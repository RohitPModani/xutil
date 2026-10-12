import UnitConverter from './UnitConverter';

type PressureUnit = 'pa' | 'kpa' | 'atm' | 'bar' | 'mbar' | 'psi' | 'mmhg' | 'torr';

const UNITS: { value: PressureUnit; label: string }[] = [
  { value: 'pa', label: 'Pascals (Pa)' },
  { value: 'kpa', label: 'Kilopascals (kPa)' },
  { value: 'atm', label: 'Atmospheres (atm)' },
  { value: 'bar', label: 'Bars (bar)' },
  { value: 'mbar', label: 'Millibars (mbar)' },
  { value: 'psi', label: 'Pounds per square inch (psi)' },
  { value: 'mmhg', label: 'Millimeters of mercury (mmHg)' },
  { value: 'torr', label: 'Torr' },
];

const UNIT_TO_PASCALS: Record<PressureUnit, number> = {
  pa: 1,
  kpa: 1000,
  atm: 101325,
  bar: 100000,
  mbar: 100,
  psi: 6894.75729317,
  mmhg: 133.322387415,
  torr: 133.322387415,
};

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_PASCALS)) throw new Error(`Unknown unit: ${unit}`);
  const pa = value * UNIT_TO_PASCALS[unit as PressureUnit];
  if (!Number.isFinite(pa)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_PASCALS).map(([k, f]) => [k, Number((pa / f).toFixed(8))]));
}

export default function PressureConverter() {
  return <UnitConverter id="pressure" defaultValue="20" defaultUnit="psi" units={UNITS} validationMessage="Pressure must be greater than zero." convert={convert} />;
}
