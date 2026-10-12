// Exercises the diff worker's pure functions. Run: node scripts/check-diff.mjs
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const src = readFileSync('src/workers/diff.worker.ts', 'utf8');
const js = ts.transpileModule(src.replace(/self\.onmessage = [\s\S]*$/, '') + '\nexport { lineDiff, inlineDiff };', { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText.replace("from 'diff'", "from 'file://" + process.cwd() + "/node_modules/diff/lib/index.mjs'");
const { lineDiff, inlineDiff } = await import('data:text/javascript,' + encodeURIComponent(js));
const r = lineDiff('alpha\nbeta\ngamma ray\nx\ny\nz\nw\nq\nend\n', 'alpha\nbeta\ngamma burst\nx\ny\nz\nw\nq\nend2\n', false, false);
console.log(JSON.stringify({ hunks: r.hunks, added: r.added, removed: r.removed, same: r.same, rows: r.rows.map(x => [x.kind, x.oldNo ?? '', x.newNo ?? '', x.hunk ?? '', x.parts?.filter(p => p.changed).map(p => p.text)]) }));
const w = inlineDiff('the quick brown fox', 'the slow brown cat', 'words', false, false);
console.log(JSON.stringify({ hunks: w.hunks, added: w.added, removed: w.removed, inline: w.inline.map(p => [p.kind, p.text]) }));
console.log(JSON.stringify(lineDiff('a\nb\n', 'a\nb\n', false, false).hunks));
