import UnitConverter from "./UnitConverter";
import seoDescriptions from '../../data/seoDescriptions';

function BitByteConverter() {
  const seo = seoDescriptions.bitByte;

  const units = [
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

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="Gb"
      units={units}
      apiEndpoint="/bit-byte/convert"
      converterName="Bit ↔ Byte Converter"
      validationMessage="Value must be greater than zero."
    />
  );
}

export default BitByteConverter;