import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import UtilityCard from '../components/UtilityCard';
import { BrainCircuit, Code2, File, FileText, Image, Network } from 'lucide-react';

const allUtilities = [
  {
    title: 'Encoding / Decoding',
    icon: BrainCircuit,
    items: [
      { name: 'GUID Generator', path: '/guid' },
      { name: 'ULID Generator', path: '/ulid' },
      { name: 'Password Generator', path: '/password' },
      { name: 'Morse Code Parser', path: '/morse' },
      { name: 'Hash Generator (MD5, SHA1, SHA256…)', path: '/hash' },
      { name: 'Base Encoder/ Decoder (Base32/ Base58/ Base64)', path: '/base' },
      { name: 'ROT13 / Caesar Cipher Encoder', path: '/cipher' },
      { name: 'JWT Encoder/ Decoder', path: '/jwt' },
      { name: 'URL Encoder/ Decoder', path: '/eurl' },
      { name: 'HTML Entities Encoder/ Decoder', path: '/html' },
    ],
  },
  {
    title: 'Converters & Formatters',
    icon: FileText,
    items: [
      { name: 'XML ↔ JSON', path: '/xml_json' },
      { name: 'YAML ↔ JSON', path: '/yaml_json' },
      { name: 'CSV ↔ JSON', path: '/csv_json' },
      { name: 'JSON to TypeScript', path: '/json_ts' },
      { name: 'JSON to Python Dataclass', path: '/json_python' },
      { name: 'JSON to Pydantic Model', path: '/json_pydantic' },
      { name: 'Number Base Converter', path: '/number_base' },
      { name: 'Text ↔ Binary / Hex / Octal / Decimal', path: '/text_base' },
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
    icon: Code2,
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
    icon: Network,
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
    icon: Image,
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
    icon: File,
    items: [
      'CSV Column Extractor',
      'HTML/CSS/JS Minifier',
      'JSON/JS/CSS Prettifier',
      'Fake Data Generator (Names, Emails, etc.)',
      'UUID Validator',
    ],
  },
];

function Home() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  useEffect(() => {
    document.title = 'XUtil | Developer Tools';
    const toolName = sessionStorage.getItem('lastClickedTool');
    const isMobile = window.innerWidth < 768;

    if (toolName && isMobile) {
      const elementId = toolName.replace(/\s+/g, '-').toLowerCase();
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      sessionStorage.removeItem('lastClickedTool');
    }
  }, []);

  const filteredUtilities = useMemo(() => {
    if (!searchQuery.trim()) return allUtilities;

    const query = searchQuery.toLowerCase();
    return allUtilities
      .map(group => {
        const filteredItems = group.items.filter(item => {
          const name = typeof item === 'string' ? item : item.name;
          return name.toLowerCase().includes(query);
        });
        return filteredItems.length
          ? { ...group, items: filteredItems }
          : null;
      })
      .filter((group): group is typeof allUtilities[number] => group !== null);
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredUtilities.map((util, index) => (
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