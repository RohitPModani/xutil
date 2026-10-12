import UnitConverter from './UnitConverter';

type PowerUnit = 'w' | 'kw' | 'hp_metric' | 'hp_imperial' | 'mw' | 'ft_lb_s';

const UNITS: { value: PowerUnit; label: string }[] = [
  { value: 'w', label: 'Watts (W)' },
  { value: 'kw', label: 'Kilowatts (kW)' },
  { value: 'hp_metric', label: 'Horsepower (metric) (hp)' },
  { value: 'hp_imperial', label: 'Horsepower (imperial) (hp)' },
  { value: 'mw', label: 'Megawatts (MW)' },
  { value: 'ft_lb_s', label: 'Foot-pounds per second (ft-lb/s)' },
];

const UNIT_TO_WATTS: Record<PowerUnit, number> = {
  w: 1,
  kw: 1000,
  hp_metric: 735.49875,
  hp_imperial: 745.69987158,
  mw: 1000 ** 2,
  ft_lb_s: 1.35581794833,
};

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_WATTS)) throw new Error(`Unknown unit: ${unit}`);
  const watts = value * UNIT_TO_WATTS[unit as PowerUnit];
  if (!Number.isFinite(watts)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_WATTS).map(([k, f]) => [k, Number((watts / f).toFixed(8))]));
}

export default function PowerConverter() {
  return <UnitConverter id="power" defaultValue="1" defaultUnit="kw" units={UNITS} validationMessage="Power must be greater than zero." convert={convert} />;
}
