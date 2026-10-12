import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, Input, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Mode = 'reverse' | 'rotate';

const reverse = (s: string) => [...s].reverse().join('');

function rotate(s: string, n: number): string {
  const chars = [...s];
  const len = chars.length;
  if (!len) return s;
  const k = ((n % len) + len) % len;
  return [...chars.slice(k), ...chars.slice(0, k)].join('');
}

export default function StringReverserRotator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('reverse');
  const [rotateBy, setRotateBy] = useState('3');

  const result = useMemo(() => {
    if (!input) return null;
    if (mode === 'reverse') return { out: reverse(input), error: '' };
    const n = Number(rotateBy);
    if (!Number.isInteger(n) || n < -100 || n > 100) return { out: '', error: 'Rotate by a whole number between -100 and 100.' };
    return { out: rotate(input, n), error: '' };
  }, [input, mode, rotateBy]);

  return (
    <ToolPage id="string_reverser_rotator">
      <Panel
        title={mode === 'reverse' ? 'Reverse' : 'Rotate'}
        actions={
          <>
            <Segmented
              size="sm"
              label="Operation"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'reverse', label: 'Reverse' },
                { value: 'rotate', label: 'Rotate' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <div className="space-y-4">
            <Field label="Text" htmlFor="srr-input">
              <TextArea id="srr-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="hello world" rows={6} autoFocus mono={false} />
            </Field>
            {mode === 'rotate' && (
              <Field label="Rotate by" htmlFor="srr-rotate" hint="Characters moved from the start to the end. Negative rotates the other way.">
                <Input
                  id="srr-rotate"
                  type="number"
                  inputMode="numeric"
                  min={-100}
                  max={100}
                  step={1}
                  value={rotateBy}
                  onChange={(e) => setRotateBy(e.target.value)}
                  className="w-32"
                  aria-invalid={Boolean(result?.error) || undefined}
                />
              </Field>
            )}
          </div>
          <Output label={mode === 'reverse' ? 'Reversed' : 'Rotated'} value={result?.out ?? ''} rows={6} mono={false} />
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
