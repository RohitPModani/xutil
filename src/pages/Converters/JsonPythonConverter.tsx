import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Input, Output, Panel, TextArea, TwoPane } from '../../ui';
import { validateClassName } from '../../utils/jsonPythonUtils';
import type { JsonObject, JsonValue } from '../../types/json';
import { getErrorMessage } from '../../utils/errors';
import { useSourceText } from '../../hooks/useSourceText';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const IMPORTS = ['from dataclasses import dataclass', 'from typing import List, Any, Union', 'from datetime import date, datetime', ''].join('\n');

function jsonToPython(jsonData: string, className: string): string {
  const data = JSON.parse(jsonData);
  const classes: string[] = [];
  const seen = new Set<string>();

  function getType(value: JsonValue, key: string): string {
    if (value === null) return 'None';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'List[Any]';
      const types = new Set(value.map((item) => getType(item, key)));
      // int and float together collapse to float.
      if (types.has('int') && types.has('float')) types.delete('int');
      const list = Array.from(types);
      return `List[${list.length > 1 ? `Union[${list.join(', ')}]` : list[0]}]`;
    }
    if (typeof value === 'object') {
      const sub = `${className}${capitalize(key)}`;
      if (!seen.has(sub)) generateClass(value, sub);
      return sub;
    }
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{2}-\d{2}-\d{4}$/.test(value)) return 'date';
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)) return 'datetime';
      return 'str';
    }
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
    return 'bool';
  }

  function generateClass(obj: JsonValue, name: string): void {
    if (seen.has(name)) return;
    seen.add(name);
    // Only an object yields named fields; an array of primitives has no keys.
    const sample = Array.isArray(obj) ? obj[0] : obj;
    const properties: JsonObject = sample && typeof sample === 'object' && !Array.isArray(sample) ? sample : {};
    const lines = ['@dataclass', `class ${name}:`];
    for (const [key, value] of Object.entries(properties)) lines.push(`    ${key}: ${getType(value, key)}`);
    classes.push(lines.join('\n'));
  }

  generateClass(data, className);
  return [IMPORTS, ...classes].join('\n\n');
}

export default function JsonPythonConverter() {
  const { text: input, setText: setInput, fileBase, setFileBase, loadFile, clear: clearSource } = useSourceText();
  const [name, setName] = useState('Root');

  const nameError = validateClassName(name);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (nameError) return { out: '', error: nameError };
    try {
      return { out: jsonToPython(input, name), error: '' };
    } catch (e) {
      return { out: '', error: getErrorMessage(e, 'Could not parse the JSON.') };
    }
  }, [input, name, nameError]);

  return (
    <ToolPage id="json_python">
      <Panel
        title="Convert"
        actions={
          <ClearButton
            onClick={() => {
              setInput('');
              setName('Root');
              setFileBase('');
            }}
            disabled={!input && name === 'Root'}
          />
        }
      >
        <Field label="Root class name" htmlFor="jp-name" className="mb-4 max-w-xs" hint="Nested objects become RootKey classes.">
          <Input
            id="jp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Root"
            maxLength={64}
            aria-invalid={Boolean(nameError) || undefined}
          />
        </Field>
        <TwoPane>
          <Field label="JSON" htmlFor="jp-input">
            <TextArea
              id="jp-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{\n  "id": 1,\n  "name": "Ada",\n  "joined": "2024-01-31"\n}'}
              rows={12}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error && !nameError) || undefined}
            />
            <FileDrop
              className="mt-3"
              accept=".json"
              label="Load a file"
              onFile={loadFile}
              onClear={clearSource}
            />
          </Field>
          <Output label="Python dataclasses" value={result?.out ?? ''} rows={12} wrap={false} fileName={`${fileBase || 'models'}.py`} mime="text/x-python" />
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
