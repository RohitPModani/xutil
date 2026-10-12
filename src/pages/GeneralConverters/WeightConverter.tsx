import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

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

// 1959 international pound: 0.45359237 kg exactly; 16 oz = 1 lb, 14 lb = 1 st.
const UNIT_TO_KILOGRAMS: Record<WeightUnit, number> = {
  mg: 1e-6,
  g: 1e-3,
  kg: 1,
  t: 1000,
  oz: 0.028349523125,
  lb: 0.45359237,
  st: 6.35029318,
};

export default function WeightConverter() {
  return <UnitConverter id="weight" defaultValue="1" defaultUnit="kg" units={UNITS} validationMessage="Weight must be greater than zero." convert={linearConvert(UNIT_TO_KILOGRAMS)} />;
}
