import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function WeightConverter() {
    const seo = seoDescriptions.weight;

    const units = [
        { value: 'mg', label: 'Milligrams (mg)' },
        { value: 'g', label: 'Grams (g)' },
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 't', label: 'Metric Tons (t)' },
        { value: 'oz', label: 'Ounces (oz)' },
        { value: 'lb', label: 'Pounds (lb)' },
        { value: 'st', label: 'Stones (st)' },
    ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="kg"
      units={units}
      apiEndpoint="/weight/convert"
      converterName="weight Converter"
      validationMessage="Weight must be greater than zero."
    />
  );
}

export default WeightConverter;