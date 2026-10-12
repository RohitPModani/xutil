import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Mode = 'auto' | 'encode' | 'decode';

const base = (c: string) => c.normalize('NFD')[0].toLowerCase();
const VOWELS = 'aeiou';

// y is a vowel unless it starts the word: "my" → "ymay", "yes" → "esyay".
const isVowelAt = (word: string, i: number) => {
  const c = base(word[i]);
  return VOWELS.includes(c) || (c === 'y' && i > 0);
};

// Onsets an English word can start with; the decoder moves back the longest
// trailing cluster that is one of these ("ingstray" → "string", not "ngstri").
const ONSETS = new Set(
  'b c d f g h j k l m n p q r s t v w x y z bl br ch cl cr dr fl fr gh gl gn gr kn ph pl pr ps qu rh sc sh sk sl sm sn sp st sw th tr tw wh wr sch scr shr spl spr squ str thr'.split(' ')
);

// ponytail: Pig Latin is lossy ("orldway" is "world" or "dworl"); a short list
// of common words settles the frequent cases. Upgrade path: a real word list.
const COMMON = new Set(
  (
    'a i of and in is it on at an or if up us out about into over other all our after even also its only end under until each any own off old again against around am are every ever open enough often upon among along across almost always another ask add act egg eat ' +
    'was were will with world what when where which who why would work word want way well went water white write wrong we win wind wine wish wife warm wait walk wall war watch week west wet wide wild wood wear woman women ' +
    'string strong street spring sweet swim small smile snow speak sport start stop stay study school three through throw'
  ).split(' ')
);

const matchCase = (word: string, like: string) => {
  if (like.length > 1 && like === like.toUpperCase() && like !== like.toLowerCase()) return word.toUpperCase();
  return like[0] !== like[0].toLowerCase() ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase();
};

function encodeWord(word: string): string {
  let i = 0;
  while (i < word.length && !isVowelAt(word, i)) i++;
  if (i === 0) return matchCase(word + 'way', word);
  if (i === word.length) return matchCase(word + 'ay', word);
  if (base(word[i]) === 'u' && base(word[i - 1]) === 'q' && i + 1 < word.length) i++;
  return matchCase(word.slice(i) + word.slice(0, i) + 'ay', word);
}

// In a rotated stem the moved onset sits at the end, so a trailing y is a
// consonant ("esy" → "yes") while a leading y is a vowel ("ym" → "my").
const isVowelInStem = (stem: string, i: number) => {
  const c = base(stem[i]);
  return VOWELS.includes(c) || (c === 'y' && i < stem.length - 1);
};

/** Best reading of a rotated stem: `{ word, moved }` where `moved` is the onset length. */
function unrotate(stem: string): { word: string; moved: number } | null {
  let i = stem.length;
  if (stem.toLowerCase().endsWith('qu')) i -= 2;
  while (i > 0 && !isVowelInStem(stem, i - 1)) i--;
  if (i === 0 || i === stem.length) return null;
  const tail = stem.slice(i);
  const candidate = (n: number) => stem.slice(stem.length - n) + stem.slice(0, stem.length - n);
  const max = Math.min(tail.length, 3);
  for (let n = 1; n <= max; n++) if (COMMON.has(candidate(n).toLowerCase())) return { word: candidate(n), moved: n };
  for (let n = max; n >= 1; n--) if (ONSETS.has(tail.slice(-n).toLowerCase())) return { word: candidate(n), moved: n };
  return { word: candidate(1), moved: 1 };
}

function decodeWord(word: string): string {
  const lower = word.toLowerCase();
  if (lower.endsWith('way') && lower.length > 3) {
    // "…way" is either a vowel-initial word plus "way" or a w-initial word
    // rotated. Read it as w-initial only when that gives a common word or a
    // real multi-letter onset ("eetsway" → "sweet"); otherwise drop "way".
    const bare = word.slice(0, -3);
    if (COMMON.has(bare.toLowerCase())) return matchCase(bare, word);
    const asW = unrotate(word.slice(0, -2));
    if (asW && (COMMON.has(asW.word.toLowerCase()) || asW.moved > 1)) return matchCase(asW.word, word);
    return matchCase(bare, word);
  }
  if (!lower.endsWith('ay') || lower.length < 3) return word;
  const stem = word.slice(0, -2);
  const read = unrotate(stem);
  return matchCase(read ? read.word : stem, word);
}

const mapWords = (text: string, fn: (w: string) => string) =>
  text
    .split(/(\s+)/)
    .map((token) => {
      if (!token.trim()) return token;
      const m = token.match(/^(\P{L}*)(\p{L}+)(\P{L}*)$/u);
      return m ? m[1] + fn(m[2]) + m[3] : token;
    })
    .join('');

// An encoded word starts with a vowel and ends in a consonant plus "ay".
const PIG_WORD = /^[aeiouyàâäáãåèéêëìíîïòóôöõùúûüý]\p{L}*[^aeiouy]ay$/iu;
const looksLikePigLatin = (text: string) => {
  const words = text.match(/\p{L}+/gu) ?? [];
  return words.length > 0 && words.filter((w) => PIG_WORD.test(w)).length / words.length >= 0.6;
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
          <Field
            label="Input"
            htmlFor="pig-input"
            hint={dir ? (dir === 'encode' ? 'Translating to Pig Latin.' : 'Translating back to English, best effort: Pig Latin is lossy, so some words come back wrong.') : 'Capitalisation and punctuation are kept.'}
          >
            <TextArea id="pig-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Hello, world" rows={6} autoFocus mono={false} />
          </Field>
          <Output label={dir === 'decode' ? 'English (best effort)' : 'Pig Latin'} value={result?.out ?? ''} rows={6} mono={false} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
