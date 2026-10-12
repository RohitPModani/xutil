import { useEffect, useMemo, useState } from 'react';
import { createTwoFilesPatch } from 'diff';
import { Check, Copy, Download } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, Checkbox, ClearButton, Field, Panel, Stat, TextArea, Toolbar, TwoPane, cn, useFlash } from '../../ui';
import useDebounce from '../../hooks/useDebounce';
import { downloadBlob } from '../../utils/download';
import { useWorkerTask } from '../../hooks/useWorkerTask';
import type { DiffRequest, DiffResponse, DiffRow } from '../../workers/diff.worker';

const MAX_LINES = 10000;
/** Rows rendered before "Show all"; the DOM gets slow well before the diff does. */
const MAX_ROWS = 2000;

const createWorker = () => new Worker(new URL('../../workers/diff.worker.ts', import.meta.url), { type: 'module' });

/** A missing final newline is not a changed line. */
const normalise = (s: string) => (s && !s.endsWith('\n') ? s + '\n' : s);

const ROW = {
  added: { line: 'border-success bg-success/10', gutter: 'text-success', mark: 'bg-success/30', sign: '+', sr: 'Added: ' },
  removed: { line: 'border-danger bg-danger/10', gutter: 'text-danger', mark: 'bg-danger/30', sign: '-', sr: 'Removed: ' },
  same: { line: 'border-transparent', gutter: 'text-muted', mark: '', sign: ' ', sr: '' },
};

function Row({ row }: { row: DiffRow }) {
  const t = ROW[row.kind];
  return (
    <div className={cn('flex whitespace-pre-wrap break-all border-l-2', t.line)}>
      <span className={cn('w-7 shrink-0 select-none text-center font-semibold', t.gutter)} aria-hidden="true">
        {t.sign}
      </span>
      <span className="sr-only">{t.sr}</span>
      <span className="min-w-0 flex-1 pr-3 text-ink">
        {row.parts
          ? row.parts.map((p, i) =>
              p.changed ? (
                <mark key={i} className={cn('rounded-sm text-ink', t.mark)}>
                  {p.text}
                </mark>
              ) : (
                p.text
              )
            )
          : row.text}
      </span>
    </div>
  );
}

export default function TextCompare() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [copied, flashCopied] = useFlash();

  const request = useMemo<DiffRequest | null>(() => {
    if (!a && !b) return null;
    return { a: normalise(a), b: normalise(b), ignoreWhitespace, ignoreCase };
  }, [a, b, ignoreWhitespace, ignoreCase]);
  const debounced = useDebounce(request, 300);
  const tooLong = debounced ? debounced.a.split('\n').length > MAX_LINES || debounced.b.split('\n').length > MAX_LINES : false;

  const task = useWorkerTask<DiffRequest, DiffResponse>(createWorker, 5000);
  const { run } = task;
  useEffect(() => {
    setShowAll(false);
    run(tooLong ? null : debounced);
  }, [debounced, tooLong, run]);

  // The unified patch is only built when someone asks for it.
  const patch = () =>
    debounced ? createTwoFilesPatch('original', 'changed', debounced.a, debounced.b, undefined, undefined, { ignoreWhitespace, ignoreCase }) : '';

  const result = task.result;
  const rows = result?.rows ?? [];
  const visible = showAll ? rows : rows.slice(0, MAX_ROWS);

  return (
    <ToolPage id="text_compare">
      <Panel
        title="Compare"
        actions={
          <ClearButton
            onClick={() => {
              setA('');
              setB('');
            }}
            disabled={!a && !b}
          />
        }
      >
        <TwoPane>
          <Field label="Original" htmlFor="cmp-a">
            <TextArea id="cmp-a" value={a} onChange={(e) => setA(e.target.value)} rows={10} stats autoFocus placeholder="The text before" autoSize={a.length < 200_000} />
          </Field>
          <Field label="Changed" htmlFor="cmp-b">
            <TextArea id="cmp-b" value={b} onChange={(e) => setB(e.target.value)} rows={10} stats placeholder="The text after" autoSize={b.length < 200_000} />
          </Field>
        </TwoPane>

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="Ignore whitespace" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
          <Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
        </Toolbar>

        {tooLong && (
          <Callout tone="error" className="mt-4">
            Each text can be at most {MAX_LINES.toLocaleString()} lines.
          </Callout>
        )}
        {task.error && (
          <Callout tone="error" className="mt-4">
            {task.error} Try shorter texts.
          </Callout>
        )}
        <span className="sr-only" aria-live="polite">
          {task.busy ? 'Comparing' : result ? `${result.added} lines added, ${result.removed} lines removed` : ''}
        </span>

        {result && debounced && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
              <Stat label="Added" value={<span className="text-success">+{result.added.toLocaleString()}</span>} />
              <Stat label="Removed" value={<span className="text-danger">-{result.removed.toLocaleString()}</span>} />
            </div>
            <div className="min-w-0">
              <div className="mb-1.5 flex min-h-7 items-center justify-between gap-3">
                <span id="cmp-diff-label" className="text-xs font-medium text-muted">
                  Differences
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    onClick={() => navigator.clipboard.writeText(patch()).then(flashCopied, () => undefined)}
                  >
                    {copied ? 'Copied' : 'Copy patch'}
                  </Button>
                  <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => downloadBlob(patch(), 'diff.patch')}>
                    Download patch
                  </Button>
                </div>
              </div>
              <div role="region" aria-labelledby="cmp-diff-label" className="rounded-md border border-line bg-surface">
                <pre className="thin-scroll max-h-[32rem] overflow-auto py-1 font-mono text-[13px] leading-relaxed">
                  {visible.map((row, i) => (
                    <Row key={i} row={row} />
                  ))}
                </pre>
                {rows.length > visible.length && (
                  <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 text-xs text-muted">
                    <span>
                      Showing the first {MAX_ROWS.toLocaleString()} of {rows.length.toLocaleString()} rows.
                    </span>
                    <Button size="sm" onClick={() => setShowAll(true)}>
                      Show all
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Panel>
    </ToolPage>
  );
}
