import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, FileDrop, Input, KeyValueList, Output, Panel, TextArea, TwoPane } from '../../ui';
import { describeJsonError } from '../../utils/json';
import { getErrorMessage } from '../../utils/errors';
import { useSourceText } from '../../hooks/useSourceText';

/* ---- JSONPath subset: $ . [] * .. unions and slices; no filters ------- */

type Selector = { type: 'keys'; keys: (string | number)[] } | { type: 'wildcard' } | { type: 'slice'; start?: number; end?: number; step?: number };
interface Segment {
  selector: Selector;
  recursive: boolean;
}
interface Match {
  value: unknown;
  /** Bracket notation, for example `$['store']['books'][0]`. */
  path: string;
}

function fail(msg: string, at: number): never {
  throw new Error(`${msg} at position ${at + 1}`);
}

function readQuoted(s: string, i: number): [string, number] {
  const quote = s[i];
  let out = '';
  for (let j = i + 1; j < s.length; j++) {
    const ch = s[j];
    if (ch === '\\' && j + 1 < s.length) {
      const next = s[++j];
      out += next === 'n' ? '\n' : next === 't' ? '\t' : next;
    } else if (ch === quote) {
      return [out, j + 1];
    } else {
      out += ch;
    }
  }
  return fail('Unterminated string', i);
}

function readBracket(s: string, start: number): [Selector, number] {
  let i = start + 1;
  const skip = () => {
    while (s[i] === ' ') i += 1;
  };
  skip();
  if (s[i] === '?') throw new Error('Filters [?(...)] are not supported');
  if (s[i] === '(') throw new Error('Script expressions [(...)] are not supported');
  if (s[i] === '*') {
    i += 1;
    skip();
    if (s[i] !== ']') fail("Expected ']'", i);
    return [{ type: 'wildcard' }, i + 1];
  }
  if (s[i] === "'" || s[i] === '"') {
    const keys: (string | number)[] = [];
    for (;;) {
      const [key, next] = readQuoted(s, i);
      keys.push(key);
      i = next;
      skip();
      if (s[i] === ']') return [{ type: 'keys', keys }, i + 1];
      if (s[i] !== ',') fail("Expected ',' or ']'", i);
      i += 1;
      skip();
      if (s[i] !== "'" && s[i] !== '"') fail('Expected a quoted name', i);
    }
  }
  const close = s.indexOf(']', i);
  if (close === -1) fail("Expected ']'", s.length);
  const body = s.slice(i, close);
  if (body.includes(':')) {
    const parts = body.split(':').map((p) => p.trim());
    if (parts.length > 3 || body.includes(',')) fail('Expected one slice [start:end:step]', i);
    const nums = parts.map((p, k) => {
      if (p === '') return undefined;
      if (!/^-?\d+$/.test(p)) fail('Expected an integer in the slice', i);
      const n = Number(p);
      if (k === 2 && n === 0) fail('Slice step cannot be 0', i);
      return n;
    });
    return [{ type: 'slice', start: nums[0], end: nums[1], step: nums[2] }, close + 1];
  }
  const keys = body.split(',').map((p) => {
    const t = p.trim();
    if (!/^-?\d+$/.test(t)) fail('Expected an index, a quoted name or *', i);
    return Number(t);
  });
  return [{ type: 'keys', keys }, close + 1];
}

function parsePath(path: string): Segment[] {
  let s = path.trim();
  if (!s) s = '$';
  if (!s.startsWith('$')) s = (s.startsWith('[') || s.startsWith('.') ? '$' : '$.') + s;
  const segments: Segment[] = [];
  let i = 1;
  while (i < s.length) {
    let recursive = false;
    if (s[i] === '.') {
      i += 1;
      if (s[i] === '.') {
        recursive = true;
        i += 1;
      }
      if (s[i] === '[') {
        if (!recursive) fail("Unexpected '[' after '.'", i);
      } else {
        const m = /^[^.[\]]+/.exec(s.slice(i));
        if (!m) fail("Expected a name after '.'", i);
        const name = m[0].trim();
        i += m[0].length;
        segments.push({ recursive, selector: name === '*' ? { type: 'wildcard' } : { type: 'keys', keys: [name] } });
        continue;
      }
    }
    if (s[i] !== '[') fail(`Unexpected '${s[i]}'`, i);
    const [selector, next] = readBracket(s, i);
    segments.push({ recursive, selector });
    i = next;
  }
  return segments;
}

const quoteKey = (k: string) => `['${k.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`;

const isObject = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** Python slice semantics on an array of `len` items, as RFC 9535 specifies. */
function sliceIndexes(len: number, { start, end, step = 1 }: { start?: number; end?: number; step?: number }): number[] {
  const norm = (n: number) => (n < 0 ? n + len : n);
  const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
  const out: number[] = [];
  if (step > 0) {
    const lo = clamp(norm(start ?? 0), 0, len);
    const hi = clamp(norm(end ?? len), 0, len);
    for (let i = lo; i < hi; i += step) out.push(i);
  } else {
    const lo = clamp(norm(start ?? len - 1), -1, len - 1);
    const hi = clamp(norm(end ?? -len - 1), -1, len - 1);
    for (let i = lo; i > hi; i += step) out.push(i);
  }
  return out;
}

