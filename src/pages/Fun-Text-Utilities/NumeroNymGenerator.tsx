import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Select, TextArea, TwoPane } from '../../ui';

function numeronym(word: string): string {
  const upper = word === word.toUpperCase();
  const first = upper ? word[0] : word[0].toLowerCase();
  const last = upper ? word[word.length - 1] : word[word.length - 1].toLowerCase();
  return `${first}${word.length - 2}${last}`;
}

function generate(text: string, minLength: number): string {
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (!token.trim()) return token;
      const m = token.match(/^(\W*)(\w+)(\W*)$/);
      if (!m || m[2].length < minLength) return token;
      return m[1] + numeronym(m[2]) + m[3];
    })
    .join('');
}

export default function NumeroNymGenerator() {
  const [input, setInput] = useState('');
  const [minLength, setMinLength] = useState('4');

  const output = useMemo(() => (input.trim() ? generate(input, Number(minLength)) : ''), [input, minLength]);

  return (
    <ToolPage id="numeronym">
      <Panel title="Abbreviate" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <div className="space-y-4">
            <Field label="Text" htmlFor="num-input" hint="Each word becomes first letter, middle count, last letter.">
              <TextArea id="num-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="internationalization and accessibility" rows={6} autoFocus mono={false} />
            </Field>
            <Field label="Shorten words of at least" htmlFor="num-min">
              <Select id="num-min" value={minLength} onChange={(e) => setMinLength(e.target.value)} className="w-40">
                <option value="3">3 letters</option>
                <option value="4">4 letters</option>
                <option value="5">5 letters</option>
                <option value="6">6 letters</option>
              </Select>
            </Field>
          </div>
          <Output label="Numeronyms" value={output} placeholder="i18n and a11y" rows={6} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
