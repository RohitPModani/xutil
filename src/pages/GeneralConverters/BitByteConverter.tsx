import UnitConverter from './UnitConverter';

type BitByteUnit = 'Bit' | 'Byte' | 'Kb' | 'KB' | 'Mb' | 'MB' | 'Gb' | 'GB' | 'Tb' | 'TB' | 'Pb' | 'PB';

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
  PB: 8e15,
};

const UNITS: { value: BitByteUnit; label: string }[] = [
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

function convert(value: number, unit: string): Record<string, number> {
  if (!(unit in UNIT_TO_BITS)) throw new Error(`Unknown unit: ${unit}`);
  const bits = value * UNIT_TO_BITS[unit as BitByteUnit];
  if (!Number.isFinite(bits)) throw new Error('The value is too large to convert.');
  return Object.fromEntries(Object.entries(UNIT_TO_BITS).map(([k, f]) => [k, Number((bits / f).toFixed(8))]));
}

export default function BitByteConverter() {
  return <UnitConverter id="bit_byte" defaultValue="1" defaultUnit="Gb" units={UNITS} validationMessage="Value must be greater than zero." convert={convert} />;
}
