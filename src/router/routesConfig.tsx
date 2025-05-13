import { lazy } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';

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
const PalindromeChecker = lazy(() => import('../pages/Fun-Text-Utilities/PalindromeChecker'));
const StringReverserRotator = lazy(() => import('../pages/Fun-Text-Utilities/StringReverserRotator'));
const RomanNumeralConverter = lazy(() => import('../pages/Fun-Text-Utilities/RomanNumeralConverter'));
const NATOPhoneticAlphabetConverter = lazy(() => import('../pages/Fun-Text-Utilities/NATOPhonetic'));
const PigLatinConverter = lazy(() => import('../pages/Fun-Text-Utilities/PigLatinConverter'));
const NumeronymGenerator = lazy(() => import('../pages/Fun-Text-Utilities/NumeroNymGenerator'));
const URLParser = lazy(() => import('../pages/Text-Utilities/URLParser'));
const RegexCheatsheet = lazy(() => import('../pages/Text-Utilities/RegexCheatSheet'));
const QRCodeGenerator = lazy(() => import('../pages/Image-Tools/QRCodeGenerator'));

export const appRoutes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home />, errorElement: <ErrorBoundary /> },
      { path: 'guid', element: <GuidGenerator />, errorElement: <ErrorBoundary /> },
      { path: 'password', element: <PasswordGenerator />, errorElement: <ErrorBoundary /> },
      { path: 'hash', element: <HashGenerator />, errorElement: <ErrorBoundary /> },
      { path: 'base', element: <BaseEncoderDecoder />, errorElement: <ErrorBoundary /> },
      { path: 'cipher', element: <CipherEncoderDecoder />, errorElement: <ErrorBoundary /> },
      { path: 'jwt', element: <JWTEncoderDecoder />, errorElement: <ErrorBoundary /> },
      { path: 'html', element: <HtmlEntities />, errorElement: <ErrorBoundary />},
      { path: 'ulid', element: <ULIDGenerator />, errorElement: <ErrorBoundary />},
      { path: 'morse', element: <MorseCodeTranslator />, errorElement: <ErrorBoundary />},
      { path: 'eurl', element: <URLEncoderDecoder />, errorElement: <ErrorBoundary />},
      { path: 'xml_json', element: <XMLJSONConverter />, errorElement: <ErrorBoundary />},
      { path: 'yaml_json', element: <YAMLJSONConverter />, errorElement: <ErrorBoundary />},
      { path: 'csv_json', element: <CSVJSONConverter />, errorElement: <ErrorBoundary />},
      { path: 'json_ts', element: <JSONTypescriptConverter />, errorElement: <ErrorBoundary />},
      { path: 'json_python', element: <JSONPythonClassConverter />, errorElement: <ErrorBoundary />},
      { path: 'json_pydantic', element: <JSONPydanticClassConverter />, errorElement: <ErrorBoundary />},
      { path: 'base_number', element: <BaseNumberConverter />, errorElement: <ErrorBoundary />},
      { path: 'text_base', element: <TextBaseConverter />, errorElement: <ErrorBoundary />},
      { path: 'unix_utc', element: <UnixUtcConverter />, errorElement: <ErrorBoundary />},
      { path: 'timezone', element: <TimezoneConverter />, errorElement: <ErrorBoundary />},
      { path: 'time', element: <TimeUnitConverter />, errorElement: <ErrorBoundary />},
      { path: 'bit_byte', element: <BitByteConverter />, errorElement: <ErrorBoundary />},
      { path: 'temperature', element: <TemperatureConverter />, errorElement: <ErrorBoundary />},
      { path: 'length', element: <LengthConverter />, errorElement: <ErrorBoundary />},
      { path: 'area', element: <AreaConverter />, errorElement: <ErrorBoundary />},
      { path: 'weight', element: <WeightConverter />, errorElement: <ErrorBoundary />},
      { path: 'volume', element: <VolumeConverter />, errorElement: <ErrorBoundary />},
      { path: 'speed', element: <SpeedConverter />, errorElement: <ErrorBoundary />},
      { path: 'energy', element: <EnergyConverter />, errorElement: <ErrorBoundary />},
      { path: 'power', element: <PowerConverter />, errorElement: <ErrorBoundary />},
      { path: 'pressure', element: <PressureConverter />, errorElement: <ErrorBoundary />},
      { path: 'frequency', element: <FrequencyConverter />, errorElement: <ErrorBoundary />},
      { path: 'angle', element: <AngleConverter />, errorElement: <ErrorBoundary />},
      { path: 'fuel_economy', element: <FuelEconomyConverter />, errorElement: <ErrorBoundary />},
      { path: 'lorem', element: <LoremIpsumGenerator />, errorElement: <ErrorBoundary />},
      { path: 'slug', element: <SlugGenerator />, errorElement: <ErrorBoundary />},
      { path: 'text_compare', element: <TextCompare />, errorElement: <ErrorBoundary />},
      { path: 'json_validator', element: <JSONValidator />, errorElement: <ErrorBoundary />},
      { path: 'text_case', element: <TextCaseConverter />, errorElement: <ErrorBoundary />},
      { path: 'regex', element: <RegexTester />, errorElement: <ErrorBoundary />},
      { path: 'markdown', element: <MarkdownPreviewer />, errorElement: <ErrorBoundary />},
      { path: 'duplicate_line_remover', element: <DuplicateLineRemover />, errorElement: <ErrorBoundary />},
      { path: 'line_break_whitespace_remover', element: <LineBreakWhiteSpaceRemover />, errorElement: <ErrorBoundary />},
      { path: 'string_counter', element: <StringCounter />, errorElement: <ErrorBoundary />},
      { path: 'palindrome', element: <PalindromeChecker />, errorElement: <ErrorBoundary />},
      { path: 'string_reverser_rotator', element: <StringReverserRotator />, errorElement: <ErrorBoundary />},
      { path: 'roman_numeral', element: <RomanNumeralConverter />, errorElement: <ErrorBoundary />},
      { path: 'nato_phonetic', element: <NATOPhoneticAlphabetConverter />, errorElement: <ErrorBoundary /> },
      { path: 'pig_latin', element: <PigLatinConverter />, errorElement: <ErrorBoundary />},
      { path: 'numeronym', element: <NumeronymGenerator />, errorElement: <ErrorBoundary />},
      { path: 'url_parser', element: <URLParser />, errorElement: <ErrorBoundary />},
      { path: 'regex_cheatsheet', element: <RegexCheatsheet />, errorElement: <ErrorBoundary />},
      { path: 'qr_code', element: <QRCodeGenerator />, errorElement: <ErrorBoundary />},
      { path: '*', element: <NotFound /> },
    ],
  }
];