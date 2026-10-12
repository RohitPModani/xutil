import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type VolumeUnit = 'm3' | 'cm3' | 'l' | 'ml' | 'ft3' | 'in3' | 'gal' | 'qt' | 'pt' | 'fl_oz';

const UNITS: { value: VolumeUnit; label: string }[] = [
  { value: 'm3', label: 'Cubic Meters (m³)' },
  { value: 'cm3', label: 'Cubic Centimeters (cm³)' },
  { value: 'l', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (mL)' },
  { value: 'ft3', label: 'Cubic Feet (ft³)' },
  { value: 'in3', label: 'Cubic Inches (in³)' },
  { value: 'gal', label: 'US Gallons (gal)' },
  { value: 'qt', label: 'US Quarts (qt)' },
  { value: 'pt', label: 'US Pints (pt)' },
  { value: 'fl_oz', label: 'US Fluid Ounces (fl oz)' },
];

// US liquid gallon = 231 in³ = 3.785411784 L exactly.
const UNIT_TO_LITERS: Record<VolumeUnit, number> = {
  m3: 1000,
  cm3: 0.001,
  l: 1,
  ml: 0.001,
  ft3: 28.316846592,
  in3: 0.016387064,
  gal: 3.785411784,
  qt: 0.946352946,
  pt: 0.473176473,
  fl_oz: 0.0295735295625,
};

export default function VolumeConverter() {
  return <UnitConverter id="volume" defaultValue="1" defaultUnit="l" units={UNITS} validationMessage="Volume must be greater than zero." convert={linearConvert(UNIT_TO_LITERS)} />;
}
