import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

type Base = 'base64' | 'base32' | 'base58';
type Direction = 'encode' | 'decode';

// codecs:start
const utf8 = (text: string) => new TextEncoder().encode(text);
function fromUtf8(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Decoded bytes are not valid UTF-8 text.');
  }
}

function base64Encode(text: string): string {
  let bin = '';
  for (const b of utf8(text)) bin += String.fromCharCode(b);
  return btoa(bin);
}
function base64Decode(s: string): string {
  // Accept the URL-safe alphabet, embedded whitespace and missing padding.
  let clean = s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  if (clean.length % 4 === 1) throw new Error('Not valid Base64: the length is wrong.');
  clean += '='.repeat((4 - (clean.length % 4)) % 4);
  let bin: string;
  try {
    bin = atob(clean);
  } catch {
    throw new Error('Not valid Base64: only A–Z, a–z, 0–9, + / (or - _) and = padding are allowed.');
  }
  return fromUtf8(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
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
  const clean = s.replace(/\s+/g, '').toUpperCase().replace(/=+$/, '');
  if (!/^[A-Z2-7]*$/.test(clean)) throw new Error('Not valid Base32: only A–Z and 2–7 are allowed.');
  // 8 characters carry 5 bytes; a remainder of 1, 3 or 6 cannot complete a byte.
  if ([1, 3, 6].includes(clean.length % 8)) throw new Error('Not valid Base32: the length is wrong.');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    value = ((value << 5) | B32.indexOf(ch)) & 0x1fff;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }
  return fromUtf8(new Uint8Array(bytes));
}

// Bitcoin alphabet. BigInt does the big arithmetic natively; pulling nine
// base-58 digits per division (58^9 < 2^53, so the chunk is a plain number)
// keeps the step count low. Byte-array long division in JS measured 20x slower.
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const B58_CHUNK = 58 ** 9;
const B58_CHUNK_N = BigInt(B58_CHUNK);
function base58Encode(text: string): string {
  const bytes = utf8(text);
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  let num = bytes.length ? BigInt('0x' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')) : 0n;
  let out = '';
  while (num > 0n) {
    let chunk = Number(num % B58_CHUNK_N);
    num /= B58_CHUNK_N;
    let part = '';
    for (let i = 0; i < 9; i++) {
      part = B58[chunk % 58] + part;
      chunk = Math.floor(chunk / 58);
    }
    out = part + out;
  }
  // The top chunk is zero-padded with '1'; only the leading-zero bytes keep theirs.
  return '1'.repeat(zeros) + out.replace(/^1+/, '');
}
function base58Decode(s: string): string {
  const clean = s.replace(/\s+/g, '');
  if (!/^[1-9A-HJ-NP-Za-km-z]*$/.test(clean)) throw new Error('Not valid Base58: 0, O, I and l are not in the alphabet.');
  let ones = 0;
  while (ones < clean.length && clean[ones] === '1') ones++;
  let num = 0n;
  const head = clean.length % 9 || 9;
  for (let i = 0; i < clean.length; ) {
    const n = i === 0 ? head : 9;
    let chunk = 0;
    for (let e = 0; e < n; e++) chunk = chunk * 58 + B58.indexOf(clean[i++]);
    num = num * BigInt(58 ** n) + BigInt(chunk);
  }
  let hex = num === 0n ? '' : num.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const body = (hex.match(/../g) ?? []).map((h) => parseInt(h, 16));
  return fromUtf8(new Uint8Array([...new Array<number>(ones).fill(0), ...body]));
}
// codecs:end

const codecs: Record<Base, { label: string; encode: (s: string) => string; decode: (s: string) => string }> = {
  base64: { label: 'Base64', encode: base64Encode, decode: base64Decode },
  base32: { label: 'Base32', encode: base32Encode, decode: base32Decode },
  base58: { label: 'Base58', encode: base58Encode, decode: base58Decode },
};

// ponytail: base conversion is quadratic; 64 KB keeps the worst case under ~1 s on the main thread.
const BASE58_LIMIT = 64 * 1024;

export default function BaseEncoderDecoder() {
  const [input, setInput] = useState('');
  const [base, setBase] = useState<Base>('base64');
  const [direction, setDirection] = useState<Direction>('encode');
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred) return null;
    if (base === 'base58' && deferred.length > BASE58_LIMIT) {
      return { out: '', error: `Base58 input is limited to ${BASE58_LIMIT / 1024} KB.` };
    }
    try {
      return { out: codecs[base][direction](deferred), error: '' };
    } catch (e) {
      return { out: '', error: getErrorMessage(e, 'Could not convert the input.') };
    }
  }, [deferred, base, direction]);

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
          <Field label={direction === 'encode' ? 'Text' : label} htmlFor="base-input" error={result?.error}>
            <TextArea
              id="base-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'encode' ? 'Hello, world' : 'SGVsbG8sIHdvcmxk'}
              rows={10}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
          </Field>
          <Output label={direction === 'encode' ? label : 'Text'} value={result?.out ?? ''} rows={10} />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
