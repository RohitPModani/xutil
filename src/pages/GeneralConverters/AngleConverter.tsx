import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function AngleConverter() {
  const seo = seoDescriptions.angle;

  const units = [
    { value: 'deg', label: 'Degrees (°)' },
    { value: 'rad', label: 'Radians (rad)' },
    { value: 'grad', label: 'Gradians (grad)' },
    { value: 'arcmin', label: 'Minutes (arcmin)' },
    { value: 'arcsec', label: 'Seconds (arcsec)' },
    { value: 'turn', label: 'Turns' },
  ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="deg"
      units={units}
      apiEndpoint="angle"
      converterName="Angle Converter"
      validationMessage="Angle must be greater than zero."
    />
  );
}

export default AngleConverter;