/**
 * Infers a type tree from a JSON sample so the TypeScript, Python dataclass
 * and Pydantic generators share one analysis and only differ in how they
 * print it.
 *
 * - Arrays of objects are merged: a key missing from some items is optional.
 * - Nested objects are named by their path (`Root` → `RootUser` →
 *   `RootUserAddress`), so two `address` objects under different parents
 *   keep their own shapes.
 * - ISO date and date-time strings are flagged with `format`.
 */
import type { JsonValue } from '../types/json';

export type Primitive = 'string' | 'integer' | 'number' | 'boolean' | 'null' | 'any';

export type Schema =
  | { kind: 'primitive'; type: Primitive; format?: 'date' | 'datetime'; nullable?: boolean }
  | { kind: 'array'; items: Schema; nullable?: boolean }
  | { kind: 'object'; name: string; fields: Field[]; nullable?: boolean }
  | { kind: 'union'; options: Schema[]; nullable?: boolean };

export interface Field {
  /** The key as it appears in the JSON. */
  key: string;
  schema: Schema;
  /** Missing from some objects in an array of objects. */
  optional: boolean;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;

export const pascalCase = (s: string) =>
  s
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'Item';

export const snakeCase = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'field';

/** A valid identifier in both Python and TypeScript (ASCII, no keywords checked). */
export const isIdentifier = (s: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(s);

/** Singular form for naming the element type of `items` → `Item`. */
const singular = (name: string) => (name.endsWith('ies') ? name.slice(0, -3) + 'y' : name.endsWith('s') && !name.endsWith('ss') ? name.slice(0, -1) : name);

export function inferSchema(value: JsonValue, name = 'Root'): Schema {
  if (value === null) return { kind: 'primitive', type: 'null' };
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'array', items: { kind: 'primitive', type: 'any' } };
    const items = value.map((v) => inferSchema(v, singular(name)));
    return { kind: 'array', items: items.slice(1).reduce((acc, s) => merge(acc, s), items[0]) };
  }
  if (typeof value === 'object') {
    const fields: Field[] = Object.entries(value).map(([key, v]) => ({
      key,
      schema: inferSchema(v, name + pascalCase(key)),
      optional: false,
    }));
    return { kind: 'object', name, fields };
  }
  if (typeof value === 'string') {
    if (DATETIME_RE.test(value)) return { kind: 'primitive', type: 'string', format: 'datetime' };
    if (DATE_RE.test(value)) return { kind: 'primitive', type: 'string', format: 'date' };
    return { kind: 'primitive', type: 'string' };
  }
  if (typeof value === 'number') return { kind: 'primitive', type: Number.isInteger(value) ? 'integer' : 'number' };
  return { kind: 'primitive', type: 'boolean' };
}

/** Merges two schemas seen for the same slot (array items, repeated keys). */
export function merge(a: Schema, b: Schema): Schema {
  if (isNull(a)) return { ...b, nullable: true };
  if (isNull(b)) return { ...a, nullable: true };
  const nullable = a.nullable || b.nullable || undefined;
  if (a.kind === 'object' && b.kind === 'object') {
    const keys = [...new Set([...a.fields.map((f) => f.key), ...b.fields.map((f) => f.key)])];
    const fields = keys.map((key) => {
      const fa = a.fields.find((f) => f.key === key);
      const fb = b.fields.find((f) => f.key === key);
      if (fa && fb) return { key, schema: merge(fa.schema, fb.schema), optional: fa.optional || fb.optional };
      const f = (fa ?? fb)!;
      return { ...f, optional: true };
    });
    return { kind: 'object', name: a.name, fields, nullable };
  }
  if (a.kind === 'array' && b.kind === 'array') return { kind: 'array', items: merge(a.items, b.items), nullable };
  if (a.kind === 'primitive' && b.kind === 'primitive') {
    if (a.type === b.type) return { ...a, format: a.format === b.format ? a.format : undefined, nullable };
    if ((a.type === 'integer' && b.type === 'number') || (a.type === 'number' && b.type === 'integer')) return { kind: 'primitive', type: 'number', nullable };
    if (a.type === 'any') return { ...b, nullable };
    if (b.type === 'any') return { ...a, nullable };
  }
  const options = [...(a.kind === 'union' ? a.options : [a]), ...(b.kind === 'union' ? b.options : [b])];
  const unique = options.filter((o, i) => options.findIndex((p) => sameShape(p, o)) === i);
  return unique.length === 1 ? { ...unique[0], nullable } : { kind: 'union', options: unique, nullable };
}

const isNull = (s: Schema) => s.kind === 'primitive' && s.type === 'null';

const sameShape = (a: Schema, b: Schema): boolean => {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'primitive' && b.kind === 'primitive') return a.type === b.type;
  if (a.kind === 'array' && b.kind === 'array') return sameShape(a.items, b.items);
  if (a.kind === 'object' && b.kind === 'object') return a.name === b.name;
  return false;
};

/** Every object type in the tree, dependencies first, so emitters can print them in order. */
export function collectObjects(schema: Schema): Extract<Schema, { kind: 'object' }>[] {
  const out: Extract<Schema, { kind: 'object' }>[] = [];
  const seen = new Set<string>();
  const walk = (s: Schema) => {
    if (s.kind === 'array') walk(s.items);
    else if (s.kind === 'union') s.options.forEach(walk);
    else if (s.kind === 'object') {
      s.fields.forEach((f) => walk(f.schema));
      if (!seen.has(s.name)) {
        seen.add(s.name);
        out.push(s);
      }
    }
  };
  walk(schema);
  return out;
}

export function parseJsonSample(text: string): JsonValue {
  const v = JSON.parse(text) as JsonValue;
  if (v === null || typeof v !== 'object') throw new Error('The root must be an object or an array of objects.');
  if (Array.isArray(v) && v.some((x) => x === null || typeof x !== 'object' || Array.isArray(x))) {
    throw new Error('A root array must contain objects.');
  }
  return v;
}
