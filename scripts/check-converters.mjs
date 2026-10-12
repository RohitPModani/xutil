// Runs the pure converter functions from the CSV, YAML, XML and JSON → types
// pages in node: `node scripts/check-converters.mjs`. Page files are sliced
// before their `export default` so no React is needed. XML needs DOMParser,
// which node lacks, so those cases only run in a browser (see the note).
import ts from 'typescript';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = resolve('node_modules/.cache/check-converters');
const built = new Map();

/** Transpiles `src/<rel>` (and the project files it imports) to OUT and returns the output path. */
function build(rel, exports = []) {
  const file = resolve('src', rel);
  if (built.has(file)) return built.get(file);
  const out = resolve(OUT, rel.replace(/\.tsx?$/, '.js'));
  built.set(file, out);
  let src = readFileSync(file, 'utf8');
  if (rel.endsWith('.tsx')) {
    src = src.slice(0, src.indexOf('export default function')).replace(/^import .*(?:'react'|\/ui'|\/components\/).*\n/gm, '');
    src += `\nexport { ${exports.join(', ')} };\n`;
  }
  src = src.replace(/from '(\.[^']+)'/g, (_, spec) => {
    const target = resolve(dirname(file), spec);
    const relTarget = target.slice(resolve('src').length + 1);
    const ext = ['.ts', '.tsx'].find((e) => {
      try {
        readFileSync(target + e);
        return true;
      } catch {
        return false;
      }
    });
    return `from '${pathToFileURL(build(relTarget + ext)).href}'`;
  });
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.Preserve } }).outputText;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, js);
  return out;
}

const load = (rel, exports) => import(pathToFileURL(build(rel, exports)).href);

let bad = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) {
    bad++;
    console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want));
  }
};

/* ---- CSV ---------------------------------------------------------------- */
const { csvToJson, jsonToCsv } = await load('pages/Converters/CsvJsonConverter.tsx', ['csvToJson', 'jsonToCsv']);
const csv = (s, o = {}) => JSON.parse(csvToJson(s, { delimiter: '', dynamicTyping: false, ...o }));

check('csv escaped quotes', csv('a\n"x ""y"""'), [{ a: 'x "y"' }]);
check('csv quoted newline', csv('a,b\n"line1\nline2",2'), [{ a: 'line1\nline2', b: '2' }]);
check('csv blank lines skipped', csv('a\n1\n\n2\n'), [{ a: '1' }, { a: '2' }]);
check('csv nested on dot', csv('id,address.city\n1,London'), [{ id: '1', address: { city: 'London' } }]);
check('csv underscore kept flat', csv('first_name\nAda'), [{ first_name: 'Ada' }]);
check('csv empty cell null', csv('a,b\n1,'), [{ a: '1', b: null }]);
check('csv quoted padding kept', csv('a\n" x "'), [{ a: ' x ' }]);
check('csv semicolon detected', csv('a;b\n1;2'), [{ a: '1', b: '2' }]);
check('csv tab forced', csv('a\tb\n1\t2', { delimiter: '\t' }), [{ a: '1', b: '2' }]);
check('csv dynamic typing', csv('n,t,s\n1,true,x1', { dynamicTyping: true }), [{ n: 1, t: true, s: 'x1' }]);
check('csv no typing by default', csv('n\n1'), [{ n: '1' }]);
check('csv array cell', csv('tags\n"[""a"",""b""]"'), [{ tags: ['a', 'b'] }]);
check('csv crlf', csv('a,b\r\n1,2\r\n'), [{ a: '1', b: '2' }]);

const toCsv = (v, o = {}) => jsonToCsv(JSON.stringify(v), { delimiter: '', dynamicTyping: false, ...o });
check('json→csv quoting', toCsv([{ a: 'x,y', b: 'say "hi"', c: 'l1\nl2', d: 'r\rn' }]), 'a,b,c,d\n"x,y","say ""hi""","l1\nl2","r\rn"');
check('json→csv nested dot', toCsv({ address: { city: 'London' } }), 'address.city\nLondon');
check('json→csv arrays in one cell', toCsv([{ id: 1, tags: ['a', 'b', 'c'] }]), 'id,tags\n1,"[""a"",""b"",""c""]"');
check('json→csv union of keys', toCsv([{ a: 1 }, { b: 2 }]), 'a,b\n1,\n,2');
check('json→csv semicolon', toCsv([{ a: 1, b: 2 }], { delimiter: ';' }), 'a;b\n1;2');
check('json→csv round trip', csv(toCsv([{ a: 'x "y"\nz', n: { m: '1' }, t: ['p'] }])), [{ a: 'x "y"\nz', n: { m: '1' }, t: ['p'] }]);
let threw = '';
try {
  jsonToCsv('[1, 2]', { delimiter: '', dynamicTyping: false });
} catch (e) {
  threw = e.message;
}
check('json→csv rejects primitives', threw, 'JSON → CSV needs an object or an array of objects.');

