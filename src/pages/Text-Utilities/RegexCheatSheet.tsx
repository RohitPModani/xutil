import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, EmptyState, Field, Input, Panel } from '../../ui';
import { REGEX_CATEGORIES } from '../../data/regexConstants';

export default function RegexCheatSheet() {
  const [filter, setFilter] = useState('');

  const sections = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return REGEX_CATEGORIES.map((c) => ({
      name: c.name,
      items: q ? c.items.filter((i) => i.pattern.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)) : [...c.items],
    })).filter((c) => c.items.length > 0);
  }, [filter]);

  return (
    <ToolPage id="regex_cheatsheet">
      <Panel title="Find" actions={<ClearButton onClick={() => setFilter('')} disabled={!filter} />}>
        <Field label="Filter" htmlFor="re-filter" hint="Matches the token or its description.">
          <Input
            id="re-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setFilter('')}
            placeholder="lookahead, \d, email"
            autoFocus
          />
        </Field>
      </Panel>

      {sections.length === 0 && (
        <Panel>
          <EmptyState>No patterns match “{filter}”</EmptyState>
        </Panel>
      )}

      {sections.map((section) => (
        <Panel key={section.name} title={section.name} bodyClassName="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="px-4 py-2 font-medium">
                  Token
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {section.items.map((item) => (
                <tr key={item.pattern}>
                  <td className="w-1/3 break-all px-4 py-1.5 align-top font-mono text-[13px] text-ink">{item.pattern}</td>
                  <td className="px-4 py-1.5 text-ink">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ))}
    </ToolPage>
  );
}
