import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Checkbox, ClearButton, Field, Output, Panel, Stat, TextArea, Toolbar, TwoPane } from '../../ui';

export default function DuplicateLineRemover() {
  const [input, setInput] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trim, setTrim] = useState(true);
  const [keepBlank, setKeepBlank] = useState(false);

  const result = useMemo(() => {
    if (!input) return null;
    const lines = input.split('\n');
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of lines) {
      if (!keepBlank && line.trim() === '') continue;
      let key = trim ? line.trim() : line;
      if (ignoreCase) key = key.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(line);
    }
    return { out: out.join('\n'), before: lines.length, after: out.length };
  }, [input, ignoreCase, trim, keepBlank]);

  return (
    <ToolPage id="duplicate_line_remover">
      <Panel title="Remove duplicates" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <Field label="Lines" htmlFor="dedupe-input">
            <TextArea
              id="dedupe-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'apple\nbanana\napple\ncherry'}
              rows={12}
              autoFocus
            />
          </Field>
          <Output label="Unique lines" value={result?.out ?? ''} rows={12} fileName="unique-lines.txt" />
        </TwoPane>

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
          <Checkbox label="Ignore leading and trailing spaces" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
          <Checkbox label="Keep blank lines" checked={keepBlank} onChange={(e) => setKeepBlank(e.target.checked)} />
        </Toolbar>

        {result && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:max-w-md">
            <Stat label="Lines in" value={result.before.toLocaleString()} />
            <Stat label="Lines out" value={result.after.toLocaleString()} />
            <Stat label="Removed" value={(result.before - result.after).toLocaleString()} />
          </div>
        )}
      </Panel>
    </ToolPage>
  );
}
