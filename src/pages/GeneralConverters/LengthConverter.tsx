import React from 'react';
import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

// Define types for better type safety
type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'inch' | 'ft' | 'yd' | 'mi' | 'nm';
type LengthConversionRates = Record<LengthUnit, number>;

// Memoize constant data outside component
const UNITS: { value: LengthUnit; label: string }[] = [
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'm', label: 'Meters (m)' },
  { value: 'km', label: 'Kilometers (km)' },
  { value: 'inch', label: 'Inches (in)' },
  { value: 'ft', label: 'Feet (ft)' },
  { value: 'yd', label: 'Yards (yd)' },
  { value: 'mi', label: 'Miles (mi)' },
  { value: 'nm', label: 'Nautical Miles (nm)' },
];

const UNIT_TO_METERS: LengthConversionRates = {
  mm: 0.001,                // Millimeters
  cm: 0.01,                 // Centimeters
  m: 1,                     // Meters
  km: 1000,                 // Kilometers
  inch: 0.0254,             // Inches
  ft: 0.3048,               // Feet
  yd: 0.9144,               // Yards
  mi: 1609.344,             // Miles
  nm: 1852,                 // Nautical Miles
};

const VALIDATION_MESSAGE = "Length must be greater than zero.";
const CONVERTER_NAME = "Length Converter";
const DEFAULT_VALUE = "1";
const DEFAULT_UNIT: LengthUnit = "km";

function LengthConverter() {
  const seo = seoDescriptions.length;

  const convertLength = (value: number, unit: string): LengthConversionRates => {
    // Input validation
    if (!Number.isFinite(value)) {
      throw new Error('Value must be a finite number');
    }

    if (value <= 0) {
      throw new Error(VALIDATION_MESSAGE);
    }

    if(!Object.keys(UNIT_TO_METERS).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}. Supported units: ${Object.keys(UNIT_TO_METERS).join(', ')}`);
    }

    // Convert to intermediate unit (meters)
    const lengthUnit = unit as LengthUnit;
    const metersValue = value * UNIT_TO_METERS[lengthUnit];

    if (!Number.isFinite(metersValue)) {
      throw new Error('Conversion resulted in non-finite value (possible overflow)');
    }

    // Convert from meters to all units
    return Object.entries(UNIT_TO_METERS).reduce((acc, [key, factor]) => {
      acc[key as LengthUnit] = round(metersValue / factor);
      return acc;
    }, {} as LengthConversionRates);
  };

  // Helper function for consistent rounding
  const round = (num: number): number => Number(num.toFixed(8));

  return (
    <UnitConverter
      seo={seo}
      defaultValue={DEFAULT_VALUE}
      defaultUnit={DEFAULT_UNIT}
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertLength}
      toolName='length'
    />
  );
}

export default React.memo(LengthConverter);