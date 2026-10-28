import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, CopyButton, EmptyState, Field, Input, Panel } from '../../ui';
import { HTTP_STATUS_CLASSES } from '../../data/httpStatusCodes';

const TH = 'sticky top-12 z-10 bg-panel px-3 py-2 font-medium';

function Tag({ children }: { children: string }) {
  return (
    <span className="ml-1.5 inline-block rounded border border-line px-1 align-middle text-[10px] font-medium uppercase tracking-wide text-muted">
      {children}
    </span>
  );
}

export default function HttpStatusCodes() {
  const [filter, setFilter] = useState('');

  const classes = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return HTTP_STATUS_CLASSES;
    return HTTP_STATUS_CLASSES.map((c) => ({
      ...c,
      codes: c.codes.filter(
        (s) =>
          String(s.code).startsWith(q) ||
          s.phrase.toLowerCase().includes(q) ||
          s.meaning.toLowerCase().includes(q) ||
          s.note.toLowerCase().includes(q) ||
          s.rfc.toLowerCase().includes(q)
      ),
    })).filter((c) => c.codes.length > 0);
  }, [filter]);

  return (
    <ToolPage id="http_status_codes">
      <Panel title="Find" actions={<ClearButton onClick={() => setFilter('')} disabled={!filter} />}>
        <Field label="Filter" htmlFor="http-filter" hint="Matches the code, reason phrase, meaning or RFC.">
          <Input
            id="http-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setFilter('')}
            placeholder="404, redirect, rate limit"
            autoFocus
          />
        </Field>
      </Panel>

      {classes.length === 0 && (
        <Panel>
          <EmptyState>No status codes match “{filter}”</EmptyState>
        </Panel>
      )}

      {classes.map((c) => (
        <Panel key={c.range} title={`${c.range} ${c.name}`} bodyClassName="p-0">
          <p className="px-4 py-2.5 text-sm text-muted">{c.description}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className={TH}>Code</th>
                <th scope="col" className={TH}>Meaning</th>
                <th scope="col" className={`${TH} hidden md:table-cell`}>Notes</th>
                <th scope="col" className={`${TH} hidden lg:table-cell`}>Spec</th>
                <th scope="col" className={TH}><span className="sr-only">Copy</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {c.codes.map((s) => (
                <tr key={s.code} className={s.deprecated ? 'text-muted' : undefined}>
                  <th scope="row" className="whitespace-nowrap px-3 py-1.5 text-left align-top font-mono text-[13px] font-semibold tabular-nums text-ink">
                    {s.code}
                  </th>
                  <td className="px-3 py-1.5 align-top text-ink">
                    <span className="font-medium">{s.phrase}</span>
                    {s.cacheable && <Tag>cacheable</Tag>}
                    {s.deprecated && <Tag>deprecated</Tag>}
                    {s.unofficial && <Tag>unofficial</Tag>}
                    <div className="text-muted">{s.meaning}</div>
                    <div className="mt-0.5 text-xs text-muted md:hidden">
                      {s.note} <span className="font-mono">{s.rfc}</span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-1.5 align-top text-muted md:table-cell">{s.note}</td>
                  <td className="hidden whitespace-nowrap px-3 py-1.5 align-top font-mono text-xs text-muted lg:table-cell">{s.rfc}</td>
                  <td className="px-1 py-0.5 text-right align-top">
                    <CopyButton text={`${s.code} ${s.phrase}`} label={`Copy ${s.code} ${s.phrase}`} compact />
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
