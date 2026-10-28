import ts from 'typescript';
import { readFileSync } from 'node:fs';

/** Pure helpers from a page: the code between `from` and `to`, transpiled and imported. */
async function load(file, from, to, names) {
  const src = readFileSync(file, 'utf8');
  const js = ts.transpileModule(src.slice(src.indexOf(from), src.indexOf(to)) + `\nexport { ${names.join(', ')} };`, {
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

const { relativeLuminance, contrastRatio, wcagVerdicts } = await load(
  'src/pages/Image-Tools/ContrastChecker.tsx',
  'type Rgb =',
  'function suggestTextColor',
  ['relativeLuminance', 'contrastRatio', 'wcagVerdicts']
);

const black = { r: 0, g: 0, b: 0 };
const white = { r: 255, g: 255, b: 255 };
const grey = { r: 0x77, g: 0x77, b: 0x77 };
const table = (ratio) => Object.fromEntries(wcagVerdicts(ratio).map((v) => [v.label, v.pass ? 'Pass' : 'Fail']));

eq('luminance of white', relativeLuminance(white), 1);
eq('luminance of black', relativeLuminance(black), 0);
eq('black on white', contrastRatio(black, white), 21);
eq('white on black (order does not matter)', contrastRatio(white, black), 21);
eq('white on white', contrastRatio(white, white), 1);
eq('#777 on white', contrastRatio(grey, white).toFixed(2), '4.48');
eq('#777 on white verdicts', table(contrastRatio(grey, white)), {
  'AA normal text': 'Fail',
  'AA large text': 'Pass',
  'AAA normal text': 'Fail',
  'AAA large text': 'Fail',
  'UI components and graphics': 'Pass',
});
eq('21:1 passes everything', Object.values(table(21)), ['Pass', 'Pass', 'Pass', 'Pass', 'Pass']);
eq('1:1 fails everything', Object.values(table(1)), ['Fail', 'Fail', 'Fail', 'Fail', 'Fail']);
eq('4.5 exactly passes AA normal and AAA large', table(4.5)['AA normal text'] + table(4.5)['AAA large text'], 'PassPass');
eq('7 exactly passes AAA normal', table(7)['AAA normal text'], 'Pass');

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
