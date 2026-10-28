import { JsonTypePage } from '../../components/JsonTypePage';
import { collectObjects, pascalCase, type Schema } from '../../utils/jsonSchema';

const PRIMITIVES = { string: 'string', integer: 'long', number: 'double', boolean: 'bool', null: 'JsonElement', any: 'JsonElement' } as const;

/** Renders a type and records the namespaces it needs in `used`. Nullable and optional values get `?`. */
function csType(s: Schema, used: Set<string>, optional = false): string {
  let t: string;
  if (s.kind === 'primitive') t = PRIMITIVES[s.type];
  else if (s.kind === 'object') t = s.name;
  else if (s.kind === 'union') t = 'JsonElement';
  else t = `List<${csType(s.items, used)}>`;
  if (t === 'JsonElement') used.add('System.Text.Json');
  if (t.startsWith('List<')) used.add('System.Collections.Generic');
  return s.nullable || optional || (s.kind === 'primitive' && s.type === 'null') ? `${t}?` : t;
}

/**
 * One `public class` per object, dependencies first, System.Text.Json style:
 * PascalCase properties with `[JsonPropertyName]` whenever the key differs.
 * A property may not share its class's name, so such a key gets a suffix.
 */
function emitCsharp(schema: Schema): string {
  const used = new Set(['System.Text.Json.Serialization']);
  const classes = collectObjects(schema).map((obj) => {
    const props = obj.fields.map((f) => {
      let name = pascalCase(f.key);
      if (/^\d/.test(name)) name = `Field${name}`;
      if (name === obj.name) name += 'Value';
      const attr = name !== f.key ? [`    [JsonPropertyName(${JSON.stringify(f.key)})]`] : [];
      return [...attr, `    public ${csType(f.schema, used, f.optional)} ${name} { get; set; }`].join('\n');
    });
    return [`public class ${obj.name}`, '{', ...(props.length ? [props.join('\n\n')] : []), '}'].join('\n');
  });
  return [[...used].sort().map((u) => `using ${u};`).join('\n'), ...classes].join('\n\n');
}

export default function JsonCsharpConverter() {
  return (
    <JsonTypePage
      id="json_csharp"
      nameLabel="Root class name"
      nameHint="Nested objects become classes named after their path, for example RootAddress."
      defaultName="Root"
      outputLabel="C#"
      fileStem="Models"
      ext="cs"
      mime="text/x-csharp"
      placeholder={'{\n  "id": 1,\n  "userName": "Ada",\n  "tags": ["admin"]\n}'}
      emit={emitCsharp}
    />
  );
}
