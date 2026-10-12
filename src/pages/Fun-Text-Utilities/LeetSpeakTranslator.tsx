import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, GenerateButton, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Mode = 'auto' | 'encode' | 'decode';

// Every token appears under exactly one letter and contains a non-letter, so
// decoding is unambiguous and plain words inside leet text survive.
const LEET: Record<string, string[]> = {
  a: ['4', '@', '/\\', '^'],
  b: ['8', '|3', 'ß'],
  c: ['(', '<', '©'],
  d: ['|)', 'o|', '[)', '∂'],
  e: ['3', '€', 'є'],
  f: ['|=', 'ƒ'],
  g: ['6', '9', '&'],
  h: ['#', '|-|', '}{', ']-[', ')-('],
  i: ['1', '!', '|', ']['],
  j: ['_|', '</', '_]'],
  k: ['|<', '|{', '|('],
  l: ['|_', '£'],
  m: ['|\\/|', '/\\/\\', '(v)'],
  n: ['|\\|', '/\\/', '/V', 'И'],
  o: ['0', '()', '[]', 'Ω'],
  p: ['|*', '|o', '|>', '|"'],
  q: ['0_', '(,)'],
  r: ['|2', '|?', 'Я'],
  s: ['5', '$', '§'],
  t: ['7', '+', '-|-', '†'],
  u: ['|_|', '(_)', 'µ'],
  v: ['\\/', '|/', '\\\\//'],
  w: ['\\/\\/', '\\^/', 'Ш'],
  x: ['><', '×'],
  y: ['`/', '¥', '\\|/', 'Ч'],
  z: ['2', '7_', '≥'],
};

// Longest token first so "|_|" wins over "|".
const DECODE: [string, string][] = Object.entries(LEET)
  .flatMap(([letter, tokens]) => tokens.map((t): [string, string] => [t, letter]))
  .sort((a, b) => b[0].length - a[0].length);

// Deterministic per character position and seed, so typing more text does not
// re-roll what is already there; Shuffle bumps the seed.
const pick = (i: number, seed: number, n: number) => {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(seed + 1, 0x85ebca77);
  h = Math.imul(h ^ (h >>> 15), 0xc2b2ae35);
  h ^= h >>> 13;
  return (h >>> 0) % n;
};

function encode(text: string, seed: number): string {
  let out = '';
  let i = 0;
  for (const ch of text) {
    const options = LEET[ch.toLowerCase()];
    out += options ? options[pick(i, seed, options.length)] : ch;
    i++;
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

const isLetter = (c: string | undefined) => c !== undefined && /\p{L}/u.test(c);

// Only tokens touching a letter count, so "Hello, world! 123" is not leet.
function looksLikeLeet(text: string): boolean {
  let hits = 0;
  let i = 0;
  while (i < text.length) {
    const hit = DECODE.find(([t]) => text.startsWith(t, i));
    if (!hit) {
      i++;
      continue;
    }
    if (isLetter(text[i - 1]) || isLetter(text[i + hit[0].length])) hits++;
    i += hit[0].length;
  }
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  return hits > 0 && hits / (hits + letters) >= 0.25;
}

export default function LeetSpeakTranslator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [seed, setSeed] = useState(0);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    const dir: Exclude<Mode, 'auto'> = mode === 'auto' ? (looksLikeLeet(input) ? 'decode' : 'encode') : mode;
    return { out: dir === 'encode' ? encode(input, seed) : decode(input), dir };
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
