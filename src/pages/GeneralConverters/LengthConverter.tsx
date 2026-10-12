import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'inch' | 'ft' | 'yd' | 'mi' | 'nm';

const UNITS: { value: LengthUnit; label: string }[] = [
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'm', label: 'Meters (m)' },
  { value: 'km', label: 'Kilometers (km)' },
  { value: 'inch', label: 'Inches (in)' },
  { value: 'ft', label: 'Feet (ft)' },
  { value: 'yd', label: 'Yards (yd)' },
  { value: 'mi', label: 'Miles (mi)' },
  { value: 'nm', label: 'Nautical Miles (nmi)' },
];

// 1959 international yard: 1 in = 25.4 mm exactly.
const UNIT_TO_METERS: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  inch: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
  nm: 1852,
};

export default function LengthConverter() {
  return <UnitConverter id="length" defaultValue="1" defaultUnit="km" units={UNITS} validationMessage="Length must be greater than zero." convert={linearConvert(UNIT_TO_METERS)} />;
}