/* ---- YAML --------------------------------------------------------------- */
const { yamlToJson, jsonToYaml, detect: detectYaml } = await load('pages/Converters/YamlJsonConverter.tsx', ['yamlToJson', 'jsonToYaml', 'detect']);
const y = (s) => JSON.parse(yamlToJson(s));
check('yaml date stays string', y('d: 2024-01-01'), { d: '2024-01-01' });
check('yaml 0o17 is int, yes is string', y('a: 0o17\nb: yes'), { a: 15, b: 'yes' });
check('yaml flow style', y('{a: 1, b: [x, y]}'), { a: 1, b: ['x', 'y'] });
check('yaml flow detected as yaml not json', detectYaml('{a: 1}'), 0);
check('yaml real json detected', detectYaml('{"a": 1}'), 1);
check('yaml multi-doc', y('a: 1\n---\nb: 2'), [{ a: 1 }, { b: 2 }]);
check('yaml single doc not wrapped', y('---\na: 1'), { a: 1 });
check('yaml comment only', y('# nothing'), null);
check('json→yaml', jsonToYaml('{"a": [1, {"b": "c"}]}'), 'a:\n  - 1\n  - b: c\n');
threw = '';
try {
  yamlToJson('a: [1');
} catch (e) {
  threw = e.message;
}
check('yaml error has line', threw, 'Line 1, column 1: unexpected end of the stream within a flow collection');

/* ---- XML ---------------------------------------------------------------- */
// xmlToJson needs DOMParser, which node lacks: the parser cases are written
// to an HTML page that reports PASS/FAIL when opened in a browser, e.g.
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --dump-dom <file>
const { jsonToXml } = await load('pages/Converters/XmlJsonConverter.tsx', ['xmlToJson', 'jsonToXml']);
check('json→xml single key root', jsonToXml('{"a": {"b": 1}}'), '<?xml version="1.0" encoding="UTF-8"?>\n<a>\n  <b>1</b>\n</a>');
check('json→xml wraps two keys', jsonToXml('{"a": 1, "b": 2}'), '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <a>1</a>\n  <b>2</b>\n</root>');
check('json→xml wraps array value', jsonToXml('{"a": [1, 2]}'), '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <a>1</a>\n  <a>2</a>\n</root>');
check('json→xml root array', jsonToXml('[{"a": 1}]'), '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item>\n    <a>1</a>\n  </item>\n</root>');
check('json→xml attrs, text, null', jsonToXml('{"n": {"@attributes": {"q": "a\\"b<c"}, "#text": "hi", "e": null}}'), '<?xml version="1.0" encoding="UTF-8"?>\n<n q="a&quot;b&lt;c">\n  hi\n  <e/>\n</n>');
threw = '';
try {
  jsonToXml('{"bad name": 1}');
} catch (e) {
  threw = e.message;
}
check('json→xml rejects bad names', threw, '"bad name" is not a valid XML element name.');

{
  const strip = (rel) => readFileSync(resolve('src', rel), 'utf8').replace(/^import .*\n/gm, '').replace(/^export /gm, '');
  const page = strip('pages/Converters/XmlJsonConverter.tsx');
  const src = [strip('utils/json.ts'), strip('utils/text.ts'), page.slice(0, page.indexOf('default function'))].join('\n');
  const js = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const cases = `
const out = [];
const check = (name, got, want) => out.push((JSON.stringify(got) === JSON.stringify(want) ? 'PASS ' : 'FAIL ') + name);
const x = (s) => JSON.parse(xmlToJson(s));
check('xml leaf attributes', x('<a><b id="1">t</b></a>'), { a: { b: { '@attributes': { id: '1' }, '#text': 't' } } });
check('xml mixed content', x('<p>Hello <b>x</b> world</p>'), { p: { b: 'x', '#text': 'Hello world' } });
check('xml repeated', x('<r><i>1</i><i>2</i></r>'), { r: { i: ['1', '2'] } });
check('xml leaf and empty', x('<r><i> hi </i><e/></r>'), { r: { i: 'hi', e: '' } });
check('xml cdata', x('<r><![CDATA[<b>]]></r>'), { r: '<b>' });
const src = { note: { '@attributes': { id: '1', q: 'a"b<c&d' }, to: 'Ada', body: 'x & y', empty: null, list: ['1', '2'] } };
check('xml attribute round trip', x(jsonToXml(JSON.stringify(src))), { note: { '@attributes': { id: '1', q: 'a"b<c&d' }, to: 'Ada', body: 'x & y', empty: '', list: ['1', '2'] } });
let threw = '';
try { xmlToJson('<a><b></a>'); } catch (e) { threw = e.message; }
check('xml parser error surfaced: ' + threw, /tag mismatch|mismatched/i.test(threw), true);
document.getElementById('out').textContent = out.join('\\n');`;
  const html = resolve(OUT, 'xml-check.html');
  writeFileSync(html, `<!doctype html><meta charset="utf-8"><title>XML check</title><pre id="out">no script</pre><script>\n${js}\n${cases}\n</script>`);
  console.log(`note: XML → JSON cases need a browser; open ${html}`);
}

