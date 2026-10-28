import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import ToolPage from '../../components/ToolPage';
import { EmptyState, Field, Input, KeyValueList, Output, Panel, Stat, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

/* ---- Maths (pure; exercised by scripts/check-calc.mjs) ----------------- */

function parseISODate(iso: string): DateTime {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? DateTime.fromISO(iso, { zone: 'utc' }) : DateTime.invalid('format');
  if (!d.isValid) throw new Error('Enter the dates as YYYY-MM-DD.');
  return d;
}

export interface Age {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  /** ISO date; today when the on-date is a birthday. */
  nextBirthday: string;
  nextBirthdayWeekday: string;
  daysToBirthday: number;
  /** The age reached on the next birthday. */
  turning: number;
  bornOn: string;
  leapYear: boolean;
}

/** Age on `onISO`. A 29 February birthday falls on 28 February in common years, as luxon clamps. */
function ageOn(birthISO: string, onISO: string): Age {
  const birth = parseISODate(birthISO);
  const on = parseISODate(onISO);
  if (birth > on) throw new Error('The birth date is after the date to count to.');
  const ymd = on.diff(birth, ['years', 'months', 'days']);
  const years = ymd.years;
  let next = birth.plus({ years });
  if (next < on) next = birth.plus({ years: years + 1 });
  return {
    years,
    months: ymd.months,
    days: ymd.days,
    totalMonths: Math.floor(on.diff(birth, 'months').months),
    totalWeeks: Math.floor(on.diff(birth, 'days').days / 7),
    totalDays: on.diff(birth, 'days').days,
    nextBirthday: next.toISODate() ?? '',
    nextBirthdayWeekday: next.weekdayLong ?? '',
    daysToBirthday: next.diff(on, 'days').days,
    turning: next.equals(on) ? years : years + 1,
    bornOn: birth.weekdayLong ?? '',
    leapYear: birth.isInLeapYear,
  };
}

/* ---- Page ---------------------------------------------------------------- */

const today = () => DateTime.now().toISODate() ?? '';
const plural = (n: number, unit: string) => `${n.toLocaleString()} ${unit}${n === 1 ? '' : 's'}`;

export default function AgeCalculator() {
  const [birth, setBirth] = useState('');
  const [on, setOn] = useState(today);

  const result = useMemo(() => {
    if (!birth || !on) return null;
    try {
      return { age: ageOn(birth, on), error: '' };
    } catch (e) {
      return { age: null, error: getErrorMessage(e, 'Could not read the dates.') };
    }
  }, [birth, on]);

  const a = result?.age;
  const headline = a ? `${plural(a.years, 'year')}, ${plural(a.months, 'month')}, ${plural(a.days, 'day')}` : '';
  const rows = a
    ? [
        { label: 'Age', value: headline },
        { label: 'In months', value: plural(a.totalMonths, 'month') },
        { label: 'In weeks', value: plural(a.totalWeeks, 'week') },
        { label: 'In days', value: plural(a.totalDays, 'day') },
        {
          label: 'Next birthday',
          value: a.daysToBirthday === 0 ? `Today, turning ${a.turning}` : `${a.nextBirthday} (${a.nextBirthdayWeekday}), in ${plural(a.daysToBirthday, 'day')}, turning ${a.turning}`,
        },
        { label: 'Born on a', value: a.bornOn, mono: false },
        { label: 'Birth year', value: a.leapYear ? 'Leap year' : 'Not a leap year', mono: false },
      ]
    : [];

  return (
    <ToolPage id="age">
      <Panel title="Age">
        <TwoPane>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of birth" htmlFor="age-birth" error={result?.error}>
                <Input id="age-birth" type="date" value={birth} max={on || undefined} onChange={(e) => setBirth(e.target.value)} autoFocus />
              </Field>
              <Field label="Age on" htmlFor="age-on" hint="Defaults to today.">
                <Input id="age-on" type="date" value={on} onChange={(e) => setOn(e.target.value)} />
              </Field>
            </div>
            {a && <Stat className="mt-4" label="Age" value={headline} />}
          </div>
          <Output label="Details" copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}>
            {rows.length > 0 ? <KeyValueList items={rows} /> : <EmptyState>Enter a date of birth</EmptyState>}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
