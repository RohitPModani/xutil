import { useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Direction = 'encode' | 'decode';

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.',
  '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', _: '..--.-', '"': '.-..-.', $: '...-..-', '@': '.--.-.',
};
const TEXT: Record<string, string> = Object.fromEntries(Object.entries(MORSE).map(([ch, code]) => [code, ch]));

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split(/\s+/)
    .map((word) =>
      Array.from(word, (ch) => MORSE[ch] ?? '')
        .filter(Boolean)
        .join(' ')
    )
    .filter(Boolean)
    .join(' / ');
}

function morseToText(morse: string): string {
  const clean = morse.replace(/\/+/g, '/').replace(/\s+/g, ' ').trim();
  if (!/^[.\-/ ]+$/.test(clean)) throw new Error('Morse code uses only dots, dashes, spaces and / between words.');
  return clean
    .split('/')
    .map((word) =>
      word
        .split(' ')
        .filter(Boolean)
        .map((code) => {
          const ch = TEXT[code];
          if (!ch) throw new Error(`"${code}" is not a Morse sequence.`);
          return ch;
        })
        .join('')
    )
    .join(' ')
    .trim();
}

// 600 Hz sidetone. Dot = 1 unit, dash = 3, gap inside a letter 1, between
// letters 3, between words 7.
function play(morse: string, onEnd: () => void) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 600;
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const unit = 0.08;
  let t = ctx.currentTime + 0.05;
  for (const ch of morse) {
    if (ch === '.' || ch === '-') {
      gain.gain.setValueAtTime(1, t);
      t += ch === '.' ? unit : unit * 3;
      gain.gain.setValueAtTime(0, t);
      t += unit;
    } else if (ch === ' ') t += unit * 2;
    else if (ch === '/') t += unit * 2;
  }
  osc.onended = () => {
    void ctx.close();
    onEnd();
  };
  osc.start();
  osc.stop(t);
}

export default function MorseCodeTranslator() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const [playing, setPlaying] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { out: direction === 'encode' ? textToMorse(input) : morseToText(input), error: '' };
    } catch (e) {
      return { out: '', error: getErrorMessage(e, 'Could not translate the input.') };
    }
  }, [input, direction]);

  const out = result?.out ?? '';
  const morse = direction === 'encode' ? out : input;

  return (
    <ToolPage id="morse">
      <Panel
        title="Translate"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={[
                { value: 'encode', label: 'Text → Morse' },
                { value: 'decode', label: 'Morse → Text' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field
            label={direction === 'encode' ? 'Text' : 'Morse'}
            htmlFor="morse-input"
            hint={direction === 'encode' ? 'Letters, digits and common punctuation. Anything else is skipped.' : 'Space between letters, / between words.'}
          >
            <TextArea
              id="morse-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? 'Hello world' : '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'}
              rows={10}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
            />
          </Field>
          <Output
            label={direction === 'encode' ? 'Morse' : 'Text'}
            value={out}
            rows={10}
            actions={
              <Button
                size="sm"
                variant="ghost"
                disabled={!out || playing}
                onClick={() => {
                  setPlaying(true);
                  play(morse, () => setPlaying(false));
                }}
                icon={<Volume2 className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                {playing ? 'Playing' : 'Play'}
              </Button>
            }
          />
        </TwoPane>
        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
