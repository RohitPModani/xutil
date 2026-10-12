import ts from 'typescript';
import { readFileSync } from 'node:fs';
const src = readFileSync('src/pages/Converters/CronConverter.tsx','utf8');
const start = src.indexOf('// Cron field positions'); const end = src.indexOf('const FIELD_LABELS');
const js = ts.transpileModule(src.slice(start, end) + '\nexport { toCron };', { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { toCron } = await import('data:text/javascript,' + encodeURIComponent(js));
const cases = {
  'every 15 minutes': '*/15 * * * *',
  'every weekday at 9:30am': '30 9 * * 1-5',
  'every monday at 3 pm': '0 15 * * 1',
  'every hour between 9 am and 5 pm': '0 9-17 * * *',
  'every 15 minutes between 9 am and 5 pm': '*/15 9-17 * * *',
  'every other day': '0 0 */2 * *',
  'every weekend': '0 0 * * 0,6',
  'every sunday': '0 0 * * 0',
  'midnight': '0 0 * * *',
  'noon': '0 12 * * *',
  'every day': '0 0 * * *',
  'daily': '0 0 * * *',
  'every minute': '* * * * *',
  'every hour': '0 * * * *',
  'every 2 hours': '0 */2 * * *',
  'every 3 days at 6 am': '0 6 */3 * *',
  'at 7:45 pm': '45 19 * * *',
  'in january': '* * * 1 *',
};
let bad = 0;
for (const [i, want] of Object.entries(cases)) { const got = toCron(i); if (got !== want) { bad++; console.log('FAIL', JSON.stringify(i), 'got', got, 'want', want); } }
console.log(bad ? `${bad} failures` : `all ${Object.keys(cases).length} cases pass`);
