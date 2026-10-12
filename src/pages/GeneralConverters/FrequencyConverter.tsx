import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type FrequencyUnit = 'hz' | 'khz' | 'mhz' | 'ghz' | 'rpm';

const UNITS: { value: FrequencyUnit; label: string }[] = [
  { value: 'hz', label: 'Hertz (Hz)' },
  { value: 'khz', label: 'Kilohertz (kHz)' },
  { value: 'mhz', label: 'Megahertz (MHz)' },
  { value: 'ghz', label: 'Gigahertz (GHz)' },
  { value: 'rpm', label: 'Revolutions per minute (RPM)' },
];

const UNIT_TO_HERTZ: Record<FrequencyUnit, number> = {
  hz: 1,
  khz: 1e3,
  mhz: 1e6,
  ghz: 1e9,
  rpm: 1 / 60,
};

export default function FrequencyConverter() {
  return <UnitConverter id="frequency" defaultValue="1" defaultUnit="ghz" units={UNITS} validationMessage="Frequency must be greater than zero." convert={linearConvert(UNIT_TO_HERTZ)} />;
}
