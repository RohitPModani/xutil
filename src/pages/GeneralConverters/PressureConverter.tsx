import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

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

// A torr is 1/760 atm by definition; mmHg is from mercury density and differs
// by about one part in seven million.
const UNIT_TO_PASCALS: Record<PressureUnit, number> = {
  pa: 1,
  kpa: 1000,
  atm: 101325,
  bar: 100000,
  mbar: 100,
  psi: 6894.757293168,
  mmhg: 133.322387415,
  torr: 101325 / 760,
};

export default function PressureConverter() {
  return <UnitConverter id="pressure" defaultValue="20" defaultUnit="psi" units={UNITS} validationMessage="Pressure must be greater than zero." convert={linearConvert(UNIT_TO_PASCALS)} />;
}
