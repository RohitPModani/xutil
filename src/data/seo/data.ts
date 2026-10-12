import type { SEODescriptionContent } from './types';

export const dataSeo: Record<string, SEODescriptionContent> = {
  xmlJson: {
    title: 'XML ⇄ JSON',
    seo: 'XML ⇄ JSON: Convert XML to JSON and Back | XUtil',
    body: `Convert XML to JSON or JSON to XML in the browser. Paste text or drop a file, the direction is detected from the input, and the result appears as you type.

## How to use

1. Paste XML or JSON into the input, or load a \`.xml\` or \`.json\` file (up to 5 MB) with the file picker or by dropping it on the page.
2. The direction is detected automatically: input that starts with \`{\` or \`[\` is treated as JSON, anything else as XML. Force a direction with the Auto / XML → JSON / JSON → XML switch if the guess is wrong.
3. The output updates as you type. Use Copy, or Download to save it as \`.json\` or \`.xml\` under the loaded file's name.

## How the mapping works

- XML is parsed with the browser's \`DOMParser\`, so malformed XML is reported with the parser's line and column rather than guessed at.
- Each element becomes a key; repeated sibling elements with the same name become an array.
- Element attributes are collected under an \`@attributes\` key. Text that sits beside attributes or child elements is kept under \`#text\`.
- An element with no attributes and no child elements becomes its trimmed text.
- JSON → XML uses a single top-level key as the root element; JSON with several keys, an array at the root or an array under the only key is wrapped in \`<root>\`. An \`@attributes\` object becomes attributes, a \`#text\` value becomes the element text, \`null\` becomes an empty element and an array repeats the element once per item. A key that is not a valid XML name is reported as an error. Output starts with an XML declaration and is indented with two spaces.
- Namespace prefixes are kept as part of the key name (\`ns:item\`). Comments are ignored.

## Example

\`\`\`
<note id="1">
  <to>Ada</to>
  <body>Hello</body>
</note>
→
{
  "note": {
    "@attributes": { "id": "1" },
    "to": "Ada",
    "body": "Hello"
  }
}
\`\`\`

## Privacy

Parsing and conversion run in the page. A dropped file is read locally, no request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Is there a standard way to convert XML to JSON?',
        a: 'No. XML has attributes, ordering, namespaces and mixed content that JSON does not, so every converter picks its own mapping. XUtil uses the common convention of an @attributes object for attributes and arrays for repeated elements.',
      },
      {
        q: 'Why do XML attributes end up under a key called @attributes?',
        a: 'JSON has no attribute concept, so attributes have to live somewhere inside the element object. Putting them under @attributes keeps them separate from child elements that might share a name.',
      },
      {
        q: 'What becomes the root element when my JSON has several keys?',
        a: 'An XML document must have exactly one root element. A single top-level key is used as that root; otherwise the converter wraps the whole document in a <root> element, and a root array becomes <item> elements inside it.',
      },
      {
        q: 'Does the converter upload my XML file?',
        a: 'No. The file is read with the browser File API and converted in the page, so its contents never leave your machine.',
      },
    ],
  },
  yamlJson: {
    title: 'YAML ⇄ JSON',
    seo: 'YAML ⇄ JSON: Convert YAML to JSON and Back | XUtil',
    body: `Convert YAML to JSON or JSON to YAML in the browser. Paste text or drop a file, the direction is detected from the input, and the result appears as you type.

## How to use

1. Paste YAML or JSON, or load a \`.yaml\`, \`.yml\` or \`.json\` file (up to 5 MB) with the file picker or by dropping it on the page.
2. Input that parses as JSON is converted to YAML; anything else, including flow-style YAML such as \`{a: 1}\`, is parsed as YAML and converted to JSON. Use the Auto / YAML → JSON / JSON → YAML switch to force a direction.
3. The output updates as you type. Copy it, or Download it as \`.json\` or \`.yaml\` named after the loaded file.

## What it supports

- Parsing and emitting are done by js-yaml. Loading uses the YAML 1.2 core schema: anchors and aliases are resolved, \`2024-01-01\` stays a string, \`0o17\` is the integer 15, and custom tags are not executed.
- A multi-document stream separated by \`---\` becomes a JSON array with one item per document.
- YAML → JSON output is indented with two spaces.
- JSON → YAML output is written with no line wrapping, so long strings stay on one line.
- A YAML parse error names the line and column.
- Comments in YAML are not carried into JSON, because JSON has no comment syntax.

## Example

\`\`\`
name: xutil
tools:
  - jwt
  - yaml
→
{
  "name": "xutil",
  "tools": [
    "jwt",
    "yaml"
  ]
}
\`\`\`

## Privacy

Conversion runs in the page. A dropped file is read locally, no request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Is YAML a superset of JSON?',
        a: 'Almost. YAML 1.2 was designed so that any valid JSON document is also valid YAML, which is why a JSON file can be fed straight to most YAML parsers. The reverse is not true: YAML adds comments, anchors, multi-line strings and unquoted keys that JSON cannot express.',
      },
      {
        q: 'Why did my YAML value "no" or "on" turn into a boolean?',
        a: 'The YAML 1.1 schema treats yes, no, on and off as booleans. js-yaml follows the stricter YAML 1.2 core schema, so only true and false are booleans; quote a value if you need it kept as a string either way.',
      },
      {
        q: 'What happens to comments when I convert YAML to JSON?',
        a: 'They are dropped. JSON has no comment syntax, so there is nowhere to put them; keep the original YAML if the comments matter.',
      },
      {
        q: 'What happens to a multi-document YAML stream?',
        a: 'Documents separated by a --- line are converted together into a JSON array, one item per document. A stream with a single document is converted to that document alone, not wrapped in an array.',
      },
    ],
  },
  csvJson: {
    title: 'CSV ⇄ JSON',
    seo: 'CSV ⇄ JSON: Convert CSV to JSON and Back | XUtil',
    body: `Convert CSV to a JSON array of objects, or JSON to CSV, in the browser. Nested objects become dot-joined column names and are rebuilt on the way back.

## How to use

1. Paste CSV (the first row is the header) or JSON, or load a \`.csv\`, \`.tsv\` or \`.json\` file up to 5 MB. The delimiter (comma, semicolon or tab) is detected, or pick one.
2. Input that starts with \`{\` or \`[\` is treated as JSON and converted to CSV; anything else is read as CSV. Use the Auto / CSV → JSON / JSON → CSV switch to force a direction.
3. The output updates as you type. Copy it, or Download it as \`.json\` or \`.csv\`.

## Rules

- **CSV → JSON** produces an array with one object per data row. Every value is a string unless "Infer numbers and booleans" is ticked; an empty cell becomes \`null\` and blank lines are skipped. A column named \`address.city\` becomes \`{ "address": { "city": … } }\`, so \`.\` in a header is read as a nesting separator. A cell holding a JSON array such as \`["a","b"]\` becomes an array.
- Parsing follows RFC 4180 (papaparse): a field wrapped in double quotes may contain the delimiter and line breaks, and \`""\` inside quotes is one quote.
- **JSON → CSV** accepts an object or an array of objects. Nested keys are joined with \`.\` to make a column, and an array inside a record is written as JSON text in one cell, so a record never becomes several rows.
- Values containing the delimiter, a quote or a line break are quoted and inner quotes doubled.

## Example

\`\`\`
id,name,address.city
1,Ada,London
→
[
  {
    "id": "1",
    "name": "Ada",
    "address": { "city": "London" }
  }
]
\`\`\`

## Privacy

Conversion runs in the page. A dropped file is read locally, no request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert CSV to a JSON array of objects?',
        a: 'Use the first row as the header: each header cell becomes a key and each later row becomes one object. That is the mapping this converter applies, with every value kept as a string.',
      },
      {
        q: 'How is nested JSON represented in CSV?',
        a: 'CSV is flat, so nested keys are joined into one column name. XUtil uses a dot: {"address": {"city": "London"}} becomes a column called address.city, and the same column turns back into the nested object. Arrays are written as JSON text in one cell.',
      },
      {
        q: 'Why are all my numbers strings after converting CSV to JSON?',
        a: 'CSV has no types; every cell is text. By default the converter does not guess, because a postcode like 01234 or an ID like 1e5 would be corrupted by automatic number conversion. Tick "Infer numbers and booleans" to convert cells that look like numbers, true or false.',
      },
      {
        q: 'What is RFC 4180?',
        a: 'RFC 4180 is the informal standard for CSV: comma-separated fields, CRLF line endings, optional header row, and double quotes around fields that contain commas, quotes or line breaks. Most spreadsheet exports follow it; tab and semicolon separated files are detected and handled too.',
      },
    ],
  },
  jsonToTs: {
    title: 'JSON to TypeScript',
    seo: 'JSON to TypeScript: Generate Interfaces from JSON | XUtil',
    body: `Generate TypeScript interfaces from a JSON sample. Paste JSON and a typed interface appears as you type, with a named interface for every nested object.

## How to use

1. Paste JSON, or load a \`.json\` file (up to 5 MB) with the file picker or by dropping it.
2. Optionally change the root interface name (default \`Data\`, up to 64 characters).
3. The TypeScript updates as you type. Copy it, or Download it as a \`.ts\` file.

## Inference rules

- \`string\`, \`number\`, \`boolean\` and \`null\` map to the matching TypeScript type. A field that is \`null\` in some array items and set in others becomes \`T | null\`.
- A nested object becomes its own \`interface\` named after its path, for example \`DataAddress\` or \`DataUserAddress\`, so two \`address\` objects under different parents keep their own shapes. Nested interfaces are listed before the interface that uses them.
- An array takes the element type: \`string[]\` when all items match, a union such as \`(string | number)[]\` when they differ, and \`any[]\` when the array is empty.
- An array of objects, including a top-level array, is typed from all its items: a key missing from some items gets the optional \`?\` marker.
- Interfaces are not exported. A key that is not a valid identifier is quoted, as in \`"first-name": string\`.

## Example

\`\`\`
{ "id": 1, "name": "Ada", "tags": ["admin"] }
→
interface Data {
  id: number;
  name: string;
  tags: string[];
}
\`\`\`

## Privacy

Inference runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'How do I generate a TypeScript interface from a JSON response?',
        a: 'Paste a representative response into a JSON-to-TypeScript tool; it infers a type for each key from the value in the sample. Check the result for fields that can be null or missing, since a single sample cannot show that.',
      },
      {
        q: 'What is the difference between interface and type in TypeScript?',
        a: 'Both describe object shapes. An interface can be extended and merged across declarations, while a type alias can also name unions, tuples and primitives. For data shapes from JSON either works; this tool emits interfaces.',
      },
      {
        q: 'Why is an empty array typed as any[]?',
        a: 'An empty array has no elements to infer from, so there is no evidence of what it holds. Replace any[] with the real element type once you know it.',
      },
      {
        q: 'Why are nested objects separate interfaces instead of inline types?',
        a: 'Named interfaces can be reused and referenced in function signatures, and they keep the root interface short. The generated names follow a RootKey pattern so they can be renamed with a single search and replace.',
      },
    ],
  },
  jsonToPython: {
    title: 'JSON to Python Dataclass',
    seo: 'JSON to Python: Generate Dataclasses from JSON | XUtil',
    body: `Generate Python dataclasses from a JSON sample. Paste JSON and typed @dataclass definitions appear as you type, one class per nested object, dates recognised.

## How to use

1. Paste JSON, or load a \`.json\` file (up to 5 MB).
2. Optionally change the root class name (default \`Root\`). It must start with a letter or underscore and contain only letters, digits and underscores, up to 64 characters.
3. The Python code updates as you type. Copy it, or Download it as a \`.py\` file.

## Inference rules

- Integers become \`int\`, other numbers \`float\`, booleans \`bool\`, strings \`str\`, and \`null\` becomes \`Optional[Any]\`.
- A string matching \`YYYY-MM-DD\` becomes \`date\`; an ISO 8601 timestamp such as \`2024-01-31T09:00:00Z\` becomes \`datetime\`.
- A list becomes \`List[T]\`. Mixed element types produce \`List[Union[...]]\`, except that \`int\` and \`float\` together collapse to \`List[float]\`. An empty list is \`List[Any]\`.
- A nested object becomes its own class named after its path, for example \`RootAddress\` or \`RootUserAddress\`, listed before the class that uses it. An empty object becomes a class with \`pass\`.
- A list of objects is typed from all its items: a key missing from some items becomes \`Optional[T] = None\` and is listed after the required fields.
- The header imports only what the classes use.
- A key that is not a valid Python identifier is renamed to snake_case (\`first-name\` → \`first_name\`, \`class\` → \`class_\`) with the original key in a comment.

## Example

\`\`\`
{ "id": 1, "name": "Ada", "joined": "2024-01-31" }
→
from dataclasses import dataclass
from datetime import date

@dataclass
class Root:
    id: int
    name: str
    joined: date
\`\`\`

## Privacy

Inference runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is a Python dataclass?',
        a: 'A class decorated with @dataclass from the standard library (Python 3.7 and later). The decorator generates __init__, __repr__ and __eq__ from the annotated fields, so a dataclass is a concise way to hold structured data.',
      },
      {
        q: 'Does a dataclass validate the types of its fields?',
        a: 'No. The annotations are hints for type checkers and editors; at runtime a dataclass accepts any value. Use Pydantic or a manual check if you need validation when loading JSON.',
      },
      {
        q: 'How do I load JSON into a dataclass?',
        a: 'Parse the JSON with json.loads and unpack the dict with Root(**data). Nested objects and date strings are not converted automatically, so convert them first or use a library such as dacite or Pydantic.',
      },
      {
        q: 'Why is a JSON null typed as Optional[Any]?',
        a: 'A single null value gives no information about the real type, so the generator writes Optional[Any] as a placeholder. Replace Any with the real type once you know what the field holds; a sample where the field is set in another item already gets Optional[T].',
      },
    ],
  },
  jsonToPydantic: {
    title: 'JSON to Pydantic Model',
    seo: 'JSON to Pydantic: Generate BaseModel Classes | XUtil',
    body: `Generate Pydantic models from a JSON sample. Paste JSON and BaseModel classes appear as you type, one model per nested object, with date fields typed.

## How to use

1. Paste JSON, or load a \`.json\` file (up to 5 MB).
2. Optionally change the root model name (default \`Root\`). It must start with a letter or underscore and contain only letters, digits and underscores, up to 64 characters.
3. The Python code updates as you type. Copy it, or Download it as a \`.py\` file.

## Inference rules

- Integers become \`int\`, other numbers \`float\`, booleans \`bool\`, strings \`str\`, and \`null\` becomes \`Optional[Any]\`.
- A string matching \`YYYY-MM-DD\` becomes \`date\`; an ISO 8601 timestamp becomes \`datetime\`. No validator is generated, because Pydantic parses ISO strings into these types on its own.
- A list becomes \`List[T]\`, mixed types \`List[Union[...]]\` (\`int\` and \`float\` together collapse to \`float\`), and an empty list \`List[Any]\`.
- A nested object becomes its own \`BaseModel\` subclass named after its path, for example \`RootAddress\` or \`RootUserAddress\`, listed before the model that uses it. An empty object becomes a model with \`pass\`.
- A list of objects is typed from all its items: a key missing from some items becomes \`Optional[T] = None\`.
- A key that is not a valid Python identifier is renamed to snake_case and kept as an alias, for example \`first_name: str = Field(alias="first-name")\`, so the JSON still loads with \`model_validate\`.
- The header imports only what the models use. No constraints are added.

## Example

\`\`\`
{ "id": 1, "joined": "2024-01-31" }
→
from pydantic import BaseModel
from datetime import date

class Root(BaseModel):
    id: int
    joined: date
\`\`\`

## Privacy

Inference runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between a Pydantic model and a dataclass?',
        a: 'A dataclass only stores fields; its type hints are not checked at runtime. A Pydantic BaseModel validates and coerces each field when an instance is created, so bad JSON fails early with a clear error.',
      },
      {
        q: 'How do I create a Pydantic model from JSON?',
        a: 'Define a BaseModel subclass with one annotated field per key, then call Root.model_validate(data) in Pydantic 2 (Root.parse_obj in Pydantic 1). Nested models are validated recursively.',
      },
      {
        q: 'Is @validator still supported in Pydantic 2?',
        a: 'Yes, but it is deprecated. Pydantic 2 keeps @validator for compatibility and emits a warning; new code should use @field_validator with mode="before" for the same pre-parsing behaviour.',
      },
      {
        q: 'Why do date fields have no validator?',
        a: 'Pydantic parses ISO 8601 strings into date and datetime on its own and raises a ValidationError for anything else, so a hand-written validator would only repeat that. Add a field_validator if you need to accept another format.',
      },
    ],
  },
  baseNumber: {
    title: 'Base Number Converter',
    seo: 'Base Number Converter: Binary, Octal, Hex, Base 2–36 | XUtil',
    body: `Convert a number between binary, octal, decimal, hexadecimal or any base from 2 to 36. Values of any length are handled exactly with BigInt; nothing is rounded.

## How to use

1. Type a number and pick the base it is written in (default base 10).
2. The equivalents in binary, octal, decimal and hexadecimal update as you type, each with a Copy button; Copy on the panel copies all rows.
3. Choose a fifth base under "Also show base" (default binary) to add any other base up to 36.

## What it supports

- Bases 2 to 36, each labelled with its name (binary, ternary, octal, duodecimal, hexadecimal, vigesimal and so on up to hexatrigesimal).
- Digits are \`0-9\` then \`a-z\`, case-insensitive on input and upper-case on output. A digit that is not valid in the chosen base is reported with the allowed digit set.
- Any length: the value is parsed into a BigInt, so numbers above 2^53 (about 9 × 10^15) convert exactly where \`parseInt\` would lose precision.
- Non-negative integers only. Signs, fractions, spaces and prefixes such as \`0x\` or \`0b\` are not accepted; strip the prefix first.

## Example

\`\`\`
255 (base 10)
→ Binary       11111111
→ Octal        377
→ Decimal      255
→ Hexadecimal  FF
→ Base 36      73
\`\`\`

## Privacy

Conversion runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert decimal to binary by hand?',
        a: 'Divide by 2 repeatedly and write down each remainder; the remainders read from last to first are the binary digits. For 13: 13→6 r1, 6→3 r0, 3→1 r1, 1→0 r1, giving 1101.',
      },
      {
        q: 'Why is hexadecimal used so much in programming?',
        a: 'One hex digit represents exactly four bits, so a byte is always two hex digits and a 32-bit value is eight. That makes hex a compact, lossless way to write binary data, memory addresses and colours such as #FF8800.',
      },
      {
        q: 'Why does JavaScript give the wrong answer for very large numbers?',
        a: 'JavaScript numbers are 64-bit floats with 53 bits of integer precision, so parseInt and toString round anything above 9,007,199,254,740,991. This converter uses BigInt instead, which has no upper limit.',
      },
      {
        q: 'What is base 36 used for?',
        a: 'Base 36 uses the digits 0-9 and letters a-z, the largest alphabet that is still case-insensitive. It is used for short identifiers and URL keys because it packs more information per character than decimal or hex.',
      },
    ],
  },
  textBase: {
    title: 'Text ⇄ Binary / Hex',
    seo: 'Text ⇄ Binary / Hex: Text to Binary, Hex, Octal | XUtil',
    body: `Convert text to binary, octal, decimal or hexadecimal character codes, and decode a list of codes back into text. Results appear as you type, in the browser.

## How to use

1. With the direction set to Text → codes, type or paste text. All four bases appear at once, each with a Copy button.
2. Pick the encoding: UTF-8 bytes (one number per byte) or UTF-16 units (one number per 16-bit code unit, the value JavaScript's charCodeAt gives).
3. Switch to Codes → text, pick the base the numbers are written in (default binary), and paste the codes separated by spaces or commas. The decoded text appears in the output.
4. Changing direction clears the input.

## What it produces

- With UTF-8 bytes, one number per byte: ASCII characters give one, \`é\` gives two (\`C3 A9\`) and most emoji give four. With UTF-16 units, one number per code unit: \`é\` gives \`E9\` and an emoji gives a surrogate pair such as \`D83D DE00\`. For ASCII text the two are identical.
- Codes are not zero-padded: \`H\` is \`1001000\` in binary, not \`01001000\`, and hex digits are upper case with no \`0x\` prefix.
- When decoding, tokens may be separated by spaces or commas; a single unseparated binary or hex string is cut into 8-bit (UTF-8) or 16-bit (UTF-16) units. Each token must contain only digits valid in the chosen base; the first invalid token is named in the error.
- UTF-8 decoding rejects values above \`FF\` and byte sequences that are not valid UTF-8. UTF-16 decoding joins surrogate pairs, also accepts a full code point such as \`1F600\`, and rejects anything above \`10FFFF\`.

## Example

\`\`\`
Hello
→ Binary       1001000 1100101 1101100 1101100 1101111
→ Octal        110 145 154 154 157
→ Decimal      72 101 108 108 111
→ Hexadecimal  48 65 6C 6C 6F
\`\`\`

## Privacy

Conversion runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert text to binary?',
        a: 'Look up each character\'s code (A is 65, a is 97) and write that number in base 2. "Hi" becomes 1001000 1101001; pad each group to eight digits if you want byte-aligned output.',
      },
      {
        q: 'What is the difference between ASCII and Unicode?',
        a: 'ASCII defines 128 characters with codes 0 to 127. Unicode extends the same first 128 codes to over 149,000 characters; UTF-8 and UTF-16 are the encodings that turn those code points into bytes.',
      },
      {
        q: 'Why does an emoji produce two or four numbers?',
        a: 'Characters above U+FFFF need four bytes in UTF-8 (F0 9F 98 80 for 😀) and a surrogate pair of two 16-bit units in UTF-16 (D83D DE00). Pick the encoding that matches the system you are talking to.',
      },
      {
        q: 'Why is "Hello" in hex 48 65 6C 6C 6F?',
        a: 'Those are the ASCII codes of H, e, l, l and o (72, 101, 108, 108, 111) written in base 16. Hex is the usual way to show bytes because every byte fits in exactly two hex digits.',
      },
    ],
  },
  unixUtc: {
    title: 'Unix ⇄ UTC',
    seo: 'Unix ⇄ UTC: Unix Timestamp Converter to Date | XUtil',
    body: `Convert a Unix timestamp to a readable UTC and local date, or a date to epoch seconds and milliseconds. Seconds and milliseconds are told apart automatically.

## How to use

1. In "Epoch to date", type a timestamp. The unit is guessed from the size: below 1e11 is seconds, then milliseconds, from 1e14 microseconds and from 1e17 nanoseconds; the hint says which was assumed.
2. In "Date to epoch", type a date as ISO 8601 (\`2025-05-01T13:57:00Z\`) or as \`YYYY-MM-DD HH:mm:ss\`. A date with no zone is treated as UTC.
3. Both panels show the result as you type: seconds, milliseconds, ISO 8601, the full UTC date, the same instant in your local zone, and a relative phrase such as "in 3 days". Each row has a Copy button, and Now fills in the current time.

## What it supports

- Positive and negative timestamps (dates before 1970), and decimal seconds.
- Any instant JavaScript's \`Date\` can hold: about 271,000 years either side of 1970.
- Date parsing is strict: \`YYYY-MM-DD\`, optionally followed by \`HH:mm\`, \`HH:mm:ss\` or \`HH:mm:ss.sss\` after a \`T\` or a space, then an optional \`Z\` or offset such as \`+05:30\`. Impossible dates such as \`2025-02-30\` or \`24:00\` are rejected rather than rolled over, and other formats such as \`01/05/2025\` are rejected.
- The UTC and local rows are formatted for your browser locale. The relative row counts a month as 30 days and a year as 365.
- Milliseconds are preserved in the ISO row and the milliseconds row; the seconds row is the floor.

## Example

\`\`\`
1714583820
→ Seconds       1714583820
→ Milliseconds  1714583820000
→ ISO 8601      2024-05-01T17:17:00.000Z
\`\`\`

## Privacy

Conversion runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is a Unix timestamp?',
        a: 'The number of seconds since 1 January 1970 00:00:00 UTC, the Unix epoch, not counting leap seconds. It is a plain integer, so it is easy to store and compare and is the same in every time zone.',
      },
      {
        q: 'How do I tell whether a timestamp is in seconds or milliseconds?',
        a: 'Count the digits. Current times are 10 digits in seconds (about 1.7 billion) and 13 digits in milliseconds. JavaScript Date.now() and Java System.currentTimeMillis() use milliseconds; most Unix tools and Python time.time() use seconds.',
      },
      {
        q: 'What is the year 2038 problem?',
        a: 'Systems that store a Unix timestamp as a signed 32-bit integer overflow at 2,147,483,647 seconds, which is 19 January 2038 03:14:07 UTC. 64-bit timestamps, now standard, push the limit out by billions of years.',
      },
      {
        q: 'How do I convert a date to a Unix timestamp in code?',
        a: 'In JavaScript, Math.floor(Date.parse("2025-05-01T13:57:00Z") / 1000). In Python, int(datetime(2025, 5, 1, 13, 57, tzinfo=timezone.utc).timestamp()). Both give 1746107820; always attach a time zone so the result is unambiguous.',
      },
    ],
  },
  timezone: {
    title: 'Timezone Converter',
    seo: 'Timezone Converter: Convert Time Between Cities | XUtil',
    body: `Convert a date and time from one city to another, to up to ten cities at once, or as a start–end range. Daylight saving time comes from IANA time zone data.

## How to use

1. **Convert**: pick a date and time, choose the From city (your own zone is pre-selected) and the To city (UTC by default). The converted time, its ISO 8601 form and whether each zone is on daylight saving time appear as you change anything. The swap button reverses the direction.
2. **Convert to many zones**: enter one time and a base zone, then add up to 10 target cities to see the same instant in each.
3. **Convert a range**: enter a start and end in the base zone and up to 10 targets to see the window in every city, for example to schedule a meeting.
4. **Saved cities**: keep up to 3 cities with live clocks and their current UTC offset at the top of the page.

## What it supports

- Over 300 cities grouped by region, searchable by city or country name. Each maps to an IANA zone such as \`America/New_York\`.
- Daylight saving rules and historical offsets come from the browser's built-in IANA data, computed with the Luxon library, so a conversion for a date in July uses that date's offset, not today's.
- A wall-clock time that does not exist, such as 02:30 on a spring-forward night, is reported as an error rather than silently shifted; a time that occurs twice on a fall-back night is converted and a note says which occurrence was used.
- Results show the zone abbreviation and UTC offset of the converted instant, and the Now button refreshes the time.
- Results are formatted for your browser locale.

## Example

\`\`\`
1 Jul 2024, 09:00 in New York → London
→ Converted  1 Jul 2024, 14:00
→ Zone       BST (UTC+01:00)
→ ISO        2024-07-01T14:00:00.000+01:00
→ From zone  Daylight saving time, EDT (UTC-04:00)
→ To zone    Daylight saving time, BST (UTC+01:00)
\`\`\`

## Privacy

Conversion runs in the page and no request is made. The saved cities list is stored in your browser's localStorage under the key \`savedTimezones\` as a JSON array of city labels; nothing else is stored, and Reset removes it.`,
    faq: [
      {
        q: 'Why does the time difference between two cities change during the year?',
        a: 'Daylight saving time. New York and London are 5 hours apart in summer but briefly 4 hours apart in March and October, because the two countries switch on different dates. A converter needs the specific date, not just the two zones.',
      },
      {
        q: 'What is the IANA time zone database?',
        a: 'The tz database, maintained by IANA, is the public record of every time zone\'s offset and daylight saving rules, past and present. Zone names look like Europe/Paris, and operating systems, browsers and most programming languages ship a copy of it.',
      },
      {
        q: 'Why should I use a city name instead of an abbreviation like EST or IST?',
        a: 'Abbreviations are ambiguous: IST means Indian, Irish or Israel Standard Time, and EST does not tell you whether daylight saving applies. A city maps to one IANA zone with exact rules.',
      },
      {
        q: 'What is the difference between UTC and GMT?',
        a: 'For everyday purposes they are the same time. UTC (Coordinated Universal Time) is the atomic-clock standard that time zones are defined against; GMT is the older name for the zone at zero offset, still used in the United Kingdom in winter.',
      },
    ],
  },
  cronConverter: {
    title: 'Cron Converter',
    seo: 'Cron Converter: English Schedule to Cron Expression | XUtil',
    body: `Turn a short English phrase such as "every weekday at 9:30am" into a five-field cron expression. The expression and each field's meaning appear as you type.

## How to use

1. Type a schedule in words, or click one of the example phrases below the input.
2. The cron expression appears on the right as you type, with Copy, and the five fields are listed as minute, hour, day of month, month and day of week.
3. If the phrase is not recognised, the error says so; rephrase using one of the patterns below.

## Phrases it understands

The parser matches a fixed set of English patterns (case-insensitive). It does not convert cron back into English.

| Phrase | Cron |
| --- | --- |
| \`every 15 minutes\`, \`every 2 hours\`, \`every 3 days\` | \`*/N\` in that field; N must fit the field (1–59 minutes, 1–23 hours, 1–31 days) |
| \`every 6 months\` | \`0 0 1 */6 *\` (the 1st of every sixth month) |
| \`every 2 weeks\` | \`0 0 */14 * *\`; cron has no fortnight, so the count restarts on the 1st of each month |
| \`every weekday\`, \`weekdays\`, \`monday to friday\` | day of week \`1-5\` |
| \`every weekend\`, \`weekends\` | day of week \`0,6\` |
| \`every monday\` … \`every sunday\`, \`monday and wednesday\`, \`tuesday through thursday\` | day of week \`0\`–\`6\`, a list or a range |
| \`every other day\`, \`alternate day\` | day of month \`*/2\` |
| \`on the 1st\`, \`on the 1st and 15th\`, \`on day 20\` | day of month |
| \`at 9:30am\`, \`at 3 pm\`, \`at 17\`, \`at midnight\`, \`at noon\` | sets minute and hour; combines with every other row |
| \`at 9am and 5pm\`, \`at 9, 12 and 17\` | hour list \`9,17\`; the minutes must match, since one expression holds one minute value |
| \`between 9 am and 5 pm\` | hour \`9-17\`; minute \`0\` unless an \`every N minutes\` or \`:MM\` is given |
| \`between 9 pm and 5 am\` | wraps past midnight as \`21-23,0-5\` |
| \`midnight\`, \`noon\`, \`mid-day\` | \`0 0 * * *\`, \`0 12 * * *\` |
| \`every hour\`, \`hourly\` | \`0 * * * *\` |
| \`every day\`, \`daily\` | \`0 0 * * *\` |
| \`every week\`, \`weekly\` | \`0 0 * * 0\` |
| \`every month\`, \`monthly\` | \`0 0 1 * *\` |
| \`every year\`, \`yearly\`, \`annually\` | \`0 0 1 1 *\` |
| \`every minute\`, \`minutely\` | \`* * * * *\` |
| \`in january\` … \`in december\`, \`in january and july\` | month \`1\`–\`12\` or a list |

Clauses combine: \`every 2 hours on weekdays in january\` fills three fields. A day-level phrase with no "at" clause (\`every monday\`, \`every weekend\`, \`every 3 days\`) means midnight; add a time to move it. \`every N hours\` and hour windows fire on the hour. Times are checked (\`at 25:00\` and \`at 13 pm\` are errors) and zero padding is dropped (\`at 09:05\` → \`5 9\`). Input is limited to 120 characters.

## Example

\`\`\`
every weekday at 9:30am → 30 9 * * 1-5
every 15 minutes        → */15 * * * *
every monday at 3 pm    → 0 15 * * 1
\`\`\`

## Privacy

Parsing runs in the page. No request is made and nothing is stored.`,
    faq: [
      {
        q: 'What do the five fields in a cron expression mean?',
        a: 'In order: minute (0-59), hour (0-23), day of month (1-31), month (1-12) and day of week (0-6, Sunday is 0). An asterisk means every value, 1-5 is a range, 0,6 a list, and */15 every fifteenth value.',
      },
      {
        q: 'What does */5 mean in cron?',
        a: 'Every fifth value, starting from the field\'s minimum. In the minute field */5 runs at :00, :05, :10 and so on; in the hour field it runs at 0:00, 5:00, 10:00, 15:00 and 20:00.',
      },
      {
        q: 'How do I write a cron job for every weekday at 9am?',
        a: '0 9 * * 1-5. The minute is 0, the hour is 9, any day of month and month, and days 1 to 5 are Monday to Friday.',
      },
      {
        q: 'Does cron use the server time zone?',
        a: 'Yes. Classic POSIX cron evaluates expressions in the system\'s local time, so a job set for 9am runs at 9am in the server\'s zone and shifts with daylight saving. Set TZ in the crontab or use UTC on the server if that matters.',
      },
    ],
  },
};
