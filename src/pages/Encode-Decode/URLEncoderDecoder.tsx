import { useDeferredValue, useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, IconButton, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Direction = 'encode' | 'decode';
type Mode = 'component' | 'uri' | 'form';

const MODES: Record<Mode, { label: string; hint: string; encode: (s: string) => string; decode: (s: string) => string }> = {
  component: {
    label: 'Component',
    hint: "Encodes everything except A–Z a–z 0–9 - _ . ! ~ * ' ( )",
    encode: encodeURIComponent,
    decode: decodeURIComponent,
  },
  uri: {
    label: 'Full URL',
    hint: 'Keeps : / ? # & = and the other separators so a whole URL stays navigable.',
    encode: encodeURI,
    decode: decodeURI,
  },
  form: {
    label: 'Form',
    hint: 'application/x-www-form-urlencoded, as an HTML form submits: a space becomes +.',
    encode: (s) => new URLSearchParams([['', s]]).toString().slice(1),
    decode: (s) => decodeURIComponent(s.replace(/\+/g, ' ')),
  },
};

export default function URLEncoderDecoder() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const [mode, setMode] = useState<Mode>('component');
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred) return null;
    try {
      return { out: MODES[mode][direction](deferred), error: '' };
    } catch {
      return {
        out: '',
        error:
          direction === 'encode'
            ? 'Text contains a lone surrogate, which has no UTF-8 encoding.'
            : 'Not valid percent-encoding: every % must be followed by two hex digits, and the bytes must be UTF-8.',
      };
    }
  }, [deferred, mode, direction]);

  const out = result?.out ?? '';

  return (
    <ToolPage id="eurl">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Mode"
              value={mode}
              onChange={setMode}
              options={(Object.keys(MODES) as Mode[]).map((m) => ({ value: m, label: MODES[m].label }))}
            />
            <Segmented
              size="sm"
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={[
                { value: 'encode', label: 'Encode' },
                { value: 'decode', label: 'Decode' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field
            label={direction === 'encode' ? 'Text' : 'Encoded'}
            htmlFor="url-input"
            hint={direction === 'encode' ? MODES[mode].hint : undefined}
            error={result?.error}
          >
            <TextArea
              id="url-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? 'q=hello world&lang=en' : 'q%3Dhello%20world%26lang%3Den'}
              rows={10}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
          </Field>
          <Output
            label={direction === 'encode' ? 'Encoded' : 'Text'}
            value={out}
            rows={10}
            actions={
              <IconButton
                label="Use result as input"
                size="sm"
                disabled={!out}
                onClick={() => {
                  setInput(out);
                  setDirection(direction === 'encode' ? 'decode' : 'encode');
                }}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
              </IconButton>
            }
          />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
