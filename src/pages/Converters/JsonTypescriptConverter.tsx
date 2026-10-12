import { JsonTypePage } from '../../components/JsonTypePage';
import { collectObjects, isIdentifier, type Schema } from '../../utils/jsonSchema';

const PRIMITIVES = { string: 'string', integer: 'number', number: 'number', boolean: 'boolean', null: 'null', any: 'any' } as const;

function tsType(s: Schema): string {
  let t: string;
  if (s.kind === 'primitive') t = PRIMITIVES[s.type];
  else if (s.kind === 'object') t = s.name;
  else if (s.kind === 'union') t = s.options.map(tsType).join(' | ');
  else {
    const items = tsType(s.items);
    t = items.includes(' | ') ? `(${items})[]` : `${items}[]`;
  }
  return s.nullable ? `${t} | null` : t;
}

/** One interface per object in the sample, dependencies first; keys missing from some array items become optional. */
function emitTypescript(schema: Schema): string {
  return collectObjects(schema)
    .map((obj) => {
      const lines = obj.fields.map((f) => `  ${isIdentifier(f.key) ? f.key : JSON.stringify(f.key)}${f.optional ? '?' : ''}: ${tsType(f.schema)};`);
      return [`interface ${obj.name} {`, ...lines, '}'].join('\n');
    })
    .join('\n\n');
}

export default function JsonTypescriptConverter() {
  return (
    <JsonTypePage
      id="json_ts"
      nameLabel="Root interface name"
      nameHint="Nested objects become interfaces named after their path, for example DataAddress."
      defaultName="Data"
      outputLabel="TypeScript"
      fileStem="types"
      ext="ts"
      mime="text/typescript"
      placeholder={'{\n  "id": 1,\n  "name": "Ada",\n  "tags": ["admin"]\n}'}
      emit={emitTypescript}
    />
  );
}
