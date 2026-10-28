import { useEffect, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, Input, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import useDebounce from '../../hooks/useDebounce';
import { getErrorMessage } from '../../utils/errors';

type Mode = 'encrypt' | 'decrypt';

// aes:start
// Payload: PREFIX + base64(salt[16] || iv[12] || AES-256-GCM ciphertext+tag).
// Key: PBKDF2-SHA-256(passphrase, salt, ITERATIONS) → 256 bits.
const PREFIX = 'xutil-aes1:';
const ITERATIONS = 310_000;
const SALT_LEN = 16;
const IV_LEN = 12;

const toB64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(passphrase: string, salt: Uint8Array, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  const subtle = globalThis.crypto.subtle;
  const material = await subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, [usage]);
}

async function encryptText(passphrase: string, text: string): Promise<string> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(passphrase, salt, 'encrypt');
  const sealed = new Uint8Array(await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
  const out = new Uint8Array(SALT_LEN + IV_LEN + sealed.length);
  out.set(salt);
  out.set(iv, SALT_LEN);
  out.set(sealed, SALT_LEN + IV_LEN);
  return PREFIX + toB64(out);
}

async function decryptText(passphrase: string, payload: string): Promise<string> {
  const trimmed = payload.trim();
  if (!trimmed.startsWith(PREFIX)) throw new Error(`Not an XUtil AES payload: it should start with "${PREFIX}".`);
  let bytes: Uint8Array;
  try {
    bytes = fromB64(trimmed.slice(PREFIX.length).replace(/\s+/g, ''));
  } catch {
    throw new Error('The part after the prefix is not valid Base64.');
  }
  // GCM tag alone is 16 bytes, so anything shorter cannot be a real payload.
  if (bytes.length < SALT_LEN + IV_LEN + 16) throw new Error('Payload too short: salt, IV and authentication tag are missing.');
  const key = await deriveKey(passphrase, bytes.subarray(0, SALT_LEN), 'decrypt');
  try {
    const plain = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(SALT_LEN, SALT_LEN + IV_LEN) }, key, bytes.subarray(SALT_LEN + IV_LEN));
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error('Decryption failed: wrong passphrase, or the data was altered after encryption (the GCM tag did not verify).');
  }
}
// aes:end

export default function AesEncryptDecrypt() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [passphrase, setPassphrase] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const debouncedPassphrase = useDebounce(passphrase, 300);
  const debouncedInput = useDebounce(input, 300);

  // PBKDF2 at 310k iterations costs 100-300 ms per run, hence the debounce
  // and the dimmed previous result while the next one is computed.
  useEffect(() => {
    if (!debouncedPassphrase || !debouncedInput) {
      setOutput('');
      setError('');
      setBusy(false);
      return;
    }
    let live = true;
    setBusy(true);
    const run = mode === 'encrypt' ? encryptText(debouncedPassphrase, debouncedInput) : decryptText(debouncedPassphrase, debouncedInput);
    run
      .then((text) => {
        if (!live) return;
        setOutput(text);
        setError('');
        setBusy(false);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setOutput('');
        setError(getErrorMessage(e, 'Could not process the input.'));
        setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [mode, debouncedPassphrase, debouncedInput]);

  const pending = busy || debouncedPassphrase !== passphrase || debouncedInput !== input;
  const encrypt = mode === 'encrypt';

  const switchMode = (m: Mode) => {
    setMode(m);
    setInput('');
  };

  return (
    <ToolPage id="aes">
      <Panel
        title={encrypt ? 'Encrypt' : 'Decrypt'}
        actions={
          <>
            <Segmented
              size="sm"
              label="Mode"
              value={mode}
              onChange={switchMode}
              options={[
                { value: 'encrypt', label: 'Encrypt' },
                { value: 'decrypt', label: 'Decrypt' },
              ]}
            />
            <ClearButton
              onClick={() => {
                setPassphrase('');
                setInput('');
              }}
              disabled={!passphrase && !input}
            />
          </>
        }
      >
        <TwoPane>
          <div className="space-y-4">
            <Field label="Passphrase" htmlFor="aes-pass" hint="Any length. A 256-bit key is derived from it with PBKDF2; a longer passphrase is a stronger key.">
              <Input id="aes-pass" type="text" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="correct horse battery staple" autoComplete="off" autoFocus />
            </Field>
            <Field label={encrypt ? 'Plaintext' : 'Ciphertext'} htmlFor="aes-input" error={error}>
              <TextArea
                id="aes-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={encrypt ? 'Text to encrypt' : `${PREFIX}...`}
                rows={8}
                stats
                autoSize={input.length < 200_000}
              />
            </Field>
          </div>
          <div className="space-y-4">
            <Output
              label={encrypt ? 'Ciphertext' : 'Plaintext'}
              value={output}
              rows={8}
              fileName={encrypt ? 'encrypted.txt' : 'decrypted.txt'}
              placeholder={pending && passphrase && input ? 'Working…' : 'Result appears here'}
              className={pending ? 'opacity-50 transition-opacity duration-150' : 'transition-opacity duration-150'}
            />
            <Callout tone="info">
              <p>
                <strong>Scheme:</strong> PBKDF2-SHA-256, random 16-byte salt, {ITERATIONS.toLocaleString()} iterations → 256-bit key; AES-256-GCM with a random 12-byte IV.
                Output is <code>{PREFIX}</code> + Base64 of <code>salt(16) ‖ iv(12) ‖ ciphertext+tag(16)</code>.
              </p>
              <p className="mt-1.5 text-muted">
                Not interchangeable with <code>openssl enc</code>, which uses its own key derivation and a <code>Salted__</code> header. Any WebCrypto, Node or Python
                library can decrypt this once it follows the layout above.
              </p>
            </Callout>
          </div>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
