import { JsonTypePage } from '../../components/JsonTypePage';
import { collectObjects, snakeCase, type Schema } from '../../utils/jsonSchema';

const PRIMITIVES = { string: 'string', integer: 'int64', number: 'float64', boolean: 'bool', null: 'any', any: 'any' } as const;
const INITIALISMS = new Set(['ID', 'URL', 'HTTP', 'API', 'JSON', 'UUID', 'IP']);

/** `user_id` → `UserID`, `homeUrl` → `HomeURL`. A leading digit gets a prefix so the field stays exported. */
function goName(key: string): string {
  const name = snakeCase(key)
    .split('_')
    .filter(Boolean)
    .map((w) => (INITIALISMS.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join('');
  return /^\d/.test(name) ? `Field${name}` : name;
}

/** Nullable and optional values are pointers so a missing key differs from the zero value; slices and `any` are already nilable. */
function goType(s: Schema, pointer = false): string {
  let t: string;
  if (s.kind === 'primitive') t = PRIMITIVES[s.type];
  else if (s.kind === 'object') t = s.name;
  else if (s.kind === 'union') t = 'any';
  else t = `[]${goType(s.items)}`;
  return (s.nullable || pointer) && t !== 'any' && !t.startsWith('[]') ? `*${t}` : t;
}

const pad = (s: string, width: number) => s + ' '.repeat(width - s.length);

/** One struct per object, dependencies first, with the name, type and tag columns aligned the way gofmt aligns them. */
function emitGo(schema: Schema): string {
  return collectObjects(schema)
    .map((obj) => {
      if (!obj.fields.length) return `type ${obj.name} struct{}`;
      const rows = obj.fields.map((f) => [goName(f.key), goType(f.schema, f.optional), `\`json:"${f.key}${f.optional ? ',omitempty' : ''}"\``]);
      const width = (col: number) => Math.max(...rows.map((r) => r[col].length)) + 1;
      return [`type ${obj.name} struct {`, ...rows.map(([name, type, tag]) => `\t${pad(name, width(0))}${pad(type, width(1))}${tag}`), '}'].join('\n');
    })
    .join('\n\n');
}

export default function JsonGoConverter() {
  return (
    <JsonTypePage
      id="json_go"
      nameLabel="Root struct name"
      nameHint="Nested objects become structs named after their path, for example RootAddress."
      defaultName="Root"
      outputLabel="Go"
      fileStem="types"
      ext="go"
      mime="text/x-go"
      placeholder={'{\n  "id": 1,\n  "user_name": "Ada",\n  "tags": ["admin"]\n}'}
      emit={emitGo}
    />
  );
}
