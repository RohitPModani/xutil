import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Segmented, Select, TextArea } from '../../ui';

type Case = 'lower' | 'upper' | 'preserve';

const SEPARATORS = [
  { value: '-', label: 'Hyphen (-)' },
  { value: '_', label: 'Underscore (_)' },
  { value: '.', label: 'Dot (.)' },
  { value: '', label: 'None' },
];

/** Latin letters that Unicode decomposition does not reduce to ASCII. */
const TRANSLIT: Record<string, string> = {
  ß: 'ss', ẞ: 'SS', ø: 'o', Ø: 'O', æ: 'ae', Æ: 'AE', œ: 'oe', Œ: 'OE',
  ł: 'l', Ł: 'L', đ: 'd', Đ: 'D', ð: 'd', Ð: 'D', þ: 'th', Þ: 'Th',
};

function slugify(text: string, separator: string, kase: Case): string {
  const parts = text
    .replace(/[ßẞøØæÆœŒłŁđĐðÐþÞ]/g, (c) => TRANSLIT[c])
    .normalize('NFKD')
    .replace(/[^\w\s~-]/g, '')
    .split(/[\s_-]+/)
    .filter(Boolean);
  const slug = parts.join(separator);
  return kase === 'upper' ? slug.toUpperCase() : kase === 'lower' ? slug.toLowerCase() : slug;
}

export default function SlugGenerator() {
  const [text, setText] = useState('');
  const [separator, setSeparator] = useState('-');
  const [kase, setKase] = useState<Case>('lower');

  const slug = useMemo(() => slugify(text, separator, kase), [text, separator, kase]);
  const error =
    text.trim() !== '' && slug === ''
      ? /\p{L}/u.test(text)
        ? 'Slugs keep only Latin letters and digits; this text has none, so nothing is left. Other scripts are not transliterated.'
        : 'Nothing is left after removing punctuation. Use letters or digits.'
      : undefined;

  return (
    <ToolPage id="slug">
      <Panel title="Slug" actions={<ClearButton onClick={() => setText('')} disabled={!text} />}>
        <Field label="Text" htmlFor="slug-input" hint="Accents are stripped; punctuation is dropped." error={error}>
          <TextArea
            id="slug-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hello World, this is a test"
            rows={3}
            mono={false}
            maxLength={1000}
            autoFocus
          />
        </Field>

        <div className="mt-4 grid gap-4 sm:grid-cols-[12rem_auto]">
          <Field label="Separator" htmlFor="slug-separator">
            <Select id="slug-separator" value={separator} onChange={(e) => setSeparator(e.target.value)}>
              {SEPARATORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Case">
            <Segmented
              label="Case"
              value={kase}
              onChange={setKase}
              options={[
                { value: 'lower', label: 'lowercase' },
                { value: 'upper', label: 'UPPERCASE' },
                { value: 'preserve', label: 'Keep' },
              ]}
            />
          </Field>
        </div>

        <Output className="mt-4" label="Slug" value={slug} rows={2} />
      </Panel>
    </ToolPage>
  );
}
