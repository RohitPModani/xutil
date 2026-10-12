import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, Input, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';

type Cipher = 'rot13' | 'caesar';
const MIN_SHIFT = -100;
const MAX_SHIFT = 100;

function caesar(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[A-Za-z]/g, (ch) => {
    const code = ch.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + s) % 26) + base);
  });
}

export default function CipherEncoderDecoder() {
  const [input, setInput] = useState('');
  const [cipher, setCipher] = useState<Cipher>('rot13');
  const [shift, setShift] = useState('3');

  const shiftN = Number(shift);
  const shiftError =
    cipher === 'caesar' && (shift.trim() === '' || !Number.isInteger(shiftN) || shiftN < MIN_SHIFT || shiftN > MAX_SHIFT)
      ? `Shift must be a whole number between ${MIN_SHIFT} and ${MAX_SHIFT}.`
      : '';

  const out = useMemo(() => {
    if (!input || shiftError) return '';
    return caesar(input, cipher === 'rot13' ? 13 : shiftN);
  }, [input, cipher, shiftN, shiftError]);

  return (
    <ToolPage id="cipher">
      <Panel
        title="Shift"
        actions={
          <>
            <Segmented
              size="sm"
              label="Cipher"
              value={cipher}
              onChange={setCipher}
              options={[
                { value: 'rot13', label: 'ROT13' },
                { value: 'caesar', label: 'Caesar' },
              ]}
            />
            <ClearButton onClick={() => setInput('')} disabled={!input} />
          </>
        }
      >
        {cipher === 'caesar' && (
          <Field label="Shift" htmlFor="cipher-shift" hint="Negative values shift backwards" className="mb-4 max-w-[12rem]">
            <Input
              id="cipher-shift"
              type="number"
              min={MIN_SHIFT}
              max={MAX_SHIFT}
              step={1}
              inputMode="numeric"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              aria-invalid={Boolean(shiftError) || undefined}
            />
          </Field>
        )}
        <TwoPane>
          <Field label="Text" htmlFor="cipher-input" hint="Only letters move; digits and punctuation stay where they are.">
            <TextArea
              id="cipher-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Attack at dawn"
              rows={10}
              stats
              autoFocus
            />
          </Field>
          <Output label={cipher === 'rot13' ? 'ROT13' : `Shifted by ${shiftError ? '…' : shiftN}`} value={out} rows={10} />
        </TwoPane>
        {shiftError && (
          <Callout tone="error" className="mt-4">
            {shiftError}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
