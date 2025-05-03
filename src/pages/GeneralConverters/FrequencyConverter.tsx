import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function FrequencyConverter() {
  const seo = seoDescriptions.frequency || {
    title: 'Frequency Converter',
    body: 'Convert frequency between hertz, kilohertz, megahertz, gigahertz, and revolutions per minute.',
  };

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
      apiEndpoint="/unit-converter/frequency"
      converterName="Frequency Converter"
      validationMessage="Frequency must be greater than zero."
    />
  );
}

export default FrequencyConverter;