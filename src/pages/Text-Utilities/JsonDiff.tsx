import { useDeferredValue, useMemo, useState } from 'react';
import { diffLines } from 'diff';
import ToolPage from '../../components/ToolPage';
import { Callout, Checkbox, ClearButton, Field, FileDrop, Output, Panel, TextArea, Toolbar, TwoPane, cn } from '../../ui';
import { describeJsonError } from '../../utils/json';
import { useSourceText } from '../../hooks/useSourceText';

/** Unchanged lines kept either side of a change when the rest is folded. */
const CONTEXT = 3;
/** Rows rendered at most; the DOM gets slow well before the diff does. */
const MAX_ROWS = 3000;

type Kind = 'added' | 'removed' | 'same';
interface Row {
  kind: Kind;
  text: string;
}

const KIND = {
  added: { sign: '+', row: 'bg-success/10', gutter: 'text-success', sr: 'Added: ' },
  removed: { sign: '-', row: 'bg-danger/10', gutter: 'text-danger', sr: 'Removed: ' },
  same: { sign: ' ', row: '', gutter: 'text-muted', sr: '' },
};

/** Sorts object keys (and optionally array items by their JSON text) recursively. */
function normalise(value: unknown, sortKeys: boolean, sortArrays: boolean): unknown {
  if (Array.isArray(value)) {
    const items = value.map((v) => normalise(v, sortKeys, sortArrays));
    if (!sortArrays) return items;
    const keyed = items.map((v) => [JSON.stringify(v), v] as const);
    keyed.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return keyed.map(([, v]) => v);
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (sortKeys) keys.sort();
    return Object.fromEntries(keys.map((k) => [k, normalise(obj[k], sortKeys, sortArrays)]));
  }
  return value;
}

/** Parses JSON text and pretty-prints it in canonical form, so formatting never shows up as a difference. */
function canonical(text: string, sortKeys: boolean, sortArrays: boolean): string {
  return JSON.stringify(normalise(JSON.parse(text), sortKeys, sortArrays), null, 2) + '\n';
}

function parse(text: string, sortKeys: boolean, sortArrays: boolean) {
  if (!text.trim()) return { out: '', error: '' };
  try {
    return { out: canonical(text, sortKeys, sortArrays), error: '' };
  } catch (e) {
    return { out: '', error: describeJsonError(e, text) };
  }
}

function lineDiff(a: string, b: string) {
  const rows: Row[] = [];
  let added = 0;
  let removed = 0;
  for (const part of diffLines(a, b)) {
    const kind: Kind = part.added ? 'added' : part.removed ? 'removed' : 'same';
    const lines = part.value.replace(/\n$/, '').split('\n');
    if (kind === 'added') added += lines.length;
    if (kind === 'removed') removed += lines.length;
    for (const text of lines) rows.push({ kind, text });
  }
  return { rows, added, removed };
}

type Item = Row | { kind: 'fold'; count: number };

/** Hides unchanged runs except `CONTEXT` lines either side of a change. */
function fold(rows: Row[]): Item[] {
  const items: Item[] = [];
  let i = 0;
  while (i < rows.length) {
    if (rows[i].kind !== 'same') {
      items.push(rows[i++]);
      continue;
    }
    let j = i;
    while (j < rows.length && rows[j].kind === 'same') j += 1;
    const before = i === 0 ? 0 : CONTEXT;
    const after = j === rows.length ? 0 : CONTEXT;
    const hidden = j - i - before - after;
    if (hidden < 2) {
      items.push(...rows.slice(i, j));
    } else {
      items.push(...rows.slice(i, i + before), { kind: 'fold', count: hidden }, ...rows.slice(j - after, j));
    }
    i = j;
  }
  return items;
}

