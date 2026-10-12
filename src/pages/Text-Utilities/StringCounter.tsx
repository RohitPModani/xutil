import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Panel, Stat, TextArea } from '../../ui';

const fmt = new Intl.NumberFormat();

export default function StringCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean);
    return [
      { label: 'Characters', value: text.length },
      { label: 'Without spaces', value: text.replace(/\s/g, '').length },
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
          />
        </Field>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={fmt.format(s.value)} />
          ))}
        </div>
      </Panel>
    </ToolPage>
  );
}
