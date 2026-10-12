import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Input, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Mode = 'reverse' | 'rotate';

// Grapheme clusters keep flags, skin tones and combining accents together.
// Intl.Segmenter is ES2022; the tsconfig lib is ES2020, hence the local type.
type Segmenter = { segment(s: string): Iterable<{ segment: string }> };
const SegmenterCtor = (Intl as { Segmenter?: new (locale?: string, o?: { granularity: 'grapheme' }) => Segmenter }).Segmenter;
const segmenter = SegmenterCtor ? new SegmenterCtor(undefined, { granularity: 'grapheme' }) : null;
const graphemes = (s: string): string[] => (segmenter ? [...segmenter.segment(s)].map((g) => g.segment) : [...s]);

const reverse = (s: string) => graphemes(s).reverse().join('');

function rotate(s: string, n: number): string {
  const chars = graphemes(s);
  const len = chars.length;
  if (!len) return s;
  const k = ((n % len) + len) % len;
  return [...chars.slice(k), ...chars.slice(0, k)].join('');
}

export default function StringReverserRotator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('reverse');
  const [rotateBy, setRotateBy] = useState('3');

  const rotateError = mode === 'rotate' && (!rotateBy.trim() || !Number.isInteger(Number(rotateBy))) ? 'Enter a whole number.' : '';

  const output = useMemo(() => {
    if (!input) return '';
    if (mode === 'reverse') return reverse(input);
    return rotateError ? '' : rotate(input, Number(rotateBy));
  }, [input, mode, rotateBy, rotateError]);

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
              <Field label="Rotate by" htmlFor="srr-rotate" hint="Characters moved from the start to the end. Negative rotates the other way." error={rotateError}>
                <Input id="srr-rotate" type="number" inputMode="numeric" step={1} value={rotateBy} onChange={(e) => setRotateBy(e.target.value)} className="w-32" />
              </Field>
            )}
          </div>
          <Output label={mode === 'reverse' ? 'Reversed' : 'Rotated'} value={output} rows={6} mono={false} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
