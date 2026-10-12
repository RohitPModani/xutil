import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Callout, Checkbox, ClearButton, Field, Input, Output, Panel, Stat, TextArea, Toolbar } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

const FLAGS = [
  { flag: 'g', label: 'g · global' },
  { flag: 'i', label: 'i · ignore case' },
  { flag: 'm', label: 'm · multiline' },
  { flag: 's', label: 's · dot matches newline' },
  { flag: 'u', label: 'u · unicode' },
];

/** The test text with each match wrapped in <mark>. */
function highlight(text: string, matches: RegExpMatchArray[]): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    const start = m.index ?? 0;
    if (start > cursor) out.push(text.slice(cursor, start));
    out.push(
      <mark key={i} className="rounded-sm bg-primary/20 text-ink">
        {m[0]}
      </mark>
    );
    cursor = start + m[0].length;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');

  const toggle = (f: string, on: boolean) =>
    setFlags((prev) => FLAGS.map((x) => x.flag).filter((x) => (x === f ? on : prev.includes(x))).join(''));

  const result = useMemo(() => {
    if (!pattern) return null;
    try {
      const re = new RegExp(pattern, flags);
      let matches: RegExpMatchArray[];
      if (flags.includes('g')) {
        matches = [...text.matchAll(re)].filter((m) => m[0] !== '');
      } else {
        const m = text.match(re);
        matches = m && m[0] !== '' ? [m] : [];
      }
      return { matches, error: '' };
    } catch (e) {
      return { matches: [], error: getErrorMessage(e, 'Invalid pattern.') };
    }
  }, [pattern, flags, text]);

  const matches = result?.matches ?? [];

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
              }}
              disabled={!pattern && !text}
            />
          </>
        }
      >
        <Field label="Pattern" htmlFor="re-pattern">
          <Input
            id="re-pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"
            autoFocus
            aria-invalid={Boolean(result?.error) || undefined}
            aria-describedby={result?.error ? 're-error' : undefined}
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
          />
        </Field>

        {result?.error && (
          <Callout tone="error" id="re-error" className="mt-4">
            {result.error}
          </Callout>
        )}

        {result && !result.error && (
          <div className="mt-4 space-y-3">
            <Stat label="Matches" value={matches.length.toLocaleString()} className="sm:max-w-[10rem]" />
            <Output label="Matches" copyText={matches.map((m) => m[0]).join('\n')} placeholder="Matches are highlighted here">
              {text && (
                <div className="thin-scroll max-h-[32rem] overflow-auto whitespace-pre-wrap break-words px-3 py-2 text-sm leading-relaxed text-ink">
                  {highlight(text, matches)}
                </div>
              )}
            </Output>
          </div>
        )}
      </Panel>
    </ToolPage>
  );
}
