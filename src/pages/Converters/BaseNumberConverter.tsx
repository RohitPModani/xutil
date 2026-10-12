import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, EmptyState, Field, Input, KeyValueList, Output, Panel, Select } from '../../ui';

const BASE_NAMES = [
  'Binary', 'Ternary', 'Quaternary', 'Quinary', 'Senary', 'Septenary', 'Octal', 'Nonary', 'Decimal',
  'Undecimal', 'Duodecimal', 'Tridecimal', 'Tetradecimal', 'Pentadecimal', 'Hexadecimal', 'Heptadecimal',
  'Octodecimal', 'Nonadecimal', 'Vigesimal', 'Unvigesimal', 'Duovigesimal', 'Trivigesimal', 'Tetravigesimal',
  'Pentavigesimal', 'Hexavigesimal', 'Heptavigesimal', 'Octovigesimal', 'Nonavigesimal', 'Trigesimal',
  'Untrigesimal', 'Duotrigesimal', 'Tritrigesimal', 'Tetratrigesimal', 'Pentatrigesimal', 'Hexatrigesimal',
];
const BASES = BASE_NAMES.map((name, i) => ({ value: i + 2, name }));
const baseName = (b: number) => `${b} (${BASES[b - 2].name})`;
const COMMON = [2, 8, 10, 16];

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const MAX_DIGITS = 4000;
const PREFIX: Record<number, string> = { 2: '0b', 8: '0o', 16: '0x' };

/** Arbitrary-length parse; parseInt loses precision above 2^53. */
function parseBig(s: string, base: number): bigint {
  const prefix = PREFIX[base] ?? (base === 10 ? '' : null);
  if (prefix !== null) return BigInt(prefix + s);
  let n = 0n;
  for (const ch of s.toLowerCase()) n = n * BigInt(base) + BigInt(DIGITS.indexOf(ch));
  return n;
}

/** Strips a sign, a matching 0x/0b/0o prefix and `_`/space grouping. */
function parseInput(value: string, base: number): { n: bigint | null; error: string } {
  let raw = value.trim().replace(/[\s_]/g, '');
  if (!raw) return { n: null, error: '' };
  const negative = raw.startsWith('-');
  if (negative) raw = raw.slice(1);
  const prefix = PREFIX[base];
  if (prefix && raw.toLowerCase().startsWith(prefix)) raw = raw.slice(2);
  if (raw.length > MAX_DIGITS) return { n: null, error: `Up to ${MAX_DIGITS.toLocaleString()} digits.` };
  if (!new RegExp(`^[${DIGITS.slice(0, base)}]+$`, 'i').test(raw)) {
    return { n: null, error: `Only the digits ${DIGITS.slice(0, base).toUpperCase()} are valid in base ${base}.` };
  }
  const n = parseBig(raw, base);
  return { n: negative ? -n : n, error: '' };
}

export default function BaseNumberConverter() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('10');
  const [to, setTo] = useState('2');

  const fromBase = Number(from);
  const toBase = Number(to);

  const result = useMemo(() => parseInput(value, fromBase), [value, fromBase]);

  const n = result.n;
  const rows = n === null
    ? []
    : [...COMMON, ...(COMMON.includes(toBase) ? [] : [toBase])].map((b) => ({ label: baseName(b), value: n.toString(b).toUpperCase() }));
  const copyAll = rows.map((r) => `${r.label}: ${r.value}`).join('\n');
  const pristine = !value && from === '10' && to === '2';

  return (
    <ToolPage id="base_number">
      <Panel
        title="Convert"
        actions={
          <ClearButton
            label="Reset"
            onClick={() => {
              setValue('');
              setFrom('10');
              setTo('2');
            }}
            disabled={pristine}
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <Field label="Number" htmlFor="bn-value" className="sm:col-span-2 md:col-span-1" hint="A leading minus, a 0x/0b/0o prefix and _ or space grouping are accepted." error={result.error}>
              <Input
                id="bn-value"
                inputMode={fromBase <= 10 ? 'numeric' : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="255"
                autoFocus
              />
            </Field>
            <Field label="From base" htmlFor="bn-from">
              <Select id="bn-from" value={from} onChange={(e) => setFrom(e.target.value)}>
                {BASES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {baseName(b.value)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Also show base" htmlFor="bn-to">
              <Select id="bn-to" value={to} onChange={(e) => setTo(e.target.value)}>
                {BASES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {baseName(b.value)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Output label="Equals" copyText={copyAll}>
            {rows.length > 0 ? <KeyValueList items={rows} /> : <EmptyState>Enter a number</EmptyState>}
          </Output>
        </div>
      </Panel>
    </ToolPage>
  );
}
