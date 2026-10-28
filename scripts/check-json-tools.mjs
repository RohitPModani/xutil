// Checks for the pure helpers of JSON Diff (normaliser) and JSONPath Tester (evaluator).
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

let bad = 0;
let total = 0;
const eq = (name, got, want) => {
  total++;
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    bad++;
    console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want));
  }
};
const throws = (name, fn, re) => {
  total++;
  try {
    fn();
    bad++;
    console.log('FAIL', name, '\n  expected an error matching', String(re));
  } catch (e) {
    if (!re.test(e.message)) {
      bad++;
      console.log('FAIL', name, '\n  got error', JSON.stringify(e.message), '\n  want match', String(re));
    }
  }
};

// JSON normaliser
const { canonical } = await load('src/pages/Text-Utilities/JsonDiff.tsx', '/** Sorts object keys', ['canonical']);
const same = (name, a, b, sortArrays = false) => eq(name, canonical(a, true, sortArrays) === canonical(b, true, sortArrays), true);
const differ = (name, a, b, sortArrays = false) => eq(name, canonical(a, true, sortArrays) === canonical(b, true, sortArrays), false);
same('key order ignored', '{"a":1,"b":2}', '{"b":2,"a":1}');
same('nested key order ignored', '{"x":{"a":1,"b":[{"d":1,"c":2}]}}', '{"x":{"b":[{"c":2,"d":1}],"a":1}}');
same('formatting ignored', '{ "a" : [ 1 ,2 ] }', '{"a":[1,\n  2]}');
differ('arrays keep order', '[1,2,3]', '[3,2,1]');
same('arrays sorted on request', '[1,2,3]', '[3,2,1]', true);
same('objects in arrays sorted by canonical text', '[{"b":1,"a":2},{"a":1}]', '[{"a":1},{"a":2,"b":1}]', true);
same('1.0 equals 1', '{"n":1.0}', '{"n":1}');
same('1e2 equals 100', '[1e2]', '[100]');
differ('string vs number differ', '{"n":"1"}', '{"n":1}');
differ('null vs missing differ', '{"a":null}', '{}');
eq('key order kept when asked', canonical('{"b":1,"a":2}', false, false), '{\n  "b": 1,\n  "a": 2\n}\n');
eq('pretty-printed with two spaces', canonical('{"a":[1]}', true, false), '{\n  "a": [\n    1\n  ]\n}\n');

// JSONPath evaluator
const { evalJsonPath } = await load('src/pages/Text-Utilities/JsonPath.tsx', 'type Selector', ['evalJsonPath']);
const doc = {
  store: {
    books: [
      { author: 'Austen', price: 8, 'a.b': 'dotted' },
      { author: 'Eco', price: 12 },
      { author: 'Lem', price: 5 },
    ],
    bike: { price: 100 },
  },
  'odd key]': true,
};
const values = (path, root = doc) => evalJsonPath(root, path).map((m) => m.value);
const paths = (path, root = doc) => evalJsonPath(root, path).map((m) => m.path);

eq('$ is the root', values('$'), [doc]);
eq('empty path is the root', paths(''), ['$']);
eq('dot child', values('$.store.bike.price'), [100]);
eq('bracket child single quotes', values("$['store']['bike']['price']"), [100]);
eq('bracket child double quotes', values('$["store"]["bike"]'), [{ price: 100 }]);
eq('quoted key with dot', values("$.store.books[0]['a.b']"), ['dotted']);
eq('quoted key with bracket', values("$['odd key]']"), [true]);
eq('leading $ optional', values('store.bike.price'), [100]);
eq('index', values('$.store.books[1].author'), ['Eco']);
eq('negative index', values('$.store.books[-1].author'), ['Lem']);
eq('index out of range is no match', values('$.store.books[9]'), []);
eq('missing member is no match', values('$.store.nothing'), []);
eq('dot wildcard', values('$.store.books.*.author'), ['Austen', 'Eco', 'Lem']);
eq('bracket wildcard', values('$.store.books[*].price'), [8, 12, 5]);
eq('wildcard over object', values('$.store.*.price'), [100]);
eq('recursive name', values('$..price'), [8, 12, 5, 100]);
eq('recursive wildcard counts every node but the root', values('$..*', { a: [1, { b: 2 }] }).length, 4);
eq('recursive index', values('$..[0]'), [{ author: 'Austen', price: 8, 'a.b': 'dotted' }]);
eq('recursive bracket name', values("$..['bike']"), [{ price: 100 }]);
eq('index union', values('$.store.books[0,2].author'), ['Austen', 'Lem']);
eq('name union', values("$.store.books[0]['author','price']"), ['Austen', 8]);
eq('slice start:end', values('$.store.books[0:2].author'), ['Austen', 'Eco']);
eq('slice open end', values('$.store.books[1:].author'), ['Eco', 'Lem']);
eq('slice negative start', values('$.store.books[-2:].author'), ['Eco', 'Lem']);
eq('slice step', values('$.store.books[::2].author'), ['Austen', 'Lem']);
eq('slice negative step reverses', values('$.store.books[::-1].author'), ['Lem', 'Eco', 'Austen']);
eq('slice clamps', values('$.store.books[1:99].price'), [12, 5]);
eq('slice on object is no match', values('$.store[0:1]'), []);
eq('paths are bracket-normalised', paths('$.store.books[-1].author'), ["$['store']['books'][2]['author']"]);
eq('paths quote dotted keys', paths("$.store.books[0]['a.b']"), ["$['store']['books'][0]['a.b']"]);
eq('path escapes quotes', paths("$['it\\'s']", { "it's": 1 }), ["$['it\\'s']"]);

throws('filter unsupported', () => evalJsonPath(doc, '$.store.books[?(@.price < 10)]'), /^Filters \[\?\(\.\.\.\)\] are not supported$/);
throws('script unsupported', () => evalJsonPath(doc, '$.store.books[(@.length-1)]'), /Script expressions .* are not supported/);
throws('unterminated string', () => evalJsonPath(doc, "$['store"), /Unterminated string/);
throws('missing bracket', () => evalJsonPath(doc, '$.store[0'), /Expected '\]'/);
throws('bad index', () => evalJsonPath(doc, '$.store[abc]'), /Expected an index/);
throws('zero step', () => evalJsonPath(doc, '$.store.books[::0]'), /step cannot be 0/);
throws('trailing dot', () => evalJsonPath(doc, '$.store.'), /Expected a name/);

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
