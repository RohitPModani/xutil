import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type SpeedUnit = 'm_s' | 'km_h' | 'mph' | 'ft_s' | 'kn';

const UNITS: { value: SpeedUnit; label: string }[] = [
  { value: 'm_s', label: 'Meters per Second (m/s)' },
  { value: 'km_h', label: 'Kilometers per Hour (km/h)' },
  { value: 'mph', label: 'Miles per Hour (mph)' },
  { value: 'ft_s', label: 'Feet per Second (ft/s)' },
  { value: 'kn', label: 'Knots (kn)' },
];

// A knot is one nautical mile (1852 m) per hour.
const UNIT_TO_METERS_PER_SECOND: Record<SpeedUnit, number> = {
  m_s: 1,
  km_h: 1 / 3.6,
  mph: 0.44704,
  ft_s: 0.3048,
  kn: 1852 / 3600,
};

export default function SpeedConverter() {
  return <UnitConverter id="speed" defaultValue="1" defaultUnit="km_h" units={UNITS} validationMessage="Speed must be greater than zero." convert={linearConvert(UNIT_TO_METERS_PER_SECOND)} />;
}
