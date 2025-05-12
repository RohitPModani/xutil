import React from 'react';
import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

// Define types for better type safety
type AreaUnit = 'm2' | 'km2' | 'ft2' | 'yd2' | 'acre' | 'hectare';

interface UnitDefinition {
  value: AreaUnit;
  label: string;
}

// Constants defined outside component to prevent recreation on each render
const UNIT_TO_SQUARE_METERS: Record<AreaUnit, number> = {
  m2: 1,                    // Square meters
  km2: 1_000_000,          // Square kilometers
  ft2: 0.09290304,         // Square feet
  yd2: 0.83612736,         // Square yards
  acre: 4046.8564224,      // Acres
  hectare: 10_000          // Hectares
};

const UNITS: UnitDefinition[] = [
  { value: 'm2', label: 'Square Meters (m²)' },
  { value: 'km2', label: 'Square Kilometers (km²)' },
  { value: 'ft2', label: 'Square Feet (ft²)' },
  { value: 'yd2', label: 'Square Yards (yd²)' },
  { value: 'acre', label: 'Acres' },
  { value: 'hectare', label: 'Hectares' },
];

function AreaConverter() {
  const { area: seo } = seoDescriptions;

  const convertArea = (value: number, unit: string): Record<AreaUnit, number> => {
    // Convert to intermediate unit (square meters)
    if (!Object.keys(UNIT_TO_SQUARE_METERS).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}. Supported units: ${Object.keys(UNIT_TO_SQUARE_METERS).join(', ')}`);
    }

    const areaUnit = unit as AreaUnit;
    const intermediateValue = value * UNIT_TO_SQUARE_METERS[areaUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error('Conversion resulted in non-finite value (possible overflow)');
    }

    // Convert from square meters to all units
    return Object.entries(UNIT_TO_SQUARE_METERS).reduce((acc, [key, factor]) => {
      acc[key as AreaUnit] = Number((intermediateValue / factor).toFixed(8));
      return acc;
    }, {} as Record<AreaUnit, number>);
  };

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="km2"
      units={UNITS}
      converterName="Area Converter"
      validationMessage="Area must be greater than zero."
      convertFunction={convertArea}
      toolName='area'
    />
  );
}

export default React.memo(AreaConverter);