import React from 'react';
import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

type weightUnit = 'mg' | 'g' | 'kg' | 't' | 'oz' | 'lb' | 'st';

const UNITS: { value: weightUnit, label: string } [] = [
    { value: 'mg', label: 'Milligrams (mg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 't', label: 'Metric Tons (t)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'st', label: 'Stones (st)' },
  ];

const UNIT_TO_KILOGRAMS: Record<weightUnit, number> = {
  mg: 1e-6,                 // Milligrams
  g: 1e-3,                  // Grams
  kg: 1,                    // Kilograms
  t: 1000,                  // Metric Tons
  oz: 0.028349523125,       // Ounces
  lb: 0.45359237,           // Pounds
  st: 6.35029318,           // Stones
};

function WeightConverter() {

  const convertWeight = (value: number, unit: string): Record<string, number> => {
    if(!Object.keys(UNIT_TO_KILOGRAMS).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}. Supported units: ${Object.keys(UNIT_TO_KILOGRAMS).join(', ')}`);
    }

    // Convert to intermediate unit (kilograms)
    const intermediateValue = value * UNIT_TO_KILOGRAMS[unit as weightUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error('Conversion resulted in non-finite value (possible overflow)');
    }

    // Convert from kilograms to all units and round to 8 decimal places
    const convertedValues: Record<string, number> = {};
    Object.entries(UNIT_TO_KILOGRAMS).forEach(([key, factor]) => {
      convertedValues[key] = Number((intermediateValue/factor).toFixed(8));
    });

    return convertedValues;
  };

  return (
    <UnitConverter
      seo={seoDescriptions.weight}
      defaultValue="1"
      defaultUnit="kg"
      units={UNITS}
      converterName="Weight Converter"
      validationMessage="Weight must be greater than zero."
      convertFunction={convertWeight}
      toolName='weight'
    />
  );
}

export default React.memo(WeightConverter);