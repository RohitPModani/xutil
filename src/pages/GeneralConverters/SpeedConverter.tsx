import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function SpeedConverter() {
    const seo = seoDescriptions.speed;

    const units = [
        { value: 'm_s', label: 'Meters per Second (m/s)' },
        { value: 'km_h', label: 'Kilometers per Hour (km/h)' },
        { value: 'mph', label: 'Miles per Hour (mph)' },
        { value: 'ft_s', label: 'Feet per Second (ft/s)' },
        { value: 'kn', label: 'Knots (kn)' },
      ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="km_h"
      units={units}
      apiEndpoint="/unit-converter/speed"
      converterName="Speed Converter"
      validationMessage="Speed must be greater than zero."
    />
  );
}

export default SpeedConverter;