import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Base = 'base64' | 'base32' | 'base58';
type Direction = 'encode' | 'decode';

const utf8 = (text: string) => new TextEncoder().encode(text);
const fromUtf8 = (bytes: Uint8Array) => new TextDecoder('utf-8', { fatal: true }).decode(bytes);

function base64Encode(text: string): string {
  let bin = '';
  for (const b of utf8(text)) bin += String.fromCharCode(b);
  return btoa(bin);
}
function base64Decode(s: string): string {
  try {
    return fromUtf8(Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0)));
  } catch {
    throw new Error('Not valid Base64.');
  }
}

// RFC 4648
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(text: string): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of utf8(text)) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += B32[(value >>> bits) & 31];
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  while (out.length % 8 !== 0) out += '=';
  return out;
}
function base32Decode(s: string): string {
  const clean = s.trim().toUpperCase().replace(/=+$/, '');
  if (!/^[A-Z2-7]*$/.test(clean)) throw new Error('Not valid Base32: only A–Z and 2–7 are allowed.');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }
  try {
    return fromUtf8(new Uint8Array(bytes));
  } catch {
    throw new Error('Decoded bytes are not valid UTF-8 text.');
  }
}

// Bitcoin alphabet
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(text: string): string {
  const bytes = utf8(text);
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let out = '';
  while (num > 0n) {
    out = B58[Number(num % 58n)] + out;
    num /= 58n;
  }
  for (const b of bytes) {
    if (b !== 0) break;
    out = '1' + out;
  }
  return out;
}
function base58Decode(s: string): string {
  const clean = s.trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]*$/.test(clean)) throw new Error('Not valid Base58: 0, O, I and l are not in the alphabet.');
  let num = 0n;
  for (const ch of clean) num = num * 58n + BigInt(B58.indexOf(ch));
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  for (const ch of clean) {
    if (ch !== '1') break;
    bytes.unshift(0);
  }
  try {
    return fromUtf8(new Uint8Array(bytes));
  } catch {
    throw new Error('Decoded bytes are not valid UTF-8 text.');
  }
}

const codecs: Record<Base, { label: string; encode: (s: string) => string; decode: (s: string) => string }> = {
  base64: { label: 'Base64', encode: base64Encode, decode: base64Decode },
  base32: { label: 'Base32', encode: base32Encode, decode: base32Decode },
  base58: { label: 'Base58', encode: base58Encode, decode: base58Decode },
};

export default function BaseEncoderDecoder() {
  const [input, setInput] = useState('');
  const [base, setBase] = useState<Base>('base64');
  const [direction, setDirection] = useState<Direction>('encode');

  const result = useMemo(() => {
    if (!input) return null;
    try {
      return { out: codecs[base][direction](input), error: '' };
    } catch (e) {
      return { out: '', error: getErrorMessage(e, 'Could not convert the input.') };
    }
  }, [input, base, direction]);

  const label = codecs[base].label;

  return (
    <ToolPage id="base">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Encoding"
              value={base}
              onChange={setBase}
              options={(Object.keys(codecs) as Base[]).map((b) => ({ value: b, label: codecs[b].label }))}
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
          <Field label={direction === 'encode' ? 'Text' : label} htmlFor="base-input">
            <TextArea
              id="base-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? 'Hello, world' : 'SGVsbG8sIHdvcmxk'}
              rows={10}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
            />
          </Field>
          <Output label={direction === 'encode' ? label : 'Text'} value={result?.out ?? ''} rows={10} />
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
