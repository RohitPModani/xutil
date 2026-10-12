import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Callout, Checkbox, ClearButton, Field, Input, Output, Panel, Stat, TextArea, Toolbar } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import useDebounce from '../../hooks/useDebounce';
import { useWorkerTask } from '../../hooks/useWorkerTask';
import { MAX_MATCHES, type RegexMatch, type RegexRequest, type RegexResponse } from '../../workers/regex.worker';

const FLAGS = [
  { flag: 'g', label: 'g · global' },
  { flag: 'i', label: 'i · ignore case' },
  { flag: 'm', label: 'm · multiline' },
  { flag: 's', label: 's · dot matches newline' },
  { flag: 'u', label: 'u · unicode' },
  { flag: 'v', label: 'v · unicode sets' },
  { flag: 'y', label: 'y · sticky' },
  { flag: 'd', label: 'd · indices' },
];

const createWorker = () => new Worker(new URL('../../workers/regex.worker.ts', import.meta.url), { type: 'module' });

/** The test text with each match wrapped in <mark>. */
function highlight(text: string, matches: RegexMatch[]): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.start > cursor) out.push(text.slice(cursor, m.start));
    out.push(
      <mark key={i} className="rounded-sm bg-primary/20 text-ink">
        {m.text}
      </mark>
    );
    cursor = m.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

const q = (s: string | undefined) => (s === undefined ? 'undefined' : JSON.stringify(s));

/** One block per match: the whole match, then each group with its span. */
const details = (matches: RegexMatch[]) =>
  matches
    .map((m, i) =>
      [`${i + 1}. ${q(m.text)} at ${m.start}–${m.end}`, ...m.groups.map((g) => `   ${g.name}: ${q(g.value)}${g.start >= 0 ? ` at ${g.start}–${g.end}` : ''}`)].join('\n')
    )
    .join('\n');

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const [replacement, setReplacement] = useState('');

  const toggle = (f: string, on: boolean) =>
    setFlags((prev) => FLAGS.map((x) => x.flag).filter((x) => (x === f ? on : prev.includes(x))).join(''));

  // Syntax errors are cheap to find here and worth showing without the debounce.
  const syntaxError = useMemo(() => {
    if (!pattern) return '';
    try {
      new RegExp(pattern, flags);
      return '';
    } catch (e) {
      return getErrorMessage(e, 'Invalid pattern.');
    }
  }, [pattern, flags]);

  const request = useMemo<RegexRequest | null>(
    () => (pattern && !syntaxError ? { pattern, flags, text, replacement } : null),
    [pattern, flags, text, replacement, syntaxError]
  );
  const debounced = useDebounce(request, 150);
  const task = useWorkerTask<RegexRequest, RegexResponse>(createWorker, 2000);
  const { run } = task;
  useEffect(() => run(debounced), [debounced, run]);

  const result = task.result;
  const matches = result?.matches ?? [];
  const error = task.error || result?.error || '';

  return (
    <ToolPage id="regex">
      <Panel
        title="Test"
        actions={
          <>
            <Link
              to="/regex_cheatsheet"
              className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Cheatsheet
            </Link>
            <ClearButton
              onClick={() => {
                setPattern('');
                setText('');
                setReplacement('');
              }}
              disabled={!pattern && !text && !replacement}
            />
          </>
        }
      >
        <Field label="Pattern" htmlFor="re-pattern" error={syntaxError || undefined}>
          <Input
            id="re-pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"
            autoFocus
          />
        </Field>
        <Toolbar className="mt-3 gap-x-5">
          {FLAGS.map((f) => (
            <Checkbox key={f.flag} label={f.label} checked={flags.includes(f.flag)} onChange={(e) => toggle(f.flag, e.target.checked)} />
          ))}
        </Toolbar>

        <Field label="Test text" htmlFor="re-text" className="mt-4">
          <TextArea
            id="re-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'user@example.com, test@domain.org'}
            rows={6}
            mono={false}
            autoSize={text.length < 200_000}
          />
        </Field>
        <Field label="Replace with" htmlFor="re-replace" className="mt-4" hint="$1, $<name> and $& work as in String.replace.">
          <Input id="re-replace" value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="$1" />
        </Field>

        {error && (
          <Callout tone="error" className="mt-4">
            {error}
          </Callout>
        )}
        <span className="sr-only" aria-live="polite">
          {task.busy ? 'Matching' : result ? `${result.total} matches` : ''}
        </span>

        {result && !error && (
          <div className="mt-4 space-y-3">
            <Stat label="Matches" value={result.total.toLocaleString()} className="sm:max-w-[10rem]" />
            {result.total > matches.length && (
              <Callout tone="info">
                Showing the first {MAX_MATCHES.toLocaleString()} of {result.total.toLocaleString()} matches.
              </Callout>
            )}
            <Output label="Highlighted text" copyText={matches.map((m) => m.text).join('\n')} placeholder="Matches are highlighted here">
              {text && (
                <div className="thin-scroll max-h-[32rem] overflow-auto whitespace-pre-wrap break-words px-3 py-2 text-sm leading-relaxed text-ink">
                  {highlight(text, matches)}
                </div>
              )}
            </Output>
            <Output label="Groups and positions" value={details(matches)} rows={6} placeholder="Each match with its groups and character offsets" />
            <Output label="Replaced" value={result.replaced} rows={4} placeholder="The test text with matches replaced" />
          </div>
        )}
      </Panel>
    </ToolPage>
  );
}
