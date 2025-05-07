import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function PressureConverter() {
  const seo = seoDescriptions.pressure;

  const units = [
    { value: 'pa', label: 'Pascals (Pa)' },
    { value: 'kpa', label: 'Kilopascals (kPa)' },
    { value: 'atm', label: 'Atmospheres (atm)' },
    { value: 'bar', label: 'Bars (bar)' },
    { value: 'mbar', label: 'Millibars (mbar)' },
    { value: 'psi', label: 'Pounds per square inch (psi)' },
    { value: 'mmhg', label: 'Millimeters of mercury (mmHg)' },
    { value: 'torr', label: 'Torr' },
  ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="pa"
      units={units}
      apiEndpoint="pressure"
      converterName="Pressure Converter"
      validationMessage="Pressure must be greater than zero."
    />
  );
}

export default PressureConverter;