import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Checkbox, CopyButton, Field, GenerateButton, Input, Output, Panel, Select, Toolbar, ValueBlock } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

/* ---- Sampling (pure; exercised by scripts/check-calc.mjs) -------------- */

const TWO_32 = 2 ** 32;
const TWO_53 = 2 ** 53;
const words = new Uint32Array(2);

/** Uniform integer in [0, n): 53 random bits, rejection sampled, so there is no modulo bias. */
function below(n: number): number {
  const limit = Math.floor(TWO_53 / n) * n;
  for (;;) {
    crypto.getRandomValues(words);
    const r = (words[0] >>> 11) * TWO_32 + words[1];
    if (r < limit) return r % n;
  }
}

function randomInts(min: number, max: number, count: number, unique: boolean): number[] {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) throw new Error('Min and max must be whole numbers.');
  if (max < min) throw new Error('Max must be at least min.');
  if (max - min >= Number.MAX_SAFE_INTEGER) throw new Error('That range is too wide.');
  const size = max - min + 1;
  if (!unique) return Array.from({ length: count }, () => min + below(size));
  if (count > size) throw new Error(`Only ${size.toLocaleString()} different numbers exist between ${min} and ${max}.`);
  if (size <= 100_000) {
    // Partial Fisher-Yates over the whole range: exact for small ranges.
    const pool = Array.from({ length: size }, (_, i) => min + i);
    for (let i = 0; i < count; i++) {
      const j = i + below(size - i);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }
  // ponytail: count <= 1000 and size > 100,000, so repeats are rare and the loop is short.
  const seen = new Set<number>();
  while (seen.size < count) seen.add(min + below(size));
  return [...seen];
}

/* ---- Page ---------------------------------------------------------------- */

const SEPARATORS = [
  { value: '\n', label: 'New line' },
  { value: ', ', label: 'Comma' },
  { value: ' ', label: 'Space' },
];

export default function RandomNumberGenerator() {
  const [minText, setMinText] = useState('1');
  const [maxText, setMaxText] = useState('100');
  const [countText, setCountText] = useState('1');
  const [unique, setUnique] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [separator, setSeparator] = useState('\n');
  const [draw, setDraw] = useState(0);

  const min = Number(minText);
  const max = Number(maxText);
  const count = Math.min(1000, Math.max(1, Math.floor(Number(countText)) || 1));
  const rangeOk = Number.isSafeInteger(min) && Number.isSafeInteger(max) && max >= min;
  const size = rangeOk ? max - min + 1 : 0;
  const tooMany = rangeOk && count > size;

  const result = useMemo(() => {
    void draw; // a new draw with the same settings
    try {
      return { nums: randomInts(min, max, count, unique && !tooMany), error: '' };
    } catch (e) {
      return { nums: [], error: getErrorMessage(e, 'Could not generate numbers.') };
    }
  }, [min, max, count, unique, tooMany, draw]);

  const nums = sorted ? [...result.nums].sort((a, b) => a - b) : result.nums;
  const text = nums.join(separator);
  const generate = () => setDraw((n) => n + 1);

  return (
    <ToolPage id="random_number">
      <Panel title="Generate">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Min" htmlFor="rng-min" error={!Number.isSafeInteger(min) ? 'Enter a whole number.' : undefined}>
            <Input id="rng-min" type="number" step={1} inputMode="numeric" value={minText} onChange={(e) => setMinText(e.target.value)} autoFocus />
          </Field>
          <Field
            label="Max"
            htmlFor="rng-max"
            error={!Number.isSafeInteger(max) ? 'Enter a whole number.' : max < min ? 'Max must be at least min.' : undefined}
          >
            <Input id="rng-max" type="number" step={1} inputMode="numeric" value={maxText} onChange={(e) => setMaxText(e.target.value)} />
          </Field>
          <Field label="How many" htmlFor="rng-count" hint="1 to 1000">
            <Input
              id="rng-count"
              type="number"
              min={1}
              max={1000}
              step={1}
              inputMode="numeric"
              value={countText}
              onChange={(e) => setCountText(e.target.value)}
              onBlur={() => setCountText(String(count))}
            />
          </Field>
          <Field label="Separator" htmlFor="rng-sep">
            <Select id="rng-sep" value={separator} onChange={(e) => setSeparator(e.target.value)}>
              {SEPARATORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="No repeats" checked={unique && !tooMany} disabled={tooMany} onChange={(e) => setUnique(e.target.checked)} />
          <Checkbox label="Sort results" checked={sorted} onChange={(e) => setSorted(e.target.checked)} />
          {tooMany && <span className="text-xs text-muted">Only {size.toLocaleString()} numbers in this range, so repeats are needed.</span>}
        </Toolbar>

        <div className="mt-4">
          {result.error && rangeOk ? (
            <p className="text-sm text-danger" role="alert">
              {result.error}
            </p>
          ) : count === 1 ? (
            <ValueBlock
              value={text}
              actions={
                <>
                  <CopyButton text={text} size="md" variant="primary" />
                  <GenerateButton variant="secondary" label="Pick again" onClick={generate} />
                </>
              }
            />
          ) : (
            <Output
              label={`${nums.length.toLocaleString()} numbers`}
              value={text}
              rows={8}
              fileName="random-numbers.txt"
              actions={<GenerateButton size="sm" label="Generate" onClick={generate} />}
            />
          )}
        </div>
      </Panel>
    </ToolPage>
  );
}
