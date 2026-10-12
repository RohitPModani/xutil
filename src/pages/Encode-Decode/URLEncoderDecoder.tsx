import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, IconButton, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Direction = 'encode' | 'decode';

export default function URLEncoderDecoder() {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');

  const result = useMemo(() => {
    if (!input) return null;
    try {
      return { out: direction === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input), error: '' };
    } catch {
      return { out: '', error: 'Not valid percent-encoding: every % must be followed by two hex digits.' };
    }
  }, [input, direction]);

  const out = result?.out ?? '';

  return (
    <ToolPage id="eurl">
      <Panel
        title="Convert"
        actions={
          <>
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
            hint={direction === 'encode' ? 'Encodes everything except A–Z a–z 0–9 - _ . ! ~ * \' ( )' : undefined}
          >
            <TextArea
              id="url-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? 'q=hello world&lang=en' : 'q%3Dhello%20world%26lang%3Den'}
              rows={10}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
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
        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
