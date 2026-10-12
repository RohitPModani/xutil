import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import ReactSelect, { type GroupBase, type Props as SelectProps } from 'react-select';
import { ArrowLeftRight, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, EmptyState, Field, IconButton, Input, KeyValueList, Output, Panel, cn } from '../../ui';
import { CITY_TIMEZONES, type TimezoneOption } from '../../data/cityTimezones';

/* ---- Time helpers ------------------------------------------------------ */

// Luxon token for the datetime-local input; results use the locale formatter.
const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";
const MAX_SAVED = 3;
const MAX_TARGETS = 10;
const STORAGE_KEY = 'savedTimezones';

const ALL_ZONES = CITY_TIMEZONES.flatMap((g) => g.options);
const zoneByValue = (value: string) => ALL_ZONES.find((z) => z.value === value) ?? null;

const nowInput = () => DateTime.now().toFormat(INPUT_FORMAT);
const laterInput = () => DateTime.now().plus({ hours: 1 }).toFormat(INPUT_FORMAT);

const localZone = () => {
  const zone = DateTime.local().zoneName || 'UTC';
  // Older ICU builds still report the deprecated alias for India.
  const z = zoneByValue(zone === 'Asia/Calcutta' ? 'Asia/Kolkata' : zone);
  return z ?? zoneByValue('UTC');
};

const formatFull = (dt: DateTime) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: dt.zoneName ?? 'UTC' }).format(
    dt.toJSDate()
  );

/** Parse a datetime-local value as wall-clock time in `zone`; null when unparseable. */
const parseIn = (value: string, zone: string) => {
  const dt = DateTime.fromISO(value, { zone });
  return dt.isValid ? dt : null;
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
          isOptionDisabled={(o) => saved.some((z) => z.value === o.value)}
          onChange={(o) => o && setSaved((s) => [...s, o])}
        />
      </Field>

      {saved.length ? (
        <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-surface">
          {saved.map((z) => {
            const dt = DateTime.fromJSDate(now).setZone(z.value);
            return (
              <li key={z.value} className="flex items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{z.label}</span>
                <span className="font-mono text-[13px] tabular-nums text-ink">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium', timeZone: z.value }).format(now)}
                </span>
                <span className="hidden w-20 text-right font-mono text-xs text-muted sm:inline">UTC{dt.toFormat('ZZ')}</span>
                <IconButton size="sm" label={`Remove ${z.label}`} onClick={() => setSaved((s) => s.filter((x) => x.value !== z.value))}>
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
  const [datetime, setDatetime] = useState(nowInput);
  const [from, setFrom] = useState<TimezoneOption | null>(localZone);
  const [to, setTo] = useState<TimezoneOption | null>(() => zoneByValue('UTC'));

  const result = useMemo(() => {
    if (!datetime || !from || !to) return null;
    const src = parseIn(datetime, from.value);
    if (!src) return { error: `That date and time is not valid in ${from.label}.` };
    const dst = src.setZone(to.value);
    const toLocal = parseIn(datetime, to.value);
    return {
      error: '',
      converted: dst,
      fromDst: src.isInDST,
      toDst: Boolean(toLocal?.isInDST),
    };
  }, [datetime, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (result?.converted) setDatetime(result.converted.toFormat(INPUT_FORMAT));
  };

  const reset = () => {
    setDatetime(nowInput());
    setFrom(localZone());
    setTo(zoneByValue('UTC'));
  };

  const rows = result?.converted
    ? [
        { label: 'Converted', value: formatFull(result.converted) },
        { label: 'ISO', value: result.converted.toISO() ?? '' },
        { label: 'From zone', value: result.fromDst ? 'Daylight saving time' : 'Standard time', mono: false },
        { label: 'To zone', value: result.toDst ? 'Daylight saving time' : 'Standard time', mono: false },
      ]
    : [];

  return (
    <Panel title="Convert" actions={<ClearButton label="Reset" onClick={reset} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Date and time" htmlFor="tz-single-time" hint="Entered as wall-clock time in the from zone.">
            <Input
              id="tz-single-time"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
            />
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
      {result?.error && (
        <Callout tone="error" className="mt-4">
          {result.error}
        </Callout>
      )}
    </Panel>
  );
}

/* ---- One time (or range) across many zones ----------------------------- */

function MultiConversion({ range }: { range: boolean }) {
  const id = range ? 'tz-range' : 'tz-multi';
  const [start, setStart] = useState(nowInput);
  const [end, setEnd] = useState(laterInput);
  const [base, setBase] = useState<TimezoneOption | null>(localZone);
  const [targets, setTargets] = useState<readonly TimezoneOption[]>([]);

  const result = useMemo(() => {
    if (!base || !start || (range && !end)) return null;
    const s = parseIn(start, base.value);
    if (!s) return { error: 'The start date and time is not valid.' };
    const e = range ? parseIn(end, base.value) : null;
    if (range && !e) return { error: 'The end date and time is not valid.' };
    if (e && e < s) return { error: 'The end must be after the start.' };
    const rows = targets.map((z) => ({
      label: z.label,
      value: e ? `${formatFull(s.setZone(z.value))} – ${formatFull(e.setZone(z.value))}` : formatFull(s.setZone(z.value)),
    }));
    return { error: '', rows };
  }, [start, end, base, targets, range]);

  const clear = () => {
    setStart(nowInput());
    setEnd(laterInput());
    setTargets([]);
  };

  const atCap = targets.length >= MAX_TARGETS;
  const rows = result?.rows ?? [];
  const invalid = Boolean(result?.error) || undefined;

  return (
    <Panel title={range ? 'Convert a range' : 'Convert to many zones'} actions={<ClearButton onClick={clear} />}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className={cn('grid gap-4', range && 'sm:grid-cols-2')}>
            <Field label={range ? 'Start' : 'Date and time'} htmlFor={`${id}-start`}>
              <Input id={`${id}-start`} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} aria-invalid={invalid} />
            </Field>
            {range && (
              <Field label="End" htmlFor={`${id}-end`}>
                <Input id={`${id}-end`} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={invalid} />
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
      {result?.error && (
        <Callout tone="error" className="mt-4">
          {result.error}
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
