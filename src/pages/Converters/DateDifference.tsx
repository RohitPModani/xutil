import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import ToolPage from '../../components/ToolPage';
import { Button, Checkbox, EmptyState, Field, Input, KeyValueList, Output, Panel, Toolbar, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

/* ---- Maths (pure; exercised by scripts/check-calc.mjs) ----------------- */

/** A calendar date read in UTC, so day counts are whole numbers across DST. */
function parseISODate(iso: string): DateTime {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? DateTime.fromISO(iso, { zone: 'utc' }) : DateTime.invalid('format');
  if (!d.isValid) throw new Error('Enter both dates as YYYY-MM-DD.');
  return d;
}

export interface DateDiff {
  /** The end date is before the start date. */
  negative: boolean;
  days: number;
  weeks: number;
  weekDays: number;
  months: number;
  monthDays: number;
  years: number;
  ymdMonths: number;
  ymdDays: number;
  /** Monday to Friday days in the span. */
  weekdays: number;
  startWeekday: string;
  endWeekday: string;
}

function dateDiff(startISO: string, endISO: string, inclusive: boolean): DateDiff {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const negative = end < start;
  const a = negative ? end : start;
  let b = negative ? start : end;
  if (inclusive) b = b.plus({ days: 1 });

  const days = b.diff(a, 'days').days;
  const md = b.diff(a, ['months', 'days']);
  const ymd = b.diff(a, ['years', 'months', 'days']);

  const fullWeeks = Math.floor(days / 7);
  let weekdays = fullWeeks * 5;
  for (let i = 0; i < days % 7; i++) if ((a.weekday - 1 + i) % 7 < 5) weekdays++;

  return {
    negative,
    days,
    weeks: fullWeeks,
    weekDays: days % 7,
    months: md.months,
    monthDays: md.days,
    years: ymd.years,
    ymdMonths: ymd.months,
    ymdDays: ymd.days,
    weekdays,
    startWeekday: start.weekdayLong ?? '',
    endWeekday: end.weekdayLong ?? '',
  };
}

/* ---- Page ---------------------------------------------------------------- */

const today = () => DateTime.now().toISODate() ?? '';
const plural = (n: number, unit: string) => `${n.toLocaleString()} ${unit}${n === 1 ? '' : 's'}`;
const parts = (pairs: [number, string][]) => pairs.map(([n, u]) => plural(n, u)).join(', ');

export default function DateDifference() {
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState('');
  const [inclusive, setInclusive] = useState(false);

  const result = useMemo(() => {
    if (!start || !end) return null;
    try {
      return { diff: dateDiff(start, end, inclusive), error: '' };
    } catch (e) {
      return { diff: null, error: getErrorMessage(e, 'Could not read the dates.') };
    }
  }, [start, end, inclusive]);

  const d = result?.diff;
  const suffix = d?.negative ? ' before' : '';
  const rows = d
    ? [
        { label: 'Total days', value: `${plural(d.days, 'day')}${suffix}` },
        { label: 'Weeks', value: parts([[d.weeks, 'week'], [d.weekDays, 'day']]) + suffix },
        { label: 'Months', value: parts([[d.months, 'month'], [d.monthDays, 'day']]) + suffix },
        { label: 'Years', value: parts([[d.years, 'year'], [d.ymdMonths, 'month'], [d.ymdDays, 'day']]) + suffix },
        { label: 'Hours', value: (d.days * 24).toLocaleString() },
        { label: 'Minutes', value: (d.days * 1440).toLocaleString() },
        { label: 'Seconds', value: (d.days * 86400).toLocaleString() },
        { label: 'Weekdays (Mon-Fri)', value: plural(d.weekdays, 'weekday') },
        { label: 'Start falls on', value: d.startWeekday, mono: false },
        { label: 'End falls on', value: d.endWeekday, mono: false },
      ]
    : [];

  return (
    <ToolPage id="date_difference">
      <Panel
        title="Days between"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setStart(end);
              setEnd(start);
            }}
            disabled={!start || !end}
          >
            Swap
          </Button>
        }
      >
        <TwoPane>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date" htmlFor="dd-start">
                <Input id="dd-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} autoFocus />
              </Field>
              <Field label="End date" htmlFor="dd-end" error={result?.error}>
                <Input id="dd-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Field>
            </div>
            <Toolbar className="mt-4 gap-x-5">
              <Checkbox label="Include end date" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} />
              <Button size="sm" onClick={() => setEnd(today())}>
                End today
              </Button>
            </Toolbar>
            {d?.negative && <p className="mt-3 text-xs text-muted">The end date is earlier than the start date, so the span is counted backwards.</p>}
          </div>
          <Output label="Difference" copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}>
            {rows.length > 0 ? <KeyValueList items={rows} /> : <EmptyState>Pick an end date</EmptyState>}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
