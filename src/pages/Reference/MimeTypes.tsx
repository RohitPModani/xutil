import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, CopyButton, EmptyState, Field, Input, Panel } from '../../ui';
import { MIME_GROUPS } from '../../data/mimeTypes';

const TH = 'sticky top-12 z-10 bg-panel px-3 py-2 font-medium';

export default function MimeTypes() {
  const [filter, setFilter] = useState('');

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase().replace(/^\./, '');
    if (!q) return MIME_GROUPS;
    return MIME_GROUPS.map((g) => ({
      ...g,
      rows: g.rows.filter((r) => r.ext.includes(q) || r.type.includes(q) || r.description.toLowerCase().includes(q)),
    })).filter((g) => g.rows.length > 0);
  }, [filter]);

  return (
    <ToolPage id="mime_types">
      <Panel title="Find" actions={<ClearButton onClick={() => setFilter('')} disabled={!filter} />}>
        <Field label="Filter" htmlFor="mime-filter" hint="Matches the extension, the MIME type or the description.">
          <Input
            id="mime-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setFilter('')}
            placeholder=".csv, image/, font"
            autoFocus
          />
        </Field>
      </Panel>

      {groups.length === 0 && (
        <Panel>
          <EmptyState>No types match “{filter}”</EmptyState>
        </Panel>
      )}

      {groups.map((g) => (
        <Panel key={g.name} title={g.name} bodyClassName="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className={TH}>Extension</th>
                <th scope="col" className={TH}>MIME type</th>
                <th scope="col" className={`${TH} hidden sm:table-cell`}>Description</th>
                <th scope="col" className={TH}><span className="sr-only">Copy</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {g.rows.map((r) => (
                <tr key={r.ext}>
                  <th scope="row" className="whitespace-nowrap px-3 py-1.5 text-left align-top font-mono text-[13px] font-semibold text-ink">
                    .{r.ext}
                  </th>
                  <td className="break-all px-3 py-1.5 align-top font-mono text-[13px] text-ink">
                    {r.type}
                    {r.note && <div className="mt-0.5 font-sans text-xs text-muted">{r.note}</div>}
                  </td>
                  <td className="hidden px-3 py-1.5 align-top text-muted sm:table-cell">{r.description}</td>
                  <td className="px-1 py-0.5 text-right align-top">
                    <CopyButton text={r.type} label={`Copy ${r.type}`} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ))}
    </ToolPage>
  );
}
