import { useDeferredValue, useMemo, useState } from 'react';
import { Marked } from 'marked';
import DOMPurify from 'dompurify';
import ToolPage from '../../components/ToolPage';
import { ClearButton, DownloadButton, EmptyState, Field, Output, Panel, TextArea, TwoPane } from '../../ui';

// Own instances, so neither library's global state is touched for other pages.
const marked = new Marked({ gfm: true, breaks: true });
const purify = DOMPurify();
purify.addHook('afterSanitizeAttributes', (node) => {
  // Preview links must not navigate the app away.
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const render = (md: string) => purify.sanitize(marked.parse(md, { async: false }), { FORBID_TAGS: ['style', 'form'] });

export default function MarkdownPreviewer() {
  const [input, setInput] = useState('');
  const deferred = useDeferredValue(input);

  const html = useMemo(() => (deferred ? render(deferred) : ''), [deferred]);

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
              autoSize={input.length < 200_000}
            />
          </Field>
          <Output
            label="Preview"
            copyText={html}
            actions={
              <DownloadButton content={html && `<!doctype html><meta charset="utf-8">\n${html}`} fileName="preview.html" mime="text/html" compact />
            }
          >
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
