import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, EmptyState, Field, Input, KeyValueList, Output, Panel, Select } from '../../ui';

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

/** Arbitrary-length parse; parseInt loses precision above 2^53. */
function parseBig(s: string, base: number): bigint {
  let n = 0n;
  for (const ch of s.toLowerCase()) n = n * BigInt(base) + BigInt(DIGITS.indexOf(ch));
  return n;
}

export default function BaseNumberConverter() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('10');
  const [to, setTo] = useState('2');

  const fromBase = Number(from);
  const toBase = Number(to);

  const result = useMemo(() => {
    const raw = value.trim();
    if (!raw) return { n: null, error: '' };
    if (!new RegExp(`^[${DIGITS.slice(0, fromBase)}]+$`, 'i').test(raw)) {
      return { n: null, error: `Only the digits ${DIGITS.slice(0, fromBase).toUpperCase()} are valid in base ${fromBase}.` };
    }
    return { n: parseBig(raw, fromBase), error: '' };
  }, [value, fromBase]);

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
            <Field label="Number" htmlFor="bn-value" className="sm:col-span-2 md:col-span-1" hint="Any length; digits are checked against the base you pick.">
              <Input
                id="bn-value"
                inputMode={fromBase <= 10 ? 'numeric' : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="255"
                autoFocus
                aria-invalid={Boolean(result.error) || undefined}
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
        {result.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
