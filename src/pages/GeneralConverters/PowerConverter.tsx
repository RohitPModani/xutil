import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function PowerConverter() {
  const seo = seoDescriptions.power || {
    title: 'Power Converter',
    body: 'Convert power between watts, kilowatts, horsepower (metric and imperial), megawatts, and foot-pounds per second.',
  };

  const units = [
    { value: 'w', label: 'Watts (W)' },
    { value: 'kw', label: 'Kilowatts (kW)' },
    { value: 'hp_metric', label: 'Horsepower (metric) (hp)' },
    { value: 'hp_imperial', label: 'Horsepower (imperial) (hp)' },
    { value: 'mw', label: 'Megawatts (MW)' },
    { value: 'ft_lb_s', label: 'Foot-pounds per second (ft-lb/s)' },
  ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="w"
      units={units}
      apiEndpoint="/unit-converter/power"
      converterName="Power Converter"
      validationMessage="Power must be greater than zero."
    />
  );
}

export default PowerConverter;