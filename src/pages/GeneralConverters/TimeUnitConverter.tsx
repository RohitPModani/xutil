import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type TimeUnit = 'ns' | 'μs' | 'ms' | 's' | 'min' | 'hr' | 'day' | 'week' | 'month' | 'year' | 'decade' | 'century';

const UNITS: { value: TimeUnit; label: string }[] = [
  { value: 'ns', label: 'Nanoseconds (ns)' },
  { value: 'μs', label: 'Microseconds (μs)' },
  { value: 'ms', label: 'Milliseconds (ms)' },
  { value: 's', label: 'Seconds (s)' },
  { value: 'min', label: 'Minutes (min)' },
  { value: 'hr', label: 'Hours (hr)' },
  { value: 'day', label: 'Days (day)' },
  { value: 'week', label: 'Weeks (week)' },
  { value: 'month', label: 'Months (1/12 year, 30.42 days)' },
  { value: 'year', label: 'Years (365 days)' },
  { value: 'decade', label: 'Decades (10 × 365 days)' },
  { value: 'century', label: 'Centuries (100 × 365 days)' },
];

// A year is a fixed 365 days and a month is one twelfth of that.
const UNIT_TO_SECONDS: Record<TimeUnit, number> = {
  ns: 1e-9,
  μs: 1e-6,
  ms: 1e-3,
  s: 1,
  min: 60,
  hr: 3600,
  day: 86400,
  week: 604800,
  month: 31536000 / 12,
  year: 31536000,
  decade: 315360000,
  century: 3153600000,
};

export default function TimeUnitConverter() {
  return <UnitConverter id="time" defaultValue="1" defaultUnit="hr" units={UNITS} validationMessage="Time must be greater than zero." convert={linearConvert(UNIT_TO_SECONDS)} />;
}
