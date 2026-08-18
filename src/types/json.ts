/**
 * Shape of anything that can come back from `JSON.parse`.
 *
 * The converters walk arbitrary parsed input, so they need a type that is open
 * enough to describe it but still forces a narrowing check before use - which
 * `any` silently skipped.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
