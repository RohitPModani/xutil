import { useDeferredValue, useMemo, useState } from 'react';
import TurndownService from 'turndown';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, FileDrop, Output, Panel, Segmented, Select, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { useSourceText } from '../../hooks/useSourceText';

type Heading = 'atx' | 'setext';
type Bullet = '-' | '*' | '+';
type Code = 'fenced' | 'indented';

function createService(headingStyle: Heading, bulletListMarker: Bullet, codeBlockStyle: Code): TurndownService {
  const service = new TurndownService({ headingStyle, bulletListMarker, codeBlockStyle });
  // Whole documents are common input; drop what is not content.
  service.remove(['script', 'style', 'head', 'title', 'noscript']);
  // Core turndown flattens tables to text. Emit a GFM pipe table when the grid is regular.
  service.addRule('table', {
    filter: 'table',
    replacement(content, node) {
      const rows = Array.from((node as HTMLTableElement).rows).map((tr) => Array.from(tr.cells));
      const width = rows[0]?.length ?? 0;
      if (!width || rows.some((r) => r.length !== width)) return `\n\n${content}\n\n`;
      const cell = (td: HTMLTableCellElement) => service.turndown(td.innerHTML).replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim();
      const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
      const [head, ...body] = rows.map((r) => r.map(cell));
      return `\n\n${[line(head), line(head.map(() => '---')), ...body.map(line)].join('\n')}\n\n`;
    },
  });
  return service;
}

export default function HtmlToMarkdown() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [heading, setHeading] = useState<Heading>('atx');
  const [bullet, setBullet] = useState<Bullet>('-');
  const [code, setCode] = useState<Code>('fenced');
  const deferred = useDeferredValue(input);

  const service = useMemo(() => createService(heading, bullet, code), [heading, bullet, code]);

  const result = useMemo(() => {
    if (!deferred.trim()) return { out: '', error: '' };
    try {
      return { out: service.turndown(deferred), error: '' };
    } catch (e) {
      return { out: '', error: getErrorMessage(e, 'Could not convert this HTML.') };
    }
  }, [deferred, service]);

  return (
    <ToolPage id="html_to_markdown">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Heading style"
              value={heading}
              onChange={setHeading}
              options={[
                { value: 'atx', label: '# Heading' },
                { value: 'setext', label: 'Underlined' },
              ]}
            />
            <Select aria-label="Bullet marker" className="w-auto" value={bullet} onChange={(e) => setBullet(e.target.value as Bullet)}>
              <option value="-">- bullets</option>
              <option value="*">* bullets</option>
              <option value="+">+ bullets</option>
            </Select>
            <Segmented
              size="sm"
              label="Code blocks"
              value={code}
              onChange={setCode}
              options={[
                { value: 'fenced', label: 'Fenced ```' },
                { value: 'indented', label: 'Indented' },
              ]}
            />
            <ClearButton onClick={clearSource} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="HTML" htmlFor="html-input" error={result.error || undefined}>
            <TextArea
              id="html-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'<h1>Title</h1>\n<p>Some <strong>bold</strong> text and a <a href="https://example.com">link</a>.</p>'}
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept=".html,.htm,text/html" label="Load a file" file={file} onFile={loadFile} onClear={clearSource} />
          </Field>
          <Output label="Markdown" value={result.out} rows={12} fileName={`${fileBase || 'converted'}.md`} mime="text/markdown" />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
