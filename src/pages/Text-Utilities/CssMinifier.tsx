import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, FileDrop, formatSize, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { useSourceText } from '../../hooks/useSourceText';

type Mode = 'min' | 'pretty';
type Indent = '2' | '4';

type CssToken = { t: 'word' | 'str' | 'url' | 'comment' | 'ws' | 'punct'; v: string };

const PUNCT = '{};:,>()!';

/**
 * Splits CSS into tokens. Strings and unquoted url() arguments are single
 * tokens kept verbatim, so a ';' or '}' inside them never reads as structure.
 */
function scanCss(css: string): CssToken[] {
  const toks: CssToken[] = [];
  const n = css.length;
  let i = 0;
  let word = '';
  const flushWord = () => {
    if (word) toks.push({ t: 'word', v: word });
    word = '';
  };
  const stringEnd = (from: number) => {
    const q = css[from];
    let j = from + 1;
    while (j < n && css[j] !== q && css[j] !== '\n') j += css[j] === '\\' ? 2 : 1;
    return Math.min(j + 1, n);
  };
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      flushWord();
      const at = css.indexOf('*/', i + 2);
      const end = at === -1 ? n : at + 2;
      toks.push({ t: 'comment', v: css.slice(i, end) });
      i = end;
    } else if (c === '"' || c === "'") {
      flushWord();
      const end = stringEnd(i);
      toks.push({ t: 'str', v: css.slice(i, end) });
      i = end;
    } else if (c === '(' && /(^|[^\w-])url$/i.test(word)) {
      word = word.slice(0, -3);
      flushWord();
      let j = i + 1;
      while (j < n && /\s/.test(css[j])) j++;
      if (css[j] === '"' || css[j] === "'") j = stringEnd(j);
      const at = css.indexOf(')', j);
      const end = at === -1 ? n : at + 1;
      toks.push({ t: 'url', v: `url(${css.slice(i + 1, end - 1).trim()})` });
      i = end;
    } else if (/\s/.test(c)) {
      flushWord();
      if (toks[toks.length - 1]?.t !== 'ws') toks.push({ t: 'ws', v: ' ' });
      i++;
    } else if (PUNCT.includes(c)) {
      flushWord();
      toks.push({ t: 'punct', v: c });
      i++;
    } else {
      word += c;
      i++;
    }
  }
  flushWord();
  return toks;
}

function minifyCss(css: string): string {
  const toks = scanCss(css).filter((t) => t.t !== 'comment' || t.v.startsWith('/*!'));
  let out = '';
  toks.forEach(({ t, v }, k) => {
    if (t === 'ws') {
      const prev = out[out.length - 1];
      const next = toks[k + 1];
      // A space before "(" stays: "@media screen and (" needs it.
      if (!prev || !next || '{};:,>(!'.includes(prev) || out.endsWith('*/') || (next.t === 'punct' && '{};:,>)!'.includes(next.v))) return;
      out += ' ';
    } else if (t === 'punct' && v === ';') {
      if (out && !/[{;]$/.test(out)) out += ';';
    } else if (t === 'punct' && v === '}') {
      out = out.replace(/[; ]+$/, '') + '}';
    } else out += v;
  });
  return out.trim();
}

function beautifyCss(css: string, indent: string): string {
  const lines: string[] = [];
  let depth = 0;
  let buf = '';
  let colon = -1;
  let paren = 0;
  let commas: number[] = [];
  const pad = () => indent.repeat(depth);
  const reset = () => {
    buf = '';
    colon = -1;
    paren = 0;
    commas = [];
  };
  const dropBlank = () => {
    while (lines[lines.length - 1] === '') lines.pop();
  };
  const flushDecl = () => {
    if (buf.trim()) {
      const s = colon > -1 ? `${buf.slice(0, colon).trimEnd()}: ${buf.slice(colon + 1).trimStart()}` : buf;
      lines.push(`${pad()}${s.trim()};`);
    }
    reset();
  };

  for (const { t, v } of scanCss(css)) {
    if (t === 'comment') {
      if (buf.trim()) buf = `${buf.trimEnd()} ${v} `;
      else lines.push(pad() + v);
    } else if (t === 'ws') {
      if (buf && !/[ (!]$/.test(buf)) buf += ' ';
    } else if (t !== 'punct') {
      buf += v;
    } else if (v === '{') {
      // Selector lists go one per line; at-rule preludes stay whole.
      const cuts = buf.trimStart().startsWith('@') ? [] : commas;
      const parts: string[] = [];
      let from = 0;
      for (const c of cuts) {
        parts.push(buf.slice(from, c));
        from = c + 1;
      }
      parts.push(buf.slice(from));
      parts.forEach((p, idx) => lines.push(`${pad()}${p.trim()}${idx < parts.length - 1 ? ',' : ' {'}`));
      depth++;
      reset();
    } else if (v === '}') {
      flushDecl();
      if (depth) depth--;
      dropBlank();
      lines.push(`${pad()}}`, '');
    } else if (v === ';') {
      flushDecl();
    } else if (v === ':') {
      if (colon === -1 && paren === 0) colon = buf.length;
      buf += paren > 0 && buf.startsWith('@') ? ': ' : ':';
    } else if (v === ',') {
      buf = `${buf.trimEnd()},`;
      if (paren === 0) commas.push(buf.length - 1);
      buf += ' ';
    } else if (v === '(') {
      paren++;
      buf += '(';
    } else if (v === ')') {
      paren = Math.max(0, paren - 1);
      buf = `${buf.trimEnd()})`;
    } else if (v === '>') {
      buf = `${buf.trimEnd()} > `;
    } else {
      buf = `${buf.trimEnd()} !`;
    }
  }
  flushDecl();
  dropBlank();
  return lines.join('\n');
}

const bytes = (s: string) => new TextEncoder().encode(s).length;

export default function CssMinifier() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [mode, setMode] = useState<Mode>('min');
  const [indent, setIndent] = useState<Indent>('2');
  const deferred = useDeferredValue(input);

  const out = useMemo(() => {
    if (!deferred.trim()) return '';
    return mode === 'min' ? minifyCss(deferred) : beautifyCss(deferred, ' '.repeat(Number(indent)));
  }, [deferred, mode, indent]);

  const before = bytes(deferred);
  const after = bytes(out);
  const saved = before ? Math.round(((before - after) / before) * 100) : 0;

  return (
    <ToolPage id="css_minifier">
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
                { value: 'min', label: 'Minify' },
                { value: 'pretty', label: 'Beautify' },
              ]}
            />
            {mode === 'pretty' && (
              <Segmented
                size="sm"
                label="Indent"
                value={indent}
                onChange={setIndent}
                options={[
                  { value: '2', label: '2 spaces' },
                  { value: '4', label: '4 spaces' },
                ]}
              />
            )}
            <ClearButton onClick={clearSource} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="CSS" htmlFor="css-input">
            <TextArea
              id="css-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'.card {\n  color: #333;\n  margin: 0 auto;\n}'}
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept=".css,text/css" label="Load a file" file={file} onFile={loadFile} onClear={clearSource} />
          </Field>
          <Output
            label={mode === 'min' ? 'Minified' : 'Formatted'}
            value={out}
            rows={12}
            wrap={mode !== 'min'}
            fileName={`${fileBase || 'styles'}${mode === 'min' ? '.min.css' : '.css'}`}
            mime="text/css"
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
