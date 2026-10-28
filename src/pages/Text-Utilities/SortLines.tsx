import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Checkbox, ClearButton, Field, Output, Panel, Segmented, TextArea, Toolbar, TwoPane } from '../../ui';

/* ---- Sorting (pure; exercised by scripts/check-calc.mjs) --------------- */

type Order = 'alpha' | 'natural' | 'numeric' | 'length' | 'random' | 'reverse';

interface SortOptions {
  order: Order;
  descending: boolean;
  caseSensitive: boolean;
  unique: boolean;
  trim: boolean;
}

const LEADING_NUMBER = /^\s*[-+]?(?:\d+\.?\d*|\.\d+)/;

function sortLines(text: string, { order, descending, caseSensitive, unique, trim }: SortOptions): string[] {
  let lines = text.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  if (trim) lines = lines.map((l) => l.trim());
  if (unique) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const key = caseSensitive ? l : l.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const sensitivity = caseSensitive ? 'variant' : 'base';
  if (order === 'alpha') {
    if (caseSensitive) lines.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    else lines.sort(new Intl.Collator(undefined, { sensitivity }).compare);
  } else if (order === 'natural') {
    lines.sort(new Intl.Collator(undefined, { numeric: true, sensitivity }).compare);
  } else if (order === 'numeric') {
    // Lines without a leading number sort last, in their original order.
    const key = (l: string) => {
      const m = LEADING_NUMBER.exec(l);
      return m ? Number(m[0]) : Infinity;
    };
    lines.sort((a, b) => key(a) - key(b));
  } else if (order === 'length') {
    lines.sort((a, b) => a.length - b.length);
  } else if (order === 'random') {
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
  } else {
    lines.reverse();
  }
  if (descending) lines.reverse();
  return lines;
}

/* ---- Page ---------------------------------------------------------------- */

const ORDERS: { value: Order; label: string }[] = [
  { value: 'alpha', label: 'Alphabetical' },
  { value: 'natural', label: 'Natural' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'length', label: 'Length' },
  { value: 'random', label: 'Shuffle' },
  { value: 'reverse', label: 'Reverse' },
];

const HINTS: Record<Order, string> = {
  alpha: 'A to Z by character.',
  natural: 'Numbers inside text compare by value, so item2 comes before item10.',
  numeric: 'By the number each line starts with; other lines go last.',
  length: 'Shortest line first.',
  random: 'A new shuffle on every change.',
  reverse: 'Last line first.',
};

export default function SortLines() {
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<Order>('alpha');
  const [descending, setDescending] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [unique, setUnique] = useState(false);
  const [trim, setTrim] = useState(false);

  const lines = useMemo(
    () => (input ? sortLines(input, { order, descending, caseSensitive, unique, trim }) : []),
    [input, order, descending, caseSensitive, unique, trim]
  );
  const output = lines.join('\n');

  return (
    <ToolPage id="sort_lines">
      <Panel title="Sort" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <Field label="Order" hint={HINTS[order]}>
          <Segmented label="Order" value={order} onChange={setOrder} options={ORDERS} />
        </Field>
        <Toolbar className="mt-3 gap-x-5">
          <Checkbox label="Descending" checked={descending} onChange={(e) => setDescending(e.target.checked)} />
          <Checkbox label="Case-sensitive" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          <Checkbox label="Remove duplicates" checked={unique} onChange={(e) => setUnique(e.target.checked)} />
          <Checkbox label="Trim lines" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
        </Toolbar>
        <TwoPane className="mt-4">
          <Field label="Lines" htmlFor="sort-input">
            <TextArea
              id="sort-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'banana\napple\ncherry'}
              rows={12}
              stats
              autoFocus
            />
          </Field>
          <Output label={lines.length ? `${lines.length.toLocaleString()} lines` : 'Sorted'} value={output} rows={12} fileName="sorted.txt" />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
