import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, GenerateButton, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Mode = 'auto' | 'encode' | 'decode';

const LEET: Record<string, string[]> = {
  a: ['4', '@', '/\\', '^', '∂'],
  b: ['8', '6', '|3', 'ß'],
  c: ['(', '<', '©'],
  d: ['|)', 'o|', '[)', '∂'],
  e: ['3', '€', 'є'],
  f: ['|=', 'ƒ'],
  g: ['6', '9', '&'],
  h: ['#', '|-|', '}{', ']-[', ')-('],
  i: ['1', '!', '|', ']['],
  j: ['_|', '</', '_]'],
  k: ['|<', '|{', '|('],
  l: ['1', '|_', '|', '£'],
  m: ['|\\/|', '/\\/\\', '(v)', 'em'],
  n: ['|\\|', '/\\/', '/V', 'И'],
  o: ['0', '()', '[]', 'Ω'],
  p: ['|*', '|o', '|>', '|"'],
  q: ['9', '0_', '(,)', 'kw'],
  r: ['|2', '|?', 'lz', 'Я'],
  s: ['5', '$', 'z', '§'],
  t: ['7', '+', '-|-', '†'],
  u: ['|_|', '(_)', 'µ'],
  v: ['\\/', '|/', '\\\\//'],
  w: ['\\/\\/', 'vv', '\\^/', 'Ш'],
  x: ['><', '}{', '×'],
  y: ['`/', '¥', '\\|/', 'Ч'],
  z: ['2', '7_', '≥', 'z'],
};

// ponytail: decoding is lossy ("1" is i or l); the first letter that lists a
// token wins, and pure-letter tokens ("vv", "em") are left alone so plain words survive.
const DECODE: [string, string][] = Object.entries(LEET)
  .flatMap(([letter, tokens]) => tokens.filter((t) => /[^a-z]/i.test(t)).map((t): [string, string] => [t, letter]))
  .filter(([t], i, all) => all.findIndex(([u]) => u === t) === i)
  .sort((a, b) => b[0].length - a[0].length);

function encode(text: string): string {
  let out = '';
  for (const ch of text) {
    const options = LEET[ch.toLowerCase()];
    out += options ? options[Math.floor(Math.random() * options.length)] : ch;
  }
  return out;
}

function decode(text: string): string {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const hit = DECODE.find(([t]) => text.startsWith(t, i));
    if (hit) {
      out += hit[1];
      i += hit[0].length;
    } else {
      out += text[i];
      i++;
    }
  }
  return out;
}

const looksLikeLeet = (text: string) => {
  const chars = text.replace(/\s/g, '');
  return chars.length > 0 && (chars.match(/[^a-z]/gi) ?? []).length / chars.length >= 0.25;
};

export default function LeetSpeakTranslator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [seed, setSeed] = useState(0);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    const dir: Exclude<Mode, 'auto'> = mode === 'auto' ? (looksLikeLeet(input) ? 'decode' : 'encode') : mode;
    return { out: dir === 'encode' ? encode(input) : decode(input), dir, seed };
  }, [input, mode, seed]);

  const dir = result?.dir;

  return (
    <ToolPage id="leetspeak">
      <Panel
        title="Translate"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'encode', label: 'Text → Leet' },
                { value: 'decode', label: 'Leet → Text' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="Input" htmlFor="leet-input" hint={dir ? (dir === 'encode' ? 'Substitutions are picked at random. Shuffle for another take.' : 'Reading leet back to plain text. Some symbols are ambiguous.') : 'Plain text or leetspeak.'}>
            <TextArea id="leet-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="elite hacker" rows={6} autoFocus mono={false} />
          </Field>
          <Output
            label={dir === 'decode' ? 'Text' : 'Leetspeak'}
            value={result?.out ?? ''}
            rows={6}
            actions={dir === 'encode' ? <GenerateButton size="sm" variant="ghost" label="Shuffle" onClick={() => setSeed((s) => s + 1)} /> : undefined}
          />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
