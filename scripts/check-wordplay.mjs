// Pig Latin and NATO round trips. Run: node scripts/check-wordplay.mjs
import ts from 'typescript';
import { readFileSync } from 'node:fs';

const DIR = 'src/pages/Fun-Text-Utilities/';
const opts = { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } };

// Transpiles everything between the imports and the default export.
async function load(file, names) {
  const src = readFileSync(DIR + file, 'utf8');
  const a = src.indexOf('\ntype Mode');
  const b = src.indexOf('\nexport default', a);
  if (a < 0 || b < 0) throw new Error(`markers not found in ${file}`);
  const js = ts.transpileModule(src.slice(a, b) + `\nexport { ${names} };`, opts).outputText;
  return import('data:text/javascript,' + encodeURIComponent(js));
}

const pig = await load('PigLatinConverter.tsx', 'encodeWord, decodeWord, mapWords, looksLikePigLatin');
const nato = await load('NATOPhonetic.tsx', 'encode, decode, looksLikeNato');

let bad = 0;
const check = (label, got, want) => {
  if (got !== want) {
    bad++;
    console.log('FAIL', label, 'got', JSON.stringify(got), 'want', JSON.stringify(want));
  }
};

const pigEncode = (s) => pig.mapWords(s, pig.encodeWord);
const pigDecode = (s) => pig.mapWords(s, pig.decodeWord);

check('pig encode', pigEncode('Hello, world'), 'Ellohay, orldway');
check('pig encode qu', pigEncode('queen square'), 'eenquay aresquay');
check('pig encode y', pigEncode('my rhythm yes style'), 'ymay ythmrhay esyay ylestay');
check('pig encode vowel', pigEncode('apple I'), 'appleway Iway');
check('pig encode unicode', pigEncode('café Éclair'), 'afécay Éclairway');
check('pig encode caps', pigEncode('HELLO'), 'ELLOHAY');
for (const s of ['Hello, world', 'the quick brown fox jumps over the lazy dog', 'string square rhythm my yes', 'it is an apple and an egg', 'with was will we were', 'café crème']) {
  check(`pig round trip "${s}"`, pigDecode(pigEncode(s)), s);
}
check('pig detect', pig.looksLikePigLatin('Ellohay, orldway'), true);
check('pig detect plain', pig.looksLikePigLatin('Stay away today'), false);
check('pig detect plain 2', pig.looksLikePigLatin('Hello, world'), false);

check('nato encode', nato.encode('AJ 1'), 'Alfa Juliett (Space) One');
check('nato encode newline', nato.encode('A\nB'), 'Alfa (Space) Bravo');
check('nato decode icao', nato.decode('Alfa Juliett X-ray'), 'AJX');
check('nato decode common', nato.decode('alpha juliet xray space'), 'AJX ');
check('nato decode newline', nato.decode('Alfa\nBravo'), 'AB');
check('nato round trip', nato.decode(nato.encode('XUTIL 2026')), 'XUTIL 2026');
check('nato detect', nato.looksLikeNato('X-ray Uniform Tango India Lima'), true);
check('nato detect plain', nato.looksLikeNato('XUTIL'), false);

console.log(bad ? `${bad} failures` : 'all wordplay cases pass');
process.exit(bad ? 1 : 0);
