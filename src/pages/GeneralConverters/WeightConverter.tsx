import UnitConverter from './UnitConverter';

type WeightUnit = 'mg' | 'g' | 'kg' | 't' | 'oz' | 'lb' | 'st';

const UNITS: { value: WeightUnit; label: string }[] = [
  { value: 'mg', label: 'Milligrams (mg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 't', label: 'Metric Tons (t)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'st', label: 'Stones (st)' },
];

const UNIT_TO_KILOGRAMS: Record<WeightUnit, number> = {
  mg: 1e-6,
  g: 1e-3,
  kg: 1,
  t: 1000,
  oz: 0.028349523125,
  lb: 0.45359237,
  st: 6.35029318,
};

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_KILOGRAMS)) throw new Error(`Unknown unit: ${unit}`);
  const kg = value * UNIT_TO_KILOGRAMS[unit as WeightUnit];
  if (!Number.isFinite(kg)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_KILOGRAMS).map(([k, f]) => [k, Number((kg / f).toFixed(8))]));
}

export default function WeightConverter() {
  return <UnitConverter id="weight" defaultValue="1" defaultUnit="kg" units={UNITS} validationMessage="Weight must be greater than zero." convert={convert} />;
}
