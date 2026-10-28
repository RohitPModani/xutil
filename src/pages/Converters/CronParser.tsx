import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, ClearButton, Field, Input, KeyValueList, Output, Panel, Segmented, Toolbar, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

/* ---- Parsing (pure; exercised by scripts/check-calc.mjs) --------------- */

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

interface FieldSpec {
  name: string;
  min: number;
  max: number;
  /** Three-letter names are accepted; the index plus `min` is the value. */
  names?: string[];
}

const FIELDS: FieldSpec[] = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day-of-month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12, names: MONTHS },
  { name: 'day-of-week', min: 0, max: 7, names: WEEKDAYS },
];

/** One comma-separated item: `*`, `5`, `1-5`, `*\/15`, `1-5/2`, `5/15`. */
interface Item {
  star: boolean;
  start: number;
  end: number;
  step: number;
}

interface ParsedField {
  raw: string;
  items: Item[];
  /** Expanded, sorted, with weekday 7 folded into 0. */
  values: number[];
  /** `*` with no step: the field places no restriction. */
  star: boolean;
}

function parseValue(token: string, spec: FieldSpec): number {
  if (/^\d+$/.test(token)) {
    const n = Number(token);
    if (n < spec.min || n > spec.max) throw new Error(`${n} is out of range in the ${spec.name} field (${spec.min}-${spec.max}).`);
    return n;
  }
  const i = spec.names?.findIndex((n) => n.slice(0, 3) === token.toLowerCase()) ?? -1;
  if (i === -1) throw new Error(`"${token}" is not valid in the ${spec.name} field.`);
  return i + spec.min;
}

function parseItem(text: string, spec: FieldSpec): Item {
  const m = /^(\*|[a-z0-9]+)(?:-([a-z0-9]+))?(?:\/(\d+))?$/i.exec(text);
  if (!m) throw new Error(`"${text}" is not valid in the ${spec.name} field.`);
  const step = m[3] === undefined ? 1 : Number(m[3]);
  if (step < 1) throw new Error(`The step in "${text}" (${spec.name} field) must be 1 or more.`);
  if (m[1] === '*') {
    if (m[2] !== undefined) throw new Error(`"${text}" is not valid in the ${spec.name} field: * cannot start a range.`);
    return { star: true, start: spec.min, end: spec.max, step };
  }
  const start = parseValue(m[1], spec);
  const end = m[2] !== undefined ? parseValue(m[2], spec) : m[3] !== undefined ? spec.max : start;
  if (end < start) throw new Error(`The range "${text}" in the ${spec.name} field runs backwards.`);
  return { star: false, start, end, step };
}

function parseField(raw: string, spec: FieldSpec): ParsedField {
  const items = raw.split(',').map((part) => parseItem(part, spec));
  const values = new Set<number>();
  for (const it of items) for (let v = it.start; v <= it.end; v += it.step) values.add(spec.names === WEEKDAYS ? v % 7 : v);
  return { raw, items, values: [...values].sort((a, b) => a - b), star: raw === '*' };
}

export interface CronParsed {
  /** The five-field expression, with any macro expanded. */
  expression: string;
  macro?: string;
  fields: ParsedField[];
}

function parseCron(input: string): CronParsed {
  let expression = input.trim().replace(/\s+/g, ' ');
  if (!expression) throw new Error('Enter a cron expression.');
  let macro: string | undefined;
  if (expression.startsWith('@')) {
    const expanded = MACROS[expression.toLowerCase()];
    if (!expanded) throw new Error(`Unknown macro "${expression}". Known ones: @yearly, @annually, @monthly, @weekly, @daily, @midnight, @hourly.`);
    macro = expression.toLowerCase();
    expression = expanded;
  }
  const parts = expression.split(' ');
  if (parts.length === 6) {
    throw new Error('Six fields are not supported: this tool reads the standard 5-field crontab format (minute hour day-of-month month day-of-week). Remove the seconds field.');
  }
  if (parts.length !== 5) throw new Error(`Expected 5 fields separated by spaces, got ${parts.length}.`);
  return { expression, macro, fields: parts.map((raw, i) => parseField(raw, FIELDS[i])) };
}

/* ---- Describing ---------------------------------------------------------- */

