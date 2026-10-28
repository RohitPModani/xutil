import type { ComponentType } from 'react';

/**
 * The one registry every surface reads from: the sidebar, the index, the
 * command palette, the router, the tool-page header and the usage tracker.
 *
 * `in` / `out` form the tool's signature (`jwt → header · payload`), which
 * says what a tool does faster than its name can. Generators have no `in`.
 */
export type CategoryId = 'encode' | 'data' | 'units' | 'text' | 'fun' | 'image';

export interface Category {
  id: CategoryId;
  title: string;
}

export interface Tool {
  id: string;
  name: string;
  category: CategoryId;
  in?: string;
  out: string;
  dir?: 'to' | 'both';
  blurb: string;
  keywords?: string;
  /** Key into `seoDescriptions`. */
  seo: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const categories: Category[] = [
  { id: 'encode', title: 'Encode & decode' },
  { id: 'data', title: 'Data formats' },
  { id: 'units', title: 'Units & measures' },
  { id: 'text', title: 'Text & code' },
  { id: 'fun', title: 'Word play' },
  { id: 'image', title: 'Images & colour' },
];

export const tools: Tool[] = [
  // Encode & decode
  { id: 'guid', name: 'GUID Generator', category: 'encode', out: 'uuid v4 · v7', blurb: 'One or many UUIDs, version 4 or 7.', keywords: 'uuid unique id', seo: 'guidGenerator', load: () => import('../pages/Encode-Decode/GuidGenerator') },
  { id: 'ulid', name: 'ULID Generator', category: 'encode', out: 'ulid', blurb: 'Sortable 26-character IDs with a time prefix.', keywords: 'unique id sortable', seo: 'ulidGenerator', load: () => import('../pages/Encode-Decode/ULIDGenerator') },
  { id: 'password', name: 'Password Generator', category: 'encode', out: 'password', blurb: 'Random passwords with length and character-set controls.', keywords: 'random secure', seo: 'passwordGenerator', load: () => import('../pages/Encode-Decode/PasswordGenerator') },
  { id: 'hash', name: 'Hash Generator', category: 'encode', in: 'text · file', out: 'md5 · sha256 · hmac', blurb: 'MD5, SHA-1, SHA-256, SHA-384, SHA-512 and HMAC for text or a file.', keywords: 'checksum digest sha md5 hmac', seo: 'hashGenerator', load: () => import('../pages/Encode-Decode/HashGenerator') },
  { id: 'base', name: 'Base64 Encoder / Decoder', category: 'encode', in: 'text', out: 'base64 · 32 · 58', dir: 'both', blurb: 'Base64, Base32 and Base58 in both directions.', keywords: 'base64 base32 base58 encode decode', seo: 'baseEncoder', load: () => import('../pages/Encode-Decode/BaseEncoderDecoder') },
  { id: 'cipher', name: 'ROT13 / Caesar Cipher', category: 'encode', in: 'text', out: 'rot13 · caesar', dir: 'both', blurb: 'Shift letters by any amount, or ROT13 in one click.', keywords: 'rotate shift encrypt', seo: 'cipherEncoder', load: () => import('../pages/Encode-Decode/CipherEncoderDecoder') },
  { id: 'jwt', name: 'JWT Decoder', category: 'encode', in: 'jwt', out: 'header · payload', blurb: 'Read a token’s header and payload without sending it anywhere.', keywords: 'json web token claims', seo: 'jwtDecoder', load: () => import('../pages/Encode-Decode/JWTDecoder') },
  { id: 'eurl', name: 'URL Encoder / Decoder', category: 'encode', in: 'text', out: 'percent-encoded', dir: 'both', blurb: 'Percent-encode text for URLs, or decode it back.', keywords: 'urlencode escape', seo: 'urlEncoder', load: () => import('../pages/Encode-Decode/URLEncoderDecoder') },
  { id: 'html', name: 'HTML Entities', category: 'encode', in: 'text', out: 'entities', dir: 'both', blurb: 'Escape &, < and > for HTML, or unescape them.', keywords: 'escape unescape', seo: 'htmlEntities', load: () => import('../pages/Encode-Decode/HTMLEntities') },
  { id: 'base64_image', name: 'Base64 Image Encoder', category: 'encode', in: 'image', out: 'data url', dir: 'both', blurb: 'Image to a Base64 data URL for CSS or HTML, or decode one back.', keywords: 'data uri img css base64', seo: 'base64Image', load: () => import('../pages/Encode-Decode/Base64Image') },
  { id: 'morse', name: 'Morse Code Translator', category: 'encode', in: 'text', out: 'morse', dir: 'both', blurb: 'Text to dots and dashes, and back.', keywords: 'dots dashes', seo: 'morseCode', load: () => import('../pages/Encode-Decode/MorseCodeTranslator') },

  // Data formats
  { id: 'xml_json', name: 'XML ⇄ JSON', category: 'data', in: 'xml', out: 'json', dir: 'both', blurb: 'Convert between XML and JSON, from text or a file.', seo: 'xmlJson', load: () => import('../pages/Converters/XmlJsonConverter') },
  { id: 'yaml_json', name: 'YAML ⇄ JSON', category: 'data', in: 'yaml', out: 'json', dir: 'both', blurb: 'Convert between YAML and JSON, from text or a file.', seo: 'yamlJson', load: () => import('../pages/Converters/YamlJsonConverter') },
  { id: 'csv_json', name: 'CSV ⇄ JSON', category: 'data', in: 'csv', out: 'json', dir: 'both', blurb: 'Convert between CSV and JSON, from text or a file.', seo: 'csvJson', load: () => import('../pages/Converters/CsvJsonConverter') },
  { id: 'json_ts', name: 'JSON to TypeScript', category: 'data', in: 'json', out: 'interface', blurb: 'Infer TypeScript interfaces from a JSON sample.', keywords: 'types typescript', seo: 'jsonToTs', load: () => import('../pages/Converters/JsonTypescriptConverter') },
  { id: 'json_python', name: 'JSON to Python Dataclass', category: 'data', in: 'json', out: 'dataclass', blurb: 'Infer Python dataclasses from a JSON sample.', keywords: 'python types', seo: 'jsonToPython', load: () => import('../pages/Converters/JsonPythonConverter') },
  { id: 'json_pydantic', name: 'JSON to Pydantic Model', category: 'data', in: 'json', out: 'basemodel', blurb: 'Infer Pydantic models from a JSON sample.', keywords: 'python pydantic', seo: 'jsonToPydantic', load: () => import('../pages/Converters/JsonPydanticConverter') },
  { id: 'base_number', name: 'Base Number Converter', category: 'data', in: 'number', out: 'base 2–36', dir: 'both', blurb: 'Binary, octal, decimal, hex and any base up to 36.', keywords: 'binary hex octal radix', seo: 'baseNumber', load: () => import('../pages/Converters/BaseNumberConverter') },
  { id: 'text_base', name: 'Text ⇄ Binary / Hex', category: 'data', in: 'text', out: 'bin · hex · dec', dir: 'both', blurb: 'Text to binary, hex, octal or decimal, and back.', keywords: 'ascii bytes', seo: 'textBase', load: () => import('../pages/Converters/TextBaseConverter') },
  { id: 'unix_utc', name: 'Unix ⇄ UTC', category: 'data', in: 'epoch', out: 'utc', dir: 'both', blurb: 'Epoch seconds or milliseconds to a readable date, and back.', keywords: 'timestamp epoch date', seo: 'unixUtc', load: () => import('../pages/Converters/UnixUTCTimeConverter') },
  { id: 'timezone', name: 'Timezone Converter', category: 'data', in: 'time', out: 'any zone', blurb: 'Convert a time between cities, with DST handled.', keywords: 'time zone clock meeting', seo: 'timezone', load: () => import('../pages/Converters/TimezoneConverter') },
  { id: 'cron', name: 'Cron Converter', category: 'data', in: 'english', out: 'cron', blurb: 'Describe a schedule in words and get the cron expression.', keywords: 'schedule crontab', seo: 'cronConverter', load: () => import('../pages/Converters/CronConverter') },
  { id: 'epoch', name: 'Epoch Clock', category: 'data', out: 'current unix time', blurb: 'The current Unix timestamp, live, in seconds and milliseconds.', keywords: 'unix timestamp now current time', seo: 'epochClock', load: () => import('../pages/Converters/EpochClock') },
  { id: 'cidr', name: 'CIDR / Subnet Calculator', category: 'data', in: 'ip/prefix', out: 'range · mask · hosts', blurb: 'Network, broadcast, mask and host count for an IPv4 CIDR block.', keywords: 'ip subnet netmask network', seo: 'cidrCalculator', load: () => import('../pages/Converters/CidrCalculator') },
  { id: 'chmod', name: 'Chmod Calculator', category: 'data', in: 'rwx', out: 'octal · symbolic', dir: 'both', blurb: 'File permissions as octal (755) or symbolic (rwxr-xr-x).', keywords: 'permissions unix linux 755 644', seo: 'chmodCalculator', load: () => import('../pages/Converters/ChmodCalculator') },

  // Units & measures
  { id: 'angle', name: 'Angle', category: 'units', in: 'deg', out: 'rad · grad · turn', dir: 'both', blurb: 'Degrees, radians, gradians and turns.', seo: 'angle', load: () => import('../pages/GeneralConverters/AngleConverter') },
  { id: 'area', name: 'Area', category: 'units', in: 'm²', out: 'ft² · acre · ha', dir: 'both', blurb: 'Square metres, feet, acres and hectares.', seo: 'area', load: () => import('../pages/GeneralConverters/AreaConverter') },
  { id: 'bit_byte', name: 'Bits / Bytes', category: 'units', in: 'byte', out: 'kb · mb · gb', dir: 'both', blurb: 'Bits, bytes and every prefix up to petabytes.', keywords: 'storage size', seo: 'bitByte', load: () => import('../pages/GeneralConverters/BitByteConverter') },
  { id: 'energy', name: 'Energy', category: 'units', in: 'joule', out: 'cal · kwh · btu', dir: 'both', blurb: 'Joules, calories, kilowatt-hours and BTU.', seo: 'energy', load: () => import('../pages/GeneralConverters/EnergyConverter') },
  { id: 'frequency', name: 'Frequency', category: 'units', in: 'hz', out: 'khz · mhz · rpm', dir: 'both', blurb: 'Hertz, kilohertz, megahertz and RPM.', seo: 'frequency', load: () => import('../pages/GeneralConverters/FrequencyConverter') },
  { id: 'fuel_economy', name: 'Fuel Economy', category: 'units', in: 'mpg', out: 'km/l · l/100km', dir: 'both', blurb: 'Miles per gallon, km per litre and litres per 100 km.', seo: 'fuelEconomy', load: () => import('../pages/GeneralConverters/FuelEconomyConverter') },
  { id: 'length', name: 'Length', category: 'units', in: 'metre', out: 'ft · mile · inch', dir: 'both', blurb: 'Metres, feet, miles, inches and nautical miles.', keywords: 'distance', seo: 'length', load: () => import('../pages/GeneralConverters/LengthConverter') },
  { id: 'power', name: 'Power', category: 'units', in: 'watt', out: 'hp · kw', dir: 'both', blurb: 'Watts, kilowatts and horsepower.', seo: 'power', load: () => import('../pages/GeneralConverters/PowerConverter') },
  { id: 'pressure', name: 'Pressure', category: 'units', in: 'pascal', out: 'bar · psi · atm', dir: 'both', blurb: 'Pascals, bar, PSI and atmospheres.', seo: 'pressure', load: () => import('../pages/GeneralConverters/PressureConverter') },
  { id: 'speed', name: 'Speed', category: 'units', in: 'km/h', out: 'mph · knot · m/s', dir: 'both', blurb: 'km/h, mph, knots and metres per second.', seo: 'speed', load: () => import('../pages/GeneralConverters/SpeedConverter') },
  { id: 'temperature', name: 'Temperature', category: 'units', in: '°c', out: '°f · k', dir: 'both', blurb: 'Celsius, Fahrenheit and Kelvin.', seo: 'temperature', load: () => import('../pages/GeneralConverters/TemperatureConverter') },
  { id: 'time', name: 'Time Unit', category: 'units', in: 'second', out: 'min · hr · day', dir: 'both', blurb: 'Seconds, minutes, hours, days and beyond.', keywords: 'duration', seo: 'timeUnit', load: () => import('../pages/GeneralConverters/TimeUnitConverter') },
  { id: 'volume', name: 'Volume', category: 'units', in: 'litre', out: 'gal · pint · m³', dir: 'both', blurb: 'Litres, gallons, pints and cubic metres.', seo: 'volume', load: () => import('../pages/GeneralConverters/VolumeConverter') },
  { id: 'weight', name: 'Weight', category: 'units', in: 'kg', out: 'lb · oz · stone', dir: 'both', blurb: 'Kilograms, pounds, ounces and stone.', keywords: 'mass', seo: 'weight', load: () => import('../pages/GeneralConverters/WeightConverter') },

  // Text & code
  { id: 'lorem', name: 'Lorem Ipsum Generator', category: 'text', out: 'placeholder text', blurb: 'Placeholder paragraphs, sentences or words.', keywords: 'filler dummy', seo: 'loremIpsum', load: () => import('../pages/Text-Utilities/LoremIpsumGenerator') },
  { id: 'slug', name: 'Slug Generator', category: 'text', in: 'title', out: 'url-slug', blurb: 'Turn a title into a URL-safe slug.', keywords: 'kebab url', seo: 'slug', load: () => import('../pages/Text-Utilities/SlugGenerator') },
  { id: 'text_compare', name: 'Text Compare', category: 'text', in: 'two texts', out: 'diff', blurb: 'Diff by line, word or character, unified or side by side.', keywords: 'diff compare patch', seo: 'textCompare', load: () => import('../pages/Text-Utilities/TextCompare') },
  { id: 'url_parser', name: 'URL Parser', category: 'text', in: 'url', out: 'host · path · query', blurb: 'Break a URL into host, path, query and fragment.', keywords: 'query string params', seo: 'urlParser', load: () => import('../pages/Text-Utilities/URLParser') },
  { id: 'json_validator', name: 'JSON Formatter & Validator', category: 'text', in: 'json', out: 'formatted · errors', blurb: 'Validate, pretty-print or minify JSON.', keywords: 'prettify beautify lint', seo: 'jsonValidator', load: () => import('../pages/Text-Utilities/JSONValidator') },
  { id: 'json_diff', name: 'JSON Diff', category: 'text', in: 'two json', out: 'diff', blurb: 'Compare two JSON documents, ignoring key order and formatting.', keywords: 'compare json', seo: 'jsonDiff', load: () => import('../pages/Text-Utilities/JsonDiff') },
  { id: 'json_path', name: 'JSONPath Tester', category: 'text', in: 'json · path', out: 'matches', blurb: 'Query JSON with a JSONPath expression.', keywords: 'query jq jsonpath', seo: 'jsonPath', load: () => import('../pages/Text-Utilities/JsonPath') },
  { id: 'sql_formatter', name: 'SQL Formatter', category: 'text', in: 'sql', out: 'formatted sql', blurb: 'Format and indent SQL for any dialect.', keywords: 'beautify prettify mysql postgres', seo: 'sqlFormatter', load: () => import('../pages/Text-Utilities/SqlFormatter') },
  { id: 'xml_formatter', name: 'XML Formatter', category: 'text', in: 'xml', out: 'formatted · minified', blurb: 'Pretty-print or minify XML, with error positions.', keywords: 'beautify prettify validate', seo: 'xmlFormatter', load: () => import('../pages/Text-Utilities/XmlFormatter') },
  { id: 'css_minifier', name: 'CSS Minifier / Beautifier', category: 'text', in: 'css', out: 'minified · formatted', dir: 'both', blurb: 'Minify CSS, or expand it back to readable rules.', keywords: 'compress beautify prettify', seo: 'cssMinifier', load: () => import('../pages/Text-Utilities/CssMinifier') },
  { id: 'html_to_markdown', name: 'HTML to Markdown', category: 'text', in: 'html', out: 'markdown', blurb: 'Convert HTML to clean Markdown.', keywords: 'md convert', seo: 'htmlToMarkdown', load: () => import('../pages/Text-Utilities/HtmlToMarkdown') },
  { id: 'text_case', name: 'Text Case Converter', category: 'text', in: 'text', out: 'camel · snake · kebab', blurb: 'camelCase, snake_case, kebab-case, Title Case and more.', keywords: 'uppercase lowercase', seo: 'textCase', load: () => import('../pages/Text-Utilities/TextCaseConverter') },
  { id: 'markdown', name: 'Markdown Previewer', category: 'text', in: 'markdown', out: 'preview', blurb: 'Render Markdown as you type.', keywords: 'md', seo: 'markdownPreviewer', load: () => import('../pages/Text-Utilities/MarkdownPreviewer') },
  { id: 'line_break_whitespace_remover', name: 'Whitespace Remover', category: 'text', in: 'text', out: 'cleaned', blurb: 'Strip line breaks, extra spaces or both.', keywords: 'trim newline', seo: 'lineBreakWhitespaceRemover', load: () => import('../pages/Text-Utilities/LineBreakWhiteSpaceRemover') },
  { id: 'duplicate_line_remover', name: 'Duplicate Line Remover', category: 'text', in: 'lines', out: 'unique lines', blurb: 'Keep each line once.', keywords: 'dedupe unique', seo: 'duplicateLineRemover', load: () => import('../pages/Text-Utilities/DuplicateLineRemover') },
  { id: 'string_counter', name: 'String Counter', category: 'text', in: 'text', out: 'chars · words · lines', blurb: 'Characters, words, lines and bytes.', keywords: 'count length', seo: 'stringCounter', load: () => import('../pages/Text-Utilities/StringCounter') },
  { id: 'regex', name: 'Regex Tester', category: 'text', in: 'pattern', out: 'matches', blurb: 'Test a pattern against text with live matches.', keywords: 'regular expression', seo: 'regexTester', load: () => import('../pages/Text-Utilities/RegexTester') },
  { id: 'regex_cheatsheet', name: 'Regex Cheatsheet', category: 'text', out: 'syntax reference', blurb: 'Regular-expression syntax with examples.', keywords: 'regular expression reference', seo: 'regexCheatsheet', load: () => import('../pages/Text-Utilities/RegexCheatSheet') },

  // Word play
  { id: 'palindrome', name: 'Palindrome Checker', category: 'fun', in: 'text', out: 'yes · no', blurb: 'Does it read the same backwards?', seo: 'palindromeChecker', load: () => import('../pages/Fun-Text-Utilities/PalindromeChecker') },
  { id: 'string_reverser_rotator', name: 'String Reverser / Rotator', category: 'fun', in: 'text', out: 'reversed · rotated', blurb: 'Reverse a string or rotate it by n characters.', seo: 'stringReverser', load: () => import('../pages/Fun-Text-Utilities/StringReverserRotator') },
  { id: 'roman_numeral', name: 'Roman Numeral Converter', category: 'fun', in: 'number', out: 'roman', dir: 'both', blurb: '1984 ⇄ MCMLXXXIV.', seo: 'romanNumeral', load: () => import('../pages/Fun-Text-Utilities/RomanNumeralConverter') },
  { id: 'nato_phonetic', name: 'NATO Phonetic Alphabet', category: 'fun', in: 'text', out: 'alfa bravo', dir: 'both', blurb: 'Spell text out as Alfa, Bravo, Charlie.', seo: 'natoPhonetic', load: () => import('../pages/Fun-Text-Utilities/NATOPhonetic') },
  { id: 'pig_latin', name: 'Pig Latin Converter', category: 'fun', in: 'english', out: 'igpay atinlay', dir: 'both', blurb: 'English to Pig Latin and back.', seo: 'pigLatin', load: () => import('../pages/Fun-Text-Utilities/PigLatinConverter') },
  { id: 'numeronym', name: 'Numeronym Generator', category: 'fun', in: 'word', out: 'i18n', blurb: 'internationalization → i18n.', seo: 'numeronym', load: () => import('../pages/Fun-Text-Utilities/NumeroNymGenerator') },
  { id: 'leetspeak', name: 'Leetspeak Translator', category: 'fun', in: 'text', out: 'l33t', dir: 'both', blurb: 'Text to l33t and back.', seo: 'leetspeak', load: () => import('../pages/Fun-Text-Utilities/LeetSpeakTranslator') },
  { id: 'word_frequency_counter', name: 'Word Frequency Counter', category: 'fun', in: 'text', out: 'word counts', blurb: 'Which words appear most, and how often.', seo: 'wordFrequencyCounter', load: () => import('../pages/Fun-Text-Utilities/WordFrequencyCounter') },

  // Images & colour
  { id: 'qr_code', name: 'QR Code Generator', category: 'image', in: 'text · url', out: 'qr png', blurb: 'QR codes for text, links, Wi-Fi and contacts.', keywords: 'wifi vcard', seo: 'qrCodeGenerator', load: () => import('../pages/Image-Tools/QRCodeGenerator') },
  { id: 'barcode_generator', name: 'Barcode Generator', category: 'image', in: 'digits', out: 'barcode svg', blurb: 'EAN, UPC, Code 128 and more as SVG or PNG.', keywords: 'ean upc code128', seo: 'barcodeGenerator', load: () => import('../pages/Image-Tools/BarCodeGenerator') },
  { id: 'barcode_reader', name: 'Barcode / QR Reader', category: 'image', in: 'image', out: 'decoded value', blurb: 'Decode a barcode or QR code from an image.', keywords: 'scan', seo: 'barcodeReader', load: () => import('../pages/Image-Tools/BarcodeReader') },
  { id: 'color_picker', name: 'Color Picker', category: 'image', in: 'colour', out: 'hex · rgb · hsl', blurb: 'Pick a colour and copy it in every format.', keywords: 'hex rgb hsl color', seo: 'colorPicker', load: () => import('../pages/Image-Tools/ColorPicker') },
  { id: 'favicon', name: 'Favicon Generator', category: 'image', in: 'image', out: 'favicon set', blurb: 'Every favicon size from one image.', keywords: 'icon ico', seo: 'faviconGenerator', load: () => import('../pages/Image-Tools/FaviconGenerator') },
  { id: 'image_compressor', name: 'Image Compressor', category: 'image', in: 'image', out: 'smaller image', blurb: 'Shrink a JPEG, PNG or WebP in the browser.', keywords: 'resize optimize', seo: 'imageCompressor', load: () => import('../pages/Image-Tools/ImageCompressor') },
  { id: 'gradient_generator', name: 'Gradient Generator', category: 'image', out: 'css gradient', blurb: 'Build a CSS gradient and copy the rule.', keywords: 'css linear radial', seo: 'gradientGenerator', load: () => import('../pages/Image-Tools/GradientGenerator') },
  { id: 'box_shadow_generator', name: 'Box Shadow Generator', category: 'image', out: 'css box-shadow', blurb: 'Tune a shadow and copy the CSS.', keywords: 'css shadow', seo: 'boxShadowGenerator', load: () => import('../pages/Image-Tools/BoxShadowGenerator') },
];

export const toolById = new Map(tools.map((t) => [t.id, t]));
export const categoryById = new Map(categories.map((c) => [c.id, c]));

export const toolPath = (tool: Tool) => `/${tool.id}`;

export const toolsInCategory = (id: CategoryId) => tools.filter((t) => t.category === id);

/** Plain-language version of the signature for screen readers. */
export const describeTool = (tool: Tool) => {
  if (!tool.in) return `${tool.name}. Produces ${tool.out}.`;
  const verb = tool.dir === 'both' ? 'converts between' : 'turns';
  return tool.dir === 'both'
    ? `${tool.name}. ${verb} ${tool.in} and ${tool.out}.`
    : `${tool.name}. ${verb} ${tool.in} into ${tool.out}.`;
};
