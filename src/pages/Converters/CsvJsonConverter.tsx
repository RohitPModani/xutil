import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import type { JsonObject, JsonValue } from '../../types/json';
import { getErrorMessage } from '../../utils/errors';
import { looksLikeJson } from '../../utils/text';
import { useSourceText } from '../../hooks/useSourceText';

type Mode = 'auto' | 'csv' | 'json';

const SEP = '_';

function flattenJson(data: JsonValue): { records: JsonObject[]; headers: string[] } {
  const records: JsonObject[] = [];
  const headers: string[] = [];

  function flatten(obj: JsonValue, prefix = '', current: JsonObject[] = [{}]): JsonObject[] {
    if (Array.isArray(obj)) {
      const next: JsonObject[] = [];
      for (const item of obj) next.push(...flatten(item, prefix, current.map((rec) => ({ ...rec }))));
      return next.length > 0 ? next : current;
    }
    if (obj && typeof obj === 'object') {
      let next = current;
      for (const [key, value] of Object.entries(obj)) next = flatten(value, prefix ? `${prefix}${SEP}${key}` : key, next);
      return next;
    }
    if (!headers.includes(prefix)) headers.push(prefix);
    return current.map((rec) => ({ ...rec, [prefix]: obj }));
  }

  for (const item of Array.isArray(data) ? data : [data]) records.push(...flatten(item));
  return { records, headers };
}

function unflatten(flat: JsonObject): JsonObject {
  const result: JsonObject = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(SEP);
    let current = result;
    for (const part of parts.slice(0, -1)) {
      const next = current[part];
      // Colliding flat keys such as "a" and "a_b" would otherwise write onto a primitive.
      if (next === null || typeof next !== 'object' || Array.isArray(next)) current[part] = {};
      current = current[part] as JsonObject;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

function jsonToCsv(jsonData: string): string {
  const { records, headers } = flattenJson(JSON.parse(jsonData));
  if (records.length === 0) return '';
  const rows = records.map((record) =>
    headers
      .map((header) => {
        const value = record[header] ?? '';
        return typeof value === 'string' && /[,"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i - 1] !== '\\') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.replace(/""/g, '"'));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/""/g, '"'));
  return result.map((val) => val.trim().replace(/^"|"$/g, ''));
}

function csvToJson(csvData: string): string {
  const lines = csvData.trim().split('\n');
  const headers = parseCsvLine(lines[0]);
  const records = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: JsonObject = {};
    headers.forEach((header, i) => (record[header] = values[i] || null));
    return unflatten(record);
  });
  return JSON.stringify(records, null, 2);
}

function convert(input: string, mode: Mode): { out: string; to: 'csv' | 'json' } {
  const toCsv = mode === 'json' || (mode === 'auto' && looksLikeJson(input));
  return toCsv ? { out: jsonToCsv(input), to: 'csv' } : { out: csvToJson(input), to: 'json' };
}

/**
 * One pane in, one pane out. Direction is detected from the input (JSON
 * starts with { or [) and can be forced with the switch. Nested keys are
 * flattened to `a_b` columns and unflattened on the way back.
 */
export default function CsvJsonConverter() {
  const { text: input, setText: setInput, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [mode, setMode] = useState<Mode>('auto');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { ...convert(input, mode), error: '' };
    } catch (e) {
      return { out: '', to: null, error: getErrorMessage(e, 'Could not parse the input.') };
    }
  }, [input, mode]);

  const to = result?.to ?? null;
  const fileName = `${fileBase || 'converted'}.${to ?? 'txt'}`;

  return (
    <ToolPage id="csv_json">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'csv', label: 'CSV → JSON' },
                { value: 'json', label: 'JSON → CSV' },
              ]}
            />
            <ClearButton
              onClick={clearSource}
              disabled={!input}
            />
          </>
        }
      >
        <TwoPane>
          <Field
            label="Input"
            htmlFor="cj-input"
            hint={
              to
                ? `Detected ${to === 'json' ? 'CSV' : 'JSON'}; converting to ${to.toUpperCase()}. Nested keys use "_" in column names.`
                : 'Paste CSV (first row is the header) or JSON. Direction is detected automatically.'
            }
          >
            <TextArea
              id="cj-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'id,name,address_city\n1,Ada,London\n2,Grace,Arlington'}
              rows={12}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
            />
            <FileDrop
              className="mt-3"
              accept=".csv,.json"
              label="Load a file"
              onFile={loadFile}
              onClear={clearSource}
            />
          </Field>
          <Output
            label={to ? `Output · ${to.toUpperCase()}` : 'Output'}
            value={result?.out ?? ''}
            rows={12}
            wrap={to !== 'csv'}
            fileName={fileName}
            mime={to === 'json' ? 'application/json' : 'text/csv'}
          />
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
