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
  'every 6 months': '0 0 1 */6 *',
  'at 09:05': '5 9 * * *',
  'every day at midnight': '0 0 * * *',
  'every monday at noon': '0 12 * * 1',
  'every monday and wednesday at 9am': '0 9 * * 1,3',
  'every monday, wednesday and friday': '0 0 * * 1,3,5',
  'monday to friday at 8:15am': '15 8 * * 1-5',
  'every 2 hours on weekdays': '0 */2 * * 1-5',
  'every 15 minutes on weekends': '*/15 * * * 0,6',
  'in january at 9am': '0 9 * 1 *',
  'every day in january and july at 9am': '0 9 * 1,7 *',
  'every hour between 9 pm and 5 am': '0 21-23,0-5 * * *',
  'every 15 minutes between 9:30 am and 5 pm': '*/15 9-17 * * *',
  'between 9:30 am and 5 pm': '30 9-17 * * *',
  'every day at 9am and 5pm': '0 9,17 * * *',
  'at 9am, noon and 5pm': '0 9,12,17 * * *',
  'weekly': '0 0 * * 0',
  'every week on friday': '0 0 * * 5',
  'monthly': '0 0 1 * *',
  'monthly on the 15th': '0 0 15 * *',
  'on the 1st and 15th at 6am': '0 6 1,15 * *',
  'yearly': '0 0 1 1 *',
  'every 2 weeks': '0 0 */14 * *',
};
const errors = ['every 90 minutes', 'every 0 minutes', 'every 24 hours', 'at 25:00', 'at 13 pm', 'at 9:75', 'at 9:30am and 5:45pm', 'every 5 weeks', 'on the 32nd', 'tomorrow', ''];
let bad = 0;
for (const [i, want] of Object.entries(cases)) { const got = toCron(i); if (got !== want) { bad++; console.log('FAIL', JSON.stringify(i), 'got', got, 'want', want); } }
for (const i of errors) { try { const got = toCron(i); bad++; console.log('FAIL', JSON.stringify(i), 'got', got, 'want an error'); } catch { /* expected */ } }
console.log(bad ? `${bad} failures` : `all ${Object.keys(cases).length + errors.length} cases pass`);
