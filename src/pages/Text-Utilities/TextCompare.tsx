import { useMemo, useState } from 'react';
import { createTwoFilesPatch, diffLines } from 'diff';
import ToolPage from '../../components/ToolPage';
import { Callout, Checkbox, ClearButton, Field, Output, Panel, Stat, TextArea, Toolbar, TwoPane, cn } from '../../ui';

const MAX_LINES = 10000;

interface Row {
  kind: 'added' | 'removed' | 'same';
  text: string;
}

export default function TextCompare() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const result = useMemo(() => {
    if (!a && !b) return null;
    if (a.split('\n').length > MAX_LINES || b.split('\n').length > MAX_LINES) {
      return { rows: [], added: 0, removed: 0, patch: '', error: `Each text can be at most ${MAX_LINES.toLocaleString()} lines.` };
    }
    const rows: Row[] = [];
    let added = 0;
    let removed = 0;
    for (const part of diffLines(a, b, { ignoreWhitespace, ignoreCase })) {
      const kind: Row['kind'] = part.added ? 'added' : part.removed ? 'removed' : 'same';
      const lines = part.value.replace(/\n$/, '').split('\n');
      if (kind === 'added') added += lines.length;
      if (kind === 'removed') removed += lines.length;
      for (const text of lines) rows.push({ kind, text });
    }
    const patch = createTwoFilesPatch('original', 'changed', a, b, undefined, undefined, { ignoreWhitespace, ignoreCase });
    return { rows, added, removed, patch, error: '' };
  }, [a, b, ignoreWhitespace, ignoreCase]);

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
            <TextArea id="cmp-a" value={a} onChange={(e) => setA(e.target.value)} rows={10} stats autoFocus placeholder="The text before" />
          </Field>
          <Field label="Changed" htmlFor="cmp-b">
            <TextArea id="cmp-b" value={b} onChange={(e) => setB(e.target.value)} rows={10} stats placeholder="The text after" />
          </Field>
        </TwoPane>

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="Ignore whitespace" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
          <Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
        </Toolbar>

        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}

        {result && !result.error && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
              <Stat label="Added" value={<span className="text-success">+{result.added.toLocaleString()}</span>} />
              <Stat label="Removed" value={<span className="text-danger">−{result.removed.toLocaleString()}</span>} />
            </div>
            <Output label="Differences" copyText={result.patch} fileName="diff.patch">
              <pre className="thin-scroll max-h-[32rem] overflow-auto py-1 font-mono text-[13px] leading-relaxed">
                {result.rows.map((row, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex whitespace-pre-wrap break-all',
                      row.kind === 'added' && 'bg-success/10',
                      row.kind === 'removed' && 'bg-danger/10'
                    )}
                  >
                    <span
                      className={cn(
                        'w-7 shrink-0 select-none text-center',
                        row.kind === 'added' ? 'text-success' : row.kind === 'removed' ? 'text-danger' : 'text-muted'
                      )}
                      aria-hidden="true"
                    >
                      {row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : ' '}
                    </span>
                    <span className="sr-only">{row.kind === 'added' ? 'Added: ' : row.kind === 'removed' ? 'Removed: ' : ''}</span>
                    <span className="min-w-0 flex-1 pr-3 text-ink">{row.text}</span>
                  </div>
                ))}
              </pre>
            </Output>
          </div>
        )}
      </Panel>
    </ToolPage>
  );
}
