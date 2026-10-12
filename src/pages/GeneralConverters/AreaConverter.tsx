import UnitConverter from './UnitConverter';

type AreaUnit = 'm2' | 'km2' | 'ft2' | 'yd2' | 'acre' | 'hectare';

const UNIT_TO_SQUARE_METERS: Record<AreaUnit, number> = {
  m2: 1,
  km2: 1_000_000,
  ft2: 0.09290304,
  yd2: 0.83612736,
  acre: 4046.8564224,
  hectare: 10_000,
};

const UNITS: { value: AreaUnit; label: string }[] = [
  { value: 'm2', label: 'Square Meters (m²)' },
  { value: 'km2', label: 'Square Kilometers (km²)' },
  { value: 'ft2', label: 'Square Feet (ft²)' },
  { value: 'yd2', label: 'Square Yards (yd²)' },
  { value: 'acre', label: 'Acres' },
  { value: 'hectare', label: 'Hectares' },
];

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_SQUARE_METERS)) throw new Error(`Unknown unit: ${unit}`);
  const m2 = value * UNIT_TO_SQUARE_METERS[unit as AreaUnit];
  if (!Number.isFinite(m2)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_SQUARE_METERS).map(([k, f]) => [k, Number((m2 / f).toFixed(8))]));
}

export default function AreaConverter() {
  return <UnitConverter id="area" defaultValue="1" defaultUnit="km2" units={UNITS} validationMessage="Area must be greater than zero." convert={convert} />;
}
