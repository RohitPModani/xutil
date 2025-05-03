import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

function VolumeConverter() {
    const seo = seoDescriptions.volume;

    const units = [
        { value: 'm3', label: 'Cubic Meters (m³)' },
        { value: 'cm3', label: 'Cubic Centimeters (cm³)' },
        { value: 'l', label: 'Liters (L)' },
        { value: 'ml', label: 'Milliliters (mL)' },
        { value: 'ft3', label: 'Cubic Feet (ft³)' },
        { value: 'in3', label: 'Cubic Inches (in³)' },
        { value: 'gal', label: 'US Gallons (gal)' },
        { value: 'qt', label: 'US Quarts (qt)' },
        { value: 'pt', label: 'US Pints (pt)' },
        { value: 'fl_oz', label: 'US Fluid Ounces (fl oz)' },
      ];

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="l"
      units={units}
      apiEndpoint="/volume/convert"
      converterName="Volume Converter"
      validationMessage="Volume must be greater than zero."
    />
  );
}

export default VolumeConverter;