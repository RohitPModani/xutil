import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, EmptyState, Field, KeyValueList, Output, Panel, Segmented, Select, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Mode = 'encode' | 'decode';

const BASES = [
  { value: 2, label: 'Binary' },
  { value: 8, label: 'Octal' },
  { value: 10, label: 'Decimal' },
  { value: 16, label: 'Hexadecimal' },
];

const DIGITS = '0123456789abcdef';

/** Each character's UTF-16 code unit in the given base, space separated. */
const encode = (text: string, base: number) =>
  Array.from(text, (ch) => ch.charCodeAt(0).toString(base).toUpperCase()).join(' ');

function decode(input: string, base: number): string {
  const valid = new RegExp(`^[${DIGITS.slice(0, base)}]+$`, 'i');
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      if (!valid.test(token)) throw new Error(`"${token}" is not a valid base-${base} number.`);
      return String.fromCharCode(parseInt(token, base));
    })
    .join('');
}

export default function TextBaseConverter() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [base, setBase] = useState('2');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === 'encode') {
      return { rows: BASES.map((b) => ({ label: b.label, value: encode(input, b.value) })), text: '', error: '' };
    }
    try {
      return { rows: [], text: decode(input, Number(base)), error: '' };
    } catch (e) {
      return { rows: [], text: '', error: getErrorMessage(e, 'Could not decode the input.') };
    }
  }, [input, mode, base]);

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
                { value: 'encode', label: 'Text → bytes' },
                { value: 'decode', label: 'Bytes → text' },
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
              hint={mode === 'encode' ? 'Each character becomes its character code.' : 'One number per character, separated by spaces.'}
            >
              <TextArea
                id="tb-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Hello' : '1001000 1100101 1101100 1101100 1101111'}
                rows={6}
                mono={mode === 'decode'}
                autoFocus
                aria-invalid={Boolean(result?.error) || undefined}
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
        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
