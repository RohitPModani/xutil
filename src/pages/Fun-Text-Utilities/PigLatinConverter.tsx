import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Mode = 'auto' | 'encode' | 'decode';

const isVowel = (c: string) => 'aeiou'.includes(c.toLowerCase());

const matchCase = (word: string, like: string) =>
  like[0] === like[0].toUpperCase() && like[0] !== like[0].toLowerCase()
    ? word[0].toUpperCase() + word.slice(1).toLowerCase()
    : word.toLowerCase();

function encodeWord(word: string): string {
  let i = 0;
  while (i < word.length && !isVowel(word[i])) i++;
  if (i === 0) return word + 'way';
  if (i === word.length) return word + 'ay';
  return matchCase(word.slice(i) + word.slice(0, i), word) + 'ay';
}

// ponytail: Pig Latin is lossy ("water" and "atwer" both give "aterway"); this
// strips "way" after a vowel, otherwise moves the trailing consonants back.
function decodeWord(word: string): string {
  const lower = word.toLowerCase();
  if (lower.endsWith('way') && lower.length > 3 && isVowel(lower[lower.length - 4])) return word.slice(0, -3);
  if (!lower.endsWith('ay') || lower.length < 3) return word;
  const stem = word.slice(0, -2);
  let i = stem.length;
  while (i > 0 && !isVowel(stem[i - 1])) i--;
  if (i === stem.length || i === 0) return matchCase(stem, word);
  return matchCase(stem.slice(i) + stem.slice(0, i), word);
}

const mapWords = (text: string, fn: (w: string) => string) =>
  text
    .split(/(\s+)/)
    .map((token) => {
      if (!token.trim()) return token;
      const m = token.match(/^(\W*)([A-Za-z]+)(\W*)$/);
      return m ? m[1] + fn(m[2]) + m[3] : token;
    })
    .join('');

const looksLikePigLatin = (text: string) => {
  const words = text.match(/[A-Za-z]+/g) ?? [];
  return words.length > 0 && words.filter((w) => /ay$/i.test(w)).length / words.length >= 0.6;
};

export default function PigLatinConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('auto');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    const dir: Exclude<Mode, 'auto'> = mode === 'auto' ? (looksLikePigLatin(input) ? 'decode' : 'encode') : mode;
    return { out: mapWords(input, dir === 'encode' ? encodeWord : decodeWord), dir };
  }, [input, mode]);

  const dir = result?.dir;

  return (
    <ToolPage id="pig_latin">
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
                { value: 'encode', label: 'English → Pig Latin' },
                { value: 'decode', label: 'Pig Latin → English' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="Input" htmlFor="pig-input" hint={dir ? (dir === 'encode' ? 'Translating to Pig Latin.' : 'Translating back to English. Some words are ambiguous.') : 'Capitalisation and punctuation are kept.'}>
            <TextArea id="pig-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Hello, world" rows={6} autoFocus mono={false} />
          </Field>
          <Output label={dir === 'decode' ? 'English' : 'Pig Latin'} value={result?.out ?? ''} rows={6} mono={false} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
