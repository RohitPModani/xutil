import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Input, Output, Panel, TextArea, TwoPane } from '../../ui';
import type { JsonObject, JsonValue } from '../../types/json';
import { getErrorMessage } from '../../utils/errors';
import { useSourceText } from '../../hooks/useSourceText';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function jsonToTypescript(jsonData: string, interfaceName: string): string {
  const data = JSON.parse(jsonData);
  const interfaces: string[] = [];
  const seen = new Set<string>();

  function getType(value: JsonValue, key: string): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';
      const types = Array.from(new Set(value.map((item) => getType(item, key))));
      return types.length > 1 ? `(${types.join(' | ')})[]` : `${types[0]}[]`;
    }
    if (typeof value === 'object') {
      const sub = `${interfaceName}_${capitalize(key)}`;
      if (!seen.has(sub)) generateInterface(value, sub);
      return sub;
    }
    return typeof value;
  }

  function generateInterface(obj: JsonValue, name: string): void {
    if (seen.has(name)) return;
    seen.add(name);
    // Only an object yields named fields; an array of primitives has no keys.
    const sample = Array.isArray(obj) ? obj[0] : obj;
    const properties: JsonObject = sample && typeof sample === 'object' && !Array.isArray(sample) ? sample : {};
    const lines = [`interface ${name} {`];
    for (const [key, value] of Object.entries(properties)) lines.push(`  ${key}: ${getType(value, key)};`);
    lines.push('}');
    interfaces.push(lines.join('\n'));
  }

  generateInterface(data, interfaceName);
  return interfaces.join('\n\n');
}

export default function JsonTypescriptConverter() {
  const { text: input, setText: setInput, fileBase, setFileBase, loadFile, clear: clearSource } = useSourceText();
  const [name, setName] = useState('Data');

  const rootName = name.trim() || 'Data';

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { out: jsonToTypescript(input, rootName), error: '' };
    } catch (e) {
      return { out: '', error: getErrorMessage(e, 'Could not parse the JSON.') };
    }
  }, [input, rootName]);

  return (
    <ToolPage id="json_ts">
      <Panel
        title="Convert"
        actions={
          <ClearButton
            onClick={() => {
              setInput('');
              setName('Data');
              setFileBase('');
            }}
            disabled={!input && name === 'Data'}
          />
        }
      >
        <Field label="Root interface name" htmlFor="jt-name" className="mb-4 max-w-xs" hint="Nested objects become Name_Key interfaces.">
          <Input id="jt-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Data" maxLength={64} />
        </Field>
        <TwoPane>
          <Field label="JSON" htmlFor="jt-input">
            <TextArea
              id="jt-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{\n  "id": 1,\n  "name": "Ada",\n  "tags": ["admin"]\n}'}
              rows={12}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
            />
            <FileDrop
              className="mt-3"
              accept=".json"
              label="Load a file"
              onFile={loadFile}
              onClear={clearSource}
            />
          </Field>
          <Output label="TypeScript" value={result?.out ?? ''} rows={12} wrap={false} fileName={`${fileBase || 'types'}.ts`} mime="text/typescript" />
        </TwoPane>
        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
