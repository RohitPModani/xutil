import { useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, GenerateButton, Input, KeyValueList, Output, Panel, RangeInput, Segmented, TextArea, TwoPane, cn } from '../../ui';
import useDebounce from '../../hooks/useDebounce';

type Mode = 'hash' | 'verify';

// helpers:start
const BCRYPT_RE = /^\$(2[abxy])\$(\d\d)\$([./A-Za-z0-9]{22})([./A-Za-z0-9]{31})$/;

/** Splits a 60-character bcrypt hash into its fields, or null when malformed. */
function parseBcrypt(hash: string): { version: string; cost: number; salt: string; digest: string } | null {
  const m = BCRYPT_RE.exec(hash.trim());
  return m ? { version: `$${m[1]}`, cost: Number(m[2]), salt: m[3], digest: m[4] } : null;
}

const utf8Length = (s: string) => new TextEncoder().encode(s).length;
// helpers:end

export default function BcryptGenerator() {
  const [mode, setMode] = useState<Mode>('hash');
  const [password, setPassword] = useState('');
  const [rounds, setRounds] = useState(10);
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<{ hash: string; ms: number } | null>(null);
  const [hashInput, setHashInput] = useState('');
  const [match, setMatch] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const debouncedPassword = useDebounce(password, 400);
  const debouncedRounds = useDebounce(rounds, 400);
  const debouncedHash = useDebounce(hashInput, 300);

  const bytes = utf8Length(password);
  const tooLong = bytes > 72;
  const parsed = parseBcrypt(hashInput);
  const hashError = hashInput.trim() && !parsed ? 'Not a bcrypt hash: expected $2a$, $2b$ or $2y$, a two-digit cost and 53 more characters (60 in total).' : '';

  // Hash: bcryptjs' async API yields between rounds so typing stays smooth,
  // but each run still costs ~100 ms at cost 10, hence the debounce.
  useEffect(() => {
    if (mode !== 'hash' || !debouncedPassword) {
      setResult(null);
      setBusy(false);
      return;
    }
    let live = true;
    setBusy(true);
    const started = performance.now();
    bcrypt.hash(debouncedPassword, debouncedRounds).then((hash) => {
      if (!live) return;
      setResult({ hash, ms: Math.round(performance.now() - started) });
      setBusy(false);
    });
    return () => {
      live = false;
    };
  }, [mode, debouncedPassword, debouncedRounds, tick]);

  // Verify: compare costs the same as hashing at the hash's own cost factor.
  useEffect(() => {
    if (mode !== 'verify' || !debouncedPassword || !parseBcrypt(debouncedHash)) {
      setMatch(null);
      setBusy(false);
      return;
    }
    let live = true;
    setBusy(true);
    bcrypt.compare(debouncedPassword, debouncedHash.trim()).then((ok) => {
      if (!live) return;
      setMatch(ok);
      setBusy(false);
    });
    return () => {
      live = false;
    };
  }, [mode, debouncedPassword, debouncedHash]);

  const pending = busy || debouncedPassword !== password || (mode === 'hash' ? debouncedRounds !== rounds : debouncedHash !== hashInput);
  const fields = result ? parseBcrypt(result.hash) : null;
  const breakdown = [
    { label: 'Version', value: fields?.version ?? '' },
    { label: 'Cost', value: fields ? String(fields.cost) : '' },
    { label: 'Salt (22 chars)', value: fields?.salt ?? '' },
    { label: 'Hash (31 chars)', value: fields?.digest ?? '' },
    { label: 'Time', value: result ? `${result.ms} ms` : '' },
  ];

  const clear = () => {
    setPassword('');
    setHashInput('');
  };

  return (
    <ToolPage id="bcrypt">
      <Panel
        title={mode === 'hash' ? 'Hash' : 'Verify'}
        actions={
          <>
            <Segmented
              size="sm"
              label="Mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'hash', label: 'Hash' },
                { value: 'verify', label: 'Verify' },
              ]}
            />
            <ClearButton onClick={clear} disabled={!password && !hashInput} />
          </>
        }
      >
        <TwoPane>
          <div className="space-y-4">
            <Field
              label="Password"
              htmlFor="bcrypt-password"
              hint={tooLong ? undefined : `${bytes} of 72 bytes. bcrypt only reads the first 72 bytes of UTF-8.`}
              error={tooLong ? `${bytes} bytes: bcrypt ignores everything after byte 72, so the tail of this password does not change the hash.` : undefined}
            >
              <Input id="bcrypt-password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="correct horse battery staple" autoComplete="off" autoFocus />
            </Field>
            {mode === 'hash' ? (
              <Field label="Cost factor" htmlFor="bcrypt-rounds" hint={`2^${rounds} iterations. 10 takes about 100 ms; each step up doubles the time, so 16 can take several seconds.`}>
                <RangeInput id="bcrypt-rounds" label="Cost factor" min={4} max={16} value={rounds} onChange={setRounds} />
              </Field>
            ) : (
              <Field label="Hash" htmlFor="bcrypt-hash" error={hashError} hint="The 60-character hash to check the password against.">
                <TextArea id="bcrypt-hash" value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="$2b$10$..." rows={3} autoSize={false} />
              </Field>
            )}
          </div>
          {mode === 'hash' ? (
            <div className="space-y-4">
              <Output label="Bcrypt hash" value={result?.hash ?? ''} rows={3} actions={<GenerateButton size="sm" variant="ghost" label="New salt" loading={pending && !!password} disabled={!password} onClick={() => setTick((t) => t + 1)} />} />
              <Output label="Breakdown" copyText={result?.hash ?? ''}>
                <div aria-busy={pending || undefined} className={cn('transition-opacity duration-150', pending && 'opacity-50')}>
                  <KeyValueList items={breakdown} />
                </div>
              </Output>
            </div>
          ) : (
            <div aria-live="polite">
              {match === true && <Callout tone="success">Match. The password produces this hash.</Callout>}
              {match === false && <Callout tone="error">No match. The password does not produce this hash.</Callout>}
              {match === null && (
                <p className="px-3 py-6 text-center text-sm text-muted">{pending && password && parsed ? 'Checking…' : 'Enter a password and a bcrypt hash.'}</p>
              )}
            </div>
          )}
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
