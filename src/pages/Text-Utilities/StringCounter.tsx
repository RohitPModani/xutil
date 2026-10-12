import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Panel, Stat, TextArea } from '../../ui';

const fmt = new Intl.NumberFormat();

// Intl.Segmenter is not in the ES2020 lib typings; declare the bit used here.
type Segmenter = { segment(text: string): Iterable<unknown> };
const segmenter: Segmenter | null =
  'Segmenter' in Intl
    ? new (Intl as unknown as { Segmenter: new (locale: undefined, o: { granularity: 'grapheme' }) => Segmenter }).Segmenter(undefined, {
        granularity: 'grapheme',
      })
    : null;

/** User-perceived characters (graphemes) where the browser can segment them, otherwise code points. */
function countChars(text: string) {
  if (!segmenter) return [...text].length;
  let n = 0;
  for (const _ of segmenter.segment(text)) n++;
  return n;
}

const CHAR_LABEL = segmenter ? 'Characters (graphemes)' : 'Characters (code points)';

export default function StringCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean);
    return [
      { label: CHAR_LABEL, value: countChars(text) },
      { label: 'Without spaces', value: countChars(text.replace(/\s/g, '')) },
      { label: 'UTF-16 units', value: text.length },
      { label: 'Bytes (UTF-8)', value: new TextEncoder().encode(text).length },
      { label: 'Words', value: words.length },
      { label: 'Unique words', value: new Set(words).size },
      { label: 'Lines', value: text ? text.split('\n').length : 0 },
      { label: 'Sentences', value: text.split(/[.!?]+(?=\s|$)/).filter((s) => s.trim()).length },
    ];
  }, [text]);

  return (
    <ToolPage id="string_counter">
      <Panel title="Count" actions={<ClearButton onClick={() => setText('')} disabled={!text} />}>
        <Field label="Text" htmlFor="count-input">
          <TextArea
            id="count-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type anything. Counts update as you go."
            rows={8}
            mono={false}
            autoFocus
            autoSize={text.length < 200_000}
          />
        </Field>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={fmt.format(s.value)} />
          ))}
        </div>
        <span className="sr-only" aria-live="polite">
          {text ? `${fmt.format(stats[4].value)} words, ${fmt.format(stats[0].value)} characters` : ''}
        </span>
      </Panel>
    </ToolPage>
  );
}
