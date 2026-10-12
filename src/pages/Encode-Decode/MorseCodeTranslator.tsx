import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Direction = 'encode' | 'decode';

// codec:start
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
    .normalize('NFD') // é → e + combining accent, then drop the accent
    .replace(/[̀-ͯ]/g, '')
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
  const clean = morse
    .replace(/[_−–—]/g, '-')
    .replace(/[•·]/g, '.')
    .replace(/\|/g, '/')
    // A word gap is "/" or three or more spaces; one space separates letters.
    .replace(/\s*\/+\s*|\s{3,}/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
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
// codec:end

// 600 Hz sidetone. Dot = 1 unit, dash = 3, gap inside a letter 1, between
// letters 3, between words 7.
function play(ctx: AudioContext, morse: string, onEnd: () => void) {
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
    } else if (ch === ' ' || ch === '/') t += unit * 2;
  }
  osc.onended = onEnd;
  osc.start();
  osc.stop(t);
}

export default function MorseCodeTranslator() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred.trim()) return null;
    try {
      return { out: direction === 'encode' ? textToMorse(deferred) : morseToText(deferred), error: '' };
    } catch (e) {
      return { out: '', error: getErrorMessage(e, 'Could not translate the input.') };
    }
  }, [deferred, direction]);

  const out = result?.out ?? '';
  const morse = direction === 'encode' ? out : deferred;

  const stop = useCallback(() => {
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setPlaying(false);
  }, []);
  useEffect(() => stop, [stop]);

  const start = () => {
    stop();
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    play(ctx, morse, () => {
      if (ctxRef.current === ctx) stop();
    });
    // Autoplay policy can hand us a suspended context; this click is the gesture.
    void ctx.resume();
    setPlaying(true);
  };

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
            hint={
              direction === 'encode'
                ? 'Letters, digits and common punctuation. Accents are dropped; anything else is skipped.'
                : 'One space between letters, / or three spaces between words.'
            }
            error={result?.error}
          >
            <TextArea
              id="morse-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? 'Hello world' : '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'}
              rows={10}
              stats
              autoFocus
              autoSize={input.length < 200_000}
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
                disabled={!out}
                onClick={playing ? stop : start}
                icon={playing ? <Square className="h-3.5 w-3.5" aria-hidden="true" /> : <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                {playing ? 'Stop' : 'Play'}
              </Button>
            }
          />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
