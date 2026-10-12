/**
 * What the dataclass and Pydantic generators share: type rendering from an
 * inferred schema, field naming, the root-name check and the import header.
 */
import { isIdentifier, snakeCase, type Schema } from './jsonSchema';

export const validateClassName = (name: string): string =>
  isIdentifier(name) ? '' : 'Use a name that starts with a letter or underscore and contains only letters, digits and underscores.';

const PY_KEYWORDS = new Set(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' ')
);

/** `first-name` → `first_name`, `class` → `class_`. Returns the key itself when it is already usable. */
export function pyFieldName(key: string): string {
  const name = isIdentifier(key) ? key : snakeCase(key);
  return PY_KEYWORDS.has(name) ? `${name}_` : name;
}

const PRIMITIVES = { string: 'str', integer: 'int', number: 'float', boolean: 'bool', null: 'Any', any: 'Any' } as const;

/** Renders a type annotation and records the typing/datetime names it needs in `used`. */
export function pyType(s: Schema, used: Set<string>): string {
  let t: string;
  if (s.kind === 'primitive') {
    t = s.format === 'date' ? 'date' : s.format === 'datetime' ? 'datetime' : PRIMITIVES[s.type];
  } else if (s.kind === 'array') {
    t = `List[${pyType(s.items, used)}]`;
  } else if (s.kind === 'object') {
    t = s.name;
  } else {
    t = `Union[${s.options.map((o) => pyType(o, used)).join(', ')}]`;
  }
  const m = /^(List|Union|Any|date|datetime)\b/.exec(t);
  if (m) used.add(m[1]);
  if (s.nullable || (s.kind === 'primitive' && s.type === 'null')) {
    used.add('Optional');
    t = `Optional[${t}]`;
  }
  return t;
}

/** Import lines for the names `pyType` recorded, in the order linters expect. */
export function pyImports(used: Set<string>, extra: string[]): string[] {
  const typing = ['Any', 'List', 'Optional', 'Union'].filter((n) => used.has(n));
  const dt = ['date', 'datetime'].filter((n) => used.has(n));
  return [...extra, ...(dt.length ? [`from datetime import ${dt.join(', ')}`] : []), ...(typing.length ? [`from typing import ${typing.join(', ')}`] : [])];
}
