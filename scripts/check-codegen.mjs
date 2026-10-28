// Runs the Go, Rust, Kotlin and C# printers from the JSON → types pages in
// node on the same samples: `node scripts/check-codegen.mjs`. Page files are
// sliced before their `export default` so no React is needed (same loader as
// check-converters.mjs).
import ts from 'typescript';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = resolve('node_modules/.cache/check-codegen');
const built = new Map();

/** Transpiles `src/<rel>` (and the project files it imports) to OUT and returns the output path. */
function build(rel, exports = []) {
  const file = resolve('src', rel);
  if (built.has(file)) return built.get(file);
  const out = resolve(OUT, rel.replace(/\.tsx?$/, '.js'));
  built.set(file, out);
  let src = readFileSync(file, 'utf8');
  if (rel.endsWith('.tsx')) {
    src = src.slice(0, src.indexOf('export default function')).replace(/^import .*(?:'react'|\/ui'|\/components\/).*\n/gm, '');
    src += `\nexport { ${exports.join(', ')} };\n`;
  }
  src = src.replace(/from '(\.[^']+)'/g, (_, spec) => {
    const target = resolve(dirname(file), spec);
    const relTarget = target.slice(resolve('src').length + 1);
    const ext = ['.ts', '.tsx'].find((e) => {
      try {
        readFileSync(target + e);
        return true;
      } catch {
        return false;
      }
    });
    return `from '${pathToFileURL(build(relTarget + ext)).href}'`;
  });
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.Preserve } }).outputText;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, js);
  return out;
}

const load = (rel, exports) => import(pathToFileURL(build(rel, exports)).href);

let bad = 0;
const check = (name, got, want) => {
  if (got !== want) {
    bad++;
    console.log('FAIL', name, '\n  got \n' + got + '\n  want\n' + want);
  }
};

const { inferSchema, parseJsonSample } = await load('utils/jsonSchema.ts');
const { emitGo } = await load('pages/Converters/JsonGoConverter.tsx', ['emitGo']);
const { emitRust } = await load('pages/Converters/JsonRustConverter.tsx', ['emitRust']);
const { emitKotlin } = await load('pages/Converters/JsonKotlinConverter.tsx', ['emitKotlin']);
const { emitCsharp } = await load('pages/Converters/JsonCsharpConverter.tsx', ['emitCsharp']);

const schema = (json) => inferSchema(parseJsonSample(json), 'Root');
const RUST_HEAD = 'use serde::{Deserialize, Serialize};\n\n#[derive(Debug, Clone, Serialize, Deserialize)]\n';
const DERIVE = '#[derive(Debug, Clone, Serialize, Deserialize)]\n';
/** A C# class with a blank line between properties. */
const cls = (name, ...props) => [`public class ${name}`, '{', props.join('\n\n'), '}'].join('\n');

/* ---- 1. flat object: string, int, float, bool, null ---------------------- */
const flat = schema('{"id": 1, "name": "Ada", "score": 9.5, "active": true, "note": null}');

check('go flat', emitGo(flat), ['type Root struct {', '\tID     int64   `json:"id"`', '\tName   string  `json:"name"`', '\tScore  float64 `json:"score"`', '\tActive bool    `json:"active"`', '\tNote   any     `json:"note"`', '}'].join('\n'));

check('rust flat', emitRust(flat), RUST_HEAD + 'pub struct Root {\n    pub id: i64,\n    pub name: String,\n    pub score: f64,\n    pub active: bool,\n    pub note: Option<serde_json::Value>,\n}');

check(
  'kotlin flat',
  emitKotlin(flat),
  'import kotlinx.serialization.Serializable\nimport kotlinx.serialization.json.JsonElement\n\n@Serializable\ndata class Root(\n    val id: Long,\n    val name: String,\n    val score: Double,\n    val active: Boolean,\n    val note: JsonElement?\n)'
);

check(
  'csharp flat',
  emitCsharp(flat),
  [
    'using System.Text.Json;\nusing System.Text.Json.Serialization;',
    cls(
      'Root',
      '    [JsonPropertyName("id")]\n    public long Id { get; set; }',
      '    [JsonPropertyName("name")]\n    public string Name { get; set; }',
      '    [JsonPropertyName("score")]\n    public double Score { get; set; }',
      '    [JsonPropertyName("active")]\n    public bool Active { get; set; }',
      '    [JsonPropertyName("note")]\n    public JsonElement? Note { get; set; }'
    ),
  ].join('\n\n')
);

/* ---- 2. nested object, array of objects with a key missing from one item - */
const nested = schema('{"userId": 7, "items": [{"id": 1, "label": "a", "price": 2.5}, {"id": 2, "price": 3}]}');

