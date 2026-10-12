import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Input, Output, Panel, Segmented, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Mode = 'auto' | 'toRoman' | 'toNumber';

const MIN = 1;
const MAX = 3999;
const ROMAN_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const VALUES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const TABLE: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function toRoman(input: string): string {
  const n = Number(input);
  if (!/^\d+$/.test(input) || n < MIN || n > MAX) throw new Error(`Enter a whole number between ${MIN} and ${MAX}.`);
  let num = n;
  let out = '';
  for (const [value, numeral] of TABLE) {
    while (num >= value) {
      out += numeral;
      num -= value;
    }
  }
  return out;
}

function toNumber(input: string): string {
  const roman = input.toUpperCase();
  if (!roman || !ROMAN_PATTERN.test(roman)) throw new Error('Not a valid Roman numeral. Use I, V, X, L, C, D and M.');
  let total = 0;
  let prev = 0;
  for (let i = roman.length - 1; i >= 0; i--) {
    const v = VALUES[roman[i]];
    total += v >= prev ? v : -v;
    prev = v;
  }
  return String(total);
}

export default function RomanNumeralConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('auto');

  const result = useMemo(() => {
    const raw = input.trim();
    if (!raw) return null;
    const dir: Exclude<Mode, 'auto'> = mode === 'auto' ? (/^[-+]?\d/.test(raw) ? 'toRoman' : 'toNumber') : mode;
    try {
      return { out: dir === 'toRoman' ? toRoman(raw) : toNumber(raw), dir, error: '' };
    } catch (e) {
      return { out: '', dir, error: getErrorMessage(e, 'Could not convert.') };
    }
  }, [input, mode]);

  const dir = result?.dir;

  return (
    <ToolPage id="roman_numeral">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'toRoman', label: 'Number → Roman' },
                { value: 'toNumber', label: 'Roman → Number' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field
            label="Input"
            htmlFor="roman-input"
            hint={dir ? (dir === 'toRoman' ? 'Converting a number to Roman.' : 'Converting Roman to a number.') : `A number from ${MIN} to ${MAX}, or a Roman numeral.`}
            error={result?.error}
          >
            <Input
              id="roman-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="1984 or MCMLXXXIV"
              autoFocus
              maxLength={16}
            />
          </Field>
          <Output label={dir === 'toNumber' ? 'Number' : 'Roman numeral'} value={result?.out ?? ''} rows={1} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
