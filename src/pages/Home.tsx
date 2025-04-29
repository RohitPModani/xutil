import { useMemo } from 'react';
import UtilityCard from '../components/UtilityCard';

function Home() {

  const utilities = useMemo(() => [
    {
      title: 'Encoding / Decoding',
      icon: '🧠',
      items: [
        { name: 'GUID Generator', path: '/guid' },
        { name: 'ULID Generator', path:'/ulid' },
        { name: 'Password Generator', path: '/password' },
        { name: 'Morse Code Parser', path: '/morse' },
        { name: 'Hash Generator (MD5, SHA1, SHA256…)', path: '/hash' },
        { name: 'Base Encoder/ Decoder (Base32/ Base58/ Base64)', path: '/base' },
        { name: 'ROT13 / Caesar Cipher Encoder', path: '/cipher' },
        { name: 'JWT Encoder/ Decoder', path: '/jwt' },
        { name: 'URL Encoder/ Decoder', path: 'eurl' },
        { name: 'HTML Entities Encoder/ Decoder', path: '/html' },
      ],
    },
    {
      title: 'Converters & Formatters',
      icon: '🧾',
      items: [
        { name: 'XML ↔ JSON', path: 'xml_json' },
        { name: 'YAML ↔ JSON', path: 'yaml_json' },
        { name: 'CSV ↔ JSON', path: 'csv_json' },
        { name: 'JSON to TypeScript', path: 'json_ts' },
        { name: 'JSON to Python Dataclass', path: 'json_python' },
        { name: 'JSON to Pydantic Model', path: 'json_pydantic' },
        { name: 'Number Base Converter', path: 'number_base' },
        { name: 'Text ↔ Binary / Hex / Octal / Decimal', path: 'text_base' },
        'Unix Timestamp ↔ Human Time Converter',
        'Timezone Converter',
        'DPI ↔ PPI',
        'px ↔ rem/em',
        'ms ↔ sec ↔ min',
        'Bits/Bytes ↔ KB/MB/GB',
        'Temperature, Distance, Weight Converters',
      ],
    },
    {
      title: 'Text & Code Utilities',
      icon: '✍️',
      items: [
        'Lorem Ipsum Generator',
        'SLUG Generator',
        'Text Diff / File Compare',
        'JSON Formatter & Validator',
        'Regex Tester',
        'Markdown Previewer',
        'Text Case Converter (camelCase, snake_case, etc.)',
        'String Reverser / Shuffler / Rotator',
        'Whitespace / Line Break Cleaner',
        'Duplicate Line Remover',
        'Palindrome Checker / Anagram Generator',
        'String/ Word/ Char/ Line Counter',
      ],
    },
    {
      title: 'Web & Network Tools',
      icon: '🌐',
      items: [
        'IP Info Finder',
        'DNS Lookup',
        'Ping & HTTP Response Checker',
        'HTTP Status Code Lookup',
        'SSL Certificate Checker',
        'URL Parser',
        'Safe Port Scanner',
      ],
    },
    {
      title: 'Barcode, QR & Image Tools',
      icon: '🖼️',
      items: [
        'QR Code Generator',
        'Barcode Generator (With Format Selector)',
        'Barcode Reader (via image upload)',
        'Color Converter (HEX ↔ RGB ↔ HSL)',
        'Hex/RGB Color Picker',
        'Favicon Generator (ICO + PNGs)',
        'Image Compressor',
        'SVG Optimizer',
        'Gradient Generator (CSS)',
        'Box Shadow Generator (CSS)',
      ],
    },
    {
      title: 'File & Misc Utilities',
      icon: '📄',
      items: [
        'CSV Column Extractor',
        'HTML/CSS/JS Minifier',
        'JSON/JS/CSS Prettifier',
        'Fake Data Generator (Names, Emails, etc.)',
        'UUID Validator',
      ],
    },
  ], []); // Only create once on initial render

  return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilities.map((util, index) => (
            <UtilityCard
              key={index}
              title={util.title}
              icon={util.icon}
              items={util.items}
            />
          ))}
        </div>
  );
}

export default Home;