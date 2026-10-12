import { useEffect, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Input, KeyValueList, Output, Panel, TextArea, TwoPane, cn } from '../../ui';
import useDebounce from '../../hooks/useDebounce';

const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algorithm = (typeof ALGORITHMS)[number];
type Hashes = Record<Algorithm, string>;

// md5:start
const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

// WebCrypto has no MD5 (RFC 1321), so this is the reference algorithm.
const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));
const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16,
  23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];
function md5(bytes: Uint8Array): Uint8Array {
  const len = bytes.length;
  const padded = new Uint8Array(Math.ceil((len + 9) / 64) * 64);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, (len * 8) >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor((len * 8) / 2 ** 32), true);
  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  const m = new Uint32Array(16);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) m[i] = view.getUint32(off + i * 4, true);
    let [a, b, c, d] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) [f, g] = [(b & c) | (~b & d), i];
      else if (i < 32) [f, g] = [(d & b) | (~d & c), (5 * i + 1) % 16];
      else if (i < 48) [f, g] = [b ^ c ^ d, (3 * i + 5) % 16];
      else [f, g] = [c ^ (b | ~d), (7 * i) % 16];
      const x = (a + f + MD5_K[i] + m[g]) | 0;
      [a, d, c] = [d, c, b];
      b = (b + ((x << MD5_S[i]) | (x >>> (32 - MD5_S[i])))) | 0;
    }
    [a0, b0, c0, d0] = [(a0 + a) | 0, (b0 + b) | 0, (c0 + c) | 0, (d0 + d) | 0];
  }
  const out = new DataView(new ArrayBuffer(16));
  [a0, b0, c0, d0].forEach((v, i) => out.setUint32(i * 4, v >>> 0, true));
  return new Uint8Array(out.buffer);
}

function hmacMd5(key: Uint8Array, data: Uint8Array): Uint8Array {
  const block = new Uint8Array(64);
  block.set(key.length > 64 ? md5(key) : key);
  const pad = (x: number, body: Uint8Array) => {
    const buf = new Uint8Array(64 + body.length);
    buf.set(block.map((b) => b ^ x));
    buf.set(body, 64);
    return buf;
  };
  return md5(pad(0x5c, md5(pad(0x36, data))));
}
// md5:end

async function digest(algorithm: Algorithm, data: Uint8Array, key: Uint8Array | null): Promise<string> {
  if (algorithm === 'MD5') return hex(key ? hmacMd5(key, data) : md5(data));
  if (!key) return hex(new Uint8Array(await crypto.subtle.digest(algorithm, data)));
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: algorithm }, false, ['sign']);
  return hex(new Uint8Array(await crypto.subtle.sign('HMAC', k, data)));
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const debounced = useDebounce(input, 150);
  const debouncedKey = useDebounce(key, 150);

  // Hashing is async: compute every algorithm at once and keep the previous
  // result on screen, dimmed, until the new one lands.
  useEffect(() => {
    let live = true;
    setBusy(true);
    const bytes = file ? file.arrayBuffer().then((b) => new Uint8Array(b)) : Promise.resolve(new TextEncoder().encode(debounced));
    const keyBytes = debouncedKey ? new TextEncoder().encode(debouncedKey) : null;
    bytes
      .then((data) => Promise.all(ALGORITHMS.map((a) => digest(a, data, keyBytes))))
      .then((values) => {
        if (!live) return;
        setHashes(Object.fromEntries(ALGORITHMS.map((a, i) => [a, values[i]])) as Hashes);
        setError('');
        setBusy(false);
      })
      .catch(() => {
        if (!live) return;
        setHashes(null);
        setError('Could not read the file.');
        setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [debounced, debouncedKey, file]);

  const pending = busy || debounced !== input || debouncedKey !== key;
  const name = (a: Algorithm) => (debouncedKey ? `HMAC-${a}` : a);
  const items = ALGORITHMS.map((a) => ({ label: name(a), value: hashes?.[a] ?? '' }));
  const all = hashes ? ALGORITHMS.map((a) => `${name(a)}: ${hashes[a]}`).join('\n') : '';

  const clear = () => {
    setInput('');
    setKey('');
    setFile(null);
  };

  return (
    <ToolPage id="hash">
      <Panel title="Hash" actions={<ClearButton onClick={clear} disabled={!input && !key && !file} />}>
        <TwoPane>
          <div className="space-y-4">
            <Field label="Text" htmlFor="hash-input" hint={file ? 'Ignored while a file is chosen.' : 'Hashed locally as UTF-8. Whitespace counts.'}>
              <TextArea
                id="hash-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="The quick brown fox"
                rows={8}
                stats
                autoFocus
                autoSize={input.length < 200_000}
              />
            </Field>
            <FileDrop accept="" label="Or hash a file" maxSizeMB={50} file={file} onFile={setFile} onClear={() => setFile(null)} />
            <Field label="HMAC key" htmlFor="hash-key" hint="Optional. With a key, each row is an HMAC instead of a plain digest.">
              <Input id="hash-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="secret" />
            </Field>
          </div>
          <Output label={file ? `Digests of ${file.name}` : 'Digests'} copyText={all} fileName="hashes.txt">
            <div aria-busy={pending || undefined} className={cn('transition-opacity duration-150', pending && 'opacity-50')}>
              <KeyValueList items={items} />
            </div>
          </Output>
        </TwoPane>
        {error && (
          <Callout tone="error" className="mt-4">
            {error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
