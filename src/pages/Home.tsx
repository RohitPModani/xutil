import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { useOutletContext } from 'react-router-dom';
import UtilityCard from '../components/UtilityCard';
import { ArrowLeftRight, BrainCircuit, Code2, GitCompareArrows, Image, Zap } from 'lucide-react';
import FrequentlyUsedTools from '../components/FrequentlyUsedTools';
import { GitHub } from 'react-feather';

const allUtilities = [
  {
    title: 'Encoding / Decoding',
    icon: BrainCircuit,
    color: '#F59E0B',
    items: [
      { name: 'GUID Generator', path: '/guid' },
      { name: 'ULID Generator', path: '/ulid' },
      { name: 'Password Generator', path: '/password' },
      { name: 'Morse Code Parser', path: '/morse' },
      { name: 'Hash Generator', path: '/hash' },
      { name: 'Base Encoder/ Decoder', path: '/base' },
      { name: 'ROT13 / Caesar Cipher Encoder', path: '/cipher' },
      { name: 'JWT Decoder', path: '/jwt' },
      { name: 'URL Encoder/ Decoder', path: '/eurl' },
      { name: 'HTML Entities Encoder/ Decoder', path: '/html' },
    ],
  },
  {
    title: 'Converters',
    icon: ArrowLeftRight,
    color: '#06B6D4',
    items: [
      { name: 'XML ↔ JSON', path: '/xml_json' },
      { name: 'YAML ↔ JSON', path: '/yaml_json' },
      { name: 'CSV ↔ JSON', path: '/csv_json' },
      { name: 'JSON to TypeScript', path: '/json_ts' },
      { name: 'JSON to Python Dataclass', path: '/json_python' },
      { name: 'JSON to Pydantic Model', path: '/json_pydantic' },
      { name: 'Base Number', path: '/base_number' },
      { name: 'Text ↔ Base Number', path: '/text_base' },
      { name: 'Unix ↔ UTC', path: '/unix_utc' },
      { name: 'Timezone', path: '/timezone' },
      { name: 'Cron Converter', path: '/cron' },
    ],
  },
  {
    title: 'General Converters',
    icon: GitCompareArrows,
    color: '#8B5CF6',
    items: [
      { name: 'Angle', path: '/angle' },
      { name: 'Area', path: '/area' },
      { name: 'Bits/Bytes', path: '/bit_byte' },
      { name: 'Energy', path: '/energy' },
      { name: 'Frequency', path: '/frequency' },
      { name: 'Fuel-Economy', path: '/fuel_economy' },
      { name: 'Length', path: '/length' },
      { name: 'Power', path: '/power' },
      { name: 'Pressure', path: '/pressure' },
      { name: 'Speed', path: '/speed' },
      { name: 'Temperature', path: '/temperature' },
      { name: 'Time Unit', path: '/time' },
      { name: 'Volume', path: '/volume' },
      { name: 'Weight', path: '/weight' },
    ],
  },
  {
    title: 'Text & Code Utilities',
    icon: Code2,
    color: '#10B981',
    items: [
      { name: 'Lorem Ipsum Generator', path: '/lorem' },
      { name: 'SLUG Generator', path: '/slug' },
      { name: 'Text Compare', path: '/text_compare' },
      { name: 'URL Parser', path: '/url_parser' },
      { name: 'JSON Formatter & Validator', path: '/json_validator' },
      { name: 'Text Case Converter', path: '/text_case' },
      { name: 'Markdown Previewer', path: '/markdown' },
      { name: 'Whitespace / Line Break Remover', path: '/line_break_whitespace_remover' },
      { name: 'Duplicate Line Remover', path: '/duplicate_line_remover' },
      { name: 'String Counter', path: '/string_counter' },
      { name: 'Regex Tester', path: '/regex' },
      { name: 'Regex Cheatsheet', path: '/regex_cheatsheet' },
    ],
  },
  {
    title: 'Fun Text Utilities',
    icon: Zap,
    color: '#EC4899',
    items: [
      { name: 'Palindrome Checker', path: '/palindrome' },
      { name: 'String Reverser / Rotator', path: '/string_reverser_rotator' },
      { name: 'Roman Numeral Converter', path: '/roman_numeral' },
      { name: 'NATO Phonetic Alphabet Converter', path: '/nato_phonetic' },
      { name: 'Pig Latin Converter', path: '/pig_latin' },
      { name: 'NumeroNym Generator', path: '/numeronym' },
      { name: 'Leetspeak Translator', path: '/leetspeak' },
      { name: 'Word Frequency Counter', path: '/word_frequency_counter' },
    ],
  },
  {
    title: 'Barcode, QR & Image Tools',
    icon: Image,
    color: '#F97316',
    items: [
      { name: 'QR Code Generator', path: '/qr_code' },
      { name: 'Barcode Generator', path: '/barcode_generator' },
      { name: 'Barcode / QR Reader', path: '/barcode_reader' },
      { name: 'Color Picker', path: '/color_picker' },
      { name: 'Favicon Generator', path: '/favicon' },
      { name: 'Image Compressor', path: '/image_compressor' },
      { name: 'Gradient Generator (CSS)', path: '/gradient_generator' },
      { name: 'Box Shadow Generator (CSS)', path: '/box_shadow_generator' },
    ],
  },
];

