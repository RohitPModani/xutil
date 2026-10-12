import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type PowerUnit = 'w' | 'kw' | 'hp_metric' | 'hp_imperial' | 'mw' | 'ft_lb_s';

const UNITS: { value: PowerUnit; label: string }[] = [
  { value: 'w', label: 'Watts (W)' },
  { value: 'kw', label: 'Kilowatts (kW)' },
  { value: 'hp_metric', label: 'Metric horsepower (PS)' },
  { value: 'hp_imperial', label: 'Imperial horsepower (hp)' },
  { value: 'mw', label: 'Megawatts (MW)' },
  { value: 'ft_lb_s', label: 'Foot-pounds per second (ft·lbf/s)' },
];

// 1 ft·lbf/s = 0.3048 m × 0.45359237 kg × 9.80665 m/s²; imperial hp = 550 of
// those; metric hp = 75 kgf·m/s = 735.49875 W exactly.
const FT_LBF_S = 0.3048 * 0.45359237 * 9.80665;
const UNIT_TO_WATTS: Record<PowerUnit, number> = {
  w: 1,
  kw: 1000,
  hp_metric: 735.49875,
  hp_imperial: 550 * FT_LBF_S,
  mw: 1e6,
  ft_lb_s: FT_LBF_S,
};

export default function PowerConverter() {
  return <UnitConverter id="power" defaultValue="1" defaultUnit="kw" units={UNITS} validationMessage="Power must be greater than zero." convert={linearConvert(UNIT_TO_WATTS)} />;
}
