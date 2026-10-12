import { useCallback, useEffect, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Checkbox, Field, GenerateButton, Input, Output, Panel, Segmented, Toolbar } from '../../ui';

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ' +
  'ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure ' +
  'dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non ' +
  'proident sunt in culpa qui officia deserunt mollit anim id est laborum'
).split(' ');

const OPENER = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];

type Unit = 'paragraphs' | 'sentences' | 'words';

const MAX: Record<Unit, number> = { paragraphs: 50, sentences: 100, words: 1000 };

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomWords = (n: number) => Array.from({ length: n }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One sentence of 5–15 words; optionally the classic opener first. */
function sentence(opener: boolean) {
  const n = rand(5, 15);
  const words = opener ? [...OPENER, ...randomWords(n - OPENER.length)] : randomWords(n);
  return capitalise(words.join(' ')) + '.';
}

function paragraph(opener: boolean) {
  return Array.from({ length: rand(3, 8) }, (_, i) => sentence(opener && i === 0)).join(' ');
}

function generate(unit: Unit, count: number, opener: boolean, html: boolean): string {
  if (unit === 'words') {
    const words = opener ? [...OPENER.slice(0, count), ...randomWords(Math.max(0, count - OPENER.length))] : randomWords(count);
    return words.join(' ');
  }
  if (unit === 'sentences') {
    return Array.from({ length: count }, (_, i) => sentence(opener && i === 0)).join(' ');
  }
  const paragraphs = Array.from({ length: count }, (_, i) => paragraph(opener && i === 0));
  return html ? paragraphs.map((p) => `<p>${p}</p>`).join('\n\n') : paragraphs.join('\n\n');
}

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [count, setCount] = useState('3');
  const [opener, setOpener] = useState(true);
  const [html, setHtml] = useState(false);
  const [text, setText] = useState('');

  const n = Math.min(MAX[unit], Math.max(1, Number(count) || 1));

  const regenerate = useCallback(() => setText(generate(unit, n, opener, html)), [unit, n, opener, html]);

  // Text on load and whenever an option changes; "New" reshuffles.
  useEffect(regenerate, [regenerate]);

  return (
    <ToolPage id="lorem">
      <Panel
        title="Generate"
        actions={
          <Segmented
            size="sm"
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: 'paragraphs', label: 'Paragraphs' },
              { value: 'sentences', label: 'Sentences' },
              { value: 'words', label: 'Words' },
            ]}
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <div className="space-y-4">
            <Field label="How many" htmlFor="lorem-count" hint={`1 to ${MAX[unit]}`}>
              <Input
                id="lorem-count"
                type="number"
                min={1}
                max={MAX[unit]}
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                onBlur={() => setCount(String(n))}
                autoFocus
              />
            </Field>
            <Checkbox label="Start with “Lorem ipsum”" checked={opener} onChange={(e) => setOpener(e.target.checked)} />
            {unit === 'paragraphs' && (
              <Checkbox label="Wrap paragraphs in <p>" checked={html} onChange={(e) => setHtml(e.target.checked)} />
            )}
            <Toolbar>
              <GenerateButton label="New" onClick={regenerate} />
            </Toolbar>
          </div>
          <Output label={`${n} ${unit}`} value={text} rows={12} mono={false} fileName={html ? 'lorem.html' : 'lorem.txt'} />
        </div>
      </Panel>
    </ToolPage>
  );
}
