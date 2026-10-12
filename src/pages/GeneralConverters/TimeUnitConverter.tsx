import UnitConverter from './UnitConverter';

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
  { value: 'month', label: 'Months (month)' },
  { value: 'year', label: 'Years (year)' },
  { value: 'decade', label: 'Decades (decade)' },
  { value: 'century', label: 'Centuries (century)' },
];

const UNIT_TO_SECONDS: Record<TimeUnit, number> = {
  ns: 1e-9,
  μs: 1e-6,
  ms: 1e-3,
  s: 1,
  min: 60,
  hr: 3600,
  day: 86400,
  week: 604800,
  month: 2628000, // average: 30.42 days
  year: 31536000, // 365 days
  decade: 315360000,
  century: 3153600000,
};

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_SECONDS)) throw new Error(`Unknown unit: ${unit}`);
  const seconds = value * UNIT_TO_SECONDS[unit as TimeUnit];
  if (!Number.isFinite(seconds)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_SECONDS).map(([k, f]) => [k, Number((seconds / f).toFixed(8))]));
}

export default function TimeUnitConverter() {
  return <UnitConverter id="time" defaultValue="1" defaultUnit="hr" units={UNITS} validationMessage="Time must be greater than zero." convert={convert} />;
}
