import type { SEODescriptionContent } from './types';

export const textSeo: Record<string, SEODescriptionContent> = {
  loremIpsum: {
    title: 'Lorem Ipsum Generator',
    seo: 'Lorem Ipsum Generator: Placeholder Paragraphs | XUtil',
    body: `A lorem ipsum generator produces placeholder text for layouts and mockups. Choose paragraphs, sentences or words, set a count, and copy or download the result.

## How to use

1. Pick a unit: paragraphs, sentences or words. Text is generated as soon as the page loads and again whenever an option changes.
2. Set how many you want. The input is clamped to the limit for that unit.
3. Untick "Start with Lorem ipsum" for a fully random opening, or tick "Wrap paragraphs in <p>" to get HTML paragraphs.
4. Press New to reshuffle, then Copy or Download (\`lorem.txt\`, or \`lorem.html\` when wrapped).

## Options and limits

| Unit | Maximum | Shape |
| --- | --- | --- |
| Paragraphs | 50 | 3 to 8 sentences each |
| Sentences | 100 | 5 to 15 words each, capitalised, ending in a full stop |
| Words | 1,000 | lowercase, space-separated |

- Words are drawn at random from the 69-word classic passage, so the vocabulary is the familiar one.
- Paragraphs are separated by a blank line. The <p> option is only offered for paragraphs.
- Output is random each time; there is no seed, so the same settings give different text on every New.

## Example

\`\`\`
Unit: words · How many: 7 · Start with Lorem ipsum
→ lorem ipsum dolor sit amet veniam culpa
\`\`\`

## Privacy

Generation runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does lorem ipsum mean?',
        a: 'Nothing coherent. It is a scrambled extract from Cicero\'s "De finibus bonorum et malorum" (45 BC) that has been used as filler text in typesetting since at least the 1960s, because it has a natural distribution of word lengths without readable meaning.',
      },
      {
        q: 'Why use placeholder text instead of real content?',
        a: 'Real words pull attention to what they say; placeholder text lets reviewers judge layout, type size and spacing on their own. It is replaced before publishing.',
      },
      {
        q: 'How many words are in a typical paragraph?',
        a: 'This generator makes paragraphs of 3 to 8 sentences with 5 to 15 words each, so roughly 15 to 120 words, averaging around 55. Web copy paragraphs usually sit between 40 and 100 words.',
      },
    ],
  },
  slug: {
    title: 'Slug Generator',
    seo: 'Slug Generator: Turn a Title into a URL Slug | XUtil',
    body: `A slug generator turns a title into a URL-safe slug. Accents are stripped, punctuation dropped and words joined with a hyphen, underscore, dot or nothing.

## How to use

1. Type or paste the title (up to 1,000 characters). The slug updates as you type.
2. Choose a separator: hyphen (default), underscore, dot or none.
3. Choose the case: lowercase (default), UPPERCASE or Keep, which leaves the original capitalisation.
4. Copy the slug from the output.

## What it does

- Decomposes accented letters with Unicode NFKD normalisation and removes the combining marks, so "é" becomes "e".
- Removes every character that is not a letter, digit, underscore, whitespace, tilde or hyphen. Letters outside ASCII that have no decomposition (for example Chinese characters) are removed, not transliterated.
- Splits on runs of whitespace and hyphens, so "well-known  word" becomes three parts, and joins them with the chosen separator. Existing underscores inside a word are kept.
- Shows an error when nothing remains after cleaning, for example for input that is only punctuation.
- Does not check whether the slug is unique or already in use anywhere.

## Example

\`\`\`
Café au Lait — a Beginner's Guide!
→ cafe-au-lait-a-beginners-guide
\`\`\`

## Privacy

The slug is built in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is a URL slug?',
        a: 'The human-readable part of a URL that identifies a page, such as "cafe-au-lait" in example.com/posts/cafe-au-lait. It usually contains only lowercase letters, digits and hyphens so it needs no percent-encoding.',
      },
      {
        q: 'Should I use hyphens or underscores in URLs?',
        a: 'Hyphens. Google treats a hyphen as a word separator but an underscore as a word joiner, so "blue-widgets" is read as two words and "blue_widgets" as one.',
      },
      {
        q: 'Why are accents removed from slugs?',
        a: 'Non-ASCII characters are legal in URLs but are percent-encoded when copied or shared, so "café" becomes "caf%C3%A9". Stripping accents keeps the link short and readable everywhere.',
      },
      {
        q: 'Does changing a slug break existing links?',
        a: 'Yes. The old URL stops working unless you add a redirect (HTTP 301) from the old slug to the new one. Pick a slug before publishing and avoid changing it.',
      },
    ],
  },
  textCompare: {
    title: 'Text Compare',
    seo: 'Text Compare: Line-by-Line Diff of Two Texts | XUtil',
    body: `A text compare tool shows the line-by-line diff of two texts, marking added and removed lines, with ignore-whitespace and ignore-case options.

## How to use

1. Paste the original text on the left and the changed text on the right. The diff appears as you type.
2. Tick "Ignore whitespace" to treat lines that differ only in spacing as equal, or "Ignore case" to ignore letter case.
3. Read the counts of added and removed lines, then the diff: removed lines are marked with − on a red background, added lines with + on green, unchanged lines in between.
4. Copy the result or Download it as \`diff.patch\`. Both give the unified diff, not the coloured view.

## What it supports

- Compares whole lines, using the same algorithm as the \`diff\` npm package. A changed line shows as one removal plus one addition; characters within a line are not highlighted.
- Each text can be at most 10,000 lines; longer input shows an error instead of a diff.
- The copied and downloaded output is a unified diff with the headers \`--- original\` and \`+++ changed\`, which \`git apply\` and \`patch\` understand.
- There is no side-by-side view and no word-level diff.

## Example

\`\`\`
Original          Changed
alpha             alpha
beta              beta
gamma             delta

→  alpha
   beta
−  gamma
+  delta
Added 1 · Removed 1
\`\`\`

## Privacy

The comparison runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is a unified diff?',
        a: 'A text format for describing changes between two files: a header naming the files, then hunks starting with @@ that list context lines, removed lines prefixed with − and added lines prefixed with +. It is the format produced by git diff and consumed by patch.',
      },
      {
        q: 'Why does a diff show a whole line as changed when only one word differs?',
        a: 'A line diff compares lines as units, so any change makes the old line a removal and the new line an addition. Tools that highlight individual words run a second, character-level diff inside each changed pair.',
      },
      {
        q: 'How do I compare two texts while ignoring spaces?',
        a: 'Enable the "Ignore whitespace" option. Lines that differ only in spaces or tabs are then treated as identical, which hides indentation-only changes.',
      },
      {
        q: 'How do I apply a .patch file?',
        a: 'Save it next to the original file and run patch original < diff.patch, or git apply diff.patch inside a repository. The patch records the lines around each change, so it fails cleanly if the file has drifted.',
      },
    ],
  },
  urlParser: {
    title: 'URL Parser',
    seo: 'URL Parser: Split Host, Path, Query and Fragment | XUtil',
    body: `A URL parser breaks a URL into protocol, origin, hostname, port, path, query and fragment and lists each query parameter decoded. Results appear as you type.

## How to use

1. Paste a full URL including the scheme, for example \`https://\`. Parsing happens as you type.
2. Read the parts on the left: protocol, origin, hostname, port, path, query and fragment, plus username and password when the URL contains them.
3. Read the query parameters on the right, one row per key with its percent-decoded value.
4. Copy any single value with its row button, or Copy on either panel to get all rows as \`label: value\` lines.

## What it supports

- Uses the browser's \`URL\` class, so parsing follows the WHATWG URL Standard that browsers use: hostnames are lowercased, default ports are dropped and the path is normalised.
- Query values are decoded with \`URLSearchParams\`, so \`%20\` and \`+\` both show as a space. Repeated keys appear as separate rows.
- Relative URLs and bare hostnames such as \`example.com/page\` are rejected with an error, because the parser needs a scheme.
- Port is empty when the URL uses the default port for its scheme (80 for http, 443 for https).
- Does not fetch the URL or check that the host exists.

## Example

\`\`\`
https://example.com:8080/path/to/page?q=search&page=2#top
→ Protocol  https:
→ Origin    https://example.com:8080
→ Hostname  example.com
→ Port      8080
→ Path      /path/to/page
→ Query     ?q=search&page=2
→ Fragment  #top
→ q = search · page = 2
\`\`\`

## Privacy

Parsing runs in the browser. No request is made to the URL or anywhere else, and nothing is stored.`,
    faq: [
      {
        q: 'What are the parts of a URL?',
        a: 'Scheme (https), optional user info, host, optional port, path, optional query starting with ? and optional fragment starting with #. Together scheme, host and port form the origin, which browsers use for the same-origin policy.',
      },
      {
        q: 'What is the difference between a query string and a fragment?',
        a: 'The query (?key=value) is sent to the server with the request. The fragment (#section) is never sent; the browser uses it locally to scroll to an element or to drive client-side routing.',
      },
      {
        q: 'Why is the port empty for an https URL?',
        a: 'Because 443 is the default port for https, and the WHATWG URL parser drops a port that matches the scheme default. The same happens for port 80 with http.',
      },
      {
        q: 'Is it safe to paste a URL with a token into a parser?',
        a: 'This parser never sends the URL anywhere, so the token stays in your browser. Treat any URL containing a token or password as a credential and avoid sharing it in screenshots or logs.',
      },
    ],
  },
  jsonValidator: {
    title: 'JSON Formatter & Validator',
    seo: 'JSON Formatter & Validator: Pretty-Print or Minify | XUtil',
    body: `A JSON formatter and validator checks that text is valid JSON, names the line of the first error, and prints it with 2 or 4 spaces or minified.

## How to use

1. Paste JSON, or load a \`.json\` or \`.txt\` file of up to 5 MB by choosing it or dropping it on the page. Validation runs as you type.
2. Pick the output: 2 spaces (default), 4 spaces or Minify.
3. Read the status line. Valid JSON reports the top-level shape, for example "3 keys" or "12 items". Invalid JSON shows the parser's message and, when the browser reports a position, the line number.
4. Copy the result or Download it as \`.json\`, named after the loaded file when there is one.

## What it supports

- Parses with the browser's \`JSON.parse\`, so it follows RFC 8259 exactly: double-quoted keys, no trailing commas, no comments, no single quotes.
- Re-serialises with \`JSON.stringify\`, which removes all original whitespace and prints keys in their original order. Numbers are printed as JavaScript numbers, so \`1.0\` becomes \`1\` and integers above 2^53 lose precision.
- The error line is taken from the parser message; some browsers only report a position, which is converted to a line, and some report neither.
- Does not sort keys, fix errors or check the document against a JSON Schema.

## Example

\`\`\`
{"name":"xutil","tags":["json","tool"]}
→ 2 spaces
{
  "name": "xutil",
  "tags": [
    "json",
    "tool"
  ]
}
\`\`\`

## Privacy

Parsing and formatting run in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Why is my JSON invalid when it looks fine?',
        a: 'The usual causes are a trailing comma after the last item, single quotes instead of double quotes, an unquoted key, or a comment. JSON (RFC 8259) allows none of these, even though JavaScript does.',
      },
      {
        q: 'What is the difference between JSON formatting and minifying?',
        a: 'Formatting adds line breaks and indentation so people can read the structure; minifying removes every optional space and newline so the file is smaller to send. The data is identical either way.',
      },
      {
        q: 'Does JSON allow comments?',
        a: 'No. The JSON specification has no comment syntax, so a parser rejects // and /* */. Some configuration formats such as JSONC and JSON5 add comments, but standard JSON.parse will not accept them.',
      },
      {
        q: 'Why did a large number change after formatting?',
        a: 'JavaScript stores numbers as 64-bit floats, so integers above 9,007,199,254,740,991 (2^53 − 1) cannot be represented exactly and are rounded when the JSON is parsed and re-printed. Keep such values as strings if precision matters.',
      },
    ],
  },
  textCase: {
    title: 'Text Case Converter',
    seo: 'Text Case Converter: camelCase, snake_case, kebab | XUtil',
    body: `A text case converter rewrites text in 13 cases at once: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case and more.

## How to use

1. Type or paste the text. All 13 cases appear in the list on the right as you type.
2. Copy one case with the button on its row.
3. Copy on the panel copies every row as \`label: value\` lines.

## The 13 cases

| Case | Example for "hello world from xutil" |
| --- | --- |
| camelCase | helloWorldFromXutil |
| PascalCase | HelloWorldFromXutil |
| snake_case | hello_world_from_xutil |
| kebab-case | hello-world-from-xutil |
| CONSTANT_CASE | HELLO_WORLD_FROM_XUTIL |
| dot.case | hello.world.from.xutil |
| path/case | hello/world/from/xutil |
| Header-Case | Hello-World-From-Xutil |
| Title Case | Hello World From Xutil |
| Sentence case | Hello world from xutil |
| lowercase | hello world from xutil |
| UPPERCASE | HELLO WORLD FROM XUTIL |
| mOcKiNg cAsE | hElLo wOrLd fRoM XuTiL |

- The word-joined cases (camel to Header) split the input on whitespace, hyphens and underscores. A run such as "XMLParser" is one word, so it is not split at the capital letters.
- Title Case, Sentence case, lowercase, UPPERCASE and mOcKiNg cAsE keep the original spacing and punctuation.
- Title Case capitalises every word, including "a" and "of"; it does not apply style-guide exceptions.

## Example

\`\`\`
user first name
→ camelCase   userFirstName
→ snake_case  user_first_name
→ kebab-case  user-first-name
\`\`\`

## Privacy

Conversion runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between camelCase and PascalCase?',
        a: 'Both join words without separators and capitalise each word after the first. camelCase starts with a lowercase letter (userName) and is common for variables; PascalCase starts with an uppercase letter (UserName) and is common for class and type names.',
      },
      {
        q: 'When should I use snake_case instead of kebab-case?',
        a: 'snake_case (user_name) is valid in identifiers in most programming languages and is standard in Python and SQL. kebab-case (user-name) contains a minus sign, so it cannot be an identifier; it is used in URLs, CSS class names and file names.',
      },
      {
        q: 'What is CONSTANT_CASE used for?',
        a: 'Also called SCREAMING_SNAKE_CASE, it is the convention for constants and environment variables, such as MAX_RETRIES or DATABASE_URL, in C, Java, Python, JavaScript and shell scripts.',
      },
    ],
  },
  markdownPreviewer: {
    title: 'Markdown Previewer',
    seo: 'Markdown Previewer: Render Markdown to HTML Live | XUtil',
    body: `A Markdown previewer renders Markdown to HTML as you type, with GitHub Flavoured Markdown tables and task lists. Copy or download the HTML.

## How to use

1. Type or paste Markdown on the left. The rendered preview updates on the right as you type.
2. Copy to put the generated HTML on the clipboard, or Download it as \`preview.html\`.
3. Use Clear to start again.

## What it supports

- Rendering uses the \`marked\` library with GitHub Flavoured Markdown (GFM) enabled: headings, emphasis, links, images, fenced code blocks, blockquotes, nested lists, tables, task lists and strikethrough.
- Line breaks are literal: a single newline inside a paragraph becomes \`<br>\`, as on GitHub comments, rather than being joined into one line as in CommonMark.
- The HTML is sanitised with DOMPurify before it is shown or copied, so \`<script>\` tags, inline event handlers and \`javascript:\` links are removed. Plain inline HTML such as \`<kbd>\` is kept.
- Code blocks are not syntax-highlighted, and there is no maths or diagram rendering.
- The downloaded file is a fragment, not a full page: it has no \`<html>\`, \`<head>\` or stylesheet.

## Example

\`\`\`
# Heading

Some **bold** text.
→ <h1>Heading</h1>
  <p>Some <strong>bold</strong> text.</p>
\`\`\`

## Privacy

Rendering runs in the browser. No request is made, and nothing is stored. Images referenced in the Markdown are loaded from their own URLs when the preview is shown.`,
    faq: [
      {
        q: 'What is GitHub Flavoured Markdown?',
        a: 'GFM is GitHub\'s superset of CommonMark. It adds tables with pipes, task lists ("- [ ] item"), strikethrough with two tildes, automatic links for bare URLs and fenced code blocks with a language tag.',
      },
      {
        q: 'How do I make a line break in Markdown?',
        a: 'In CommonMark you end the line with two spaces or a backslash; a single newline is otherwise joined into the paragraph. This previewer turns every newline into a line break, matching the GitHub comment setting.',
      },
      {
        q: 'Why is my HTML removed from the preview?',
        a: 'The output is sanitised to prevent scripts from running. Tags like <script>, <iframe> and attributes such as onclick are stripped; ordinary formatting tags are kept.',
      },
      {
        q: 'How do I add a table in Markdown?',
        a: 'Separate columns with | and put a row of dashes under the header: "| Name | Age |" then "| --- | --- |" then one line per row. Add a colon to the dashes (:---, ---:) to align a column left or right.',
      },
    ],
  },
  lineBreakWhitespaceRemover: {
    title: 'Whitespace Remover',
    seo: 'Whitespace Remover: Strip Line Breaks, Extra Spaces | XUtil',
    body: `A whitespace remover strips line breaks, collapses repeated spaces and tabs, and trims the ends of each line. Pick any combination of the three.

## How to use

1. Paste the text. The cleaned version appears on the right as you type.
2. Tick or untick the three options; all are on by default.
3. Check the line counts before and after, then Copy or Download \`cleaned.txt\`.

## Options

| Option | What it does |
| --- | --- |
| Remove line breaks | Replaces every run of newlines (\`\\n\` or \`\\r\\n\`) with a single space, joining the text into one line |
| Collapse repeated spaces | Replaces runs of spaces and tabs with one space. With line breaks kept, newlines are left alone |
| Trim leading and trailing spaces | Removes whitespace at both ends of each line, or of the whole text when lines were joined |

- Order is fixed: line breaks first, then collapsing, then trimming.
- With only "Remove line breaks" on, a blank line becomes one space and leading indentation is kept.
- Does not remove non-breaking spaces (U+00A0) when trimming or collapsing is off, and does not reflow minified code into readable lines.

## Example

\`\`\`
First line

   second   line	 with tabs
→ all three options
First line second line with tabs
\`\`\`

## Privacy

Cleaning runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I remove all line breaks from text?',
        a: 'Replace every newline character with a space, then collapse any doubled spaces. In this tool that is the default: "Remove line breaks" and "Collapse repeated spaces" together turn a multi-line paste into one line.',
      },
      {
        q: 'What counts as whitespace?',
        a: 'In JavaScript the \\s class matches the space, tab, newline, carriage return, form feed, vertical tab and Unicode space separators including the non-breaking space (U+00A0). The collapse and trim options use that definition.',
      },
      {
        q: 'Why do copied PDFs have a line break after every line?',
        a: 'PDF stores text as positioned lines, so copying keeps the visual line endings as hard newlines. Removing line breaks and collapsing spaces reflows the text into normal paragraphs.',
      },
    ],
  },
  duplicateLineRemover: {
    title: 'Duplicate Line Remover',
    seo: 'Duplicate Line Remover: Keep Each Line Once | XUtil',
    body: `A duplicate line remover keeps the first occurrence of every line and drops the repeats, with options to ignore case or spaces and keep blank lines.

## How to use

1. Paste the lines. The unique lines appear on the right as you type.
2. Adjust the options: "Ignore case" and "Keep blank lines" are off by default, "Ignore leading and trailing spaces" is on.
3. Read the counts of lines in, lines out and removed, then Copy or Download \`unique-lines.txt\`.

## Options

| Option | Default | Effect |
| --- | --- | --- |
| Ignore case | off | "Apple" and "apple" count as the same line |
| Ignore leading and trailing spaces | on | "  apple" and "apple" count as the same line |
| Keep blank lines | off | Blank lines are removed; when on, the first blank line is kept and the rest are removed as duplicates |

- Order is preserved: the first occurrence stays where it was and later copies are removed.
- The kept line is written out exactly as it appeared, even when "Ignore case" or the trim option decided it was a duplicate.
- Lines are split on \`\\n\`; a Windows \`\\r\\n\` file is handled because the trim option removes the trailing \`\\r\` before comparing.
- Does not sort the output, count occurrences or remove duplicates within a line.

## Example

\`\`\`
apple
banana
apple
cherry
→
apple
banana
cherry
Lines in 4 · Lines out 3 · Removed 1
\`\`\`

## Privacy

Deduplication runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I remove duplicate lines but keep the original order?',
        a: 'Keep a set of lines already seen and output each line only the first time it appears. This tool does that, so the result is in the original order; the Unix sort -u command, by contrast, sorts the lines first.',
      },
      {
        q: 'What is the difference between uniq and sort -u?',
        a: 'uniq only removes adjacent duplicates, so it is normally run after sort. sort -u sorts and deduplicates in one step. Neither preserves the original order; a set-based approach like this tool does.',
      },
      {
        q: 'Why are two lines that look identical not treated as duplicates?',
        a: 'They probably differ in invisible characters: trailing spaces, tabs, a non-breaking space, or letter case. Turn on "Ignore leading and trailing spaces" and "Ignore case", or check the lines in a hex viewer.',
      },
    ],
  },
  stringCounter: {
    title: 'String Counter',
    seo: 'String Counter: Characters, Words, Lines, Bytes | XUtil',
    body: `A string counter reports characters with and without spaces, UTF-8 bytes, words, unique words, lines and sentences. Counts update as you type.

## How to use

1. Type or paste the text.
2. Read the seven counts in the grid; they update on every keystroke.
3. Use Clear to start again.

## What it counts

| Count | How it is measured |
| --- | --- |
| Characters | UTF-16 code units, the same as \`string.length\` in JavaScript |
| Without spaces | Characters that are not whitespace |
| Bytes (UTF-8) | Length of the text encoded as UTF-8 |
| Words | Runs of non-whitespace separated by spaces, tabs or newlines |
| Unique words | Distinct words, case-sensitive and including attached punctuation |
| Lines | Newline characters plus one; empty text is 0 |
| Sentences | Segments ending in \`.\`, \`!\` or \`?\` followed by a space or the end |

- Characters are code units, so an emoji such as 😀 counts as 2 characters and 4 bytes, and "é" counts as 1 character and 2 bytes.
- "Hello," and "Hello" are different unique words; punctuation is not stripped.
- "e.g. this" counts as two sentences, because the splitter does not know abbreviations.
- Does not count paragraphs, syllables or reading time.

## Example

\`\`\`
Héllo wörld. Hi!
→ Characters 16 · Without spaces 14 · Bytes (UTF-8) 18
→ Words 3 · Unique words 3 · Lines 1 · Sentences 2
\`\`\`

## Privacy

Counting runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Why is the byte count higher than the character count?',
        a: 'UTF-8 uses 1 byte for ASCII but 2 bytes for accented Latin letters, 3 for most other scripts and 4 for emoji. Any text with characters outside ASCII therefore has more bytes than characters.',
      },
      {
        q: 'How many characters are in a tweet or SMS?',
        a: 'X (Twitter) allows 280 characters, counting most CJK characters as 2. An SMS holds 160 characters in the GSM-7 alphabet, or 70 characters once any character outside it, such as an emoji, forces UTF-16 encoding.',
      },
      {
        q: 'How is a word counted?',
        a: 'As a run of non-whitespace characters. "state-of-the-art" is one word and "hello,world" is one word, while "hello , world" is three. Word processors use similar rules, so counts usually agree within a few per cent.',
      },
      {
        q: 'Why does an emoji count as two characters?',
        a: 'JavaScript strings are UTF-16, and characters above U+FFFF, which includes most emoji, take two 16-bit code units. Counting Unicode code points instead would give 1.',
      },
    ],
  },
  regexTester: {
    title: 'Regex Tester',
    seo: 'Regex Tester: Test a Pattern with Live Matches | XUtil',
    body: `A regex tester runs a JavaScript regular expression against sample text and highlights every match as you type, with the g, i, m, s and u flags.

## How to use

1. Type the pattern without surrounding slashes, for example \`\\d+\` rather than \`/\\d+/\`.
2. Tick the flags you need. Only g (global) is on by default; without it, only the first match is shown.
3. Paste the test text. Matches are highlighted in place and counted as you type.
4. Copy to get all matched strings, one per line. A syntax error in the pattern is shown under the flags.

## What it supports

| Flag | Meaning |
| --- | --- |
| g | Find every match, not just the first |
| i | Ignore case |
| m | \`^\` and \`$\` match at line starts and ends, not only the string ends |
| s | \`.\` also matches newlines |
| u | Unicode mode: \`\\p{L}\` property escapes and correct handling of characters above U+FFFF |

- Uses the browser's \`RegExp\`, so the syntax is JavaScript (ECMAScript): lookbehind, named groups \`(?<name>…)\` and \`\\p{…}\` with the u flag all work; possessive quantifiers, atomic groups and \`\\A\`/\`\\z\` do not.
- Empty matches are dropped, so a pattern such as \`a*\` reports only the non-empty hits.
- Shows whole matches only. Capture groups are not listed separately, and there is no replace function.
- Patterns that backtrack heavily on long text run in the page thread and can make the tab slow.

## Example

\`\`\`
Pattern  \\b\\d{4}-\\d{2}-\\d{2}\\b   Flags g
Text     Released 2024-03-15, patched 2024-04-02.
→ 2 matches: 2024-03-15, 2024-04-02
\`\`\`

## Privacy

Matching runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does the g flag do in regex?',
        a: 'Global: the expression finds every match in the text instead of stopping at the first. In JavaScript it also makes matchAll and replaceAll work across the whole string.',
      },
      {
        q: 'What is the difference between greedy and lazy quantifiers?',
        a: 'A greedy quantifier such as .* matches as much as it can and gives back only if the rest of the pattern fails; a lazy one such as .*? matches as little as possible. On <b>x</b><b>y</b>, <b>.*</b> matches the whole string while <b>.*?</b> matches only <b>x</b>.',
      },
      {
        q: 'Why does my regex work in Python but not here?',
        a: 'This tester uses JavaScript syntax. Python-only features include (?P<name>…) for named groups (JavaScript uses (?<name>…)), inline flags like (?i), and \\A and \\Z anchors. Lookbehind works in both.',
      },
      {
        q: 'How do I match a literal dot or bracket?',
        a: 'Escape it with a backslash: \\. matches a dot, \\[ an opening bracket, \\\\ a backslash. Inside a character class a dot is already literal, so [.] also works.',
      },
    ],
  },
  regexCheatsheet: {
    title: 'Regex Cheatsheet',
    seo: 'Regex Cheatsheet: Syntax Reference with Examples | XUtil',
    body: `A regex cheatsheet of 120 regular expression tokens in 10 sections, from character classes and quantifiers to lookarounds, flags and common patterns.

## How to use

1. Type in the filter box to narrow the tables. The filter matches the token itself or its description, so both \`\\d\` and "digit" find the same row.
2. Scroll the sections that remain. Press Escape or Clear to show everything again.
3. Open the Regex Tester to try a token against your own text.

## What it covers

| Section | Contents |
| --- | --- |
| Characters | \`.\`, \`\\d\`, \`\\w\`, \`\\s\`, sets, ranges, \`\\b\`, escapes such as \`\\n\`, \`\\xhh\`, \`\\u{hhhh}\` |
| Character classes | POSIX classes such as \`[:alpha:]\` and \`[:digit:]\` |
| Unicode | \`\\p{L}\`, \`\\p{N}\`, \`\\p{Script=Latin}\` and the negated \`\\P{…}\` |
| Anchors | \`^\`, \`$\`, \`\\A\`, \`\\Z\`, \`\\z\`, \`\\G\`, \`\\K\` |
| Quantifiers | greedy, lazy and possessive forms of \`*\`, \`+\`, \`?\` and \`{n,m}\` |
| Groups and references | capturing, non-capturing, named, backreferences, atomic, conditional, recursion |
| Lookarounds | positive and negative lookahead and lookbehind |
| Flags and modifiers | \`/i\`, \`/g\`, \`/m\`, \`/s\`, \`/u\`, \`/y\`, \`/x\` and inline \`(?i)\` forms |
| Special constructs | backtracking verbs such as \`(*PRUNE)\` and comments |
| Common patterns | email, URL, dates, times, hex colour, numbers, US phone and ZIP, card number formats |

- The sheet is a cross-flavour reference. POSIX classes, possessive quantifiers, atomic groups, \`\\A\`, \`\\z\`, \`\\K\`, recursion and the \`(*…)\` verbs come from PCRE and do not work in JavaScript, which supports the Characters, Unicode (with the u flag), Quantifiers (greedy and lazy), Lookarounds and the \`/g /i /m /s /u /y\` flags.
- The common patterns are starting points. The email pattern, for example, accepts most addresses but is not a full RFC 5322 validator.

## Example

\`\`\`
Filter: lookbehind
→ (?<=abc)   Positive lookbehind
→ (?<!abc)   Negative lookbehind
→ (?<=^.{5}) Lookbehind for first 5 chars
\`\`\`

## Privacy

The reference is part of the page. Filtering runs in the browser, no request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between \\b and \\B in regex?',
        a: '\\b matches a word boundary: the position between a word character (letter, digit or underscore) and a non-word character or the string edge. \\B matches any position that is not a boundary, so \\Bcat\\B finds "cat" only inside a longer word.',
      },
      {
        q: 'What is a lookahead in regex?',
        a: 'A zero-width check that the text after the current position matches a sub-pattern without consuming it. (?=…) requires it, (?!…) forbids it. Lookbehind, (?<=…) and (?<!…), checks the text before the position instead.',
      },
      {
        q: 'What is the difference between * and + in regex?',
        a: '* matches zero or more repetitions of the preceding item, so it can match nothing. + matches one or more, so at least one occurrence is required. ? matches zero or one.',
      },
      {
        q: 'Which regex features are not supported in JavaScript?',
        a: 'Possessive quantifiers (a++), atomic groups (?>…), the \\A, \\z and \\K anchors, inline flags like (?i), the x (free-spacing) flag, recursion and conditional groups. These come from PCRE and are available in PHP, Perl and some Python libraries, not in the browser.',
      },
    ],
  },
};
