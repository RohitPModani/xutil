import UnitConverter from './UnitConverter';

type SpeedUnit = 'm_s' | 'km_h' | 'mph' | 'ft_s' | 'kn';

const UNITS: { value: SpeedUnit; label: string }[] = [
  { value: 'm_s', label: 'Meters per Second (m/s)' },
  { value: 'km_h', label: 'Kilometers per Hour (km/h)' },
  { value: 'mph', label: 'Miles per Hour (mph)' },
  { value: 'ft_s', label: 'Feet per Second (ft/s)' },
  { value: 'kn', label: 'Knots (kn)' },
];

const UNIT_TO_METERS_PER_SECOND: Record<SpeedUnit, number> = {
  m_s: 1,
  km_h: 1 / 3.6,
  mph: 0.44704,
  ft_s: 0.3048,
  kn: 0.51444444444,
};

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_METERS_PER_SECOND)) throw new Error(`Unknown unit: ${unit}`);
  const ms = value * UNIT_TO_METERS_PER_SECOND[unit as SpeedUnit];
  if (!Number.isFinite(ms)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_METERS_PER_SECOND).map(([k, f]) => [k, Number((ms / f).toFixed(8))]));
}

export default function SpeedConverter() {
  return <UnitConverter id="speed" defaultValue="1" defaultUnit="km_h" units={UNITS} validationMessage="Speed must be greater than zero." convert={convert} />;
}
