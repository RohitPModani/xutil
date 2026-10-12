import { useMemo, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ToolPage from '../../components/ToolPage';
import { ClearButton, EmptyState, Field, Output, Panel, TextArea, TwoPane } from '../../ui';

marked.setOptions({ gfm: true, breaks: true });

export default function MarkdownPreviewer() {
  const [input, setInput] = useState('');

  const html = useMemo(() => (input ? DOMPurify.sanitize(marked.parse(input, { async: false }) as string) : ''), [input]);

  return (
    <ToolPage id="markdown">
      <Panel title="Preview" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <Field label="Markdown" htmlFor="md-input">
            <TextArea
              id="md-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'# Heading\n\nSome **bold** text and a [link](https://example.com).'}
              rows={14}
              autoFocus
            />
          </Field>
          <Output label="Preview" copyText={html} fileName="preview.html" mime="text/html">
            {html ? (
              <div className="prose-tool thin-scroll max-h-[40rem] overflow-auto px-4 py-3" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <EmptyState>Rendered Markdown appears here</EmptyState>
            )}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
