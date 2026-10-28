// Checks for the calculator pages: cron parser, date difference, age, random numbers, sort lines.
import ts from 'typescript';
import { readFileSync } from 'node:fs';

const LUXON = import.meta.resolve('luxon');

/** Pure helpers from a page: the code between `from` and `export default`, transpiled and imported. */
async function load(file, from, names, { luxon = false } = {}) {
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf(from);
  const end = src.indexOf('export default function');
  const head = luxon ? `import { DateTime } from '${LUXON}';\n` : '';
  const js = ts.transpileModule(head + src.slice(start, end) + `\nexport { ${names.join(', ')} };`, {
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
    const got = fn();
    bad++;
    console.log('FAIL', name, 'got', JSON.stringify(got), 'want an error');
  } catch (e) {
    if (re && !re.test(e.message)) {
      bad++;
      console.log('FAIL', name, 'error', JSON.stringify(e.message), 'did not match', re);
    }
  }
};

/* ---- Cron parser ------------------------------------------------------- */
const { parseCron, describeCron, nextRuns } = await load('src/pages/Converters/CronParser.tsx', 'const MONTHS', ['parseCron', 'describeCron', 'nextRuns']);

const describes = {
  '* * * * *': 'Every minute.',
  '*/15 * * * *': 'Every 15 minutes.',
  '*/15 9-17 * * *': 'Every 15 minutes, between 09:00 and 17:59.',
  '30 9 * * 1-5': 'At 09:30 on Monday through Friday.',
  '30 9 * * MON-FRI': 'At 09:30 on Monday through Friday.',
  '0 0 1 1 *': 'At 00:00 on day-of-month 1 in January.',
  '0 0 1 JAN *': 'At 00:00 on day-of-month 1 in January.',
  '@yearly': 'At 00:00 on day-of-month 1 in January.',
  '@daily': 'At 00:00.',
  '@hourly': 'At minute 0.',
  '0 */2 * * *': 'At minute 0 past every 2nd hour.',
  '0 9,17 * * *': 'At 09:00 and 17:00.',
  '5 4 * * sun': 'At 04:05 on Sunday.',
  '0 0 1,15 * *': 'At 00:00 on day-of-month 1 and 15.',
  '0 0 13 * 5': 'At 00:00 on day-of-month 13 and on Friday.',
  '0 0 */2 * *': 'At 00:00 on every 2nd day-of-month.',
  '30 9 * * 7': 'At 09:30 on Sunday.',
  '0 9 * * 1-5/2': 'At 09:00 on every 2nd day-of-week from Monday through Friday.',
  '15,45 9-17 * * *': 'At minute 15 and 45 past every hour from 9 through 17.',
  '0 0 * 6-8 *': 'At 00:00 in June through August.',
  '* 9 * * *': 'Every minute past hour 9.',
  '0 0,12 1 */2 *': 'At 00:00 and 12:00 on day-of-month 1 in every 2nd month.',
  '  30   9 * *  1-5  ': 'At 09:30 on Monday through Friday.',
};
for (const [expr, want] of Object.entries(describes)) eq(`describe ${expr}`, describeCron(expr), want);

eq('values of */15', parseCron('*/15 * * * *').fields[0].values, [0, 15, 30, 45]);
eq('values of 1-5/2', parseCron('0 0 * * 1-5/2').fields[4].values, [1, 3, 5]);
eq('weekday 7 folds to 0', parseCron('0 0 * * 5-7').fields[4].values, [0, 5, 6]);
eq('names', parseCron('0 0 * jan,DEC Mon').fields.slice(3).map((f) => f.values), [[1, 12], [1]]);
eq('5/15 steps from 5', parseCron('5/15 * * * *').fields[0].values, [5, 20, 35, 50]);
eq('macro expands', parseCron('@weekly').expression, '0 0 * * 0');

const cronErrors = {
  '': /Enter/,
  '* * * *': /Expected 5 fields/,
  '0 0 0 * * *': /Six fields/,
  '60 * * * *': /60 is out of range in the minute field/,
  '* 24 * * *': /24 is out of range in the hour field/,
  '* * 0 * *': /0 is out of range in the day-of-month field/,
  '* * * 13 *': /13 is out of range in the month field/,
  '* * * * 8': /8 is out of range in the day-of-week field/,
  '* * * * foo': /"foo" is not valid in the day-of-week field/,
  '5-1 * * * *': /runs backwards/,
  '*/0 * * * *': /step/,
  '*-5 * * * *': /not valid/,
  '@reboot': /Unknown macro/,
  '1,,2 * * * *': /not valid in the minute field/,
};
for (const [expr, re] of Object.entries(cronErrors)) throws(`error ${JSON.stringify(expr)}`, () => parseCron(expr), re);

const iso = (d) => d.toISOString().slice(0, 16);
const from = new Date('2026-10-28T09:07:30Z'); // a Wednesday
eq('next */15', nextRuns('*/15 * * * *', from, 3, 'utc').map(iso), ['2026-10-28T09:15', '2026-10-28T09:30', '2026-10-28T09:45']);
eq('next 30 9 weekdays', nextRuns('30 9 * * 1-5', from, 3, 'utc').map(iso), ['2026-10-28T09:30', '2026-10-29T09:30', '2026-10-30T09:30']);
eq('next skips the weekend', nextRuns('30 9 * * 1-5', new Date('2026-10-30T10:00:00Z'), 2, 'utc').map(iso), ['2026-11-02T09:30', '2026-11-03T09:30']);
eq('next @monthly', nextRuns('@monthly', from, 2, 'utc').map(iso), ['2026-11-01T00:00', '2026-12-01T00:00']);
eq('next @yearly', nextRuns('@yearly', from, 2, 'utc').map(iso), ['2027-01-01T00:00', '2028-01-01T00:00']);
eq('next 29 Feb', nextRuns('0 0 29 2 *', from, 1, 'utc').map(iso), ['2028-02-29T00:00']);
eq('next dom OR dow', nextRuns('0 0 13 * 5', new Date('2026-11-01T00:00:00Z'), 3, 'utc').map(iso), ['2026-11-06T00:00', '2026-11-13T00:00', '2026-11-20T00:00']);
eq('next window', nextRuns('*/15 9-17 * * 1-5', new Date('2026-10-28T17:50:00Z'), 2, 'utc').map(iso), ['2026-10-29T09:00', '2026-10-29T09:15']);
eq('next starts after from, not at it', nextRuns('0 9 * * *', new Date('2026-10-28T09:00:00Z'), 1, 'utc').map(iso), ['2026-10-29T09:00']);
eq('next sunday as 7', nextRuns('0 0 * * 7', from, 1, 'utc').map(iso), ['2026-11-01T00:00']);
eq('next names', nextRuns('0 12 * JAN MON', from, 1, 'utc').map(iso), ['2027-01-04T12:00']);
throws('never runs', () => nextRuns('0 0 31 2 *', from, 1, 'utc'), /never runs/);

/* ---- Date difference --------------------------------------------------- */
const { dateDiff } = await load('src/pages/Converters/DateDifference.tsx', 'function parseISODate', ['dateDiff'], { luxon: true });
const pick = (d) => ({ days: d.days, w: [d.weeks, d.weekDays], m: [d.months, d.monthDays], ymd: [d.years, d.ymdMonths, d.ymdDays], weekdays: d.weekdays, neg: d.negative });

eq('same day', pick(dateDiff('2026-10-28', '2026-10-28', false)), { days: 0, w: [0, 0], m: [0, 0], ymd: [0, 0, 0], weekdays: 0, neg: false });
eq('same day inclusive', pick(dateDiff('2026-10-28', '2026-10-28', true)), { days: 1, w: [0, 1], m: [0, 1], ymd: [0, 0, 1], weekdays: 1, neg: false });
eq('one week', pick(dateDiff('2026-10-26', '2026-11-02', false)), { days: 7, w: [1, 0], m: [0, 7], ymd: [0, 0, 7], weekdays: 5, neg: false });
eq('leap year', pick(dateDiff('2024-01-01', '2025-01-01', false)).days, 366);
eq('common year', pick(dateDiff('2025-01-01', '2026-01-01', false)).days, 365);
eq('across 29 Feb', pick(dateDiff('2024-02-28', '2024-03-01', false)), { days: 2, w: [0, 2], m: [0, 2], ymd: [0, 0, 2], weekdays: 2, neg: false });
eq('Jan 31 → Feb 28 (clamped month)', pick(dateDiff('2025-01-31', '2025-02-28', false)), { days: 28, w: [4, 0], m: [1, 0], ymd: [0, 1, 0], weekdays: 20, neg: false });
eq('Jan 31 → Mar 1', pick(dateDiff('2025-01-31', '2025-03-01', false)), { days: 29, w: [4, 1], m: [1, 1], ymd: [0, 1, 1], weekdays: 21, neg: false });
eq('explainer example', pick(dateDiff('2024-01-31', '2025-03-01', false)), { days: 395, w: [56, 3], m: [13, 1], ymd: [1, 1, 1], weekdays: 283, neg: false });
eq('reversed is negative with the same numbers', pick(dateDiff('2025-03-01', '2024-01-31', false)), { days: 395, w: [56, 3], m: [13, 1], ymd: [1, 1, 1], weekdays: 283, neg: true });
eq('weekday names', [dateDiff('2026-10-28', '2026-11-01', false).startWeekday, dateDiff('2026-10-28', '2026-11-01', false).endWeekday], ['Wednesday', 'Sunday']);
eq('weekdays over a weekend', dateDiff('2026-10-30', '2026-11-03', false).weekdays, 2); // Fri, Mon
throws('bad date', () => dateDiff('2026-02-30', '2026-03-01', false), /YYYY-MM-DD/);
throws('empty date', () => dateDiff('', '2026-03-01', false), /YYYY-MM-DD/);

/* ---- Age --------------------------------------------------------------- */
const { ageOn } = await load('src/pages/Converters/AgeCalculator.tsx', 'function parseISODate', ['ageOn'], { luxon: true });
const age = (b, o) => {
  const a = ageOn(b, o);
  return [a.years, a.months, a.days];
};
eq('age example', age('1990-07-15', '2026-10-28'), [36, 3, 13]);
const ex = ageOn('1990-07-15', '2026-10-28');
eq('age totals', [ex.totalMonths, ex.totalWeeks, ex.totalDays], [435, 1893, 13254]);
eq('next birthday', [ex.nextBirthday, ex.nextBirthdayWeekday, ex.daysToBirthday, ex.turning], ['2027-07-15', 'Thursday', 260, 37]);
eq('born on', [ex.bornOn, ex.leapYear], ['Sunday', false]);
eq('birthday today', (() => { const a = ageOn('2000-10-28', '2026-10-28'); return [a.years, a.months, a.days, a.daysToBirthday, a.turning]; })(), [26, 0, 0, 0, 26]);
eq('day before birthday', (() => { const a = ageOn('2000-10-28', '2026-10-27'); return [a.years, a.months, a.days, a.daysToBirthday, a.turning]; })(), [25, 11, 29, 1, 26]);
eq('born on the 31st, checked on 28 Feb', age('2000-01-31', '2001-02-28'), [1, 1, 0]);
eq('born on the 31st, checked on 1 Mar', age('2000-01-31', '2001-03-01'), [1, 1, 1]);
eq('leapling in a common year', (() => { const a = ageOn('2000-02-29', '2025-02-28'); return [a.years, a.months, a.days, a.leapYear, a.nextBirthday, a.daysToBirthday]; })(), [25, 0, 0, true, '2025-02-28', 0]);
eq('leapling in a leap year', (() => { const a = ageOn('2000-02-29', '2028-02-28'); return [a.years, a.nextBirthday, a.daysToBirthday, a.turning]; })(), [27, '2028-02-29', 1, 28]);
eq('newborn', age('2026-10-28', '2026-10-28'), [0, 0, 0]);
throws('birth after on-date', () => ageOn('2026-10-29', '2026-10-28'), /after/);

/* ---- Random numbers ---------------------------------------------------- */
const { randomInts } = await load('src/pages/Encode-Decode/RandomNumberGenerator.tsx', 'const TWO_32', ['randomInts']);
const inRange = (xs, lo, hi) => xs.every((x) => Number.isInteger(x) && x >= lo && x <= hi);
let r = randomInts(1, 100, 1000, false);
eq('count', r.length, 1000);
eq('in range', inRange(r, 1, 100), true);
eq('covers the range', new Set(r).size > 90, true);
r = randomInts(1, 1000, 1000, true);
eq('unique: full permutation', [...new Set(r)].length, 1000);
eq('unique: every value present', [...r].sort((a, b) => a - b), Array.from({ length: 1000 }, (_, i) => i + 1));
r = randomInts(-5, 5, 11, true);
eq('negative range, unique', [...r].sort((a, b) => a - b), [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
r = randomInts(7, 7, 5, false);
eq('single-value range', r, [7, 7, 7, 7, 7]);
eq('single-value range unique', randomInts(7, 7, 1, true), [7]);
r = randomInts(0, 2 ** 32 - 1, 500, true);
eq('2^32 wide range, unique (Set path)', [new Set(r).size, inRange(r, 0, 2 ** 32 - 1)], [500, true]);
r = randomInts(-(2 ** 31), 2 ** 31, 200, false);
eq('2^32 apart with negatives', inRange(r, -(2 ** 31), 2 ** 31), true);
r = randomInts(0, 2 ** 50, 100, true);
eq('big range', [new Set(r).size, inRange(r, 0, 2 ** 50)], [100, true]);
// A coarse uniformity check: 60,000 draws of 1-6 land near 10,000 per face.
const faces = new Map();
for (const x of randomInts(1, 6, 60000, false)) faces.set(x, (faces.get(x) ?? 0) + 1);
eq('roughly uniform', [...faces.values()].every((n) => n > 9400 && n < 10600), true);
throws('too many unique', () => randomInts(1, 5, 10, true), /Only 5 different numbers/);
throws('max < min', () => randomInts(10, 1, 1, false), /Max must be at least min/);
throws('not integers', () => randomInts(1.5, 10, 1, false), /whole numbers/);

/* ---- Sort lines -------------------------------------------------------- */
const { sortLines } = await load('src/pages/Text-Utilities/SortLines.tsx', 'type Order', ['sortLines']);
const base = { order: 'alpha', descending: false, caseSensitive: false, unique: false, trim: false };
eq('alpha', sortLines('banana\napple\ncherry', base), ['apple', 'banana', 'cherry']);
eq('alpha descending', sortLines('banana\napple\ncherry', { ...base, descending: true }), ['cherry', 'banana', 'apple']);
eq('alpha ignores case', sortLines('b\nA\nc', base), ['A', 'b', 'c']);
eq('alpha case-sensitive puts capitals first', sortLines('b\na\nB\nA', { ...base, caseSensitive: true }), ['A', 'B', 'a', 'b']);
eq('natural', sortLines('file10\nfile2\nFile1', { ...base, order: 'natural' }), ['File1', 'file2', 'file10']);
eq('alpha is not natural', sortLines('file10\nfile2', base), ['file10', 'file2']);
eq('numeric', sortLines('10 apples\n-3 pears\n2.5 kg\nnone\n7', { ...base, order: 'numeric' }), ['-3 pears', '2.5 kg', '7', '10 apples', 'none']);
eq('numeric keeps order of non-numbers', sortLines('x\n2\ny\n1', { ...base, order: 'numeric' }), ['1', '2', 'x', 'y']);
eq('length', sortLines('ccc\na\nbb', { ...base, order: 'length' }), ['a', 'bb', 'ccc']);
eq('reverse', sortLines('1\n2\n3', { ...base, order: 'reverse' }), ['3', '2', '1']);
eq('shuffle keeps every line', [...sortLines('1\n2\n3\n4\n5', { ...base, order: 'random' })].sort(), ['1', '2', '3', '4', '5']);
eq('unique ignoring case', sortLines('a\nA\nb', { ...base, unique: true }), ['a', 'b']);
eq('unique case-sensitive', sortLines('a\nA\nb', { ...base, unique: true, caseSensitive: true }), ['A', 'a', 'b']);
eq('trim', sortLines('  b\na  ', { ...base, trim: true }), ['a', 'b']);
eq('trailing newline dropped', sortLines('b\na\n', base), ['a', 'b']);
eq('blank lines kept', sortLines('b\n\na', base), ['', 'a', 'b']);

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
