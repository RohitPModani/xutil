import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import ReactSelect, { type GroupBase, type Props as SelectProps } from 'react-select';
import { ArrowLeftRight, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, ClearButton, EmptyState, Field, IconButton, Input, KeyValueList, Output, Panel, cn } from '../../ui';
import { CITY_TIMEZONES, ZONE_ALIASES, type TimezoneOption } from '../../data/cityTimezones';

/* ---- Time helpers ------------------------------------------------------ */

// Luxon token for the datetime-local input; results use the locale formatter.
const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";
const MAX_SAVED = 3;
const MAX_TARGETS = 10;
const STORAGE_KEY = 'savedTimezones';

const ALL_ZONES = CITY_TIMEZONES.flatMap((g) => g.options);
const UTC = ALL_ZONES.find((z) => z.value === 'UTC')!;

/**
 * Several cities share one IANA zone, so prefer the option named after the
 * zone itself (America/New_York → "New York City", not "Birmingham").
 * Unknown zones get a synthetic option rather than falling back to UTC.
 */
const zoneOption = (name: string): TimezoneOption => {
  const value = ZONE_ALIASES[name] ?? name;
  const city = (value.split('/').pop() ?? '').replace(/_/g, ' ').toLowerCase();
  const matches = ALL_ZONES.filter((z) => z.value === value);
  return matches.find((z) => z.label.toLowerCase().includes(city)) ?? matches[0] ?? { value, label: value };
};

const nowInput = () => DateTime.now().toFormat(INPUT_FORMAT);
const laterInput = () => DateTime.now().plus({ hours: 1 }).toFormat(INPUT_FORMAT);
const localZone = () => zoneOption(DateTime.local().zoneName || 'UTC');

