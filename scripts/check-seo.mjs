// Sanity checks for the tool explainers: title length, meta description
// length, FAQ count, and that every registry tool has an entry.
import ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';

const load = async (file) => {
  const src = readFileSync(file, 'utf8').replace(/^import type.*\n/m, '');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return Object.values(await import('data:text/javascript,' + encodeURIComponent(js)))[0];
};

const all = {};
for (const f of readdirSync('src/data/seo').filter((f) => f !== 'types.ts')) Object.assign(all, await load(`src/data/seo/${f}`));

const registry = readFileSync('src/data/tools.ts', 'utf8');
const keys = [...registry.matchAll(/seo: '(\w+)'/g)].map((m) => m[1]);

let problems = 0;
const flag = (k, msg) => { problems++; console.log(`${k}: ${msg}`); };
for (const k of keys) if (!all[k]) flag(k, 'no explainer');
for (const [k, v] of Object.entries(all)) {
  const first = v.body.trim().split(/\n\s*\n/)[0].replace(/[*_`#]/g, '').replace(/\s+/g, ' ');
  if (v.seo.length > 60) flag(k, `title ${v.seo.length} chars`);
  if (first.length > 160 || first.length < 100) flag(k, `description ${first.length} chars`);
  if (!v.faq || v.faq.length < 3 || v.faq.length > 4) flag(k, `faq count ${v.faq?.length ?? 0}`);
  const prose = v.body.replace(/```[\s\S]*?```/g, '');
  if (/[a-z]!(\s|$)|pro tip|game-changer/im.test(prose)) flag(k, 'tone');
}
console.log(problems ? `${problems} problem(s)` : `${Object.keys(all).length} explainers OK`);
process.exit(problems ? 1 : 0);
