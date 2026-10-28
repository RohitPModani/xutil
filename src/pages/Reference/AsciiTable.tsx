import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Checkbox, ClearButton, CopyButton, EmptyState, Field, Input, Panel, Segmented } from '../../ui';
import { ASCII_TABLE, LATIN1_TABLE, type AsciiRow } from '../../data/asciiTable';

type View = 'all' | 'control' | 'printable';

const TH = 'sticky top-12 z-10 bg-panel px-3 py-2 font-medium';

export default function AsciiTable() {
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<View>('all');
  const [extended, setExtended] = useState(false);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase().replace(/^0x/, '');
    const source = extended ? [...ASCII_TABLE, ...LATIN1_TABLE] : ASCII_TABLE;
    return source.filter((r) => {
      if (view === 'control' && !r.control) return false;
      if (view === 'printable' && r.control) return false;
      if (!q) return true;
      return (
        r.char.toLowerCase() === q ||
        r.name.toLowerCase().includes(q) ||
        r.char.toLowerCase().includes(q) ||
        String(r.code) === q ||
        r.hex.toLowerCase() === q ||
        r.oct === q ||
        r.bin === q ||
        r.entity.toLowerCase().includes(q) ||
        r.escape.toLowerCase() === q
      );
    });
  }, [filter, view, extended]);

  return (
    <ToolPage id="ascii_table">
      <Panel title="Find" actions={<ClearButton onClick={() => setFilter('')} disabled={!filter} />}>
        <Field
          label="Filter"
          htmlFor="ascii-filter"
          hint="Matches the character, its name, or the decimal, hex, octal or binary code."
          actions={<Checkbox label="Extended (128–255)" checked={extended} onChange={(e) => setExtended(e.target.checked)} />}
        >
          <Input
            id="ascii-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setFilter('')}
            placeholder="A, 65, 0x41, space, tab"
            autoFocus
          />
        </Field>
        <Segmented
          className="mt-3"
          label="Show"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: 'all', label: 'All' },
            { value: 'control', label: 'Control' },
            { value: 'printable', label: 'Printable' },
          ]}
        />
      </Panel>

      {rows.length === 0 ? (
        <Panel>
          <EmptyState>No characters match “{filter}”</EmptyState>
        </Panel>
      ) : (
        <Panel title={extended ? 'ASCII and Latin-1' : 'ASCII'} bodyClassName="thin-scroll overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className={TH}>Dec</th>
                <th scope="col" className={TH}>Hex</th>
                <th scope="col" className={TH}>Oct</th>
                <th scope="col" className={TH}>Bin</th>
                <th scope="col" className={TH}>Char</th>
                <th scope="col" className={TH}>Name</th>
                <th scope="col" className={TH}>HTML</th>
                <th scope="col" className={TH}>Escape</th>
                <th scope="col" className={TH}><span className="sr-only">Copy</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {rows.map((r) => (
                <Row key={r.code} row={r} />
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </ToolPage>
  );
}

const TD = 'px-3 py-1 font-mono text-[13px] tabular-nums text-ink';

function Row({ row }: { row: AsciiRow }) {
  return (
    <tr>
      <td className={TD}>{row.code}</td>
      <td className={TD}>{row.hex}</td>
      <td className={TD}>{row.oct}</td>
      <td className={TD}>{row.bin}</td>
      <td className={`${TD} ${row.control ? 'text-muted' : 'font-semibold'}`}>{row.char}</td>
      <td className="px-3 py-1 text-ink">{row.name}</td>
      <td className={TD}>{row.entity}</td>
      <td className={TD}>{row.escape}</td>
      <td className="px-1 py-0.5 text-right">
        <CopyButton text={row.control ? String(row.code) : row.char} label={row.control ? `Copy ${row.code}` : `Copy ${row.char}`} compact />
      </td>
    </tr>
  );
}
