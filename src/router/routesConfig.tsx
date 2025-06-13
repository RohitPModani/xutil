import { lazy } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';

// Encode-Decode Tools
const Home = lazy(() => import('../pages/Home'));
const GuidGenerator = lazy(() => import('../pages/Encode-Decode/GuidGenerator'));
const PasswordGenerator = lazy(() => import('../pages/Encode-Decode/PasswordGenerator'));
const HashGenerator = lazy(() => import('../pages/Encode-Decode/HashGenerator'));
const BaseEncoderDecoder = lazy(() => import('../pages/Encode-Decode/BaseEncoderDecoder'));
const CipherEncoderDecoder = lazy(() => import('../pages/Encode-Decode/CipherEncoderDecoder'));
const JWTEncoderDecoder = lazy(() => import('../pages/Encode-Decode/JWTDecoder'));
const HtmlEntities = lazy(() => import('../pages/Encode-Decode/HTMLEntities'));
const ULIDGenerator = lazy(() => import('../pages/Encode-Decode/ULIDGenerator'));
const MorseCodeTranslator = lazy(() => import('../pages/Encode-Decode/MorseCodeTranslator'));
const URLEncoderDecoder = lazy(() => import('../pages/Encode-Decode/URLEncoderDecoder'));

// Converters
const XMLJSONConverter = lazy(() => import('../pages/Converters/XmlJsonConverter'));
const YAMLJSONConverter = lazy(() => import('../pages/Converters/YamlJsonConverter'));
const CSVJSONConverter = lazy(() => import('../pages/Converters/CsvJsonConverter'));
const JSONTypescriptConverter = lazy(() => import('../pages/Converters/JsonTypescriptConverter'));
const JSONPythonClassConverter = lazy(() => import('../pages/Converters/JsonPythonConverter'));
const JSONPydanticClassConverter = lazy(() => import('../pages/Converters/JsonPydanticConverter'));
const BaseNumberConverter = lazy(() => import('../pages/Converters/BaseNumberConverter'));
const TextBaseConverter = lazy(() => import('../pages/Converters/TextBaseConverter'));
const UnixUtcConverter = lazy(() => import('../pages/Converters/UnixUTCTimeConverter'));
const TimezoneConverter = lazy(() => import('../pages/Converters/TimezoneConverter'));
const CronConverter = lazy(() => import('../pages/Converters/CronConverter'));

// General Converters
const TimeUnitConverter = lazy(() => import('../pages/GeneralConverters/TimeUnitConverter'));
const BitByteConverter = lazy(() => import('../pages/GeneralConverters/BitByteConverter'));
const TemperatureConverter = lazy(() => import('../pages/GeneralConverters/TemperatureConverter'));
const LengthConverter = lazy(() => import('../pages/GeneralConverters/LengthConverter'));
const AreaConverter = lazy(() => import('../pages/GeneralConverters/AreaConverter'));
const WeightConverter = lazy(() => import('../pages/GeneralConverters/WeightConverter'));
const VolumeConverter = lazy(() => import('../pages/GeneralConverters/VolumeConverter'));
const SpeedConverter = lazy(() => import('../pages/GeneralConverters/SpeedConverter'));
const EnergyConverter = lazy(() => import('../pages/GeneralConverters/EnergyConverter'));
const PowerConverter = lazy(() => import('../pages/GeneralConverters/PowerConverter'));
const PressureConverter = lazy(() => import('../pages/GeneralConverters/PressureConverter'));
const FrequencyConverter = lazy(() => import('../pages/GeneralConverters/FrequencyConverter'));
const AngleConverter = lazy(() => import('../pages/GeneralConverters/AngleConverter'));
const FuelEconomyConverter = lazy(() => import('../pages/GeneralConverters/FuelEconomyConverter'));

// Text Utilities
const LoremIpsumGenerator = lazy(() => import('../pages/Text-Utilities/LoremIpsumGenerator'));
const SlugGenerator = lazy(() => import('../pages/Text-Utilities/SlugGenerator'));
const TextCompare = lazy(() => import('../pages/Text-Utilities/TextCompare'));
const JSONValidator = lazy(() => import('../pages/Text-Utilities/JSONValidator'));
const TextCaseConverter = lazy(() => import('../pages/Text-Utilities/TextCaseConverter'));
const RegexTester = lazy(() => import('../pages/Text-Utilities/RegexTester'));
const MarkdownPreviewer = lazy(() => import('../pages/Text-Utilities/MarkdownPreviewer'));
const DuplicateLineRemover = lazy(() => import('../pages/Text-Utilities/DuplicateLineRemover'));
const LineBreakWhiteSpaceRemover = lazy(() => import('../pages/Text-Utilities/LineBreakWhiteSpaceRemover'));
const StringCounter = lazy(() => import('../pages/Text-Utilities/StringCounter'));
const URLParser = lazy(() => import('../pages/Text-Utilities/URLParser'));
const RegexCheatsheet = lazy(() => import('../pages/Text-Utilities/RegexCheatSheet'));