check(
  'go nested',
  emitGo(nested),
  [
    'type RootItem struct {\n\tID    int64   `json:"id"`\n\tLabel *string `json:"label,omitempty"`\n\tPrice float64 `json:"price"`\n}',
    'type Root struct {\n\tUserID int64      `json:"userId"`\n\tItems  []RootItem `json:"items"`\n}',
  ].join('\n\n')
);

check(
  'rust nested',
  emitRust(nested),
  RUST_HEAD +
    'pub struct RootItem {\n    pub id: i64,\n    pub label: Option<String>,\n    pub price: f64,\n}\n\n' +
    DERIVE +
    '#[serde(rename_all = "camelCase")]\npub struct Root {\n    pub user_id: i64,\n    pub items: Vec<RootItem>,\n}'
);

check(
  'kotlin nested',
  emitKotlin(nested),
  [
    'import kotlinx.serialization.Serializable',
    '@Serializable\ndata class RootItem(\n    val id: Long,\n    val label: String? = null,\n    val price: Double\n)',
    '@Serializable\ndata class Root(\n    val userId: Long,\n    val items: List<RootItem>\n)',
  ].join('\n\n')
);

check(
  'csharp nested',
  emitCsharp(nested),
  [
    'using System.Collections.Generic;\nusing System.Text.Json.Serialization;',
    cls(
      'RootItem',
      '    [JsonPropertyName("id")]\n    public long Id { get; set; }',
      '    [JsonPropertyName("label")]\n    public string? Label { get; set; }',
      '    [JsonPropertyName("price")]\n    public double Price { get; set; }'
    ),
    cls('Root', '    [JsonPropertyName("userId")]\n    public long UserId { get; set; }', '    [JsonPropertyName("items")]\n    public List<RootItem> Items { get; set; }'),
  ].join('\n\n')
);

/* ---- 3. array of mixed ints and strings ---------------------------------- */
const mixed = schema('{"values": [1, "two", 3]}');

check('go mixed', emitGo(mixed), 'type Root struct {\n\tValues []any `json:"values"`\n}');
check('rust mixed', emitRust(mixed), RUST_HEAD + 'pub struct Root {\n    pub values: Vec<serde_json::Value>,\n}');
check('kotlin mixed', emitKotlin(mixed), 'import kotlinx.serialization.Serializable\nimport kotlinx.serialization.json.JsonElement\n\n@Serializable\ndata class Root(\n    val values: List<JsonElement>\n)');
check(
  'csharp mixed',
  emitCsharp(mixed),
  'using System.Collections.Generic;\nusing System.Text.Json;\nusing System.Text.Json.Serialization;\n\npublic class Root\n{\n    [JsonPropertyName("values")]\n    public List<JsonElement> Values { get; set; }\n}'
);

/* ---- 4. keywords, non-identifier keys, empty object ---------------------- */
const names = schema('{"type": "x", "first-name": "A", "when": 1, "meta": {}}');

check(
  'go names',
  emitGo(names),
  'type RootMeta struct{}\n\ntype Root struct {\n\tType      string   `json:"type"`\n\tFirstName string   `json:"first-name"`\n\tWhen      int64    `json:"when"`\n\tMeta      RootMeta `json:"meta"`\n}'
);
check(
  'rust names',
  emitRust(names),
  RUST_HEAD +
    'pub struct RootMeta {\n}\n\n' +
    DERIVE +
    'pub struct Root {\n    pub r#type: String,\n    #[serde(rename = "first-name")]\n    pub first_name: String,\n    pub when: i64,\n    pub meta: RootMeta,\n}'
);
check(
  'kotlin names',
  emitKotlin(names),
  'import kotlinx.serialization.SerialName\nimport kotlinx.serialization.Serializable\n\n@Serializable\nclass RootMeta\n\n@Serializable\ndata class Root(\n    val type: String,\n    @SerialName("first-name")\n    val firstName: String,\n    val `when`: Long,\n    val meta: RootMeta\n)'
);
check(
  'csharp names',
  emitCsharp(names),
  [
    'using System.Text.Json.Serialization;',
    'public class RootMeta\n{\n}',
    cls(
      'Root',
      '    [JsonPropertyName("type")]\n    public string Type { get; set; }',
      '    [JsonPropertyName("first-name")]\n    public string FirstName { get; set; }',
      '    [JsonPropertyName("when")]\n    public long When { get; set; }',
      '    [JsonPropertyName("meta")]\n    public RootMeta Meta { get; set; }'
    ),
  ].join('\n\n')
);

console.log(bad ? `${bad} failures` : 'all cases pass');
process.exit(bad ? 1 : 0);
