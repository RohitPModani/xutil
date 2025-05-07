import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function FrequencyConverter() {
  const seo = seoDescriptions.frequency;

  const units = [
    { value: 'hz', label: 'Hertz (Hz)' },
    { value: 'khz', label: 'Kilohertz (kHz)' },
    { value: 'mhz', label: 'Megahertz (MHz)' },
    { value: 'ghz', label: 'Gigahertz (GHz)' },
    { value: 'rpm', label: 'Revolutions per minute (RPM)' },
  ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="hz"
      units={units}
      apiEndpoint="frequency"
      converterName="Frequency Converter"
      validationMessage="Frequency must be greater than zero."
    />
  );
}

export default FrequencyConverter;