import ts from 'typescript';
import { readFileSync } from 'node:fs';
const src = readFileSync('src/pages/Converters/UnixUTCTimeConverter.tsx', 'utf8');
const start = src.indexOf('/* ---- Parsing'); const end = src.indexOf('/* ---- Page');
const js = ts.transpileModule(src.slice(start, end) + '\nexport { parseDate, parseEpoch };', { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { parseDate, parseEpoch } = await import('data:text/javascript,' + encodeURIComponent(js));

// Dates: expected ISO string, or 'error' when the input must be rejected.
const dates = {
  '2025-05-01T13:57:00Z': '2025-05-01T13:57:00.000Z',
  '2025-05-01 13:57:00': '2025-05-01T13:57:00.000Z',
  '2025-05-01T13:57': '2025-05-01T13:57:00.000Z',
  '2025-05-01': '2025-05-01T00:00:00.000Z',
  '2025-05-01 13:57:00 +05:30': '2025-05-01T08:27:00.000Z',
  '2025-05-01T13:57:00+0530': '2025-05-01T08:27:00.000Z',
  '2025-05-01T13:57:00-07': '2025-05-01T20:57:00.000Z',
  '2025-05-01T13:57:00.123456Z': '2025-05-01T13:57:00.123Z',
  '0099-01-01': '0099-01-01T00:00:00.000Z',
  '2025-02-30': 'error',
  '2025-13-01': 'error',
  '2025-05-01 24:00:00': 'error',
  '2025-05-01 13:60:00': 'error',
  '01/05/2025': 'error',
  'May 1 2025': 'error',
  '2025-05-01T13:57:00+15:00': 'error',
  '': 'error',
};
// Epochs: [unit, ISO] or 'error'.
const epochs = {
  '1714583820': ['seconds', '2024-05-01T17:17:00.000Z'],
  '-86400': ['seconds', '1969-12-31T00:00:00.000Z'],
  '1714583820.5': ['seconds', '2024-05-01T17:17:00.500Z'],
  '1714583820000': ['milliseconds', '2024-05-01T17:17:00.000Z'],
  '1714583820000000': ['microseconds', '2024-05-01T17:17:00.000Z'],
  '1714583820000000000': ['nanoseconds', '2024-05-01T17:17:00.000Z'],
  '1e5': 'error',
  'abc': 'error',
  '10000000000000000000000': 'error',
};
let bad = 0;
const fail = (i, got, want) => { bad++; console.log('FAIL', JSON.stringify(i), 'got', got, 'want', want); };
for (const [i, want] of Object.entries(dates)) {
  const r = parseDate(i); const got = r instanceof Date ? r.toISOString() : 'error';
  if (got !== want) fail(i, r instanceof Date ? got : r, want);
}
for (const [i, want] of Object.entries(epochs)) {
  const r = parseEpoch(i); const got = typeof r === 'string' ? 'error' : [r.unit, r.date.toISOString()];
  if (JSON.stringify(got) !== JSON.stringify(want)) fail(i, JSON.stringify(got), JSON.stringify(want));
}
const total = Object.keys(dates).length + Object.keys(epochs).length;
console.log(bad ? `${bad} failures` : `all ${total} cases pass`);
