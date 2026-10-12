import UnitConverter from './UnitConverter';

type EnergyUnit = 'j' | 'kj' | 'cal' | 'kcal' | 'wh' | 'kwh' | 'ev' | 'btu';

const UNITS: { value: EnergyUnit; label: string }[] = [
  { value: 'j', label: 'Joules (J)' },
  { value: 'kj', label: 'Kilojoules (kJ)' },
  { value: 'cal', label: 'Calories (cal)' },
  { value: 'kcal', label: 'Kilocalories (kcal)' },
  { value: 'wh', label: 'Watt-hours (Wh)' },
  { value: 'kwh', label: 'Kilowatt-hours (kWh)' },
  { value: 'ev', label: 'Electronvolts (eV)' },
  { value: 'btu', label: 'British Thermal Units (BTU)' },
];

const UNIT_TO_JOULES: Record<EnergyUnit, number> = {
  j: 1.0,
  kj: 1000.0,
  cal: 4.184,
  kcal: 4184.0,
  wh: 3600.0,
  kwh: 3600000.0,
  ev: 1.602176634e-19,
  btu: 1055.05585262,
};

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_JOULES)) throw new Error(`Unknown unit: ${unit}`);
  const joules = value * UNIT_TO_JOULES[unit as EnergyUnit];
  if (!Number.isFinite(joules)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_JOULES).map(([k, f]) => [k, Number((joules / f).toFixed(8))]));
}

export default function EnergyConverter() {
  return <UnitConverter id="energy" defaultValue="100" defaultUnit="kcal" units={UNITS} validationMessage="Energy must be greater than zero." convert={convert} />;
}