const TOTAL_TOOLS = allUtilities.reduce((acc, u) => acc + u.items.length, 0);

const STATS = [
  `${TOTAL_TOOLS}+ Tools`,
  'No Ads',
  'Privacy First',
  'Open Source',
];

const fuseOptions = {
  keys: ['name'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
  ignoreLocation: true,
  shouldSort: true,
};

function Home() {
  const { searchQuery, updateSearchResults } = useOutletContext<{
    searchQuery: string;
    updateSearchResults: (hasResults: boolean) => void;
  }>();

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

  const { filteredUtilities, isEmpty } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { filteredUtilities: allUtilities, isEmpty: false };
    }

    const allItemsWithGroup = allUtilities.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupTitle: group.title,
        groupIcon: group.icon,
        groupColor: group.color,
      }))
    );

    const fuse = new Fuse(allItemsWithGroup, fuseOptions);
    const results = fuse.search(searchQuery);

    const groupedResults = new Map();

    results.forEach(({ item }) => {
      if (!groupedResults.has(item.groupTitle)) {
        groupedResults.set(item.groupTitle, {
          title: item.groupTitle,
          icon: item.groupIcon,
          color: item.groupColor,
          items: [],
        });
      }
      groupedResults.get(item.groupTitle).items.push({
        name: item.name,
        path: item.path,
      });
    });

    const filtered = Array.from(groupedResults.values());
    return {
      filteredUtilities: filtered,
      isEmpty: filtered.length === 0 && searchQuery.trim() !== '',
    };
  }, [searchQuery]);

  // Reported from an effect, not from the useMemo body: calling the parent's
  // setState while this component renders triggers a React warning.
  useEffect(() => {
    updateSearchResults(!isEmpty);
  }, [isEmpty, updateSearchResults]);

  return (
    <div className="space-y-5 pt-3 sm:pt-4">
      {/* Stats bar + recently used — only when not searching */}
      {searchQuery === '' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {STATS.map((stat) => (
              <span key={stat} className="stat-chip">
                {stat}
              </span>
            ))}
          </div>
          <FrequentlyUsedTools />
        </motion.div>
      )}

      {/* No results state */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="max-w-md space-y-4">
            <p className="text-4xl font-bold font-display text-zinc-300 dark:text-zinc-600">
              ¯\_(ツ)_/¯
            </p>
            <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">
              No results for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
              Can't find it? Request it — we build what developers need.
            </p>
            <a
              href="https://github.com/RohitPModani/xutil/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full text-sm font-mono transition-all duration-200 hover:scale-105"
            >
              <GitHub className="w-4 h-4" />
              Request on GitHub
            </a>
          </div>
        </div>
      ) : (
        /* Tool category grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUtilities.map((util, index) => (
            <motion.div
              key={util.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
            >
              <UtilityCard
                title={util.title}
                icon={util.icon}
                items={util.items}
                color={(util as typeof allUtilities[0]).color}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
