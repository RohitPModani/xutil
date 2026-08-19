/**
 * What each tool takes in and what it hands back.
 *
 * Every utility here has the same shape - something goes in, something comes
 * out - so the index shows that directly rather than making people infer it
 * from a name. "Base Encoder/ Decoder" tells you less than `text ⇄ base64`.
 *
 * `in` is the value you supply, `out` is what you get. `dir` is "to" for a
 * one-way transform and "both" when the tool runs in either direction.
 * Generators have no input, so `in` is omitted.
 */
export interface ToolSignature {
  in?: string;
  out: string;
  dir?: 'to' | 'both';
}

export const toolSignatures: Record<string, ToolSignature> = {
  // Encoding / decoding
  '/guid': { out: 'uuid v4 · v7' },
  '/ulid': { out: 'ulid' },
  '/password': { out: 'password' },
  '/morse': { in: 'text', out: 'morse', dir: 'both' },
  '/hash': { in: 'text', out: 'md5 · sha1 · sha256' },
  '/base': { in: 'text', out: 'base64 · 32 · 58', dir: 'both' },
  '/cipher': { in: 'text', out: 'rot13 · caesar', dir: 'both' },
  '/jwt': { in: 'jwt', out: 'header · payload' },
  '/eurl': { in: 'text', out: 'percent-encoded', dir: 'both' },
  '/html': { in: 'text', out: 'entities', dir: 'both' },

  // Data converters
  '/xml_json': { in: 'xml', out: 'json', dir: 'both' },
  '/yaml_json': { in: 'yaml', out: 'json', dir: 'both' },
  '/csv_json': { in: 'csv', out: 'json', dir: 'both' },
  '/json_ts': { in: 'json', out: 'interface' },
  '/json_python': { in: 'json', out: 'dataclass' },
  '/json_pydantic': { in: 'json', out: 'basemodel' },
  '/base_number': { in: 'number', out: 'base 2–36', dir: 'both' },
  '/text_base': { in: 'text', out: 'bin · hex · dec', dir: 'both' },
  '/unix_utc': { in: 'epoch', out: 'utc', dir: 'both' },
  '/timezone': { in: 'time', out: 'any zone' },
  '/cron': { in: 'english', out: 'cron' },

  // Units
  '/angle': { in: 'deg', out: 'rad · grad · turn', dir: 'both' },
  '/area': { in: 'm²', out: 'ft² · acre · ha', dir: 'both' },
  '/bit_byte': { in: 'byte', out: 'kb · mb · gb', dir: 'both' },
  '/energy': { in: 'joule', out: 'cal · kwh · btu', dir: 'both' },
  '/frequency': { in: 'hz', out: 'khz · mhz · rpm', dir: 'both' },
  '/fuel_economy': { in: 'mpg', out: 'km/l · l/100km', dir: 'both' },
  '/length': { in: 'metre', out: 'ft · mile · inch', dir: 'both' },
  '/power': { in: 'watt', out: 'hp · kw', dir: 'both' },
  '/pressure': { in: 'pascal', out: 'bar · psi · atm', dir: 'both' },
  '/speed': { in: 'km/h', out: 'mph · knot · m/s', dir: 'both' },
  '/temperature': { in: '°c', out: '°f · k', dir: 'both' },
  '/time': { in: 'second', out: 'min · hr · day', dir: 'both' },
  '/volume': { in: 'litre', out: 'gal · pint · m³', dir: 'both' },
  '/weight': { in: 'kg', out: 'lb · oz · stone', dir: 'both' },

  // Text and code
  '/lorem': { out: 'placeholder text' },
  '/slug': { in: 'title', out: 'url-slug' },
  '/text_compare': { in: 'two texts', out: 'diff' },
  '/url_parser': { in: 'url', out: 'host · path · query' },
  '/json_validator': { in: 'json', out: 'formatted · errors' },
  '/text_case': { in: 'text', out: 'camel · snake · kebab' },
  '/markdown': { in: 'markdown', out: 'preview' },
  '/line_break_whitespace_remover': { in: 'text', out: 'cleaned' },
  '/duplicate_line_remover': { in: 'lines', out: 'unique lines' },
  '/string_counter': { in: 'text', out: 'chars · words · lines' },
  '/regex': { in: 'pattern', out: 'matches' },
  '/regex_cheatsheet': { out: 'syntax reference' },

  // Word play
  '/palindrome': { in: 'text', out: 'yes · no' },
  '/string_reverser_rotator': { in: 'text', out: 'reversed · rotated' },
  '/roman_numeral': { in: 'number', out: 'roman', dir: 'both' },
  '/nato_phonetic': { in: 'text', out: 'alfa bravo', dir: 'both' },
  '/pig_latin': { in: 'english', out: 'igpay atinlay', dir: 'both' },
  '/numeronym': { in: 'word', out: 'i18n' },
  '/leetspeak': { in: 'text', out: 'l33t', dir: 'both' },
  '/word_frequency_counter': { in: 'text', out: 'word counts' },

  // Barcodes, colour, image
  '/qr_code': { in: 'text · url', out: 'qr png' },
  '/barcode_generator': { in: 'digits', out: 'barcode svg' },
  '/barcode_reader': { in: 'image', out: 'decoded value' },
  '/color_picker': { in: 'colour', out: 'hex · rgb · hsl' },
  '/favicon': { in: 'image', out: 'favicon set' },
  '/image_compressor': { in: 'image', out: 'smaller image' },
  '/gradient_generator': { out: 'css gradient' },
  '/box_shadow_generator': { out: 'css box-shadow' },
};
