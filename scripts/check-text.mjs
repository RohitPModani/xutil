import ts from 'typescript';
import { readFileSync } from 'node:fs';

/** Pure helpers from a page: the code between `from` and `export default`, transpiled and imported. */
async function load(file, from, names) {
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf(from);
  const end = src.indexOf('export default function');
  const js = ts.transpileModule(src.slice(start, end) + `\nexport { ${names.join(', ')} };`, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import('data:text/javascript,' + encodeURIComponent(js));
}
async function loadModule(file) {
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  return import('data:text/javascript,' + encodeURIComponent(js));
}

let bad = 0;
let total = 0;
const eq = (name, got, want) => {
  total++;
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    bad++;
    console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want));
  }
};

// Case conversion
const { cases } = await load('src/pages/Text-Utilities/TextCaseConverter.tsx', 'const cap', ['cases']);
const byLabel = (text) => Object.fromEntries(cases(text).map((c) => [c.label, c.value]));
let c = byLabel('helloWorld');
eq('camel → snake', c.snake_case, 'hello_world');
eq('camel → kebab', c['kebab-case'], 'hello-world');
eq('camel → CONSTANT', c.CONSTANT_CASE, 'HELLO_WORLD');
c = byLabel('XMLParser.user/name');
eq('acronym + dot + slash split', c['kebab-case'], 'xml-parser-user-name');
eq('PascalCase from acronym', c.PascalCase, 'XmlParserUserName');
c = byLabel("it's a DOG's life. really? yes! ok");
eq('Title lowercases the rest, no capital after apostrophe', c['Title Case'], "It's A Dog's Life. Really? Yes! Ok");
eq('Sentence case per sentence', c['Sentence case'], "It's a dog's life. Really? Yes! Ok");
eq('Sentence case after newline', byLabel('one\ntwo')['Sentence case'], 'One\nTwo');
eq('camelCase basic', byLabel('hello world from xutil').camelCase, 'helloWorldFromXutil');

// Slug transliteration
const { slugify } = await load('src/pages/Text-Utilities/SlugGenerator.tsx', 'const TRANSLIT', ['slugify']);
eq('København', slugify('København', '-', 'lower'), 'kobenhavn');
eq('Straße Łódź œuvre Æsir Đorđe Þór', slugify('Straße Łódź œuvre Æsir Đorđe Þór', '-', 'lower'), 'strasse-lodz-oeuvre-aesir-dorde-thor');
eq('underscore is a break', slugify('hello_world foo', '-', 'lower'), 'hello-world-foo');
eq('accents stripped', slugify('Crème Brûlée!', '-', 'lower'), 'creme-brulee');
eq('non-Latin yields empty', slugify('日本語', '-', 'lower'), '');
eq('keep case', slugify('Hello World', '_', 'preserve'), 'Hello_World');

// Duplicate lines
const { dedupe } = await load('src/pages/Text-Utilities/DuplicateLineRemover.tsx', 'interface Options', ['dedupe']);
const opts = { ignoreCase: false, trim: true, keepBlank: false };
let d = dedupe('a\n\nb\n\na\n', opts);
eq('blanks dropped', d.out, 'a\nb');
eq('duplicate count', d.duplicates, 1);
eq('blank count', d.blanks, 3);
d = dedupe('a\n\nb\n\na', { ...opts, keepBlank: true });
eq('blanks kept, all of them', d.out, 'a\n\nb\n\na'.replace('\na', ''));
eq('blanks kept, blank count zero', d.blanks, 0);
eq('ignore case', dedupe('A\na', { ...opts, ignoreCase: true }).out, 'A');
eq('trim off keeps both', dedupe('a\n a', { ...opts, trim: false }).out, 'a\n a');

// JSON error describer
const { describeJsonError } = await loadModule('src/utils/json.ts');
const describe = (src) => {
  try {
    JSON.parse(src);
    return 'parsed';
  } catch (e) {
    return describeJsonError(e, src);
  }
};
const m1 = describe('{"b": line 7}');
eq('line is not read from the echoed input', /^Line 7/.test(m1), false);
eq('echoed input stripped', m1.includes('line 7}'), false);
const m2 = describe('{\n"a": 1,\n"b": }');
eq('no raw newlines in the message', m2.includes('\n'), false);
// Engine formats that this Node version does not produce.
const src = '{\n"a": 1,\n"b": }';
eq('V8 position → line', describeJsonError(new SyntaxError('Unexpected token } in JSON at position 15'), src), 'Line 3: Unexpected token } in JSON');
eq(
  'V8 line/column',
  describeJsonError(new SyntaxError('Expected double-quoted property name in JSON at position 15 (line 3 column 6)'), src),
  'Line 3, column 6: Expected double-quoted property name in JSON at position 15'
);
eq(
  'Firefox line/column',
  describeJsonError(new SyntaxError('JSON.parse: unexpected character at line 3 column 6 of the JSON data'), src),
  'Line 3, column 6: JSON.parse: unexpected character'
);

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
