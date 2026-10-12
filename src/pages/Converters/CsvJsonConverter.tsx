import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { TwoWayConverter, type Format } from '../../components/TwoWayConverter';
import { Checkbox, Field, Select } from '../../ui';
import type { JsonObject, JsonValue } from '../../types/json';
import { describeJsonError } from '../../utils/json';
import { looksLikeJson } from '../../utils/text';

/** Nested keys are joined with this in column names: `address.city`. */
const SEP = '.';

interface CsvOptions {
  /** Empty string lets papaparse detect the delimiter. */
  delimiter: string;
  /** Turn "1" into 1 and "true" into true when reading CSV. */
  dynamicTyping: boolean;
}

/** `{ a: { b: 1 }, tags: [1, 2] }` → `{ "a.b": 1, tags: "[1,2]" }`. Arrays stay in one cell as JSON. */
function flatten(value: JsonValue, prefix: string, out: JsonObject): JsonObject {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}${SEP}${key}` : key, out);
    return out;
  }
  out[prefix] = Array.isArray(value) ? JSON.stringify(value) : value;
  return out;
}

/** Puts a flat record's `a.b` keys back into nested objects; a cell holding a JSON array becomes an array. */
function unflatten(flat: Record<string, unknown>): JsonObject {
  const result: JsonObject = {};
  for (const [key, raw] of Object.entries(flat)) {
    let value: JsonValue = raw === undefined || raw === '' ? null : (raw as JsonValue);
    if (typeof value === 'string' && /^\s*\[[\s\S]*\]\s*$/.test(value)) {
      try {
        value = JSON.parse(value) as JsonValue;
      } catch {
        /* not JSON after all: keep the text */
      }
    }
    const parts = key.split(SEP);
    let current = result;
    for (const part of parts.slice(0, -1)) {
      const next = current[part];
      // Colliding keys such as "a" and "a.b" would otherwise write onto a primitive.
      if (next === null || typeof next !== 'object' || Array.isArray(next)) current[part] = {};
      current = current[part] as JsonObject;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

function jsonToCsv(input: string, { delimiter }: CsvOptions): string {
  let data: JsonValue;
  try {
    data = JSON.parse(input) as JsonValue;
  } catch (e) {
    throw new Error(describeJsonError(e, input));
  }
  const items = Array.isArray(data) ? data : [data];
  if (items.some((item) => item === null || typeof item !== 'object' || Array.isArray(item))) {
    throw new Error('JSON → CSV needs an object or an array of objects.');
  }
  const records = items.map((item) => flatten(item, '', {}));
  const fields = [...new Set(records.flatMap((r) => Object.keys(r)))];
  if (fields.length === 0) return '';
  return Papa.unparse({ fields, data: records.map((r) => fields.map((f) => r[f] ?? null)) }, { delimiter: delimiter || ',', newline: '\n' });
}

function csvToJson(input: string, { delimiter, dynamicTyping }: CsvOptions): string {
  const parsed = Papa.parse<Record<string, unknown>>(input, { header: true, skipEmptyLines: true, delimiter, dynamicTyping });
  const fatal = parsed.errors.find((e) => e.type === 'Quotes');
  if (fatal) throw new Error(fatal.row === undefined ? fatal.message : `Row ${fatal.row + 2}: ${fatal.message}`);
  // papaparse puts cells beyond the header row under this key; they have no column name to keep.
  const records = parsed.data.map(({ __parsed_extra: _extra, ...row }) => unflatten(row));
  return JSON.stringify(records, null, 2);
}

const FORMATS: [Format, Format] = [
  { label: 'CSV', ext: 'csv', mime: 'text/csv' },
  { label: 'JSON', ext: 'json', mime: 'application/json', json: true },
];

const detect = (input: string): 0 | 1 => (looksLikeJson(input) ? 1 : 0);

/**
 * Nested keys are flattened to `a.b` columns and unflattened on the way
 * back; arrays stay in one cell as JSON text, so a record never multiplies
 * into several rows.
 */
export default function CsvJsonConverter() {
  const [delimiter, setDelimiter] = useState('');
  const [dynamicTyping, setDynamicTyping] = useState(false);

  const convert = useCallback(
    (input: string, from: 0 | 1) => (from === 1 ? jsonToCsv(input, { delimiter, dynamicTyping }) : csvToJson(input, { delimiter, dynamicTyping })),
    [delimiter, dynamicTyping]
  );

  return (
    <TwoWayConverter
      id="csv_json"
      formats={FORMATS}
      accept=".csv,.tsv,.json"
      detect={detect}
      convert={convert}
      wrapOutput={false}
      placeholder={'id,name,address.city\n1,Ada,London\n2,Grace,Arlington'}
      hint='Paste CSV (first row is the header) or JSON. Direction is detected automatically; nested keys use "." in column names.'
      options={
        <>
          <Field label="Delimiter" htmlFor="cj-delimiter" className="w-40">
            <Select id="cj-delimiter" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
              <option value="">Detect</option>
              <option value=",">Comma</option>
              <option value=";">Semicolon</option>
              <option value={'\t'}>Tab</option>
            </Select>
          </Field>
          <Checkbox className="pb-2" label="Infer numbers and booleans" checked={dynamicTyping} onChange={(e) => setDynamicTyping(e.target.checked)} />
        </>
      }
    />
  );
}
