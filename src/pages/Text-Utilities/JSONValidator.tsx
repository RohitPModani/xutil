import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { describeJsonError, hasUnsafeIntegers, UNSAFE_INTEGER_NOTE } from '../../utils/json';
import { useSourceText } from '../../hooks/useSourceText';

type Indent = '2' | '4' | 'min';

const describe = (v: unknown) => {
  if (Array.isArray(v)) return `${v.length.toLocaleString()} items`;
  if (v && typeof v === 'object') return `${Object.keys(v).length.toLocaleString()} keys`;
  return typeof v;
};

export default function JSONValidator() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [indent, setIndent] = useState<Indent>('2');
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred.trim()) return null;
    try {
      const parsed: unknown = JSON.parse(deferred);
      const out = indent === 'min' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, Number(indent));
      return { out, summary: describe(parsed), error: '', unsafe: hasUnsafeIntegers(deferred) };
    } catch (e) {
      return { out: '', summary: '', error: describeJsonError(e, deferred), unsafe: false };
    }
  }, [deferred, indent]);

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
            <ClearButton onClick={clearSource} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="JSON" htmlFor="json-input" error={result?.error || undefined}>
            <TextArea
              id="json-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{"name": "xutil", "tools": 42}'}
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept=".json,.txt" label="Load a file" file={file} onFile={loadFile} onClear={clearSource} />
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

        {result && !result.error && (
          <Callout tone="success" className="mt-4">
            Valid JSON · {result.summary}
          </Callout>
        )}
        {result?.unsafe && (
          <Callout tone="info" className="mt-4">
            {UNSAFE_INTEGER_NOTE}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
