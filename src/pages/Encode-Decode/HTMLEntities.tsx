import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Direction = 'encode' | 'decode';

// codec:start
const encodeMap: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&apos;',
  '©': '&copy;',
  '®': '&reg;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
};

const htmlEncode = (text: string) => text.replace(/[&<>"'©®€£¥¢]/g, (ch) => encodeMap[ch]);

// The browser's own parser knows every named entity, decodes exactly one
// level, and never runs anything: a textarea's content is text, not markup.
function htmlDecode(text: string): string {
  const ta = document.createElement('textarea');
  ta.innerHTML = text;
  return ta.value;
}
// codec:end

export default function HTMLEntities() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const deferred = useDeferredValue(input);

  const out = useMemo(
    () => (deferred ? (direction === 'encode' ? htmlEncode(deferred) : htmlDecode(deferred)) : ''),
    [deferred, direction]
  );

  return (
    <ToolPage id="html">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={[
                { value: 'encode', label: 'Escape' },
                { value: 'decode', label: 'Unescape' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field
            label={direction === 'encode' ? 'Text' : 'HTML'}
            htmlFor="html-input"
            hint={direction === 'encode' ? 'Escapes & < > " \' and a few symbols.' : 'Every named, decimal and hex entity is unescaped, one level at a time.'}
          >
            <TextArea
              id="html-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? '<a href="/">Tom & Jerry</a>' : '&lt;a href=&quot;/&quot;&gt;Tom &amp; Jerry&lt;/a&gt;'}
              rows={10}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
          </Field>
          <Output label={direction === 'encode' ? 'HTML' : 'Text'} value={out} rows={10} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
