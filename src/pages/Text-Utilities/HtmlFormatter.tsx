import { useDeferredValue, useMemo, useState } from 'react';
import { html as beautifyHtml } from 'js-beautify';
import ToolPage from '../../components/ToolPage';
import { Checkbox, ClearButton, Field, FileDrop, formatSize, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { useSourceText } from '../../hooks/useSourceText';

type Mode = 'pretty' | 'min';
type Indent = '2' | '4' | 'tab';

/** Elements whose surrounding whitespace never renders, so it can go. */
const BLOCK = new Set(
  '!doctype html head body title meta link base style script noscript template div p ul ol li dl dt dd table caption thead tbody tfoot tr td th colgroup col section article header footer nav main aside h1 h2 h3 h4 h5 h6 form fieldset legend hr br pre blockquote figure figcaption address details summary dialog option optgroup'.split(' ')
);

// Comments, verbatim blocks (closing tag matched by back-reference), tags, text, a stray "<".
const TOKEN = /<!--[\s\S]*?-->|<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]*>|[^<]+|</gi;
// Not \s: that would also eat literal non-breaking spaces.
const WS = /[ \t\r\n\f]/;

const tagName = (tag: string) => /^<\/?([a-z][\w:-]*|!doctype)/i.exec(tag)?.[1].toLowerCase() ?? '';

/** Collapses whitespace inside a tag, outside quoted attribute values. */
function squashTag(tag: string): string {
  let out = '';
  let quote = '';
  for (const c of tag) {
    if (quote) {
      out += c;
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") {
      quote = c;
      out += c;
    } else if (WS.test(c)) {
      if (!out.endsWith(' ')) out += ' ';
    } else out += c;
  }
  return out.replace(/ >$/, '>');
}

type Tok = { t: 'raw' | 'tag' | 'text'; v: string; block: boolean };

/**
 * Conservative minifier: drops comments (except conditional ones) and
 * formatting whitespace next to block-level tags, collapses other runs to a
 * single space, and leaves pre, textarea, script and style untouched.
 */
function minifyHtml(html: string): string {
  const toks: Tok[] = [];
  for (const m of html.matchAll(TOKEN)) {
    const v = m[0];
    if (v.startsWith('<!--')) {
      if (/^<!--(\[if|<!\[endif\])/i.test(v)) toks.push({ t: 'raw', v, block: true });
    } else if (m[1]) toks.push({ t: 'raw', v, block: m[1].toLowerCase() !== 'textarea' });
    else if (v.startsWith('<') && v.endsWith('>')) toks.push({ t: 'tag', v: squashTag(v), block: BLOCK.has(tagName(v)) });
    else if (toks[toks.length - 1]?.t === 'text') toks[toks.length - 1].v += v;
    else toks.push({ t: 'text', v, block: false });
  }
  const edge = (n: Tok | undefined) => !n || n.block;
  return toks
    .map((tok, i) => {
      if (tok.t !== 'text') return tok.v;
      let v = tok.v.replace(/[ \t\r\n\f]+/g, ' ');
      if (edge(toks[i - 1])) v = v.trimStart();
      if (edge(toks[i + 1])) v = v.trimEnd();
      return v;
    })
    .join('');
}

const bytes = (s: string) => new TextEncoder().encode(s).length;

export default function HtmlFormatter() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [mode, setMode] = useState<Mode>('pretty');
  const [indent, setIndent] = useState<Indent>('2');
  const [keepBlank, setKeepBlank] = useState(false);
  const deferred = useDeferredValue(input);

  const out = useMemo(() => {
    if (!deferred.trim()) return '';
    if (mode === 'min') return minifyHtml(deferred);
    return beautifyHtml(deferred, {
      indent_size: indent === '4' ? 4 : 2,
      indent_with_tabs: indent === 'tab',
      preserve_newlines: keepBlank,
      max_preserve_newlines: 1,
      wrap_line_length: 0,
    });
  }, [deferred, mode, indent, keepBlank]);

  const before = bytes(deferred);
  const after = bytes(out);
  const saved = before ? Math.round(((before - after) / before) * 100) : 0;

  return (
    <ToolPage id="html_formatter">
      <Panel
        title={mode === 'min' ? 'Minify' : 'Beautify'}
        actions={
          <>
            <Segmented
              size="sm"
              label="Mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'pretty', label: 'Beautify' },
                { value: 'min', label: 'Minify' },
              ]}
            />
            {mode === 'pretty' && (
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
                <Checkbox label="Keep blank lines" checked={keepBlank} onChange={(e) => setKeepBlank(e.target.checked)} className="px-2" />
              </>
            )}
            <ClearButton onClick={clearSource} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="HTML" htmlFor="html-input">
            <TextArea
              id="html-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'<ul><li><a href="/">Home</a></li><li>About</li></ul>'}
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept=".html,.htm,text/html" label="Load a file" file={file} onFile={loadFile} onClear={clearSource} />
          </Field>
          <Output
            label={mode === 'min' ? 'Minified' : 'Formatted'}
            value={out}
            rows={12}
            wrap={mode !== 'min'}
            fileName={`${fileBase || 'page'}${mode === 'min' ? '.min.html' : '.html'}`}
            mime="text/html"
          />
        </TwoPane>
        {out && (
          <p className="mt-3 font-mono text-xs tabular-nums text-muted">
            {formatSize(before)} → {formatSize(after)}
            {mode === 'min' && ` · ${saved}% smaller`}
          </p>
        )}
      </Panel>
    </ToolPage>
  );
}
