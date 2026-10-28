export interface AsciiRow {
  code: number;
  hex: string;
  oct: string;
  bin: string;
  /** The printable character, or the control abbreviation (NUL, SOH, … SP, DEL). */
  char: string;
  /** Full name ("Null", "Space", "Latin capital letter A"). Blank for the Latin-1 rows. */
  name: string;
  /** HTML entity: named where one exists, otherwise numeric for printable codes. */
  entity: string;
  /** C / JavaScript string escape where one exists. */
  escape: string;
  control: boolean;
}

const CONTROL: [string, string][] = [
  ['NUL', 'Null'],
  ['SOH', 'Start of Heading'],
  ['STX', 'Start of Text'],
  ['ETX', 'End of Text'],
  ['EOT', 'End of Transmission'],
  ['ENQ', 'Enquiry'],
  ['ACK', 'Acknowledge'],
  ['BEL', 'Bell'],
  ['BS', 'Backspace'],
  ['HT', 'Horizontal Tab'],
  ['LF', 'Line Feed'],
  ['VT', 'Vertical Tab'],
  ['FF', 'Form Feed'],
  ['CR', 'Carriage Return'],
  ['SO', 'Shift Out'],
  ['SI', 'Shift In'],
  ['DLE', 'Data Link Escape'],
  ['DC1', 'Device Control 1 (XON)'],
  ['DC2', 'Device Control 2'],
  ['DC3', 'Device Control 3 (XOFF)'],
  ['DC4', 'Device Control 4'],
  ['NAK', 'Negative Acknowledge'],
  ['SYN', 'Synchronous Idle'],
  ['ETB', 'End of Transmission Block'],
  ['CAN', 'Cancel'],
  ['EM', 'End of Medium'],
  ['SUB', 'Substitute'],
  ['ESC', 'Escape'],
  ['FS', 'File Separator'],
  ['GS', 'Group Separator'],
  ['RS', 'Record Separator'],
  ['US', 'Unit Separator'],
];

// Names for 32–64, 91–96 and 123–126; letters and digits are generated.
const PUNCT: Record<number, string> = {
  32: 'Space',
  33: 'Exclamation mark',
  34: 'Quotation mark',
  35: 'Number sign (hash)',
  36: 'Dollar sign',
  37: 'Percent sign',
  38: 'Ampersand',
  39: 'Apostrophe (single quote)',
  40: 'Left parenthesis',
  41: 'Right parenthesis',
  42: 'Asterisk',
  43: 'Plus sign',
  44: 'Comma',
  45: 'Hyphen-minus',
  46: 'Full stop (period)',
  47: 'Solidus (slash)',
  58: 'Colon',
  59: 'Semicolon',
  60: 'Less-than sign',
  61: 'Equals sign',
  62: 'Greater-than sign',
  63: 'Question mark',
  64: 'Commercial at',
  91: 'Left square bracket',
  92: 'Reverse solidus (backslash)',
  93: 'Right square bracket',
  94: 'Circumflex accent (caret)',
  95: 'Low line (underscore)',
  96: 'Grave accent (backtick)',
  123: 'Left curly bracket',
  124: 'Vertical line (pipe)',
  125: 'Right curly bracket',
  126: 'Tilde',
};

const DIGIT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const NAMED_ENTITY: Record<number, string> = { 34: '&quot;', 38: '&amp;', 39: '&#39;', 60: '&lt;', 62: '&gt;' };

const ESCAPE: Record<number, string> = {
  0: '\\0',
  7: '\\a',
  8: '\\b',
  9: '\\t',
  10: '\\n',
  11: '\\v',
  12: '\\f',
  13: '\\r',
  27: '\\x1B',
  34: '\\"',
  39: "\\'",
  92: '\\\\',
};

const numeric = (code: number) => ({
  code,
  hex: code.toString(16).toUpperCase().padStart(2, '0'),
  oct: code.toString(8).padStart(3, '0'),
  bin: code.toString(2).padStart(8, '0'),
});

const nameOf = (code: number): string => {
  if (code in PUNCT) return PUNCT[code];
  if (code >= 48 && code <= 57) return `Digit ${DIGIT_WORDS[code - 48]}`;
  if (code >= 65 && code <= 90) return `Latin capital letter ${String.fromCharCode(code)}`;
  if (code >= 97 && code <= 122) return `Latin small letter ${String.fromCharCode(code)}`;
  return '';
};

const standardRow = (code: number): AsciiRow => {
  const control = code < 32 || code === 127;
  const char = code < 32 ? CONTROL[code][0] : code === 32 ? 'SP' : code === 127 ? 'DEL' : String.fromCharCode(code);
  const name = code < 32 ? CONTROL[code][1] : code === 127 ? 'Delete' : nameOf(code);
  return {
    ...numeric(code),
    char,
    name,
    entity: NAMED_ENTITY[code] ?? (control ? '' : `&#${code};`),
    escape: ESCAPE[code] ?? '',
    control,
  };
};

/** The 128 standard ASCII characters, codes 0–127 in order. */
export const ASCII_TABLE: AsciiRow[] = Array.from({ length: 128 }, (_, i) => standardRow(i));

/**
 * Latin-1 supplement, codes 128–255, as ISO-8859-1 (and the first 256 Unicode
 * code points). 128–159 are the C1 control characters; Windows-1252 puts
 * printable characters such as € and “ ” there instead.
 */
export const LATIN1_TABLE: AsciiRow[] = Array.from({ length: 128 }, (_, i) => {
  const code = 128 + i;
  const control = code < 160;
  return {
    ...numeric(code),
    char: control ? '' : String.fromCharCode(code),
    name: code === 160 ? 'No-break space' : code === 173 ? 'Soft hyphen' : '',
    entity: control ? '' : `&#${code};`,
    escape: '',
    control,
  };
});
