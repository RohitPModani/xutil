import React from 'react';
import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

// Define types for better type safety
type AngleUnit = 'deg' | 'rad' | 'grad' | 'arcmin' | 'arcsec' | 'turn';

interface UnitDefinition {
  value: AngleUnit;
  label: string;
}

const UNIT_TO_RADIANS: Record<AngleUnit, number> = {
  deg: Math.PI / 180,        // Degrees
  rad: 1,                    // Radians
  grad: Math.PI / 200,       // Gradians
  arcmin: Math.PI / 10800,   // Arcminutes
  arcsec: Math.PI / 648000,  // Arcseconds
  turn: 2 * Math.PI          // Turns
};

const UNITS: UnitDefinition[] = [
  { value: 'deg', label: 'Degrees (°)' },
  { value: 'rad', label: 'Radians (rad)' },
  { value: 'grad', label: 'Gradians (grad)' },
  { value: 'arcmin', label: 'Minutes (arcmin)' },
  { value: 'arcsec', label: 'Seconds (arcsec)' },
  { value: 'turn', label: 'Turns' },
];

function AngleConverter() {
  const { angle: seo } = seoDescriptions;

  const convertAngle = (value: number, unit: string): Record<string, number> => {
    if (!Object.keys(UNIT_TO_RADIANS).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}. Supported units: ${Object.keys(UNIT_TO_RADIANS).join(', ')}`);
    }

    const angleUnit = unit as AngleUnit;

    // Convert to intermediate unit (radians)
    const intermediateValue = value * UNIT_TO_RADIANS[angleUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error('Conversion resulted in non-finite value (possible overflow)');
    }

    // Convert from radians to all units
    return Object.entries(UNIT_TO_RADIANS).reduce((acc, [key, factor]) => {
      acc[key as AngleUnit] = Number((intermediateValue / factor).toFixed(8));
      return acc;
    }, {} as Record<AngleUnit, number>);
  };

  return (
    <UnitConverter
      seo={seo}
      defaultValue="90"
      defaultUnit="deg"
      units={UNITS}
      converterName="Angle Converter"
      validationMessage="Angle must be greater than zero."
      convertFunction={convertAngle}
      toolName='angle'
    />
  );
}

export default React.memo(AngleConverter);