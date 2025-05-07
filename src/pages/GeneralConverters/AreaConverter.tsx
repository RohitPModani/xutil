import UnitConverter from "./UnitConverter";
import seoDescriptions from '../../data/seoDescriptions';

function AreaConverter() {
  const seo = seoDescriptions.area;
  
  const units = [
    { value: 'm2', label: 'Square Meters (m²)' },
    { value: 'km2', label: 'Square Kilometers (km²)' },
    { value: 'ft2', label: 'Square Feet (ft²)' },
    { value: 'yd2', label: 'Square Yards (yd²)' },
    { value: 'acre', label: 'Acres' },
    { value: 'hectare', label: 'Hectares' },
  ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="m2"
      units={units}
      apiEndpoint="area"
      converterName="Area Converter"
      validationMessage="Area must be greater than zero."
    />
  );
}

export default AreaConverter;