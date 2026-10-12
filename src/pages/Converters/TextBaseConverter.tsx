import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, EmptyState, Field, KeyValueList, Output, Panel, Segmented, Select, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Mode = 'encode' | 'decode';
type Encoding = 'utf8' | 'utf16';

const BASES = [
  { value: 2, label: 'Binary' },
  { value: 8, label: 'Octal' },
  { value: 10, label: 'Decimal' },
  { value: 16, label: 'Hexadecimal' },
];

const DIGITS = '0123456789abcdef';
const MAX_CODE_POINT = 0x10ffff;

/** Width of one fixed-size unit in the base, for splitting unseparated input. */
const unitWidth = (base: number, encoding: Encoding) => (base === 2 ? 8 : base === 16 ? 2 : 0) * (encoding === 'utf16' ? 2 : 1);

/** Each UTF-8 byte or UTF-16 code unit in the given base, space separated. */
const encode = (text: string, base: number, encoding: Encoding) => {
  const units = encoding === 'utf8' ? Array.from(new TextEncoder().encode(text)) : Array.from({ length: text.length }, (_, i) => text.charCodeAt(i));
  return units.map((u) => u.toString(base).toUpperCase()).join(' ');
};

function decode(input: string, base: number, encoding: Encoding): string {
  const valid = new RegExp(`^[${DIGITS.slice(0, base)}]+$`, 'i');
  let tokens = input.split(/[\s,]+/).filter(Boolean);
  const width = unitWidth(base, encoding);
  // "48656C6C6F" with no separators: cut into fixed-width units.
  if (tokens.length === 1 && width && tokens[0].length > width && tokens[0].length % width === 0) {
    tokens = tokens[0].match(new RegExp(`.{${width}}`, 'g')) ?? tokens;
  }
  const values = tokens.map((token) => {
    if (!valid.test(token)) throw new Error(`"${token}" is not a valid base-${base} number.`);
    const n = parseInt(token, base);
    if (encoding === 'utf8' && n > 0xff) throw new Error(`"${token}" is above FF, so it is not a UTF-8 byte.`);
    if (n > MAX_CODE_POINT) throw new Error(`"${token}" is above 10FFFF, the last Unicode code point.`);
    return n;
  });
  if (encoding === 'utf8') {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(values));
    } catch {
      throw new Error('Those bytes are not a valid UTF-8 sequence.');
    }
  }
  // Surrogate pairs join naturally; a value above FFFF is taken as a code point.
  return values.map((n) => String.fromCodePoint(n)).join('');
}

export default function TextBaseConverter() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [base, setBase] = useState('2');
  const [encoding, setEncoding] = useState<Encoding>('utf8');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === 'encode') {
      return { rows: BASES.map((b) => ({ label: b.label, value: encode(input, b.value, encoding) })), text: '', error: '' };
    }
    try {
      return { rows: [], text: decode(input, Number(base), encoding), error: '' };
    } catch (e) {
      return { rows: [], text: '', error: getErrorMessage(e, 'Could not decode the input.') };
    }
  }, [input, mode, base, encoding]);

  const rows = result?.rows ?? [];

  return (
    <ToolPage id="text_base">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode}
              onChange={(m) => {
                setMode(m);
                setInput('');
              }}
              options={[
                { value: 'encode', label: 'Text → codes' },
                { value: 'decode', label: 'Codes → text' },
              ]}
            />
            <Segmented
              size="sm"
              label="Encoding"
              value={encoding}
              onChange={setEncoding}
              options={[
                { value: 'utf8', label: 'UTF-8 bytes' },
                { value: 'utf16', label: 'UTF-16 units' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <div className="space-y-4">
            {mode === 'decode' && (
              <Field label="Input base" htmlFor="tb-base" className="max-w-xs">
                <Select id="tb-base" value={base} onChange={(e) => setBase(e.target.value)}>
                  {BASES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.value} ({b.label})
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field
              label={mode === 'encode' ? 'Text' : 'Numbers'}
              htmlFor="tb-input"
              hint={
                mode === 'encode'
                  ? encoding === 'utf8'
                    ? 'Each UTF-8 byte becomes one number; é gives two, most emoji four.'
                    : 'Each UTF-16 code unit becomes one number; emoji give a surrogate pair.'
                  : 'Numbers separated by spaces or commas. Unseparated binary or hex is cut into fixed-width units.'
              }
              error={result?.error}
            >
              <TextArea
                id="tb-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Hello' : '1001000 1100101 1101100 1101100 1101111'}
                rows={6}
                mono={mode === 'decode'}
                autoFocus
              />
            </Field>
          </div>
          {mode === 'encode' ? (
            <Output label="Encoded" copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}>
              {rows.length > 0 ? <KeyValueList items={rows} /> : <EmptyState>Enter some text</EmptyState>}
            </Output>
          ) : (
            <Output label="Text" value={result?.text ?? ''} rows={6} mono={false} />
          )}
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
