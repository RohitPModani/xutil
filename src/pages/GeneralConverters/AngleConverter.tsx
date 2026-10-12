import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type AngleUnit = 'deg' | 'rad' | 'grad' | 'arcmin' | 'arcsec' | 'turn';

const UNITS: { value: AngleUnit; label: string }[] = [
  { value: 'deg', label: 'Degrees (°)' },
  { value: 'rad', label: 'Radians (rad)' },
  { value: 'grad', label: 'Gradians (grad)' },
  { value: 'arcmin', label: 'Minutes (arcmin)' },
  { value: 'arcsec', label: 'Seconds (arcsec)' },
  { value: 'turn', label: 'Turns' },
];

const UNIT_TO_RADIANS: Record<AngleUnit, number> = {
  deg: Math.PI / 180,
  rad: 1,
  grad: Math.PI / 200,
  arcmin: Math.PI / 10800,
  arcsec: Math.PI / 648000,
  turn: 2 * Math.PI,
};

export default function AngleConverter() {
  return <UnitConverter id="angle" defaultValue="90" defaultUnit="deg" units={UNITS} convert={linearConvert(UNIT_TO_RADIANS)} allowNonPositive />;
}