function children(node: Match): Match[] {
  if (Array.isArray(node.value)) return node.value.map((value, i) => ({ value, path: `${node.path}[${i}]` }));
  if (isObject(node.value)) return Object.keys(node.value).map((k) => ({ value: (node.value as Record<string, unknown>)[k], path: node.path + quoteKey(k) }));
  return [];
}

function select(node: Match, selector: Selector): Match[] {
  if (selector.type === 'wildcard') return children(node);
  if (selector.type === 'slice') {
    if (!Array.isArray(node.value)) return [];
    const arr = node.value;
    return sliceIndexes(arr.length, selector).map((i) => ({ value: arr[i], path: `${node.path}[${i}]` }));
  }
  const out: Match[] = [];
  for (const key of selector.keys) {
    if (Array.isArray(node.value)) {
      // A numeric key is an index on arrays; a leading `-` counts from the end.
      const n = typeof key === 'number' ? key : /^-?\d+$/.test(key) ? Number(key) : NaN;
      const i = n < 0 ? node.value.length + n : n;
      if (Number.isInteger(i) && i >= 0 && i < node.value.length) out.push({ value: node.value[i], path: `${node.path}[${i}]` });
    } else if (isObject(node.value) && typeof key === 'string' && Object.prototype.hasOwnProperty.call(node.value, key)) {
      out.push({ value: node.value[key], path: node.path + quoteKey(key) });
    }
  }
  return out;
}

/** The node and every descendant, depth first. */
function descendants(node: Match): Match[] {
  const out: Match[] = [];
  const walk = (n: Match) => {
    out.push(n);
    children(n).forEach(walk);
  };
  walk(node);
  return out;
}

function evalJsonPath(root: unknown, path: string): Match[] {
  let nodes: Match[] = [{ value: root, path: '$' }];
  for (const { selector, recursive } of parsePath(path)) {
    const from = recursive ? nodes.flatMap(descendants) : nodes;
    nodes = from.flatMap((n) => select(n, selector));
  }
  return nodes;
}

const SYNTAX = [
  { label: '$', value: 'The root document' },
  { label: ".name  or  ['name']", value: 'Child member of an object' },
  { label: '[0]  [-1]', value: 'Array item by index; negative counts from the end' },
  { label: '*  or  [*]', value: 'Every member or item' },
  { label: '..name  ..*', value: 'Recursive descent: matches at any depth' },
  { label: "[0,2]  ['a','b']", value: 'Union of several indexes or names' },
  { label: '[start:end:step]', value: 'Array slice, end exclusive, Python rules' },
  { label: '[?(expr)]', value: 'Filters are not supported' },
].map((r) => ({ ...r, copy: r.label, mono: false }));

export default function JsonPath() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear } = useSourceText();
  const [path, setPath] = useState('$');
  const deferred = useDeferredValue(input);
  const deferredPath = useDeferredValue(path);

  const doc = useMemo(() => {
    if (!deferred.trim()) return null;
    try {
      return { value: JSON.parse(deferred) as unknown, error: '' };
    } catch (e) {
      return { value: undefined, error: describeJsonError(e, deferred) };
    }
  }, [deferred]);

  const result = useMemo(() => {
    if (!doc || doc.error) return null;
    try {
      return { matches: evalJsonPath(doc.value, deferredPath), error: '' };
    } catch (e) {
      return { matches: [], error: getErrorMessage(e, 'Invalid JSONPath.') };
    }
  }, [doc, deferredPath]);

  const matches = result?.matches ?? [];
  const values = matches.length ? JSON.stringify(matches.map((m) => m.value), null, 2) : '';

  return (
    <ToolPage id="json_path">
      <Panel title="Query" actions={<ClearButton onClick={clear} disabled={!input} />}>
        <TwoPane>
          <Field label="JSON" htmlFor="jp-input" error={doc?.error || undefined}>
            <TextArea
              id="jp-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{"store": {"books": [{"author": "Austen"}, {"author": "Eco"}]}}'}
              rows={14}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-2" accept=".json,application/json" label="Load a file" file={file} onFile={loadFile} onClear={clear} />
          </Field>
          <div className="space-y-4">
            <Field label="JSONPath" htmlFor="jp-path" error={result?.error || undefined}>
              <Input id="jp-path" value={path} onChange={(e) => setPath(e.target.value)} placeholder="$.store.books[*].author" />
            </Field>
            <Output
              label={result && !result.error ? `${matches.length.toLocaleString()} ${matches.length === 1 ? 'match' : 'matches'}` : 'Matches'}
              value={values}
              rows={8}
              fileName={`${fileBase || 'matches'}.json`}
              mime="application/json"
            />
            <Output label="Paths" value={matches.map((m) => m.path).join('\n')} rows={4} placeholder="Normalised path of each match" />
          </div>
        </TwoPane>

        <details className="mt-4 rounded-md border border-line bg-surface">
          <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted">Supported syntax</summary>
          <KeyValueList items={SYNTAX} className="border-t border-line" />
        </details>
      </Panel>
    </ToolPage>
  );
}
