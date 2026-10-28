import type { SEODescriptionContent } from './types';

export const codegenSeo: Record<string, SEODescriptionContent> = {
  jsonToGo: {
    title: 'JSON to Go Struct',
    seo: 'JSON to Go Struct: Generate Go Types Online | XUtil',
    body: `Generate Go structs with json tags from a JSON sample. Paste JSON and gofmt-aligned struct definitions appear as you type, one struct per nested object.

## How to use

1. Paste JSON, or load a \`.json\` file (up to 5 MB).
2. Optionally change the root struct name (default \`Root\`). It must start with a letter or underscore and contain only letters, digits and underscores.
3. The Go code updates as you type. Copy it, or Download it as a \`.go\` file.

## What it does

| JSON | Go |
| --- | --- |
| string | \`string\` |
| integer | \`int64\` |
| other number | \`float64\` |
| boolean | \`bool\` |
| null, or mixed types | \`any\` |
| array | \`[]T\` |
| nested object | a named struct, \`RootAddress\` |
| null in some items | \`*T\` |
| key missing from some items | \`*T\` with \`,omitempty\` |

- Field names are PascalCase with the Go initialisms \`ID\`, \`URL\`, \`HTTP\`, \`API\`, \`JSON\`, \`UUID\` and \`IP\` kept upper case, so \`user_id\` becomes \`UserID\`. The original key goes in the \`json\` tag.
- Nested structs are listed before the struct that uses them, and the columns of each struct are aligned the way gofmt aligns them.
- A list of objects, including a top-level array, is typed from all its items. Slices and \`any\` are already nilable, so they do not become pointers.

## Example

\`\`\`json
{ "id": 1, "user_name": "Ada", "tags": ["admin"] }
\`\`\`

\`\`\`go
type Root struct {
	ID       int64    \`json:"id"\`
	UserName string   \`json:"user_name"\`
	Tags     []string \`json:"tags"\`
}
\`\`\`

## Privacy

Inference runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'How do I handle null values in a Go struct?',
        a: 'Use a pointer type such as *string or *int64. encoding/json sets the pointer to nil for a JSON null and leaves it nil when the key is absent, so you can tell "missing" from the zero value. A nil slice or map already encodes as null without a pointer.',
      },
      {
        q: 'What does omitempty do?',
        a: 'The ,omitempty option in a json tag drops the field from the output when it holds its zero value: nil, false, 0, an empty string, or an empty slice or map. It affects marshaling only; decoding ignores it.',
      },
      {
        q: 'Why are JSON numbers int64 and float64 instead of int?',
        a: 'int64 is the same size on every platform and holds the full range of integers JSON usually carries, such as IDs and timestamps. Go decodes any JSON number into float64 by default, so float64 is the natural type for values with a fraction.',
      },
      {
        q: 'Why must struct fields be capitalised?',
        a: 'encoding/json can only read and write exported fields, and in Go a field is exported when its name starts with an upper-case letter. The json tag maps the exported name back to the original lower-case key.',
      },
    ],
  },
  jsonToRust: {
    title: 'JSON to Rust Struct',
    seo: 'JSON to Rust Struct with Serde Derives | XUtil',
    body: `Generate Rust structs with Serialize and Deserialize derives from a JSON sample. Paste JSON and typed structs appear as you type, with serde renames as needed.

## How to use

1. Paste JSON, or load a \`.json\` file (up to 5 MB).
2. Optionally change the root struct name (default \`Root\`). It must start with a letter or underscore and contain only letters, digits and underscores.
3. The Rust code updates as you type. Copy it, or Download it as a \`.rs\` file. The output needs the \`serde\` crate with the \`derive\` feature, and \`serde_json\` when a field is typed \`serde_json::Value\`.

## What it does

| JSON | Rust |
| --- | --- |
| string | \`String\` |
| integer | \`i64\` |
| other number | \`f64\` |
| boolean | \`bool\` |
| null, or mixed types | \`serde_json::Value\` |
| array | \`Vec<T>\` |
| nested object | a named struct, \`RootAddress\` |
| null in some items, or key missing from some items | \`Option<T>\` |

- Every struct is \`pub\` and derives \`Debug\`, \`Clone\`, \`Serialize\` and \`Deserialize\`. Nested structs are listed before the struct that uses them.
- Field names are snake_case. When every key in a struct is camelCase the struct gets \`#[serde(rename_all = "camelCase")]\`; otherwise each key that differs from its field name gets \`#[serde(rename = "key")]\`.
- Keys that are Rust keywords become raw identifiers such as \`r#type\`, which serde serialises as \`type\`.

## Example

\`\`\`json
{ "id": 1, "userName": "Ada", "tags": ["admin"] }
\`\`\`

\`\`\`rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Root {
    pub id: i64,
    pub user_name: String,
    pub tags: Vec<String>,
}
\`\`\`

## Privacy

Inference runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is #[serde(rename_all = "camelCase")]?',
        a: 'A container attribute that maps every field of a struct from Rust snake_case to camelCase in the JSON, so user_name is read and written as userName. It replaces a per-field #[serde(rename = "...")] when the whole struct follows one convention.',
      },
      {
        q: 'Should I use Option<T> for nullable JSON?',
        a: 'Yes. Option<T> deserialises JSON null as None and, for a struct field, also accepts a missing key as None. Serialising None writes null; add #[serde(skip_serializing_if = "Option::is_none")] if the key should be omitted instead.',
      },
      {
        q: 'When should I use serde_json::Value?',
        a: 'When a field has no fixed shape, for example when a sample mixes numbers and strings or only ever shows null. Value holds any JSON and can be matched or converted later, at the cost of compile-time typing.',
      },
      {
        q: 'How do I parse JSON into a struct with serde?',
        a: 'Derive Deserialize on the struct and call serde_json::from_str::<Root>(text) or from_slice for bytes. The result is a Result, so a missing required field or a wrong type returns an error that names the field.',
      },
    ],
  },
  jsonToKotlin: {
    title: 'JSON to Kotlin Data Class',
    seo: 'JSON to Kotlin Data Class Generator | XUtil',
    body: `Generate Kotlin data classes for kotlinx.serialization from a JSON sample. Paste JSON and @Serializable classes appear as you type, one per nested object.

## How to use

1. Paste JSON, or load a \`.json\` file (up to 5 MB).
2. Optionally change the root class name (default \`Root\`). It must start with a letter or underscore and contain only letters, digits and underscores.
3. The Kotlin code updates as you type. Copy it, or Download it as a \`.kt\` file. The output needs the kotlinx.serialization plugin and runtime.

## What it does

| JSON | Kotlin |
| --- | --- |
| string | \`String\` |
| integer | \`Long\` |
| other number | \`Double\` |
| boolean | \`Boolean\` |
| null, or mixed types | \`JsonElement\` |
| array | \`List<T>\` |
| nested object | a named data class, \`RootAddress\` |
| null in some items | \`T?\` |
| key missing from some items | \`T? = null\` |

- Property names are camelCase; a key that differs, such as \`first_name\`, keeps the original in \`@SerialName("first_name")\`. Keywords such as \`when\` are written in backticks.
- Nested data classes are listed before the class that uses them. An empty object becomes a plain \`@Serializable class\`, because a data class needs at least one property.
- Imports cover only what the classes use: \`Serializable\`, and \`SerialName\` or \`JsonElement\` when they appear.

## Example

\`\`\`json
{ "id": 1, "user_name": "Ada", "tags": ["admin"] }
\`\`\`

\`\`\`kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Root(
    val id: Long,
    @SerialName("user_name")
    val userName: String,
    val tags: List<String>
)
\`\`\`

## Privacy

Inference runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'How do I parse JSON in Kotlin with kotlinx.serialization?',
        a: 'Mark the class @Serializable, apply the kotlinx.serialization Gradle plugin, and call Json.decodeFromString<Root>(text). Use Json { ignoreUnknownKeys = true } when the payload may carry keys the class does not declare.',
      },
      {
        q: 'What does @SerialName do?',
        a: 'It sets the JSON key for a property when it should differ from the Kotlin name, for example @SerialName("user_name") val userName. Without it, the serialiser uses the property name as the key.',
      },
      {
        q: 'Why do optional properties need a default value?',
        a: 'kotlinx.serialization treats a property without a default as required and fails when the key is missing. Giving it = null makes the key optional, and the nullable type lets an explicit null through as well.',
      },
      {
        q: 'Should I use Int or Long for JSON numbers?',
        a: 'Long is the safer default: IDs and timestamps often exceed the Int range of about 2.1 billion. Switch to Int when you know the field is small, or to Double when the sample shows a fraction.',
      },
    ],
  },
  jsonToCsharp: {
    title: 'JSON to C# Class',
    seo: 'JSON to C# Class Generator Online | XUtil',
    body: `Generate C# classes for System.Text.Json from a JSON sample. Paste JSON and classes with typed properties and JsonPropertyName attributes appear as you type.

## How to use

1. Paste JSON, or load a \`.json\` file (up to 5 MB).
2. Optionally change the root class name (default \`Root\`). It must start with a letter or underscore and contain only letters, digits and underscores.
3. The C# code updates as you type. Copy it, or Download it as a \`.cs\` file.

## What it does

| JSON | C# |
| --- | --- |
| string | \`string\` |
| integer | \`long\` |
| other number | \`double\` |
| boolean | \`bool\` |
| null, or mixed types | \`JsonElement\` |
| array | \`List<T>\` |
| nested object | a named class, \`RootAddress\` |
| null in some items, or key missing from some items | \`T?\` |

- Properties are PascalCase with \`{ get; set; }\`. Every property whose key differs from its name, including \`id\` → \`Id\`, gets \`[JsonPropertyName("key")]\`, so the class round-trips without a naming policy.
- Nested classes are listed before the class that uses them. \`using\` lines cover only what the classes need: \`System.Text.Json.Serialization\` always, \`System.Collections.Generic\` for lists and \`System.Text.Json\` for \`JsonElement\`.
- A key that matches its class name gets a \`Value\` suffix, because a member may not share the name of its enclosing type.

## Example

\`\`\`json
{ "id": 1, "userName": "Ada", "tags": ["admin"] }
\`\`\`

\`\`\`csharp
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class Root
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("userName")]
    public string UserName { get; set; }

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; }
}
\`\`\`

## Privacy

Inference runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between JsonPropertyName and JsonProperty in C#?',
        a: 'JsonPropertyName belongs to System.Text.Json (System.Text.Json.Serialization) and JsonProperty to Newtonsoft.Json. Both set the JSON key for a property; use the one that matches the serialiser your project calls, since each ignores the other.',
      },
      {
        q: 'How do I deserialize JSON to a C# class?',
        a: 'Call JsonSerializer.Deserialize<Root>(text) from System.Text.Json. Property names are matched case-sensitively by default, so either add JsonPropertyName attributes or pass JsonSerializerOptions with PropertyNameCaseInsensitive = true.',
      },
      {
        q: 'What does the ? after a type mean in C#?',
        a: 'For a value type such as long or bool it makes a Nullable<T> that can hold null. For a reference type such as string it is a nullable annotation that tells the compiler, with nullable reference types enabled, that null is an expected value.',
      },
      {
        q: 'Why is a JSON number mapped to long instead of int?',
        a: 'A JSON integer has no declared size, and IDs and timestamps regularly exceed the int limit of about 2.1 billion. long covers them safely; change a property to int when you know the values stay small.',
      },
    ],
  },
};
