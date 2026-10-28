import { JsonTypePage } from '../../components/JsonTypePage';
import { collectObjects, isIdentifier, pascalCase, type Schema } from '../../utils/jsonSchema';

const PRIMITIVES = { string: 'String', integer: 'Long', number: 'Double', boolean: 'Boolean', null: 'JsonElement', any: 'JsonElement' } as const;
const KEYWORDS = new Set('as break class continue do else false for fun if in interface is null object package return super this throw true try typealias typeof val var when while'.split(' '));

/** `first_name` → `firstName`, `ID` → `id`. */
const camelCase = (s: string) => {
  const p = pascalCase(s);
  return /^[A-Z0-9]+$/.test(p) ? p.toLowerCase() : p[0].toLowerCase() + p.slice(1);
};

function ktType(s: Schema, used: Set<string>, optional = false): string {
  let t: string;
  if (s.kind === 'primitive') t = PRIMITIVES[s.type];
  else if (s.kind === 'object') t = s.name;
  else if (s.kind === 'union') t = 'JsonElement';
  else t = `List<${ktType(s.items, used)}>`;
  if (t === 'JsonElement') used.add('JsonElement');
  return s.nullable || optional || (s.kind === 'primitive' && s.type === 'null') ? `${t}?` : t;
}

/**
 * One `@Serializable data class` per object, dependencies first. Properties
 * are camelCase with `@SerialName` when the key differs; keywords and names
 * that are not identifiers are backtick-escaped. A key missing from some
 * array items becomes `T? = null`. An empty object is a plain class, since a
 * data class needs at least one property.
 */
function emitKotlin(schema: Schema): string {
  const used = new Set<string>();
  const classes = collectObjects(schema).map((obj) => {
    if (!obj.fields.length) return `@Serializable\nclass ${obj.name}`;
    const props = obj.fields.map((f) => {
      const name = camelCase(f.key);
      const ident = KEYWORDS.has(name) || !isIdentifier(name) ? `\`${name}\`` : name;
      if (name !== f.key) used.add('SerialName');
      const ann = name !== f.key ? [`    @SerialName(${JSON.stringify(f.key)})`] : [];
      return [...ann, `    val ${ident}: ${ktType(f.schema, used, f.optional)}${f.optional ? ' = null' : ''}`].join('\n');
    });
    return ['@Serializable', `data class ${obj.name}(`, props.join(',\n'), ')'].join('\n');
  });
  const imports = [
    ...(used.has('SerialName') ? ['import kotlinx.serialization.SerialName'] : []),
    'import kotlinx.serialization.Serializable',
    ...(used.has('JsonElement') ? ['import kotlinx.serialization.json.JsonElement'] : []),
  ];
  return [imports.join('\n'), ...classes].join('\n\n');
}

export default function JsonKotlinConverter() {
  return (
    <JsonTypePage
      id="json_kotlin"
      nameLabel="Root class name"
      nameHint="Nested objects become data classes named after their path, for example RootAddress."
      defaultName="Root"
      outputLabel="Kotlin"
      fileStem="Models"
      ext="kt"
      mime="text/x-kotlin"
      placeholder={'{\n  "id": 1,\n  "user_name": "Ada",\n  "tags": ["admin"]\n}'}
      emit={emitKotlin}
    />
  );
}
