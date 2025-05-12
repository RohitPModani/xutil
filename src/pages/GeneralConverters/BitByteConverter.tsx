import React from 'react';
import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

// Define types for better type safety
type BitByteUnit = 'Bit' | 'Byte' | 'Kb' | 'KB' | 'Mb' | 'MB' | 'Gb' | 'GB' | 'Tb' | 'TB' | 'Pb' | 'PB';

interface UnitDefinition {
  value: BitByteUnit;
  label: string;
}

// Constants defined outside component to prevent recreation on each render
const UNIT_TO_BITS: Record<BitByteUnit, number> = {
  Bit: 1,
  Byte: 8,
  Kb: 1e3,
  KB: 8e3,
  Mb: 1e6,
  MB: 8e6,
  Gb: 1e9,
  GB: 8e9,
  Tb: 1e12,
  TB: 8e12,
  Pb: 1e15,
  PB: 8e15
};

const UNITS: UnitDefinition[] = [
  { value: 'Bit', label: 'Bits (bit)' },
  { value: 'Byte', label: 'Bytes (byte)' },
  { value: 'Kb', label: 'Kilobits (Kb)' },
  { value: 'KB', label: 'Kilobytes (KB)' },
  { value: 'Mb', label: 'Megabits (Mb)' },
  { value: 'MB', label: 'Megabytes (MB)' },
  { value: 'Gb', label: 'Gigabits (Gb)' },
  { value: 'GB', label: 'Gigabytes (GB)' },
  { value: 'Tb', label: 'Terabits (Tb)' },
  { value: 'TB', label: 'Terabytes (TB)' },
  { value: 'Pb', label: 'Petabits (Pb)' },
  { value: 'PB', label: 'Petabytes (PB)' },
];

function BitByteConverter() {
  const { bitByte: seo } = seoDescriptions;

  const convertBitByte = (value: number, unit: string): Record<BitByteUnit, number> => {
    // Convert to intermediate unit (bits)
    if(!Object.keys(UNIT_TO_BITS).includes(unit)) {
      throw new Error(`Invalid unit: ${unit}. Supported units: ${Object.keys(UNIT_TO_BITS).join(', ')}`);
    }
    const bitByteUnit = unit as BitByteUnit;
    // Type assertion to ensure unit is a valid BitByteUnit
    const intermediateValue = value * UNIT_TO_BITS[bitByteUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error('Conversion resulted in non-finite value (possible overflow)');
    }

    // Convert from bits to all units
    return (Object.entries(UNIT_TO_BITS) as [BitByteUnit, number][]).reduce(
      (acc, [key, factor]) => {
        acc[key] = Number((intermediateValue / factor).toFixed(8));
        return acc;
      },
      {} as Record<BitByteUnit, number>
    );
  };

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="Gb"
      units={UNITS}
      converterName="Bit ↔ Byte Converter"
      validationMessage="Value must be greater than zero."
      convertFunction={convertBitByte}
      toolName='bit_byte'
    />
  );
}

export default React.memo(BitByteConverter);