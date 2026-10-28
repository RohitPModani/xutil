import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, CopyButton, EmptyState, Field, Input, Panel, Segmented } from '../../ui';
import { PORT_GROUPS, portRange, type PortRange } from '../../data/portNumbers';

type View = 'all' | PortRange;

const TH = 'sticky top-12 z-10 bg-panel px-3 py-2 font-medium';
const RANGE_LABEL: Record<PortRange, string> = { system: 'System', registered: 'Registered', dynamic: 'Dynamic' };

export default function PortNumbers() {
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<View>('all');

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return PORT_GROUPS.map((g) => ({
      ...g,
      rows: g.rows.filter(
        (r) =>
          (view === 'all' || portRange(r.port) === view) &&
          (!q || String(r.port).startsWith(q) || r.service.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
      ),
    })).filter((g) => g.rows.length > 0);
  }, [filter, view]);

  return (
    <ToolPage id="port_numbers">
      <Panel title="Find" actions={<ClearButton onClick={() => setFilter('')} disabled={!filter} />}>
        <Field label="Filter" htmlFor="port-filter" hint="Matches the port number, the service name or the description.">
          <Input
            id="port-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setFilter('')}
            placeholder="443, postgres, kafka"
            autoFocus
          />
        </Field>
        <Segmented
          className="mt-3"
          label="Range"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: 'all', label: 'All' },
            { value: 'system', label: 'System (0–1023)' },
            { value: 'registered', label: 'Registered (1024–49151)' },
            { value: 'dynamic', label: 'Dynamic (49152+)' },
          ]}
        />
      </Panel>

      {groups.length === 0 && (
        <Panel>
          <EmptyState>No ports match “{filter}”</EmptyState>
        </Panel>
      )}

      {groups.map((g) => (
        <Panel key={g.name} title={g.name} bodyClassName="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className={TH}>Port</th>
                <th scope="col" className={TH}>Protocol</th>
                <th scope="col" className={TH}>Service</th>
                <th scope="col" className={`${TH} hidden md:table-cell`}>Description</th>
                <th scope="col" className={`${TH} hidden sm:table-cell`}>Range</th>
                <th scope="col" className={TH}><span className="sr-only">Copy</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {g.rows.map((r) => (
                <tr key={`${r.port}-${r.protocol}`}>
                  <th scope="row" className="px-3 py-1.5 text-left align-top font-mono text-[13px] font-semibold tabular-nums text-ink">
                    {r.port}
                  </th>
                  <td className="px-3 py-1.5 align-top font-mono text-xs text-muted">{r.protocol}</td>
                  <td className="px-3 py-1.5 align-top text-ink">
                    {r.service}
                    <div className="text-xs text-muted md:hidden">{r.description}</div>
                  </td>
                  <td className="hidden px-3 py-1.5 align-top text-muted md:table-cell">{r.description}</td>
                  <td className="hidden whitespace-nowrap px-3 py-1.5 align-top text-xs text-muted sm:table-cell">{RANGE_LABEL[portRange(r.port)]}</td>
                  <td className="px-1 py-0.5 text-right align-top">
                    <CopyButton text={String(r.port)} label={`Copy ${r.port}`} compact />
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
