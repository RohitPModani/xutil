import React from 'react';
import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

type VolumeUnit = 'm3' | 'cm3' | 'l' | 'ml' | 'ft3' | 'in3' | 'gal' | 'qt' | 'pt' | 'fl_oz';
type VolumeConversionRates = Record<VolumeUnit, number>;

const UNITS: { value: VolumeUnit; label: string }[] = [
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
] as const;

const UNIT_TO_LITERS: VolumeConversionRates = {
  m3: 1000,                 // Cubic Meters
  cm3: 0.001,               // Cubic Centimeters
  l: 1,                     // Liters
  ml: 0.001,                // Milliliters
  ft3: 28.316846592,        // Cubic Feet
  in3: 0.016387064,         // Cubic Inches
  gal: 3.785411784,         // US Gallons
  qt: 0.946352946,          // US Quarts
  pt: 0.473176473,          // US Pints
  fl_oz: 0.0295735295625,   // US Fluid Ounces
};

const VALIDATION_MESSAGE = "Volume must be greater than zero.";
const CONVERTER_NAME = "Volume Converter";

function VolumeConverter() {
  const convertVolume = (value: number, unit: string): Record<string, number> => {
    if(!Object.keys(UNIT_TO_LITERS).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}. Supported units: ${Object.keys(UNIT_TO_LITERS).join(', ')}`);
    }

    // Convert to intermediate unit (liters)
    const intermediateValue = value * UNIT_TO_LITERS[unit as VolumeUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error('Conversion resulted in non-finite value (possible overflow)');
    }

    // Convert from liters to all units
    const convertedValues: Record<string, number> = {};
    Object.entries(UNIT_TO_LITERS).forEach(([key, factor]) => {
      convertedValues[key] = Number((intermediateValue / factor).toFixed(8));
    });

    return convertedValues;
  };

  return (
    <UnitConverter
      seo={seoDescriptions.volume}
      defaultValue="1"
      defaultUnit="l"
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertVolume}
      toolName='volume'
    />
  );
}

export default React.memo(VolumeConverter);