import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Checkbox, ClearButton, Field, Output, Panel, Stat, TextArea, Toolbar, TwoPane } from '../../ui';

export default function LineBreakWhiteSpaceRemover() {
  const [input, setInput] = useState('');
  const [joinLines, setJoinLines] = useState(true);
  const [collapse, setCollapse] = useState(true);
  const [collapseBlank, setCollapseBlank] = useState(false);
  const [trim, setTrim] = useState(true);

  const result = useMemo(() => {
    if (!input) return null;
    let out = input;
    // Runs of blank lines become one blank line.
    if (collapseBlank && !joinLines) out = out.replace(/\r?\n(?:[^\S\r\n]*\r?\n){2,}/g, '\n\n');
    if (joinLines) out = out.replace(/[\r\n]+/g, ' ');
    // Only runs of two or more; a single tab is left as it is.
    if (collapse) out = out.replace(/[^\S\r\n]{2,}/g, ' ');
    if (trim) out = joinLines ? out.trim() : out.split('\n').map((l) => l.trim()).join('\n');
    return { out, before: input.split('\n').length, after: out.split('\n').length };
  }, [input, joinLines, collapse, collapseBlank, trim]);

  return (
    <ToolPage id="line_break_whitespace_remover">
      <Panel title="Clean" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <Field label="Text" htmlFor="ws-input">
            <TextArea
              id="ws-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'First line\n\n   second   line\t with tabs'}
              rows={12}
              autoFocus
              autoSize={input.length < 200_000}
            />
          </Field>
          <Output label="Cleaned" value={result?.out ?? ''} rows={12} fileName="cleaned.txt" />
        </TwoPane>

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="Remove line breaks" checked={joinLines} onChange={(e) => setJoinLines(e.target.checked)} />
          <Checkbox label="Collapse blank lines" checked={collapseBlank} disabled={joinLines} onChange={(e) => setCollapseBlank(e.target.checked)} />
          <Checkbox label="Collapse runs of spaces and tabs" checked={collapse} onChange={(e) => setCollapse(e.target.checked)} />
          <Checkbox label="Trim leading and trailing spaces" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
        </Toolbar>

        {result && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
            <Stat label="Lines in" value={result.before.toLocaleString()} />
            <Stat label="Lines out" value={result.after.toLocaleString()} />
          </div>
        )}
      </Panel>
    </ToolPage>
  );
}
