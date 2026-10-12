import UnitConverter from './UnitConverter';
import { linearConvert } from '../../utils/units';

type BitByteUnit =
  | 'bit' | 'B'
  | 'kbit' | 'kB' | 'Mbit' | 'MB' | 'Gbit' | 'GB' | 'Tbit' | 'TB' | 'Pbit' | 'PB'
  | 'KiB' | 'MiB' | 'GiB' | 'TiB';

const UNITS: { value: BitByteUnit; label: string }[] = [
  { value: 'bit', label: 'Bits (bit)' },
  { value: 'B', label: 'Bytes (B)' },
  { value: 'kbit', label: 'Kilobits (kbit)' },
  { value: 'kB', label: 'Kilobytes (kB)' },
  { value: 'Mbit', label: 'Megabits (Mbit)' },
  { value: 'MB', label: 'Megabytes (MB)' },
  { value: 'Gbit', label: 'Gigabits (Gbit)' },
  { value: 'GB', label: 'Gigabytes (GB)' },
  { value: 'Tbit', label: 'Terabits (Tbit)' },
  { value: 'TB', label: 'Terabytes (TB)' },
  { value: 'Pbit', label: 'Petabits (Pbit)' },
  { value: 'PB', label: 'Petabytes (PB)' },
  { value: 'KiB', label: 'Kibibytes (KiB, 1024 B)' },
  { value: 'MiB', label: 'Mebibytes (MiB, 1024² B)' },
  { value: 'GiB', label: 'Gibibytes (GiB, 1024³ B)' },
  { value: 'TiB', label: 'Tebibytes (TiB, 1024⁴ B)' },
];

// SI prefixes are powers of 1000; IEC binary prefixes are powers of 1024.
const UNIT_TO_BITS: Record<BitByteUnit, number> = {
  bit: 1,
  B: 8,
  kbit: 1e3,
  kB: 8e3,
  Mbit: 1e6,
  MB: 8e6,
  Gbit: 1e9,
  GB: 8e9,
  Tbit: 1e12,
  TB: 8e12,
  Pbit: 1e15,
  PB: 8e15,
  KiB: 8 * 1024,
  MiB: 8 * 1024 ** 2,
  GiB: 8 * 1024 ** 3,
  TiB: 8 * 1024 ** 4,
};

export default function BitByteConverter() {
  return <UnitConverter id="bit_byte" defaultValue="1" defaultUnit="Gbit" units={UNITS} validationMessage="Value must be greater than zero." convert={linearConvert(UNIT_TO_BITS)} />;
}