const formatters = new Map<string, Intl.DateTimeFormat>();
const formatterFor = (zone: string, timeStyle: 'short' | 'medium') => {
  const key = `${zone}|${timeStyle}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle, timeZone: zone });
    formatters.set(key, f);
  }
  return f;
};

const formatFull = (dt: DateTime) => formatterFor(dt.zoneName ?? 'UTC', 'short').format(dt.toJSDate());
/** "EDT (UTC-04:00)"; falls back to "GMT+5:30"-style names where ICU has no abbreviation. */
const zoneTag = (dt: DateTime) => `${dt.toFormat('ZZZZ')} (UTC${dt.toFormat('ZZ')})`;

type Parsed = { dt: DateTime; warning: string } | { error: string };

/**
 * Parse a datetime-local value as wall-clock time in `zone`. A time inside a
 * spring-forward gap does not exist (Luxon would silently shift it); a time
 * inside a fall-back overlap exists twice, so the pick is reported.
 */
const parseIn = (value: string, zone: TimezoneOption): Parsed => {
  const dt = DateTime.fromISO(value, { zone: zone.value });
  const wall = DateTime.fromISO(value, { zone: 'utc' });
  if (!dt.isValid || !wall.isValid) return { error: 'That date and time could not be read.' };
  const key = wall.toFormat(INPUT_FORMAT);
  if (dt.toFormat(INPUT_FORMAT) !== key) {
    return { error: `${wall.toFormat('HH:mm')} does not exist in ${zone.label} on that date because clocks go forward.` };
  }
  const twice = [dt.minus({ hours: 1 }), dt.plus({ hours: 1 })].some((d) => d.toFormat(INPUT_FORMAT) === key);
  return {
    dt,
    warning: twice ? `${wall.toFormat('HH:mm')} occurs twice in ${zone.label} on that date because clocks go back. The ${dt.toFormat('ZZZZ')} occurrence is used.` : '',
  };
};

const loadSaved = (): TimezoneOption[] => {
  try {
    const labels: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(labels)) return [];
    return labels.map((l) => ALL_ZONES.find((z) => z.label === l)).filter((z): z is TimezoneOption => Boolean(z));
  } catch {
    return [];
  }
};

/* ---- react-select styled with the design tokens ------------------------ */

const selectClassNames = {
  control: (s: { isFocused: boolean; isDisabled: boolean }) =>
    cn(
      'min-h-9 rounded-md border border-control bg-panel px-3 text-sm text-ink transition-colors duration-150',
      s.isFocused && 'border-primary outline outline-2 -outline-offset-1 outline-primary',
      s.isDisabled && 'cursor-not-allowed opacity-60'
    ),
  valueContainer: () => 'gap-1 py-1',
  placeholder: () => 'text-muted/70',
  input: () => 'text-ink',
  singleValue: () => 'text-ink',
  multiValue: () => 'rounded border border-line bg-surface pl-1.5',
  multiValueLabel: () => 'py-0.5 text-xs text-ink',
  multiValueRemove: () => 'rounded-r px-1 text-muted hover:text-ink',
  indicatorsContainer: () => 'gap-1',
  indicatorSeparator: () => 'hidden',
  dropdownIndicator: () => 'text-muted',
  clearIndicator: () => 'text-muted hover:text-ink',
  menu: () => 'mt-1 rounded-md border border-line bg-panel shadow-xl',
  menuList: () => 'thin-scroll max-h-60 py-1',
  groupHeading: () => 'px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted',
  option: (s: { isFocused: boolean; isSelected: boolean; isDisabled: boolean }) =>
    cn(
      'cursor-pointer px-3 py-1.5 text-sm text-ink',
      s.isFocused && 'bg-surface',
      s.isSelected && 'font-medium',
      s.isDisabled && 'cursor-not-allowed opacity-50'
    ),
  noOptionsMessage: () => 'px-3 py-2 text-sm text-muted',
};

type ZoneSelectProps<IsMulti extends boolean> = Omit<
  SelectProps<TimezoneOption, IsMulti, GroupBase<TimezoneOption>>,
  'options' | 'unstyled' | 'classNames'
>;

/** Searchable city picker. Pass `inputId` to tie it to a Field label. */
function ZoneSelect<IsMulti extends boolean = false>(props: ZoneSelectProps<IsMulti>) {
  return (
    <ReactSelect<TimezoneOption, IsMulti, GroupBase<TimezoneOption>>
      options={CITY_TIMEZONES}
      // Several cities share a zone value; labels are unique.
      getOptionValue={(o) => o.label}
      unstyled
      classNames={selectClassNames}
      placeholder="Search a city"
      {...props}
    />
  );
}

/* ---- Saved zones with live clocks -------------------------------------- */

function SavedZones() {
  const [saved, setSaved] = useState<TimezoneOption[]>(loadSaved);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (saved.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.map((z) => z.label)));
    else localStorage.removeItem(STORAGE_KEY);
  }, [saved]);

  useEffect(() => {
    if (!saved.length) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [saved.length]);

  const full = saved.length >= MAX_SAVED;

  return (
    <Panel title="Saved cities" actions={<ClearButton label="Reset" onClick={() => setSaved([])} disabled={!saved.length} />}>
      <Field
        label="Add a city"
        htmlFor="tz-saved-add"
        hint={full ? `${MAX_SAVED} cities is the limit. Remove one to add another.` : `Up to ${MAX_SAVED} cities, kept in this browser.`}
      >
        <ZoneSelect
          inputId="tz-saved-add"
          value={null}
          isDisabled={full}
          isOptionDisabled={(o) => saved.some((z) => z.label === o.label)}
          onChange={(o) => o && setSaved((s) => [...s, o])}
        />
      </Field>

      {saved.length ? (
        <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-surface">
          {saved.map((z) => {
            const dt = DateTime.fromJSDate(now).setZone(z.value);
            return (
              <li key={z.label} className="flex items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{z.label}</span>
                <span className="font-mono text-[13px] tabular-nums text-ink">{formatterFor(z.value, 'medium').format(now)}</span>
                <span className="hidden w-20 text-right font-mono text-xs text-muted sm:inline">UTC{dt.toFormat('ZZ')}</span>
                <IconButton size="sm" label={`Remove ${z.label}`} onClick={() => setSaved((s) => s.filter((x) => x.label !== z.label))}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </IconButton>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState>No saved cities yet</EmptyState>
      )}
    </Panel>
  );
}

/* ---- One zone to another ----------------------------------------------- */

function SingleConversion() {
  const [seed, setSeed] = useState(nowInput);
  const [datetime, setDatetime] = useState(seed);
  const [from, setFrom] = useState<TimezoneOption | null>(localZone);
  const [to, setTo] = useState<TimezoneOption | null>(UTC);

  const result = useMemo(() => {
    if (!datetime || !from || !to) return null;
    const src = parseIn(datetime, from);
    if ('error' in src) return { error: src.error, warning: '', converted: null, source: null };
    return { error: '', warning: src.warning, converted: src.dt.setZone(to.value), source: src.dt };
  }, [datetime, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (result?.converted) setDatetime(result.converted.toFormat(INPUT_FORMAT));
  };

  const reset = () => {
    const s = nowInput();
    setSeed(s);
    setDatetime(s);
    setFrom(localZone());
    setTo(UTC);
  };
  const pristine = datetime === seed && from?.value === localZone().value && to?.value === 'UTC';

  const dst = (d: DateTime) => (d.isInDST ? 'Daylight saving time' : 'Standard time');
  const rows =
    result?.converted && result.source
      ? [
          { label: 'Converted', value: formatFull(result.converted) },
          { label: 'Zone', value: zoneTag(result.converted) },
          { label: 'ISO', value: result.converted.toISO() ?? '' },
          { label: 'From zone', value: `${dst(result.source)}, ${zoneTag(result.source)}`, mono: false },
          { label: 'To zone', value: `${dst(result.converted)}, ${zoneTag(result.converted)}`, mono: false },
        ]
      : [];

  return (
    <Panel
      title="Convert"
      actions={
        <>
          <Button size="sm" onClick={() => setDatetime(nowInput())}>
            Now
          </Button>
          <ClearButton label="Reset" onClick={reset} disabled={pristine} />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Date and time" htmlFor="tz-single-time" hint="Entered as wall-clock time in the from zone." error={result?.error}>
            <Input id="tz-single-time" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} autoFocus />
          </Field>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <Field label="From" htmlFor="tz-single-from">
              <ZoneSelect inputId="tz-single-from" value={from} onChange={setFrom} />
            </Field>
            <IconButton label="Swap zones" onClick={swap} disabled={!from || !to}>
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <Field label="To" htmlFor="tz-single-to">
              <ZoneSelect inputId="tz-single-to" value={to} onChange={setTo} />
            </Field>
          </div>
        </div>
        <Output label="Result" copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}>
          {rows.length ? <KeyValueList items={rows} /> : <EmptyState>Pick a time and two zones</EmptyState>}
        </Output>
      </div>
      {result?.warning && (
        <Callout tone="info" className="mt-4">
          {result.warning}
        </Callout>
      )}
    </Panel>
  );
}

/* ---- One time (or range) across many zones ----------------------------- */

function MultiConversion({ range }: { range: boolean }) {
  const id = range ? 'tz-range' : 'tz-multi';
  const [seed, setSeed] = useState(() => ({ start: nowInput(), end: laterInput() }));
  const [start, setStart] = useState(seed.start);
  const [end, setEnd] = useState(seed.end);
  const [base, setBase] = useState<TimezoneOption | null>(localZone);
  const [targets, setTargets] = useState<readonly TimezoneOption[]>([]);

  const result = useMemo(() => {
    if (!base || !start || (range && !end)) return null;
    const s = parseIn(start, base);
    if ('error' in s) return { field: 'start', error: s.error, warning: '', rows: [] };
    const e = range ? parseIn(end, base) : null;
    if (e && 'error' in e) return { field: 'end', error: e.error, warning: '', rows: [] };
    if (e && e.dt < s.dt) return { field: 'end', error: 'The end must be after the start.', warning: '', rows: [] };
    const rows = targets.map((z) => {
      const a = s.dt.setZone(z.value);
      const b = e?.dt.setZone(z.value);
      return { label: z.label, value: `${formatFull(a)}${b ? ` – ${formatFull(b)}` : ''} ${zoneTag(b ?? a)}` };
    });
    return { field: '', error: '', warning: [s.warning, e?.warning].filter(Boolean).join(' '), rows };
  }, [start, end, base, targets, range]);

  const now = () => {
    setStart(nowInput());
    setEnd(laterInput());
  };
  const clear = () => {
    const next = { start: nowInput(), end: laterInput() };
    setSeed(next);
    setStart(next.start);
    setEnd(next.end);
    setTargets([]);
  };
  const pristine = start === seed.start && end === seed.end && !targets.length;

  const atCap = targets.length >= MAX_TARGETS;
  const rows = result?.rows ?? [];
  const errorFor = (field: string) => (result?.field === field ? result.error : undefined);

  return (
    <Panel
      title={range ? 'Convert a range' : 'Convert to many zones'}
      actions={
        <>
          <Button size="sm" onClick={now}>
            Now
          </Button>
          <ClearButton onClick={clear} disabled={pristine} />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className={cn('grid gap-4', range && 'sm:grid-cols-2')}>
            <Field label={range ? 'Start' : 'Date and time'} htmlFor={`${id}-start`} error={errorFor('start')}>
              <Input id={`${id}-start`} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            {range && (
              <Field label="End" htmlFor={`${id}-end`} error={errorFor('end')}>
                <Input id={`${id}-end`} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Field>
            )}
          </div>
          <Field label="Base zone" htmlFor={`${id}-base`} hint="The zone the time above is written in.">
            <ZoneSelect inputId={`${id}-base`} value={base} onChange={setBase} />
          </Field>
          <Field
            label="Target zones"
            htmlFor={`${id}-targets`}
            hint={atCap ? `${MAX_TARGETS} zones is the limit.` : `Up to ${MAX_TARGETS} zones.`}
          >
            <ZoneSelect<true>
              inputId={`${id}-targets`}
              isMulti
              value={targets}
              isOptionDisabled={() => atCap}
              onChange={setTargets}
              placeholder="Search cities"
            />
          </Field>
        </div>
        <Output label="Results" copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}>
          {rows.length ? <KeyValueList items={rows} /> : <EmptyState>Add target zones</EmptyState>}
        </Output>
      </div>
      {result?.warning && (
        <Callout tone="info" className="mt-4">
          {result.warning}
        </Callout>
      )}
    </Panel>
  );
}

export default function TimezoneConverter() {
  return (
    <ToolPage id="timezone">
      <SavedZones />
      <SingleConversion />
      <MultiConversion range={false} />
      <MultiConversion range />
    </ToolPage>
  );
}
