import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { useSourceText } from '../../hooks/useSourceText';

type Indent = '2' | '4' | 'min';

/** Line number from a JSON.parse message, when the engine includes a position. */
function lineOf(message: string, input: string): number | null {
  const line = /line (\d+)/.exec(message);
  if (line) return Number(line[1]);
  const pos = /position (\d+)/.exec(message);
  if (pos) return input.slice(0, Number(pos[1])).split('\n').length;
  return null;
}

const describe = (v: unknown) => {
  if (Array.isArray(v)) return `${v.length.toLocaleString()} items`;
  if (v && typeof v === 'object') return `${Object.keys(v).length.toLocaleString()} keys`;
  return typeof v;
};

export default function JSONValidator() {
  const { text: input, setText: setInput, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [indent, setIndent] = useState<Indent>('2');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const parsed: unknown = JSON.parse(input);
      const out = indent === 'min' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, Number(indent));
      return { out, summary: describe(parsed), error: '', line: null };
    } catch (e) {
      const message = getErrorMessage(e, 'Could not parse this JSON.');
      return { out: '', summary: '', error: message, line: lineOf(message, input) };
    }
  }, [input, indent]);

  return (
    <ToolPage id="json_validator">
      <Panel
        title="Format"
        actions={
          <>
            <Segmented
              size="sm"
              label="Indent"
              value={indent}
              onChange={setIndent}
              options={[
                { value: '2', label: '2 spaces' },
                { value: '4', label: '4 spaces' },
                { value: 'min', label: 'Minify' },
              ]}
            />
            <ClearButton
              onClick={clearSource}
              disabled={!input}
            />
          </>
        }
      >
        <TwoPane>
          <Field label="JSON" htmlFor="json-input">
            <TextArea
              id="json-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{"name": "xutil", "tools": 42}'}
              rows={12}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
              aria-describedby={result?.error ? 'json-error' : undefined}
            />
            <FileDrop
              className="mt-3"
              accept=".json,.txt"
              label="Load a file"
              onFile={loadFile}
              onClear={clearSource}
            />
          </Field>
          <Output
            label={indent === 'min' ? 'Minified' : 'Formatted'}
            value={result?.out ?? ''}
            rows={12}
            wrap={indent !== 'min'}
            fileName={`${fileBase || 'formatted'}.json`}
            mime="application/json"
          />
        </TwoPane>

        {result?.error && (
          <Callout tone="error" id="json-error" className="mt-4">
            {result.line !== null && <span className="font-medium">Line {result.line}: </span>}
            {result.error}
          </Callout>
        )}
        {result && !result.error && (
          <Callout tone="success" className="mt-4">
            Valid JSON · {result.summary}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