export default function JsonDiff() {
  const left = useSourceText();
  const right = useSourceText();
  const [sortKeys, setSortKeys] = useState(true);
  const [sortArrays, setSortArrays] = useState(false);
  const [showUnchanged, setShowUnchanged] = useState(false);
  const a = useDeferredValue(left.text);
  const b = useDeferredValue(right.text);

  const sideA = useMemo(() => parse(a, sortKeys, sortArrays), [a, sortKeys, sortArrays]);
  const sideB = useMemo(() => parse(b, sortKeys, sortArrays), [b, sortKeys, sortArrays]);

  const diff = useMemo(() => (sideA.out && sideB.out ? lineDiff(sideA.out, sideB.out) : null), [sideA.out, sideB.out]);
  const identical = Boolean(diff && diff.added === 0 && diff.removed === 0);
  const items = useMemo(() => (diff && !identical ? (showUnchanged ? diff.rows : fold(diff.rows)) : []), [diff, identical, showUnchanged]);
  const visible = items.slice(0, MAX_ROWS);
  const patch = diff ? diff.rows.map((r) => KIND[r.kind].sign + r.text).join('\n') : '';

  const clear = () => {
    left.clear();
    right.clear();
  };

  return (
    <ToolPage id="json_diff">
      <Panel title="Compare" actions={<ClearButton onClick={clear} disabled={!left.text && !right.text} />}>
        <TwoPane>
          <Field label={left.file ? `Left · ${left.file.name}` : 'Left'} htmlFor="jd-a" error={sideA.error || undefined}>
            <TextArea id="jd-a" value={left.text} onChange={(e) => left.setText(e.target.value)} rows={10} stats autoFocus placeholder='{"name": "xutil", "tools": 42}' autoSize={left.text.length < 200_000} />
            <FileDrop className="mt-2" accept=".json,application/json" label="Load a file" file={left.file} onFile={left.loadFile} onClear={left.clear} />
          </Field>
          <Field label={right.file ? `Right · ${right.file.name}` : 'Right'} htmlFor="jd-b" error={sideB.error || undefined}>
            <TextArea id="jd-b" value={right.text} onChange={(e) => right.setText(e.target.value)} rows={10} stats placeholder='{"tools": 43, "name": "xutil"}' autoSize={right.text.length < 200_000} />
            <FileDrop className="mt-2" accept=".json,application/json" label="Load a file" file={right.file} onFile={right.loadFile} onClear={right.clear} />
          </Field>
        </TwoPane>

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="Ignore key order" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} />
          <Checkbox label="Ignore array order" checked={sortArrays} onChange={(e) => setSortArrays(e.target.checked)} />
          <Checkbox label="Show unchanged lines" checked={showUnchanged} onChange={(e) => setShowUnchanged(e.target.checked)} />
        </Toolbar>

        {identical && (
          <Callout tone="success" className="mt-4">
            Identical after normalisation
          </Callout>
        )}

        {diff && !identical && (
          <Output
            className="mt-4"
            label={
              <>
                Differences · <span className="text-success">{diff.added.toLocaleString()} added</span> · <span className="text-danger">{diff.removed.toLocaleString()} removed</span>
              </>
            }
            copyText={patch}
            fileName="diff.patch"
            mime="text/x-diff"
          >
            <div className="thin-scroll max-h-[32rem] overflow-auto py-1 font-mono text-[13px] leading-relaxed">
              {visible.map((item, i) =>
                item.kind === 'fold' ? (
                  <div key={i} className="border-y border-line bg-canvas px-3 py-1 text-xs text-muted">
                    {item.count.toLocaleString()} unchanged {item.count === 1 ? 'line' : 'lines'}
                  </div>
                ) : (
                  <div key={i} className={cn('flex', KIND[item.kind].row)}>
                    <span className={cn('w-6 shrink-0 select-none text-center font-semibold', KIND[item.kind].gutter)} aria-hidden="true">
                      {KIND[item.kind].sign}
                    </span>
                    <span className="min-w-0 flex-1 whitespace-pre-wrap break-all px-2 text-ink">
                      <span className="sr-only">{KIND[item.kind].sr}</span>
                      {item.text || ' '}
                    </span>
                  </div>
                )
              )}
            </div>
            {items.length > visible.length && (
              <div className="border-t border-line px-3 py-2 text-xs text-muted">
                Showing the first {MAX_ROWS.toLocaleString()} of {items.length.toLocaleString()} rows. Copy or download for the full diff.
              </div>
            )}
          </Output>
        )}
      </Panel>
    </ToolPage>
  );
}
