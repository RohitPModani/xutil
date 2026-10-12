import { useCallback, useEffect, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, Checkbox, CopyButton, Field, GenerateButton, Panel, RangeInput, ValueBlock, cn } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

const DIGITS = '0123456789';
const PUNCTUATION = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MIN = 8;
const MAX = 128;

interface Sets {
  numbers: boolean;
  special: boolean;
  upper: boolean;
  lower: boolean;
}

// Uniform integer in [0, max) by rejection sampling; `random % max` would
// bias the pool and the shuffle.
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

function generatePassword(length: number, sets: Sets): string {
  const pools = [
    sets.numbers && DIGITS,
    sets.special && PUNCTUATION,
    sets.lower && LOWER,
    sets.upper && UPPER,
  ].filter((p): p is string => Boolean(p));
  if (pools.length === 0) throw new Error('Pick at least one character set.');

  const all = pools.join('');
  // One guaranteed character from each chosen set, then fill and shuffle.
  const chars = pools.map((p) => p[randomInt(p.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

type Strength = { label: string; level: 1 | 2 | 3 | 4 };

function strengthOf(password: string, sets: Sets): Strength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length >= 20) score++;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  if (hasLower && hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  score += [sets.lower && hasLower, sets.upper && hasUpper, sets.numbers && hasNumber, sets.special && hasSpecial].filter(Boolean).length;
  if (score >= 8) return { label: 'Very strong', level: 4 };
  if (score >= 6) return { label: 'Strong', level: 3 };
  if (score >= 4) return { label: 'Medium', level: 2 };
  return { label: 'Weak', level: 1 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [sets, setSets] = useState<Sets>({ numbers: true, special: true, upper: true, lower: true });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const n = length;

  const regenerate = useCallback(() => {
    try {
      setPassword(generatePassword(n, sets));
      setError('');
    } catch (e) {
      setPassword('');
      setError(getErrorMessage(e, 'Could not generate a password.'));
    }
  }, [n, sets]);

  // A fresh password on load and whenever an option changes.
  useEffect(regenerate, [regenerate]);

  const strength = useMemo(() => (password ? strengthOf(password, sets) : null), [password, sets]);
  const toggle = (key: keyof Sets) => (e: React.ChangeEvent<HTMLInputElement>) => setSets((s) => ({ ...s, [key]: e.target.checked }));

  return (
    <ToolPage id="password">
      <Panel title="Generate">
        <ValueBlock
          value={password}
          actions={
            <>
              <CopyButton text={password} size="md" variant="primary" />
              <GenerateButton variant="secondary" label="New" onClick={regenerate} />
            </>
          }
        />

        {strength && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Strength</span>
              <span className="text-ink">{strength.label}</span>
            </div>
            <div
              className="mt-1 h-1.5 w-full rounded-full bg-surface"
              role="meter"
              aria-label="Password strength"
              aria-valuemin={1}
              aria-valuemax={4}
              aria-valuenow={strength.level}
              aria-valuetext={strength.label}
            >
              <div
                className={cn('h-1.5 rounded-full', strength.level === 1 ? 'bg-danger' : strength.level === 2 ? 'bg-control' : 'bg-success')}
                style={{ width: `${strength.level * 25}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <Field label={`Length · ${n}`} htmlFor="pw-length" hint={`${MIN} to ${MAX} characters`}>
            <RangeInput id="pw-length" label="Length" min={MIN} max={MAX} value={length} onChange={setLength} />
          </Field>
          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-xs font-medium text-muted">Character sets</legend>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              <Checkbox label="Lowercase a–z" checked={sets.lower} onChange={toggle('lower')} />
              <Checkbox label="Uppercase A–Z" checked={sets.upper} onChange={toggle('upper')} />
              <Checkbox label="Numbers 0–9" checked={sets.numbers} onChange={toggle('numbers')} />
              <Checkbox label="Symbols !@#$" checked={sets.special} onChange={toggle('special')} />
            </div>
          </fieldset>
        </div>

        {error && (
          <Callout tone="error" className="mt-4">
            {error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
