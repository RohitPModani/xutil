import type { SEODescriptionContent } from './types';

export const jsonSeo: Record<string, SEODescriptionContent> = {
  jsonDiff: {
    title: 'JSON Diff',
    seo: 'JSON Diff: Compare Two JSON Files Online | XUtil',
    body: `A JSON diff tool compares two JSON documents and shows what changed, ignoring key order and formatting. Added and removed lines are highlighted as you type.

## How to use

1. Paste or load the first document on the left and the second on the right. Each side reports its own parse error with a line number until it is valid JSON.
2. Leave "Ignore key order" on so that \`{"a": 1, "b": 2}\` and \`{"b": 2, "a": 1}\` count as equal. Tick "Ignore array order" when arrays are sets rather than sequences.
3. Read the diff: lines beginning with \`-\` exist only on the left, lines beginning with \`+\` only on the right. Unchanged runs are folded unless "Show unchanged lines" is ticked.
4. Copy or download the diff as a \`.patch\` file.

## What it does

- Parses both sides, sorts object keys recursively (when "Ignore key order" is on) and pretty-prints each with two-space indentation. Only then are the two texts compared line by line, so indentation, spacing and key order never show up as differences.
- Numbers are compared by value: \`1.0\` and \`1\` are the same, as are \`1e2\` and \`100\`. Integers above 2^53 lose precision in the browser, so differences in those digits are not detected.
- "Ignore array order" sorts the items of every array by their JSON text before comparing, so \`[1, 2]\` equals \`[2, 1]\`. Off by default because order usually matters in arrays.
- Reports "Identical after normalisation" when nothing differs, otherwise the number of lines added and removed. The patch is a plain line diff, not a JSON Patch (RFC 6902) document.
- Both sides must parse; the tool does not compare JSON with trailing commas or comments.

## Example

\`\`\`
Left:  {"name": "xutil", "tools": 42, "tags": ["a", "b"]}
Right: {"tags": ["a", "b"], "tools": 43, "name": "xutil"}

   "name": "xutil",
   "tags": [
     "a",
     "b"
   ],
-  "tools": 42
+  "tools": 43
\`\`\`

## Privacy

Both documents are compared in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I compare two JSON files ignoring the order of keys?',
        a: 'Parse both files, sort every object\'s keys recursively, pretty-print them with the same indentation and diff the results. That is what this tool does with "Ignore key order" on, so two documents that differ only in key order show as identical.',
      },
      {
        q: 'Does the order of elements in a JSON array matter?',
        a: 'Yes. JSON arrays are ordered, so [1, 2] and [2, 1] are different values. When an array is used as an unordered set, tick "Ignore array order" and the items are sorted before the comparison.',
      },
      {
        q: 'What is the difference between a JSON diff and a JSON Patch?',
        a: 'A diff shows the lines that differ for a person to read. A JSON Patch (RFC 6902) is a machine-readable list of add, remove and replace operations that turns one document into the other. This tool produces a line diff.',
      },
      {
        q: 'Why does the diff treat 1.0 and 1 as equal?',
        a: 'JSON has one number type and the two spellings denote the same value, so after parsing there is no difference left to show. The same applies to 1e2 and 100.',
      },
    ],
  },
  jsonPath: {
    title: 'JSONPath Tester',
    seo: 'JSONPath Tester: Query JSON Online | XUtil',
    body: `A JSONPath tester runs a path expression such as \`$.store.books[*].author\` against a JSON document and lists every match with its path, updating as you type.

## How to use

1. Paste or load the JSON document on the left.
2. Type a JSONPath expression. The default \`$\` matches the whole document; the result updates with every keystroke.
3. Read the matches as a JSON array in the first output and the normalised path of each match, such as \`$['store']['books'][0]['author']\`, in the second.
4. Copy either output, or download the matches as a \`.json\` file.

## Supported syntax

| Syntax | Meaning |
| --- | --- |
| \`$\` | The root document |
| \`.name\` or \`['name']\` | A member of an object; quoted names may contain dots and spaces |
| \`[0]\`, \`[-1]\` | An array item; a negative index counts from the end |
| \`*\` or \`[*]\` | Every member or item |
| \`..name\`, \`..*\`, \`..[0]\` | Recursive descent: the selector applied at every depth |
| \`[0,2]\`, \`['a','b']\` | A union of indexes or names |
| \`[start:end:step]\` | An array slice with Python rules: end is exclusive, any part may be omitted, a negative step reverses |

Filter expressions \`[?(@.price < 10)]\` and script expressions \`[(@.length-1)]\` are not supported; the tool says so instead of returning nothing. A missing member or an out-of-range index simply produces no match. A path without the leading \`$\` is accepted.

## Example

\`\`\`
{"store": {"books": [{"author": "Austen", "price": 8}, {"author": "Eco", "price": 12}]}}

$.store.books[*].author   → ["Austen", "Eco"]
$..price                  → [8, 12]
$.store.books[-1:]        → [{"author": "Eco", "price": 12}]
\`\`\`

## Privacy

The query runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is JSONPath?',
        a: 'JSONPath is a query language for JSON, in the way XPath is for XML. An expression starts at the root ($), walks down members and array items, and can use wildcards, recursive descent, unions and slices to select many values at once. It was proposed by Stefan Goessner in 2007 and standardised as RFC 9535 in 2024.',
      },
      {
        q: 'What is the difference between $.name and $..name?',
        a: 'A single dot selects a direct member of the current object, so $.name matches only a top-level "name". Two dots descend recursively and match "name" at any depth.',
      },
      {
        q: 'How do I select the last element of an array in JSONPath?',
        a: 'Use a negative index: $.items[-1] returns the last item, and $.items[-2:] returns the last two. Older implementations needed the script form [(@.length-1)], which this tool does not support.',
      },
      {
        q: 'What is the difference between JSONPath and jq?',
        a: 'JSONPath only selects values from a document. jq is a full command-line language that can also transform, filter and build new JSON. Simple jq paths such as .store.books[0].author have a JSONPath equivalent, $.store.books[0].author.',
      },
    ],
  },
};
