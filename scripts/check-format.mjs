// Checks for the XML and CSS formatters' pure helpers.
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

// XML
const { formatXml, minifyXml } = await load('src/pages/Text-Utilities/XmlFormatter.tsx', 'type XmlToken', ['formatXml', 'minifyXml']);
eq('nested elements', formatXml('<a><b><c>x</c></b></a>', '  '), '<a>\n  <b>\n    <c>x</c>\n  </b>\n</a>');
eq('tab indent', formatXml('<a><b/></a>', '\t'), '<a>\n\t<b/>\n</a>');
eq('self-closing with attributes', formatXml('<r><img src="a.png" alt="x"/><br /></r>', '  '), '<r>\n  <img src="a.png" alt="x"/>\n  <br />\n</r>');
eq(
  'attribute quotes, order and > inside a quoted value',
  formatXml(`<a z='1' b="x>y" c="&amp;"><e/></a>`, '  '),
  `<a z='1' b="x>y" c="&amp;">\n  <e/>\n</a>`
);
eq('declaration, doctype, comment, PI and CDATA preserved', formatXml('<?xml version="1.0"?><!DOCTYPE r [<!ENTITY e "x">]><r><!-- note --><?php x ?><s><![CDATA[a < b && c]]></s></r>', '  '), '<?xml version="1.0"?>\n<!DOCTYPE r [<!ENTITY e "x">]>\n<r>\n  <!-- note -->\n  <?php x ?>\n  <s><![CDATA[a < b && c]]></s>\n</r>');
eq('mixed content stays on one line', formatXml('<p>\n  Hello <b>world</b>,\n  bye\n</p>', '  '), '<p>Hello <b>world</b>, bye</p>');
eq('text trimmed, empty element kept', formatXml('<a>\n  <b>  hi  </b>\n  <c></c>\n</a>', '  '), '<a>\n  <b>hi</b>\n  <c></c>\n</a>');
eq('entities untouched', formatXml('<a>&lt;x&gt; &#169;</a>', '  '), '<a>&lt;x&gt; &#169;</a>');
eq('minify strips inter-element whitespace', minifyXml('<a>\n  <b>x</b>\n  <c>\n    <d/>\n  </c>\n</a>\n'), '<a><b>x</b><c><d/></c></a>');
eq('minify keeps comments and CDATA', minifyXml('<a>\n <!-- c -->\n <s><![CDATA[ 1\n2 ]]></s>\n</a>'), '<a><!-- c --><s><![CDATA[ 1\n2 ]]></s></a>');
eq('minify collapses text whitespace', minifyXml('<p>a\n   b <i>c</i></p>'), '<p>a b <i>c</i></p>');

// CSS
const { minifyCss, beautifyCss } = await load('src/pages/Text-Utilities/CssMinifier.tsx', 'type CssToken', ['minifyCss', 'beautifyCss']);
eq('basic minify', minifyCss('a {\n  color : red ;\n  margin: 0 auto;\n}\n'), 'a{color:red;margin:0 auto}');
eq('comments stripped, /*! kept', minifyCss('/* gone */ a { /*! keep */ color: red; }'), 'a{/*! keep */color:red}');
eq('!important kept, space before it dropped', minifyCss('a { color: red !important; }'), 'a{color:red!important}');
eq('strings untouched', minifyCss(`a::after { content: "; } {" ; quotes: '\\"' "x y" }`), `a::after{content:"; } {";quotes:'\\"' "x y"}`);
eq('unquoted url kept verbatim', minifyCss('a { background: url( data:image/png;base64,AB==  ) no-repeat; }'), 'a{background:url(data:image/png;base64,AB==) no-repeat}');
eq('quoted url with ) inside', minifyCss('a { background: url("a).png") }'), 'a{background:url("a).png")}');
eq('child combinator and commas', minifyCss('ul > li , ol > li { color: rgba(0, 0, 0, .5) }'), 'ul>li,ol>li{color:rgba(0,0,0,.5)}');
eq('@media keeps the space before (', minifyCss('@media screen and ( min-width : 600px ) {\n a { b: c; }\n}'), '@media screen and (min-width:600px){a{b:c}}');
eq('calc keeps operator spaces', minifyCss('a { width: calc( 100% - 2px ); }'), 'a{width:calc(100% - 2px)}');
eq('double semicolons', minifyCss('a { b: c;; d: e; ; }'), 'a{b:c;d:e}');

eq('basic beautify', beautifyCss('a{color:red;margin:0 auto}', '  '), 'a {\n  color: red;\n  margin: 0 auto;\n}');
eq('blank line between rules, 4-space indent', beautifyCss('a{b:c}d{e:f}', '    '), 'a {\n    b: c;\n}\n\nd {\n    e: f;\n}');
eq('selectors split one per line', beautifyCss('h1,h2 , .x:is(a, b){m:0}', '  '), 'h1,\nh2,\n.x:is(a, b) {\n  m: 0;\n}');
eq('@media nesting', beautifyCss('@media (min-width:600px){a{b:c}d{e:f}}', '  '), '@media (min-width: 600px) {\n  a {\n    b: c;\n  }\n\n  d {\n    e: f;\n  }\n}');
eq('@supports and comments kept', beautifyCss('/* top */@supports (display:grid){a{/* in */b:c /* after */}}', '  '), '/* top */\n@supports (display: grid) {\n  a {\n    /* in */\n    b: c /* after */;\n  }\n}');
eq('pseudo selectors keep their colon', beautifyCss('a:hover,a::before{content:":"}', '  '), 'a:hover,\na::before {\n  content: ":";\n}');
eq('strings with braces survive beautify', beautifyCss(`a{content:"} ; {";b:c}`, '  '), `a {\n  content: "} ; {";\n  b: c;\n}`);
eq('!important and > spaced', beautifyCss('a>b{c:d!important}', '  '), 'a > b {\n  c: d !important;\n}');
eq('@import at top level', beautifyCss('@import url(x.css) screen;a{b:c}', '  '), '@import url(x.css) screen;\na {\n  b: c;\n}');
eq('minify then beautify round trip', beautifyCss(minifyCss('a {\n  b: c;\n}\n'), '  '), 'a {\n  b: c;\n}');

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
