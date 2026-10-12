import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Direction = 'encode' | 'decode';

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

const decodeMap: Record<string, string> = {
  ...Object.fromEntries(Object.entries(encodeMap).map(([ch, ent]) => [ent, ch])),
  '&amp;lt;': '<',
  '&amp;gt;': '>',
  '&amp;amp;': '&',
  '&amp;quot;': '"',
  '&amp;apos;': "'",
};

const htmlEncode = (text: string) => text.replace(/[&<>"'©®€£¥¢]/g, (ch) => encodeMap[ch]);

const htmlDecode = (text: string) =>
  text.replace(/&(?:amp;)?(?:[a-z]+|#\d+|#x[\da-f]+);/gi, (match) => {
    const named = decodeMap[match.toLowerCase()];
    if (named) return named;
    const num = match.match(/&#(x[\da-f]+|\d+);/i);
    if (!num) return match;
    const code = num[1].startsWith('x') ? parseInt(num[1].slice(1), 16) : parseInt(num[1], 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });

export default function HTMLEntities() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');

  const out = useMemo(() => (input ? (direction === 'encode' ? htmlEncode(input) : htmlDecode(input)) : ''), [input, direction]);

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
            hint={direction === 'encode' ? 'Escapes & < > " \' and a few symbols.' : 'Named, decimal and hex entities are unescaped.'}
          >
            <TextArea
              id="html-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? '<a href="/">Tom & Jerry</a>' : '&lt;a href=&quot;/&quot;&gt;Tom &amp; Jerry&lt;/a&gt;'}
              rows={10}
              stats
              autoFocus
            />
          </Field>
          <Output label={direction === 'encode' ? 'HTML' : 'Text'} value={out} rows={10} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
