import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type EnergyUnit = 'j' | 'kj' | 'cal' | 'kcal' | 'wh' | 'kwh' | 'ev' | 'btu';

const UNITS: { value: EnergyUnit; label: string }[] = [
  { value: 'j', label: 'Joules (J)' },
  { value: 'kj', label: 'Kilojoules (kJ)' },
  { value: 'cal', label: 'Calories (cal)' },
  { value: 'kcal', label: 'Kilocalories (kcal)' },
  { value: 'wh', label: 'Watt-hours (Wh)' },
  { value: 'kwh', label: 'Kilowatt-hours (kWh)' },
  { value: 'ev', label: 'Electronvolts (eV)' },
  { value: 'btu', label: 'British Thermal Units (BTU)' },
];

// Thermochemical calorie, 2019 SI electronvolt, ISO (International Table) BTU.
const UNIT_TO_JOULES: Record<EnergyUnit, number> = {
  j: 1,
  kj: 1000,
  cal: 4.184,
  kcal: 4184,
  wh: 3600,
  kwh: 3_600_000,
  ev: 1.602176634e-19,
  btu: 1055.05585262,
};

export default function EnergyConverter() {
  return <UnitConverter id="energy" defaultValue="100" defaultUnit="kcal" units={UNITS} validationMessage="Energy must be greater than zero." convert={linearConvert(UNIT_TO_JOULES)} />;
}