// Fun Text Utilities
const PalindromeChecker = lazy(() => import('../pages/Fun-Text-Utilities/PalindromeChecker'));
const StringReverserRotator = lazy(() => import('../pages/Fun-Text-Utilities/StringReverserRotator'));
const RomanNumeralConverter = lazy(() => import('../pages/Fun-Text-Utilities/RomanNumeralConverter'));
const NATOPhoneticAlphabetConverter = lazy(() => import('../pages/Fun-Text-Utilities/NATOPhonetic'));
const PigLatinConverter = lazy(() => import('../pages/Fun-Text-Utilities/PigLatinConverter'));
const NumeronymGenerator = lazy(() => import('../pages/Fun-Text-Utilities/NumeroNymGenerator'));
const LeetSpeakTranslator = lazy(() => import('../pages/Fun-Text-Utilities/LeetSpeakTranslator'));
const WordFrequencyCounter = lazy(() => import('../pages/Fun-Text-Utilities/WordFrequencyCounter'));

// Image Tools
const QRCodeGenerator = lazy(() => import('../pages/Image-Tools/QRCodeGenerator'));
const BarcodeGenerator = lazy(() => import('../pages/Image-Tools/BarCodeGenerator'));
const BarcodeReader = lazy(() => import('../pages/Image-Tools/BarcodeReader'));
const ColorPicker = lazy(() => import('../pages/Image-Tools/ColorPicker'));
const FaviconGenerator = lazy(() => import('../pages/Image-Tools/FaviconGenerator'));
const ImageCompressor = lazy(() => import('../pages/Image-Tools/ImageCompressor'));
const GradientGenerator = lazy(() => import('../pages/Image-Tools/GradientGenerator'));
const BoxShadowGenerator = lazy(() => import('../pages/Image-Tools/BoxShadowGenerator'));

// Route configuration helper
const createRoute = (path: string, Component: React.LazyExoticComponent<any>) => ({
  path,
  element: <Component />,
  errorElement: <ErrorBoundary />
});

// Grouped routes
const encodeDecodeRoutes = [
  createRoute('guid', GuidGenerator),
  createRoute('password', PasswordGenerator),
  createRoute('hash', HashGenerator),
  createRoute('base', BaseEncoderDecoder),
  createRoute('cipher', CipherEncoderDecoder),
  createRoute('jwt', JWTEncoderDecoder),
  createRoute('html', HtmlEntities),
  createRoute('ulid', ULIDGenerator),
  createRoute('morse', MorseCodeTranslator),
  createRoute('eurl', URLEncoderDecoder),
];

const converterRoutes = [
  createRoute('xml_json', XMLJSONConverter),
  createRoute('yaml_json', YAMLJSONConverter),
  createRoute('csv_json', CSVJSONConverter),
  createRoute('json_ts', JSONTypescriptConverter),
  createRoute('json_python', JSONPythonClassConverter),
  createRoute('json_pydantic', JSONPydanticClassConverter),
  createRoute('base_number', BaseNumberConverter),
  createRoute('text_base', TextBaseConverter),
  createRoute('unix_utc', UnixUtcConverter),
  createRoute('timezone', TimezoneConverter),
  createRoute('cron', CronConverter),
];

const generalConverterRoutes = [
  createRoute('time', TimeUnitConverter),
  createRoute('bit_byte', BitByteConverter),
  createRoute('temperature', TemperatureConverter),
  createRoute('length', LengthConverter),
  createRoute('area', AreaConverter),
  createRoute('weight', WeightConverter),
  createRoute('volume', VolumeConverter),
  createRoute('speed', SpeedConverter),
  createRoute('energy', EnergyConverter),
  createRoute('power', PowerConverter),
  createRoute('pressure', PressureConverter),
  createRoute('frequency', FrequencyConverter),
  createRoute('angle', AngleConverter),
  createRoute('fuel_economy', FuelEconomyConverter),
];

const textUtilityRoutes = [
  createRoute('lorem', LoremIpsumGenerator),
  createRoute('slug', SlugGenerator),
  createRoute('text_compare', TextCompare),
  createRoute('json_validator', JSONValidator),
  createRoute('text_case', TextCaseConverter),
  createRoute('regex', RegexTester),
  createRoute('markdown', MarkdownPreviewer),
  createRoute('duplicate_line_remover', DuplicateLineRemover),
  createRoute('line_break_whitespace_remover', LineBreakWhiteSpaceRemover),
  createRoute('string_counter', StringCounter),
  createRoute('url_parser', URLParser),
  createRoute('regex_cheatsheet', RegexCheatsheet),
];

const funTextUtilityRoutes = [
  createRoute('palindrome', PalindromeChecker),
  createRoute('string_reverser_rotator', StringReverserRotator),
  createRoute('roman_numeral', RomanNumeralConverter),
  createRoute('nato_phonetic', NATOPhoneticAlphabetConverter),
  createRoute('pig_latin', PigLatinConverter),
  createRoute('numeronym', NumeronymGenerator),
  createRoute('leetspeak', LeetSpeakTranslator),
  createRoute('word_frequency_counter', WordFrequencyCounter),
];

const imageToolRoutes = [
  createRoute('qr_code', QRCodeGenerator),
  createRoute('barcode_generator', BarcodeGenerator),
  createRoute('barcode_reader', BarcodeReader),
  createRoute('color_picker', ColorPicker),
  createRoute('favicon', FaviconGenerator),
  createRoute('image_compressor', ImageCompressor),
  createRoute('gradient_generator', GradientGenerator),
  createRoute('box_shadow_generator', BoxShadowGenerator),
];

export const appRoutes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home />, errorElement: <ErrorBoundary /> },
      ...encodeDecodeRoutes,
      ...converterRoutes,
      ...generalConverterRoutes,
      ...textUtilityRoutes,
      ...funTextUtilityRoutes,
      ...imageToolRoutes,
      { path: '*', element: <NotFound /> },
    ],
  }
];