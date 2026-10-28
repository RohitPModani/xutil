import { JsonTypePage } from '../../components/JsonTypePage';
import { collectObjects, snakeCase, type Schema } from '../../utils/jsonSchema';

const PRIMITIVES = { string: 'String', integer: 'i64', number: 'f64', boolean: 'bool', null: 'serde_json::Value', any: 'serde_json::Value' } as const;
const KEYWORDS = new Set(
  'as break const continue else enum extern false fn for if impl in let loop match mod move mut pub ref return static struct trait true type unsafe use where while async await dyn abstract become box do final macro override priv typeof unsized virtual yield try gen'.split(' ')
);
/** Keywords that cannot be raw identifiers either. */
const RESERVED = new Set(['self', 'super', 'crate']);

/** Serde's own snake → camel rule, used to decide whether `rename_all = "camelCase"` reproduces every key. */
const camel = (snake: string) => snake.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function rustType(s: Schema, optional = false): string {
  let t: string;
  if (s.kind === 'primitive') t = PRIMITIVES[s.type];
  else if (s.kind === 'object') t = s.name;
  else if (s.kind === 'union') t = 'serde_json::Value';
  else t = `Vec<${rustType(s.items)}>`;
  return s.nullable || optional || (s.kind === 'primitive' && s.type === 'null') ? `Option<${t}>` : t;
}

/**
 * One `pub struct` per object, dependencies first. Field names are snake_case;
 * a struct whose keys are all camelCase gets `rename_all`, otherwise each key
 * that differs from its field name gets `rename`. Keywords become `r#name`.
 */
function emitRust(schema: Schema): string {
  const structs = collectObjects(schema).map((obj) => {
    const fields = obj.fields.map((f) => {
      const name = snakeCase(f.key);
      const ident = RESERVED.has(name) ? `${name}_` : KEYWORDS.has(name) ? `r#${name}` : /^\d/.test(name) ? `_${name}` : name;
      return { ...f, ident, serde: ident.replace(/^r#/, '') };
    });
    const renameAll = fields.some((f) => f.serde !== f.key) && fields.every((f) => camel(f.serde) === f.key);
    const lines = fields.flatMap((f) => [
      ...(!renameAll && f.serde !== f.key ? [`    #[serde(rename = ${JSON.stringify(f.key)})]`] : []),
      `    pub ${f.ident}: ${rustType(f.schema, f.optional)},`,
    ]);
    return ['#[derive(Debug, Clone, Serialize, Deserialize)]', ...(renameAll ? ['#[serde(rename_all = "camelCase")]'] : []), `pub struct ${obj.name} {`, ...lines, '}'].join('\n');
  });
  return ['use serde::{Deserialize, Serialize};', ...structs].join('\n\n');
}

export default function JsonRustConverter() {
  return (
    <JsonTypePage
      id="json_rust"
      nameLabel="Root struct name"
      nameHint="Nested objects become structs named after their path, for example RootAddress."
      defaultName="Root"
      outputLabel="Rust"
      fileStem="types"
      ext="rs"
      mime="text/x-rust"
      placeholder={'{\n  "id": 1,\n  "userName": "Ada",\n  "tags": ["admin"]\n}'}
      emit={emitRust}
    />
  );
}
