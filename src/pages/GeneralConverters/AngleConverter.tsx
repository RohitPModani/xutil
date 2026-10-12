import UnitConverter from './UnitConverter';

type AngleUnit = 'deg' | 'rad' | 'grad' | 'arcmin' | 'arcsec' | 'turn';

const UNIT_TO_RADIANS: Record<AngleUnit, number> = {
  deg: Math.PI / 180,
  rad: 1,
  grad: Math.PI / 200,
  arcmin: Math.PI / 10800,
  arcsec: Math.PI / 648000,
  turn: 2 * Math.PI,
};

const UNITS: { value: AngleUnit; label: string }[] = [
  { value: 'deg', label: 'Degrees (°)' },
  { value: 'rad', label: 'Radians (rad)' },
  { value: 'grad', label: 'Gradians (grad)' },
  { value: 'arcmin', label: 'Minutes (arcmin)' },
  { value: 'arcsec', label: 'Seconds (arcsec)' },
  { value: 'turn', label: 'Turns' },
];

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_RADIANS)) throw new Error(`Unknown unit: ${unit}`);
  const radians = value * UNIT_TO_RADIANS[unit as AngleUnit];
  if (!Number.isFinite(radians)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_RADIANS).map(([k, f]) => [k, Number((radians / f).toFixed(8))]));
}

export default function AngleConverter() {
  return <UnitConverter id="angle" defaultValue="90" defaultUnit="deg" units={UNITS} validationMessage="Angle must be greater than zero." convert={convert} />;
}
