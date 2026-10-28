import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, FileDrop, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { useSourceText } from '../../hooks/useSourceText';

type Mode = '2' | '4' | 'tab' | 'min';

const INDENT: Record<Exclude<Mode, 'min'>, string> = { '2': '  ', '4': '    ', tab: '\t' };

/**
 * Tokens of the raw markup. Tags, comments, CDATA, processing instructions
 * and the DOCTYPE are kept verbatim, so attribute order, quoting and entity
 * references survive untouched. Only run on input DOMParser has accepted.
 */
type XmlToken = { kind: 'open' | 'close' | 'self' | 'text' | 'other'; raw: string };

/** Index just past the `>` that closes the markup starting at `i`, honouring quotes and DOCTYPE subsets. */
function markupEnd(text: string, i: number): number {
  let quote = '';
  let bracket = 0;
  for (let j = i + 1; j < text.length; j++) {
    const c = text[j];
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '[') bracket++;
    else if (c === ']') bracket--;
    else if (c === '>' && bracket <= 0) return j + 1;
  }
  return text.length;
}

function tokenizeXml(text: string): XmlToken[] {
  const tokens: XmlToken[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] !== '<') {
      const next = text.indexOf('<', i);
      const end = next === -1 ? text.length : next;
      tokens.push({ kind: 'text', raw: text.slice(i, end) });
      i = end;
      continue;
    }
    let end: number;
    let kind: XmlToken['kind'] = 'other';
    const closer = text.startsWith('<!--', i) ? '-->' : text.startsWith('<![CDATA[', i) ? ']]>' : text.startsWith('<?', i) ? '?>' : '';
    if (closer) {
      const at = text.indexOf(closer, i + 2);
      end = at === -1 ? text.length : at + closer.length;
    } else {
      end = markupEnd(text, i);
      if (text[i + 1] !== '!') {
        const raw = text.slice(i, end);
        kind = raw.startsWith('</') ? 'close' : raw.endsWith('/>') ? 'self' : 'open';
      }
    }
    tokens.push({ kind, raw: text.slice(i, end) });
    i = end;
  }
  return tokens;
}

type XmlNode = XmlToken | { kind: 'element'; open: string; close: string; children: XmlNode[] };

function buildTree(tokens: XmlToken[]): XmlNode[] {
  const root: XmlNode[] = [];
  const stack: { kind: 'element'; open: string; close: string; children: XmlNode[] }[] = [];
  const top = () => (stack.length ? stack[stack.length - 1].children : root);
  for (const t of tokens) {
    if (t.kind === 'open') {
      const el = { kind: 'element' as const, open: t.raw, close: '', children: [] };
      top().push(el);
      stack.push(el);
    } else if (t.kind === 'close') {
      const el = stack.pop();
      if (el) el.close = t.raw;
      else root.push(t);
    } else top().push(t);
  }
  return root;
}

const isBlank = (n: XmlNode) => n.kind === 'text' && !n.raw.trim();
const hasText = (nodes: XmlNode[]) => nodes.some((n) => (n.kind === 'text' && n.raw.trim()) || (n.kind === 'other' && n.raw.startsWith('<![CDATA[')));

/** Mixed content stays on one line: text keeps its words, whitespace runs collapse to a space. */
function inline(nodes: XmlNode[]): string {
  return nodes
    .map((n) => {
      if (n.kind === 'element') return n.open + inline(n.children) + n.close;
      return n.kind === 'text' ? n.raw.replace(/\s+/g, ' ') : n.raw;
    })
    .join('');
}

function render(nodes: XmlNode[], indent: string, depth: number, out: string[]) {
  const pad = indent.repeat(depth);
  for (const n of nodes) {
    if (isBlank(n)) continue;
    if (n.kind !== 'element') {
      out.push(pad + n.raw.trim());
    } else if (!n.children.length || hasText(n.children)) {
      out.push(pad + n.open + inline(n.children).trim() + n.close);
    } else {
      out.push(pad + n.open);
      render(n.children, indent, depth + 1, out);
      out.push(pad + n.close);
    }
  }
}

function formatXml(text: string, indent: string): string {
  const out: string[] = [];
  render(buildTree(tokenizeXml(text)), indent, 0, out);
  return out.join('\n');
}

function minifyXml(text: string): string {
  return tokenizeXml(text)
    .filter((t) => !isBlank(t))
    .map((t) => (t.kind === 'text' ? t.raw.replace(/\s+/g, ' ') : t.raw))
    .join('');
}

/** The browser's parsererror text, reduced to "Line n, column m: reason". */
function xmlError(doc: Document): string {
  const el = doc.getElementsByTagName('parsererror')[0];
  if (!el) return '';
  const text = el.textContent ?? '';
  // Chrome and Safari: "error on line 3 at column 7: Opening and ending tag mismatch: ..."
  let m = text.match(/line (\d+) at column (\d+):\s*([^\n]*)/);
  if (m) return `Line ${m[1]}, column ${m[2]}: ${m[3].trim()}`;
  // Firefox: "XML Parsing Error: mismatched tag. ...\nLocation: ...\nLine Number 3, Column 7:"
  m = text.match(/XML Parsing Error: ([^\n]*)[\s\S]*Line Number (\d+), Column (\d+)/);
  if (m) return `Line ${m[2]}, column ${m[3]}: ${m[1].trim()}`;
  return text.replace(/\s+/g, ' ').trim() || 'Not well-formed XML.';
}

export default function XmlFormatter() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [mode, setMode] = useState<Mode>('2');
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred.trim()) return { out: '', error: '' };
    const error = xmlError(new DOMParser().parseFromString(deferred, 'application/xml'));
    if (error) return { out: '', error };
    return { out: mode === 'min' ? minifyXml(deferred) : formatXml(deferred, INDENT[mode]), error: '' };
  }, [deferred, mode]);

  return (
    <ToolPage id="xml_formatter">
      <Panel
        title="Format"
        actions={
          <>
            <Segmented
              size="sm"
              label="Indent"
              value={mode}
              onChange={setMode}
              options={[
                { value: '2', label: '2 spaces' },
                { value: '4', label: '4 spaces' },
                { value: 'tab', label: 'Tab' },
                { value: 'min', label: 'Minify' },
              ]}
            />
            <ClearButton onClick={clearSource} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="XML" htmlFor="xml-input" error={result.error || undefined}>
            <TextArea
              id="xml-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'<note><to>Ada</to><body>Hello</body></note>'}
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept=".xml,text/xml,application/xml" label="Load a file" file={file} onFile={loadFile} onClear={clearSource} />
          </Field>
          <Output
            label={mode === 'min' ? 'Minified' : 'Formatted'}
            value={result.out}
            rows={12}
            wrap={mode !== 'min'}
            fileName={`${fileBase || 'formatted'}.xml`}
            mime="application/xml"
          />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
