import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createTwoFilesPatch } from 'diff';
import { ArrowLeftRight, Check, ChevronDown, ChevronUp, Copy, Download } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, Checkbox, ClearButton, EmptyState, Field, FileDrop, IconButton, Panel, Segmented, Stat, TextArea, Toolbar, TwoPane, cn, useFlash } from '../../ui';
import useDebounce from '../../hooks/useDebounce';
import { useWorkerTask } from '../../hooks/useWorkerTask';
import { downloadBlob } from '../../utils/download';
import type { DiffRequest, DiffResponse, DiffRow, Granularity } from '../../workers/diff.worker';

const MAX_LINES = 10_000;
/** Word and character modes compare the whole text as one sequence; keep that bounded. */
const MAX_INLINE_CHARS = 100_000;
/** Rows rendered before "Show all"; the DOM gets slow well before the diff does. */
const MAX_ROWS = 2000;
/** Unchanged lines kept around each change when the rest is folded. */
const CONTEXT = 3;
const TEXT_FILES = '.txt,.md,.json,.csv,.tsv,.xml,.yaml,.yml,.toml,.ini,.env,.log,.js,.jsx,.ts,.tsx,.css,.html,.py,.rb,.go,.rs,.java,.kt,.sh,.sql,text/*';

const createWorker = () => new Worker(new URL('../../workers/diff.worker.ts', import.meta.url), { type: 'module' });

/** A missing final newline is not a changed line. */
const normalise = (s: string) => (s && !s.endsWith('\n') ? s + '\n' : s);

type View = 'unified' | 'split';

const KIND = {
  added: { bg: 'bg-success/10', gutter: 'text-success', mark: 'bg-success/30', sign: '+', sr: 'Added: ' },
  removed: { bg: 'bg-danger/10', gutter: 'text-danger', mark: 'bg-danger/30', sign: '-', sr: 'Removed: ' },
  same: { bg: '', gutter: 'text-muted', mark: '', sign: ' ', sr: '' },
};

/** What the result region renders: real rows, or a fold standing in for a run of unchanged lines. */
type Item = { type: 'row'; row: DiffRow; index: number } | { type: 'fold'; from: number; count: number };
type SplitItem = { type: 'pair'; left?: DiffRow; right?: DiffRow; hunk?: number } | { type: 'fold'; from: number; count: number };

/** Hides unchanged runs except `CONTEXT` lines either side of a change. */
function fold(rows: DiffRow[], showUnchanged: boolean, expanded: Set<number>): Item[] {
  if (showUnchanged) return rows.map((row, index) => ({ type: 'row', row, index }));
  const items: Item[] = [];
  let i = 0;
  while (i < rows.length) {
    if (rows[i].kind !== 'same') {
      items.push({ type: 'row', row: rows[i], index: i });
      i += 1;
      continue;
    }
    let j = i;
    while (j < rows.length && rows[j].kind === 'same') j += 1;
    const before = i === 0 ? 0 : CONTEXT;
    const after = j === rows.length ? 0 : CONTEXT;
    const hidden = j - i - before - after;
    if (hidden < 2 || expanded.has(i)) {
      for (let k = i; k < j; k++) items.push({ type: 'row', row: rows[k], index: k });
    } else {
      for (let k = i; k < i + before; k++) items.push({ type: 'row', row: rows[k], index: k });
      items.push({ type: 'fold', from: i, count: hidden });
      for (let k = j - after; k < j; k++) items.push({ type: 'row', row: rows[k], index: k });
    }
    i = j;
  }
  return items;
}

/** Pairs each removed line with the added line that replaced it, for the side-by-side view. */
function toSplit(items: Item[]): SplitItem[] {
  const out: SplitItem[] = [];
  let removed: DiffRow[] = [];
  let added: DiffRow[] = [];
  const flush = () => {
    const n = Math.max(removed.length, added.length);
    for (let k = 0; k < n; k++) out.push({ type: 'pair', left: removed[k], right: added[k], hunk: (removed[k] ?? added[k])?.hunk });
    removed = [];
    added = [];
  };
  for (const item of items) {
    if (item.type === 'fold') {
      flush();
      out.push(item);
    } else if (item.row.kind === 'removed') {
      if (added.length) flush();
      removed.push(item.row);
    } else if (item.row.kind === 'added') {
      added.push(item.row);
    } else {
      flush();
      out.push({ type: 'pair', left: item.row, right: item.row });
    }
  }
  flush();
  return out;
}

