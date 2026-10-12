// Re-runs the Encode & decode pages' pure codecs in node: HTML entity decode,
// Morse word gaps, Base32 length validation, Base58 round-trip and MD5.
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

async function load(file, startMark, endMark, exports) {
  const src = readFileSync(file, 'utf8');
  const slice = src.slice(src.indexOf(startMark), src.indexOf(endMark));
  const js = ts.transpileModule(`${slice}\nexport { ${exports} };`, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import('data:text/javascript,' + encodeURIComponent(js));
}

let bad = 0;
let total = 0;
const check = (name, got, want) => {
  total++;
  if (got !== want) {
    bad++;
    console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want));
  }
};
const throws = (name, fn) => {
  total++;
  try {
    fn();
    bad++;
    console.log('FAIL', name, 'did not throw');
  } catch {
    /* expected */
  }
};

// ---- HTML entities ------------------------------------------------------
// Node has no HTML parser; this stand-in textarea decodes the five core
// entities and numeric references, one level. What is under test is that the
// page decodes exactly one level (no second pass on `&amp;lt;`).
const CORE = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
globalThis.document = {
  createElement: () => ({
    set innerHTML(v) {
      this.value = v.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m, e) =>
        e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (CORE[e] ?? m)
      );
    },
  }),
};
const { htmlDecode, htmlEncode } = await load('src/pages/Encode-Decode/HTMLEntities.tsx', '// codec:start', '// codec:end', 'htmlDecode, htmlEncode');
check('double-encoded stays one level', htmlDecode('&amp;lt;'), '&lt;');
check('decimal and hex', htmlDecode('&#169; &#xA9;'), '© ©');
check('escape round trip', htmlDecode(htmlEncode('<a href="/">Tom & Jerry</a>')), '<a href="/">Tom & Jerry</a>');

// ---- Morse ---------------------------------------------------------------
const { textToMorse, morseToText } = await load('src/pages/Encode-Decode/MorseCodeTranslator.tsx', '// codec:start', '// codec:end', 'textToMorse, morseToText');
check('three-space word gap', morseToText('... --- ...   ... --- ...'), 'SOS SOS');
check('slash word gap', morseToText('... --- ... / ... --- ...'), 'SOS SOS');
check('slash with extra spaces', morseToText('... --- ...   /   ... --- ...'), 'SOS SOS');
check('underscore and pipe variants', morseToText('... ___ ... | ... --- ...'), 'SOS SOS');
check('accents folded', textToMorse('é'), '.');
check('round trip', morseToText(textToMorse('Hello world')), 'HELLO WORLD');
throws('unknown sequence', () => morseToText('.-.-.-.-'));

// ---- Base32 / Base58 / Base64 -------------------------------------------
const { base32Encode, base32Decode, base58Encode, base58Decode, base64Decode } = await load(
  'src/pages/Encode-Decode/BaseEncoderDecoder.tsx',
  '// codecs:start',
  '// codecs:end',
  'base32Encode, base32Decode, base58Encode, base58Decode, base64Decode'
);
check('base32 encode', base32Encode('Hello, world'), 'JBSWY3DPFQQHO33SNRSA====');
check('base32 decode without padding', base32Decode('JBSWY3DPFQQHO33SNRSA'), 'Hello, world');
throws('base32 length 1 mod 8', () => base32Decode('A'));
throws('base32 length 3 mod 8', () => base32Decode('ABC'));
throws('base32 length 6 mod 8', () => base32Decode('ABCDEF'));
check('base32 length 2 mod 8 is fine', base32Decode('ME'), 'a');

check('base58 encode', base58Encode('Hello, world'), '2NEpo7TZsLFA2wMeK');
check('base58 decode', base58Decode('2NEpo7TZsLFA2wMeK'), 'Hello, world');
check('base58 leading zero bytes', base58Decode(base58Encode('\0\0abc')), '\0\0abc');
check('base58 unicode round trip', base58Decode(base58Encode('héllo wörld ✓')), 'héllo wörld ✓');
const big = 'x'.repeat(40 * 1024);
const t0 = performance.now();
check('base58 40 KB round trip', base58Decode(base58Encode(big)), big);
console.log(`base58 40 KB round trip: ${Math.round(performance.now() - t0)} ms`);

check('base64 url-safe alphabet', base64Decode('fn5-aGk_'), '~~~hi?');
check('base64 missing padding and whitespace', base64Decode('SGVs\nbG8'), 'Hello');
throws('base64 bad alphabet', () => base64Decode('$$$$'));
throws('base64 valid but not utf-8', () => base64Decode('/w=='));
try {
  base64Decode('/w==');
} catch (e) {
  check('base64 non-utf-8 names the right failure', e.message, 'Decoded bytes are not valid UTF-8 text.');
}

// ---- MD5 -----------------------------------------------------------------
const { md5, hmacMd5, hex } = await load('src/pages/Encode-Decode/HashGenerator.tsx', '// md5:start', '// md5:end', 'md5, hmacMd5, hex');
const enc = (s) => new TextEncoder().encode(s);
for (const s of ['', 'The quick brown fox', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'é'.repeat(1000)]) {
  check(`md5 of ${s.length} chars`, hex(md5(enc(s))), createHash('md5').update(s).digest('hex'));
}
check('hmac-md5', hex(hmacMd5(enc('key'), enc('The quick brown fox jumps over the lazy dog'))), '80070713463e7749b90c2dc24911e275');

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