const two = (n: number) => String(n).padStart(2, '0');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ordinal = (n: number) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${s}`;
};
const joinList = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const nameOf = (v: number, spec: FieldSpec) => (spec.names ? cap(spec.names[(v - spec.min) % spec.names.length]) : String(v));
const isSingle = (it: Item) => !it.star && it.start === it.end;

/** "day-of-month 1 and 15", "every 2nd hour", "Monday through Friday". */
function describeField(field: ParsedField, spec: FieldSpec): string {
  const unit = spec.name;
  if (field.items.every(isSingle)) {
    const names = joinList(field.items.map((it) => nameOf(it.start, spec)));
    return spec.names ? names : `${unit} ${names}`;
  }
  return joinList(
    field.items.map((it) => {
      if (it.star) return it.step === 1 ? `every ${unit}` : `every ${ordinal(it.step)} ${unit}`;
      if (isSingle(it)) return spec.names ? nameOf(it.start, spec) : `${unit} ${it.start}`;
      const range = `${nameOf(it.start, spec)} through ${nameOf(it.end, spec)}`;
      if (it.step === 1) return spec.names ? range : `every ${unit} from ${range}`;
      return `every ${ordinal(it.step)} ${unit} from ${range}`;
    })
  );
}

function timePhrase(minute: ParsedField, hour: ParsedField): string {
  const minuteSingles = minute.items.every(isSingle);
  if (minuteSingles && hour.items.every(isSingle)) {
    const times = hour.values.flatMap((h) => minute.values.map((m) => `${two(h)}:${two(m)}`));
    if (times.length <= 4) return `At ${joinList(times)}`;
    return `At minute ${joinList(minute.values.map(String))} past hour ${joinList(hour.values.map(String))}`;
  }
  let text: string;
  if (minute.items.length === 1 && minute.items[0].star) {
    const step = minute.items[0].step;
    text = step === 1 ? 'Every minute' : `Every ${step} minutes`;
  } else if (minuteSingles) {
    text = `At minute ${joinList(minute.values.map(String))}`;
  } else {
    text = cap(describeField(minute, FIELDS[0]));
  }
  if (hour.star) return text;
  const only = hour.items.length === 1 ? hour.items[0] : null;
  if (only && !only.star && only.step === 1 && only.start !== only.end && !minuteSingles) {
    return `${text}, between ${two(only.start)}:00 and ${two(only.end)}:59`;
  }
  return `${text} past ${describeField(hour, FIELDS[1])}`;
}

/** English like crontab.guru: "At 09:30 on Monday through Friday." */
function describeCron(input: string): string {
  const [minute, hour, dom, month, dow] = parseCron(input).fields;
  let s = timePhrase(minute, hour);
  if (!dom.star) s += ` on ${describeField(dom, FIELDS[2])}`;
  if (!dow.star) s += `${dom.star ? '' : ' and'} on ${describeField(dow, FIELDS[4])}`;
  if (!month.star) s += ` in ${describeField(month, FIELDS[3])}`;
  return `${s}.`;
}

/* ---- Next runs ----------------------------------------------------------- */

type Zone = 'utc' | 'local';

const FIVE_YEARS = 5 * 366 * 86_400_000;

/**
 * The next `count` instants after `from`, read in UTC or the browser's zone.
 * Standard cron semantics: when both day-of-month and day-of-week are
 * restricted, a match on either one fires. Walks forward a minute, hour, day
 * or month at a time and gives up after five years.
 */
function nextRuns(input: string, from: Date, count = 5, zone: Zone = 'local'): Date[] {
  const { fields } = parseCron(input);
  const [minute, hour, dom, month, dow] = fields.map((f) => new Set(f.values));
  const domRestricted = !fields[2].star;
  const dowRestricted = !fields[4].star;
  const utc = zone === 'utc';

  const read = (d: Date) =>
    utc
      ? [d.getUTCMinutes(), d.getUTCHours(), d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCDay()]
      : [d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()];
  const nextHour = (d: Date) => {
    if (utc) {
      d.setUTCMinutes(0, 0, 0);
      d.setUTCHours(d.getUTCHours() + 1);
    } else {
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() + 1);
    }
  };
  const nextDay = (d: Date) => {
    if (utc) {
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() + 1);
    } else {
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 1);
    }
  };
  const nextMonth = (d: Date) => {
    if (utc) {
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() + 1);
    } else {
      d.setHours(0, 0, 0, 0);
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
    }
  };

  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setTime(d.getTime() + 60_000);
  const limit = from.getTime() + FIVE_YEARS;
  const out: Date[] = [];
  while (out.length < count) {
    if (d.getTime() > limit) throw new Error('This never runs in the next five years. Check the day-of-month and month combination, for example 31 in a 30-day month.');
    const [mi, h, day, mo, wd] = read(d);
    if (!month.has(mo)) {
      nextMonth(d);
      continue;
    }
    const dayOk =
      domRestricted && dowRestricted ? dom.has(day) || dow.has(wd) : domRestricted ? dom.has(day) : dowRestricted ? dow.has(wd) : true;
    if (!dayOk) {
      nextDay(d);
      continue;
    }
    if (!hour.has(h)) {
      nextHour(d);
      continue;
    }
    if (minute.has(mi)) out.push(new Date(d.getTime()));
    d.setTime(d.getTime() + 60_000);
  }
  return out;
}

/* ---- Page ---------------------------------------------------------------- */

const LOCAL_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const formatterFor = (zone: Zone) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: zone === 'utc' ? 'UTC' : LOCAL_ZONE,
  });

const EXAMPLES = ['*/15 * * * *', '30 9 * * 1-5', '0 0 1 * *', '0 */2 * * *', '*/15 9-17 * * 1-5', '0 9,17 * * MON-FRI', '0 0 1 1 *', '@daily'];

const FIELD_LABELS = ['Minute', 'Hour', 'Day of month', 'Month', 'Day of week'];

const CHEAT = [
  { label: 'Minute', value: '0-59' },
  { label: 'Hour', value: '0-23' },
  { label: 'Day of month', value: '1-31' },
  { label: 'Month', value: '1-12 or JAN-DEC' },
  { label: 'Day of week', value: '0-7 or SUN-SAT (0 and 7 are Sunday)' },
  { label: 'Symbols', value: '* any · , list · - range · / step' },
  { label: 'Macros', value: '@hourly @daily @weekly @monthly @yearly' },
];

export default function CronParser() {
  const [input, setInput] = useState('');
  const [zone, setZone] = useState<Zone>('local');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const parsed = parseCron(input);
      const description = describeCron(input);
      let runs: Date[] = [];
      let runsError = '';
      try {
        runs = nextRuns(input, new Date(), 5, zone);
      } catch (e) {
        runsError = getErrorMessage(e, 'Could not compute the next runs.');
      }
      return { parsed, description, runs, runsError, error: '' };
    } catch (e) {
      return { parsed: null, description: '', runs: [], runsError: '', error: getErrorMessage(e, 'Could not read that expression.') };
    }
  }, [input, zone]);

  const fieldRows =
    result?.parsed?.fields.map((f, i) => ({
      label: FIELD_LABELS[i],
      value: `${f.raw} · ${f.star ? 'any' : describeField(f, FIELDS[i])}`,
      copy: f.raw,
    })) ?? [];
  const bothDays = Boolean(result?.parsed && !result.parsed.fields[2].star && !result.parsed.fields[4].star);
  const fmt = formatterFor(zone);
  const runsText = result?.runs.map((d) => fmt.format(d)).join('\n') ?? '';

  return (
    <ToolPage id="cron_parser">
      <Panel
        title="Parse"
        actions={
          <>
            <Link
              to="/cron"
              className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
            >
              Build one from words
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <div>
            <Field
              label="Cron expression"
              htmlFor="cronp-input"
              hint={result?.parsed?.macro ? `${result.parsed.macro} expands to ${result.parsed.expression}` : 'Five fields: minute hour day-of-month month day-of-week.'}
              error={result?.error}
            >
              <Input
                id="cronp-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="*/15 9-17 * * 1-5"
                maxLength={120}
                autoFocus
              />
            </Field>
            <Toolbar className="mt-3">
              {EXAMPLES.map((ex) => (
                <Button key={ex} size="sm" className="font-mono" onClick={() => setInput(ex)}>
                  {ex}
                </Button>
              ))}
            </Toolbar>
            {fieldRows.length > 0 && (
              <Output className="mt-4" label="Fields" copyText={result?.parsed?.expression ?? ''}>
                <KeyValueList items={fieldRows} />
              </Output>
            )}
          </div>
          <div className="space-y-4">
            <Output label="In words" value={result?.description ?? ''} rows={2} mono={false} placeholder="At 09:30 on Monday through Friday." />
            {bothDays && (
              <Callout>Both day-of-month and day-of-week are set, so the job runs when either one matches, as cron does.</Callout>
            )}
            <Output
              label={`Next 5 runs · ${zone === 'utc' ? 'UTC' : LOCAL_ZONE}`}
              value={runsText}
              rows={5}
              mono={false}
              placeholder="Run times appear here"
              actions={
                <Segmented
                  size="sm"
                  label="Time zone"
                  value={zone}
                  onChange={setZone}
                  options={[
                    { value: 'utc', label: 'UTC' },
                    { value: 'local', label: 'Local' },
                  ]}
                />
              }
            />
            {result?.runsError && <Callout tone="error">{result.runsError}</Callout>}
          </div>
        </TwoPane>
      </Panel>

      <Panel title="Field order and allowed values">
        <KeyValueList items={CHEAT} />
      </Panel>
    </ToolPage>
  );
}