function LineText({ row }: { row: DiffRow }) {
  const t = KIND[row.kind];
  return (
    <>
      <span className="sr-only">{t.sr}</span>
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
        : row.text || ' '}
    </>
  );
}

function FoldRow({ count, onExpand, columns }: { count: number; onExpand: () => void; columns: number }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex w-full items-center gap-2 border-y border-line bg-canvas px-3 py-1 text-left text-xs text-muted hover:text-ink"
      style={{ gridColumn: `span ${columns}` }}
    >
      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      {count.toLocaleString()} unchanged {count === 1 ? 'line' : 'lines'}
    </button>
  );
}

export default function TextCompare() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [mode, setMode] = useState<Granularity>('lines');
  const [view, setView] = useState<View>('unified');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeHunk, setActiveHunk] = useState(0);
  const [copied, flashCopied] = useFlash();
  const region = useRef<HTMLDivElement>(null);

  const request = useMemo<DiffRequest | null>(() => {
    if (!a && !b) return null;
    return mode === 'lines' ? { a: normalise(a), b: normalise(b), mode, ignoreWhitespace, ignoreCase } : { a, b, mode, ignoreWhitespace, ignoreCase };
  }, [a, b, mode, ignoreWhitespace, ignoreCase]);
  const debounced = useDebounce(request, 300);

  const tooBig = useMemo(() => {
    if (!debounced) return '';
    if (debounced.mode === 'lines') {
      return debounced.a.split('\n').length > MAX_LINES || debounced.b.split('\n').length > MAX_LINES ? `Each text can be at most ${MAX_LINES.toLocaleString()} lines in line mode.` : '';
    }
    return debounced.a.length > MAX_INLINE_CHARS || debounced.b.length > MAX_INLINE_CHARS ? `Word and character modes take up to ${MAX_INLINE_CHARS.toLocaleString()} characters per side; switch to Lines for longer texts.` : '';
  }, [debounced]);

  const task = useWorkerTask<DiffRequest, DiffResponse>(createWorker, 5000);
  const { run } = task;
  useEffect(() => {
    setShowAll(false);
    setExpanded(new Set());
    setActiveHunk(0);
    run(tooBig ? null : debounced);
  }, [debounced, tooBig, run]);

  const result = task.result;
  const identical = Boolean(result && debounced && result.hunks === 0);

  const items = useMemo(() => (result?.mode === 'lines' ? fold(result.rows, showUnchanged, expanded) : []), [result, showUnchanged, expanded]);
  const visibleItems = showAll ? items : items.slice(0, MAX_ROWS);
  const splitItems = useMemo(() => (view === 'split' ? toSplit(visibleItems) : []), [view, visibleItems]);
  const expand = useCallback((from: number) => setExpanded((s) => new Set(s).add(from)), []);

  // The unified patch is only built when someone asks for it.
  const patch = () =>
    debounced
      ? createTwoFilesPatch(fileA?.name ?? 'original', fileB?.name ?? 'changed', normalise(a), normalise(b), undefined, undefined, { ignoreWhitespace, ignoreCase })
      : '';

  const goTo = (hunk: number) => {
    if (!result || result.hunks === 0) return;
    const next = ((hunk - 1 + result.hunks) % result.hunks) + 1;
    setActiveHunk(next);
    // A folded hunk is never hidden, so its first row is always in the DOM.
    region.current?.querySelector<HTMLElement>(`[data-hunk="${next}"]`)?.scrollIntoView({ block: 'center' });
  };

  const swap = () => {
    setA(b);
    setB(a);
    setFileA(fileB);
    setFileB(fileA);
  };

  const loadInto = (set: (s: string) => void, setFile: (f: File | null) => void) => async (file: File) => {
    setFile(file);
    set(await file.text());
  };

  const rowClass = (kind: DiffRow['kind'], hunk?: number) => cn(KIND[kind].bg, Boolean(hunk) && hunk === activeHunk && 'ring-1 ring-inset ring-primary/60');
  const textClass = cn('min-w-0 px-2 text-ink', wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre');
  const gutterClass = 'w-10 shrink-0 select-none pr-1.5 text-right text-[11px] tabular-nums text-muted';

  return (
    <ToolPage id="text_compare">
      <Panel
        title="Compare"
        actions={
          <>
            <Segmented
              size="sm"
              label="Compare by"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'lines', label: 'Lines' },
                { value: 'words', label: 'Words' },
                { value: 'chars', label: 'Characters' },
              ]}
            />
            <ClearButton
              onClick={() => {
                setA('');
                setB('');
                setFileA(null);
                setFileB(null);
              }}
              disabled={!a && !b}
            />
          </>
        }
      >
        <div className="relative">
          <TwoPane>
            <Field label={fileA ? `Original · ${fileA.name}` : 'Original'} htmlFor="cmp-a">
              <TextArea id="cmp-a" value={a} onChange={(e) => setA(e.target.value)} rows={10} stats autoFocus placeholder="The text before" autoSize={a.length < 200_000} />
              <FileDrop className="mt-2" accept={TEXT_FILES} label="Load a file" hint="text and code files" file={fileA} maxSizeMB={2} onFile={loadInto(setA, setFileA)} onClear={() => setFileA(null)} />
            </Field>
            <Field label={fileB ? `Changed · ${fileB.name}` : 'Changed'} htmlFor="cmp-b">
              <TextArea id="cmp-b" value={b} onChange={(e) => setB(e.target.value)} rows={10} stats placeholder="The text after" autoSize={b.length < 200_000} />
              <FileDrop className="mt-2" accept={TEXT_FILES} label="Load a file" hint="text and code files" file={fileB} maxSizeMB={2} onFile={loadInto(setB, setFileB)} onClear={() => setFileB(null)} />
            </Field>
          </TwoPane>
          <IconButton label="Swap sides" size="sm" onClick={swap} disabled={!a && !b} className="absolute -top-1 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="Ignore whitespace" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
          <Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
          {mode === 'lines' && (
            <>
              <Checkbox label="Show unchanged lines" checked={showUnchanged} onChange={(e) => setShowUnchanged(e.target.checked)} />
              <Checkbox label="Wrap long lines" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
            </>
          )}
        </Toolbar>

        {tooBig && (
          <Callout tone="error" className="mt-4">
            {tooBig}
          </Callout>
        )}
        {task.error && (
          <Callout tone="error" className="mt-4">
            {task.error} Try shorter texts, or compare by lines.
          </Callout>
        )}
        <span className="sr-only" aria-live="polite">
          {task.busy ? 'Comparing' : identical ? 'The texts are identical' : result ? `${result.hunks} changes: ${result.added} added, ${result.removed} removed` : ''}
        </span>

        {identical && (
          <Callout tone="success" className="mt-4">
            The texts are identical{ignoreWhitespace || ignoreCase ? ' with the chosen options' : ''}.
          </Callout>
        )}

        {result && debounced && !identical && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="grid grid-cols-3 gap-3 sm:w-auto sm:min-w-[22rem]">
                <Stat label="Changes" value={result.hunks.toLocaleString()} />
                <Stat label={mode === 'lines' ? 'Lines added' : mode === 'words' ? 'Words added' : 'Characters added'} value={<span className="text-success">+{result.added.toLocaleString()}</span>} />
                <Stat label={mode === 'lines' ? 'Lines removed' : mode === 'words' ? 'Words removed' : 'Characters removed'} value={<span className="text-danger">-{result.removed.toLocaleString()}</span>} />
              </div>
              {mode === 'lines' && (
                <Segmented
                  size="sm"
                  label="View"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'unified', label: 'Unified' },
                    { value: 'split', label: 'Side by side' },
                  ]}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 flex min-h-7 flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span id="cmp-diff-label" className="text-xs font-medium text-muted">
                    Differences
                  </span>
                  {mode === 'lines' && result.hunks > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-muted">
                      <IconButton label="Previous change" size="sm" onClick={() => goTo(activeHunk === 0 ? result.hunks : activeHunk - 1)}>
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                      <span className="tabular-nums" aria-live="polite">
                        {activeHunk === 0 ? `${result.hunks} ${result.hunks === 1 ? 'change' : 'changes'}` : `${activeHunk} of ${result.hunks}`}
                      </span>
                      <IconButton label="Next change" size="sm" onClick={() => goTo(activeHunk + 1)}>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </span>
                  )}
                </div>
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

              <div ref={region} role="region" aria-labelledby="cmp-diff-label" className="rounded-md border border-line bg-surface">
                {mode !== 'lines' ? (
                  <div className={cn('relative thin-scroll max-h-[32rem] overflow-auto px-3 py-2 text-sm leading-relaxed text-ink', wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre')}>
                    {result.inline.map((p, i) =>
                      p.kind === 'same' ? (
                        <span key={i}>{p.text}</span>
                      ) : (
                        <mark key={i} className={cn('rounded-sm text-ink', p.kind === 'added' ? 'bg-success/30' : 'bg-danger/30 line-through decoration-danger/70')}>
                          <span className="sr-only">{KIND[p.kind].sr}</span>
                          {p.text}
                        </mark>
                      )
                    )}
                  </div>
                ) : view === 'unified' ? (
                  <div className="relative thin-scroll max-h-[32rem] overflow-auto py-1 font-mono text-[13px] leading-relaxed">
                    {visibleItems.length === 0 && <EmptyState>Nothing to show</EmptyState>}
                    {visibleItems.map((item) =>
                      item.type === 'fold' ? (
                        <FoldRow key={`f${item.from}`} count={item.count} columns={1} onExpand={() => expand(item.from)} />
                      ) : (
                        <div key={item.index} data-hunk={item.row.hunk} className={cn('flex', rowClass(item.row.kind, item.row.hunk))}>
                          <span className={gutterClass} aria-hidden="true">
                            {item.row.oldNo ?? ''}
                          </span>
                          <span className={gutterClass} aria-hidden="true">
                            {item.row.newNo ?? ''}
                          </span>
                          <span className={cn('w-5 shrink-0 select-none text-center font-semibold', KIND[item.row.kind].gutter)} aria-hidden="true">
                            {KIND[item.row.kind].sign}
                          </span>
                          <span className={cn(textClass, 'flex-1')}>
                            <LineText row={item.row} />
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="relative thin-scroll max-h-[32rem] overflow-auto py-1 font-mono text-[13px] leading-relaxed">
                    <div className="grid min-w-[40rem] grid-cols-[2.5rem_minmax(0,1fr)_2.5rem_minmax(0,1fr)]">
                      {splitItems.map((item, i) =>
                        item.type === 'fold' ? (
                          <FoldRow key={`f${item.from}`} count={item.count} columns={4} onExpand={() => expand(item.from)} />
                        ) : (
                          <div key={i} data-hunk={item.hunk} className={cn('contents', Boolean(item.hunk) && item.hunk === activeHunk && '[&>*]:ring-1 [&>*]:ring-inset [&>*]:ring-primary/40')}>
                            <span className={cn(gutterClass, 'w-auto', item.left && KIND[item.left.kind].bg)} aria-hidden="true">
                              {item.left?.oldNo ?? ''}
                            </span>
                            <span className={cn(textClass, 'border-r border-line', item.left ? KIND[item.left.kind].bg : 'bg-canvas/60')}>{item.left ? <LineText row={item.left} /> : ' '}</span>
                            <span className={cn(gutterClass, 'w-auto', item.right && KIND[item.right.kind].bg)} aria-hidden="true">
                              {item.right?.newNo ?? ''}
                            </span>
                            <span className={cn(textClass, item.right ? KIND[item.right.kind].bg : 'bg-canvas/60')}>{item.right ? <LineText row={item.right} /> : ' '}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {mode === 'lines' && items.length > visibleItems.length && (
                  <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 text-xs text-muted">
                    <span>
                      Showing the first {MAX_ROWS.toLocaleString()} of {items.length.toLocaleString()} rows.
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
