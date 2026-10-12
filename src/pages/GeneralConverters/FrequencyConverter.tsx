import UnitConverter from './UnitConverter';

type FrequencyUnit = 'hz' | 'khz' | 'mhz' | 'ghz' | 'rpm';

const UNITS: { value: FrequencyUnit; label: string }[] = [
  { value: 'hz', label: 'Hertz (Hz)' },
  { value: 'khz', label: 'Kilohertz (kHz)' },
  { value: 'mhz', label: 'Megahertz (MHz)' },
  { value: 'ghz', label: 'Gigahertz (GHz)' },
  { value: 'rpm', label: 'Revolutions per minute (RPM)' },
];

const UNIT_TO_HERTZ: Record<FrequencyUnit, number> = {
  hz: 1,
  khz: 1000,
  mhz: 1000000,
  ghz: 1000000000,
  rpm: 1 / 60,
};

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_HERTZ)) throw new Error(`Unknown unit: ${unit}`);
  const hz = value * UNIT_TO_HERTZ[unit as FrequencyUnit];
  if (!Number.isFinite(hz)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_HERTZ).map(([k, f]) => [k, Number((hz / f).toFixed(8))]));
}

export default function FrequencyConverter() {
  return <UnitConverter id="frequency" defaultValue="1" defaultUnit="ghz" units={UNITS} validationMessage="Frequency must be greater than zero." convert={convert} />;
}
