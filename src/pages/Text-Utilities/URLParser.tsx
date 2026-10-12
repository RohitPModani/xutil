import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, EmptyState, Field, Input, KeyValueList, Output, Panel, TwoPane } from '../../ui';

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export default function URLParser() {
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const url = new URL(input.trim());
      const parts = [
        { label: 'Protocol', value: url.protocol },
        // Opaque origins (mailto:, custom schemes) serialise as the string "null".
        { label: 'Origin', value: url.origin === 'null' ? '' : url.origin },
        { label: 'Host', value: url.host },
        { label: 'Hostname', value: url.hostname },
        { label: 'Port', value: url.port },
        { label: 'Path', value: url.pathname },
        { label: 'Decoded path', value: decode(url.pathname) },
        { label: 'Query', value: url.search },
        { label: 'Fragment', value: url.hash },
        ...(url.username ? [{ label: 'Username', value: url.username }] : []),
        ...(url.password ? [{ label: 'Password', value: url.password }] : []),
      ];
      const params = [...url.searchParams].map(([k, v]) => ({ label: k, value: v }));
      return { parts, params, error: '' };
    } catch {
      return { parts: [], params: [], error: 'Not a valid URL. Include the scheme, for example https://.' };
    }
  }, [input]);

  const asText = (items: { label: string; value: string }[]) => items.map((i) => `${i.label}: ${i.value}`).join('\n');

  return (
    <ToolPage id="url_parser">
      <Panel title="Parse" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <Field label="URL" htmlFor="url-input" error={result?.error || undefined}>
          <Input
            id="url-input"
            type="url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com:8080/path/to/page?q=search&page=2#top"
            autoFocus
          />
        </Field>

        {result && !result.error && (
          <TwoPane className="mt-4">
            <Output label="Parts" copyText={asText(result.parts)}>
              <KeyValueList items={result.parts} />
            </Output>
            <Output label={`Query parameters · ${result.params.length}`} copyText={asText(result.params)}>
              {result.params.length > 0 ? <KeyValueList items={result.params} /> : <EmptyState>No query parameters</EmptyState>}
            </Output>
          </TwoPane>
        )}
      </Panel>
    </ToolPage>
  );
}
