import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, KeyValueList, Output, Panel, TextArea, TwoPane } from '../../ui';

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

/** Words of `text`: split on whitespace, `_ - . /` and camelCase/PascalCase boundaries ("XMLParser" → XML, Parser). */
function splitWords(text: string) {
  return text
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[\s_\-./]+/)
    .filter(Boolean);
}

const titleCase = (text: string) => text.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, p: string, c: string) => p + c.toUpperCase());

/** Capital after the start of the text, a line break, or sentence-ending punctuation. */
const sentenceCase = (text: string) =>
  text.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_, p: string, c: string) => p + c.toUpperCase());

/** Every variant of `text`. */
function cases(text: string) {
  const words = splitWords(text);
  const lower = words.map((w) => w.toLowerCase());
  const pascal = words.map(cap).join('');
  return [
    { label: 'camelCase', value: pascal.charAt(0).toLowerCase() + pascal.slice(1) },
    { label: 'PascalCase', value: pascal },
    { label: 'snake_case', value: lower.join('_') },
    { label: 'kebab-case', value: lower.join('-') },
    { label: 'CONSTANT_CASE', value: lower.join('_').toUpperCase() },
    { label: 'dot.case', value: lower.join('.') },
    { label: 'path/case', value: lower.join('/') },
    { label: 'Header-Case', value: words.map(cap).join('-') },
    { label: 'Title Case', value: titleCase(text) },
    { label: 'Sentence case', value: sentenceCase(text) },
    { label: 'lowercase', value: text.toLowerCase() },
    { label: 'UPPERCASE', value: text.toUpperCase() },
    { label: 'mOcKiNg cAsE', value: [...text].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join('') },
  ];
}

export default function TextCaseConverter() {
  const [text, setText] = useState('');
  const items = useMemo(() => (text.trim() ? cases(text) : []), [text]);

  return (
    <ToolPage id="text_case">
      <Panel title="Convert" actions={<ClearButton onClick={() => setText('')} disabled={!text} />}>
        <TwoPane>
          <Field label="Text" htmlFor="case-input">
            <TextArea
              id="case-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="hello world from xutil"
              rows={6}
              mono={false}
              autoFocus
            />
          </Field>
          <Output label="Cases" copyText={items.map((i) => `${i.label}: ${i.value}`).join('\n')} placeholder="Every case appears here">
            {items.length > 0 && <KeyValueList items={items} />}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