/* ---- Schema inference --------------------------------------------------- */
const { inferSchema, parseJsonSample } = await load('utils/jsonSchema.ts');
const { emitTypescript } = await load('pages/Converters/JsonTypescriptConverter.tsx', ['emitTypescript']);
const { emitDataclasses } = await load('pages/Converters/JsonPythonConverter.tsx', ['emitDataclasses']);
const { emitPydantic } = await load('pages/Converters/JsonPydanticConverter.tsx', ['emitPydantic']);

const sample = '[{"id": 1, "first-name": "Ada", "user": {"address": {"zip": 1}}, "when": "2024-01-31"}, {"id": 2.5, "company": {"address": {"name": "x"}}, "when": null, "class": "a"}]';
const schema = inferSchema(parseJsonSample(sample), 'Root');

check(
  'ts',
  emitTypescript(schema),
  [
    'interface RootUserAddress {\n  zip: number;\n}',
    'interface RootUser {\n  address: RootUserAddress;\n}',
    'interface RootCompanyAddress {\n  name: string;\n}',
    'interface RootCompany {\n  address: RootCompanyAddress;\n}',
    'interface Root {\n  id: number;\n  "first-name"?: string;\n  user?: RootUser;\n  when: string | null;\n  company?: RootCompany;\n  class?: string;\n}',
  ].join('\n\n')
);

check(
  'dataclass',
  emitDataclasses(schema),
  [
    'from dataclasses import dataclass\nfrom datetime import date\nfrom typing import Optional',
    '@dataclass\nclass RootUserAddress:\n    zip: int',
    '@dataclass\nclass RootUser:\n    address: RootUserAddress',
    '@dataclass\nclass RootCompanyAddress:\n    name: str',
    '@dataclass\nclass RootCompany:\n    address: RootCompanyAddress',
    '@dataclass\nclass Root:\n    id: float\n    when: Optional[date]\n    first_name: Optional[str] = None  # "first-name"\n    user: Optional[RootUser] = None\n    company: Optional[RootCompany] = None\n    class_: Optional[str] = None  # "class"\n',
  ].join('\n\n')
);

check(
  'pydantic',
  emitPydantic(schema),
  [
    'from pydantic import BaseModel, Field\nfrom datetime import date\nfrom typing import Optional',
    'class RootUserAddress(BaseModel):\n    zip: int',
    'class RootUser(BaseModel):\n    address: RootUserAddress',
    'class RootCompanyAddress(BaseModel):\n    name: str',
    'class RootCompany(BaseModel):\n    address: RootCompanyAddress',
    'class Root(BaseModel):\n    id: float\n    first_name: Optional[str] = Field(None, alias="first-name")\n    user: Optional[RootUser] = None\n    when: Optional[date]\n    company: Optional[RootCompany] = None\n    class_: Optional[str] = Field(None, alias="class")\n',
  ].join('\n\n')
);

const empty = inferSchema(parseJsonSample('{"a": {}, "n": null, "l": []}'), 'Root');
check('empty class gets pass (py)', emitDataclasses(empty).includes('class RootA:\n    pass'), true);
check('null → Optional[Any], imports Any', emitPydantic(empty), 'from pydantic import BaseModel\nfrom typing import Any, List, Optional\n\nclass RootA(BaseModel):\n    pass\n\nclass Root(BaseModel):\n    a: RootA\n    n: Optional[Any]\n    l: List[Any]\n');
check('ts empty', emitTypescript(empty), 'interface RootA {\n}\n\ninterface Root {\n  a: RootA;\n  n: null;\n  l: any[];\n}');

console.log(bad ? `${bad} failures` : 'all cases pass');
process.exit(bad ? 1 : 0);
