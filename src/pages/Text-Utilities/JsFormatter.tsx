import { useDeferredValue, useMemo, useState } from 'react';
import { js as beautifyJs } from 'js-beautify';
import ToolPage from '../../components/ToolPage';
import { Checkbox, ClearButton, Field, FileDrop, formatSize, Output, Panel, Segmented, Select, TextArea, TwoPane } from '../../ui';
import { useSourceText } from '../../hooks/useSourceText';

type Indent = '2' | '4' | 'tab';
type Brace = 'collapse' | 'expand' | 'end-expand';

const bytes = (s: string) => new TextEncoder().encode(s).length;

export default function JsFormatter() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [indent, setIndent] = useState<Indent>('2');
  const [keepBlank, setKeepBlank] = useState(true);
  const [spaceParen, setSpaceParen] = useState(false);
  const [brace, setBrace] = useState<Brace>('collapse');
  const deferred = useDeferredValue(input);

  // js-beautify never throws: broken JS comes back indented as best it can.
  const out = useMemo(
    () =>
      deferred.trim()
        ? beautifyJs(deferred, {
            indent_size: indent === '4' ? 4 : 2,
            indent_with_tabs: indent === 'tab',
            preserve_newlines: keepBlank,
            max_preserve_newlines: 2,
            space_in_paren: spaceParen,
            brace_style: brace,
          })
        : '',
    [deferred, indent, keepBlank, spaceParen, brace]
  );

  return (
    <ToolPage id="js_formatter">
      <Panel
        title="Beautify"
        actions={
          <>
            <Segmented
              size="sm"
              label="Indent"
              value={indent}
              onChange={setIndent}
              options={[
                { value: '2', label: '2' },
                { value: '4', label: '4' },
                { value: 'tab', label: 'Tab' },
              ]}
            />
            <Select aria-label="Brace style" value={brace} onChange={(e) => setBrace(e.target.value as Brace)} className="w-auto">
              <option value="collapse">Braces: collapse</option>
              <option value="expand">Braces: expand</option>
              <option value="end-expand">Braces: end-expand</option>
            </Select>
            <Checkbox label="Keep blank lines" checked={keepBlank} onChange={(e) => setKeepBlank(e.target.checked)} className="px-2" />
            <Checkbox label="Space in parens" checked={spaceParen} onChange={(e) => setSpaceParen(e.target.checked)} className="px-2" />
            <ClearButton onClick={clearSource} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="JavaScript or JSON" htmlFor="js-input">
            <TextArea
              id="js-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'function add(a,b){return a+b}const x={a:1,b:[2,3]}'}
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept=".js,.mjs,.cjs,.ts,.json,text/javascript" label="Load a file" file={file} onFile={loadFile} onClear={clearSource} />
          </Field>
          <Output label="Formatted" value={out} rows={12} fileName={`${fileBase || 'script'}.js`} mime="text/javascript" />
        </TwoPane>
        {out && (
          <p className="mt-3 font-mono text-xs tabular-nums text-muted">
            {formatSize(bytes(deferred))} → {formatSize(bytes(out))}
          </p>
        )}
      </Panel>
    </ToolPage>
  );
}
