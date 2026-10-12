import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Mode = 'auto' | 'encode' | 'decode';

// ICAO spellings (Alfa, Juliett); the common Alpha and Juliet decode too.
const NATO: Record<string, string> = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel',
  I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa',
  Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey',
  X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six',
  '7': 'Seven', '8': 'Eight', '9': 'Nine', ' ': '(Space)',
};

const WORD_TO_CHAR: Record<string, string> = Object.fromEntries(
  Object.entries(NATO).map(([c, w]) => [w.toLowerCase(), c])
);
Object.assign(WORD_TO_CHAR, { alpha: 'A', juliet: 'J', xray: 'X', space: ' ' });

function encode(text: string): string {
  return [...text.toUpperCase()]
    .map((c) => {
      if (/\s/.test(c)) return NATO[' '];
      if (!(c in NATO)) throw new Error(`Only letters, digits and spaces can be spelled out (found "${c}").`);
      return NATO[c];
    })
    .join(' ');
}

function decode(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const c = WORD_TO_CHAR[w.toLowerCase()];
      if (c === undefined) throw new Error(`"${w}" is not a NATO code word.`);
      return c;
    })
    .join('');
}

const looksLikeNato = (text: string) => {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((w) => w.toLowerCase() in WORD_TO_CHAR);
};

export default function NATOPhonetic() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('auto');

  const result = useMemo(() => {
    const raw = input.trim();
    if (!raw) return null;
    const dir: Exclude<Mode, 'auto'> = mode === 'auto' ? (looksLikeNato(raw) ? 'decode' : 'encode') : mode;
    try {
      return { out: dir === 'encode' ? encode(raw) : decode(raw), dir, error: '' };
    } catch (e) {
      return { out: '', dir, error: getErrorMessage(e, 'Could not convert.') };
    }
  }, [input, mode]);

  const dir = result?.dir;

  return (
    <ToolPage id="nato_phonetic">
      <Panel
        title="Spell"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'encode', label: 'Text → NATO' },
                { value: 'decode', label: 'NATO → Text' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field
            label="Input"
            htmlFor="nato-input"
            hint={dir ? (dir === 'encode' ? 'Spelling out as code words.' : 'Reading code words back to text.') : 'Letters, digits and spaces, or a list of code words.'}
            error={result?.error}
          >
            <TextArea id="nato-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="XUTIL or X-ray Uniform Tango India Lima" rows={6} autoFocus mono={false} />
          </Field>
          <Output label={dir === 'decode' ? 'Text' : 'Code words'} value={result?.out ?? ''} rows={6} mono={false} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
