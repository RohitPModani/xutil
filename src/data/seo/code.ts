import type { SEODescriptionContent } from './types';

export const codeSeo: Record<string, SEODescriptionContent> = {
  sqlFormatter: {
    title: 'SQL Formatter',
    seo: 'SQL Formatter: Beautify and Indent SQL Online | XUtil',
    body: `An SQL formatter indents and line-breaks a query so it reads clearly. Pick the dialect, keyword case and indent; the result updates as you type.

## How to use

1. Paste a query or load a \`.sql\` file. The formatted SQL appears as you type.
2. Choose the dialect: Standard SQL, MySQL, PostgreSQL, SQLite, SQL Server (T-SQL), Oracle (PL/SQL), BigQuery, Snowflake or Spark SQL. The dialect decides which keywords, operators and quoting styles are recognised.
3. Pick the keyword case: UPPER (default), lower, or Keep to leave keywords as written. Identifiers and string literals are never changed.
4. Pick the indent: 2 spaces, 4 spaces or a tab. Copy the result or download it as \`.sql\`, named after the loaded file.

## What it does

- Uses the \`sql-formatter\` library: each clause (SELECT, FROM, WHERE, GROUP BY, ORDER BY, JOIN) starts on its own line, selected columns go one per line, and subqueries and parentheses are indented.
- Formats several statements at once; each ends with a semicolon on its own line.
- Keeps comments, both \`-- line\` and \`/* block */\`, in place.
- Reports a parse error, with the offending token and position, when the query does not fit the chosen dialect. Trying another dialect often fixes an error caused by a vendor-specific keyword.
- Does not run or validate the query against a database, and does not rewrite it: nothing is reordered, aliased or optimised.

## Example

\`\`\`
select id,name from users where active=1 and role in ('admin','owner') order by name
→
SELECT
  id,
  name
FROM
  users
WHERE
  active = 1
  AND role IN ('admin', 'owner')
ORDER BY
  name
\`\`\`

## Privacy

Formatting runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Should SQL keywords be uppercase?',
        a: 'It is convention, not a requirement: SQL keywords are case-insensitive in every major database. Uppercase keywords make the structure of a query stand out from table and column names, which is why most style guides and this formatter default to it.',
      },
      {
        q: 'Why does the formatter report an error on a query that runs fine?',
        a: 'The parser follows one dialect at a time. A query that uses vendor syntax, for example MySQL backticks, T-SQL square brackets or PostgreSQL casts, needs that dialect selected. Switch dialects and the error usually goes away.',
      },
      {
        q: 'Does formatting change what the query does?',
        a: 'No. Only whitespace, line breaks and keyword case change. Identifiers, string literals, numbers and comments are left as written, so the formatted query is equivalent to the original.',
      },
      {
        q: 'Can I format a file with many statements?',
        a: 'Yes. Statements separated by semicolons are formatted one after another, each ending with its semicolon on its own line. Files up to 5 MB can be loaded.',
      },
    ],
  },
  xmlFormatter: {
    title: 'XML Formatter',
    seo: 'XML Formatter: Pretty Print, Validate and Minify XML | XUtil',
    body: `An XML formatter checks that a document is well-formed, then pretty-prints it with a chosen indent or minifies it to one line. Errors show the line and column.

## How to use

1. Paste XML or load a \`.xml\` file. The output updates as you type.
2. Choose 2 spaces, 4 spaces or Tab to pretty-print, or Minify to remove the whitespace between elements.
3. Fix any error shown under the input: it names the line, column and reason, as the browser's XML parser reports it.
4. Copy the result or download it as \`.xml\`, named after the loaded file.

## What it does

- Parses with the browser's own XML parser, so the well-formedness rules are the real ones: matching tags, quoted attributes, a single root element, declared entities, correct nesting.
- Pretty-prints one element per line, nested elements indented one level deeper. An element that contains text, or text mixed with inline elements, stays on one line with its whitespace runs collapsed to a single space.
- Keeps the markup as written: attribute order and quote style, the XML declaration, DOCTYPE, comments, processing instructions, CDATA sections and entity references such as \`&amp;\` are all preserved, not rewritten.
- Minify removes whitespace-only text between elements and collapses runs of whitespace inside text to one space. Comments and CDATA are kept.
- Does not validate against a DTD or XML Schema, and does not treat \`xml:space="preserve"\` specially.

## Example

\`\`\`
<note><to>Ada</to><body>Hello <b>there</b></body></note>
→
<note>
  <to>Ada</to>
  <body>Hello <b>there</b></body>
</note>
\`\`\`

## Privacy

Parsing and formatting run in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does "well-formed" XML mean?',
        a: 'That the document follows the XML syntax rules: one root element, every start tag closed, tags properly nested, attribute values quoted, and the characters <, & escaped in text. Well-formed is different from valid, which means conforming to a particular DTD or schema.',
      },
      {
        q: 'Why does my XML fail with "mismatched tag"?',
        a: 'An element was closed with a different name than it was opened with, or a tag in between was never closed. XML is case-sensitive, so <Item> and </item> do not match. The error shows the line and column of the closing tag the parser did not expect.',
      },
      {
        q: 'Is whitespace significant in XML?',
        a: 'Whitespace inside text content is passed to the application as-is, so it can matter. Whitespace between elements is usually ignored by consumers, which is why pretty-printing and minifying are safe for most documents. Documents that rely on exact spacing should not be reformatted.',
      },
      {
        q: 'What is a CDATA section?',
        a: 'A block of text, written <![CDATA[ ... ]]>, in which < and & are taken literally instead of starting markup or an entity. It is handy for embedding code or HTML in XML. This formatter leaves CDATA sections exactly as written.',
      },
    ],
  },
  cssMinifier: {
    title: 'CSS Minifier and Beautifier',
    seo: 'CSS Minifier and Beautifier: Compress or Format CSS | XUtil',
    body: `A CSS minifier strips comments and whitespace to shrink a stylesheet; the beautifier expands minified CSS into readable, indented rules, with sizes shown.

## How to use

1. Paste CSS or load a \`.css\` file. The result updates as you type.
2. Choose Minify to compress, or Beautify to format with a 2- or 4-space indent.
3. Read the byte sizes under the output: original, result, and the percentage saved when minifying.
4. Copy the result or download it as \`.min.css\` or \`.css\`, named after the loaded file.

## What it does

- Minify strips comments except those starting with \`/*!\`, which are the licence comments bundlers keep. It collapses whitespace, removes spaces around \`{\`, \`}\`, \`:\`, \`;\`, \`,\` and the \`>\` combinator, drops the last semicolon in each block and the space before \`!important\`.
- Strings and \`url()\` arguments are tokenised, so a \`;\`, \`}\` or extra space inside quotes or a data URI is never touched. The space in \`@media screen and (\` and the spaces around operators in \`calc()\` are kept, because removing them changes the meaning.
- Beautify puts one declaration per line with a space after the colon, splits comma-separated selector lists one per line, indents nested blocks such as \`@media\` and \`@supports\`, and leaves a blank line between rules. Comments are kept.
- Neither mode rewrites values: colours are not shortened, units are not changed, and duplicate or empty rules are not removed. Invalid CSS is passed through with the same whitespace treatment rather than rejected.

## Example

\`\`\`
/* card */
.card, .panel {
  margin: 0 auto;
  color: rgba(0, 0, 0, 0.5) !important;
}
→ .card,.panel{margin:0 auto;color:rgba(0,0,0,0.5)!important}
\`\`\`

## Privacy

Minifying and formatting run in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Does minifying CSS change how a page looks?',
        a: 'No, when done correctly. Browsers ignore comments and most whitespace, so removing them leaves the same rules. The exceptions are whitespace that is syntactically significant, such as spaces in calc() or in media queries, which this tool keeps.',
      },
      {
        q: 'How much smaller does CSS get when minified?',
        a: 'Typically 15 to 30 percent for hand-written CSS, mostly from comments and indentation. The saving on top of gzip or Brotli compression is smaller, because compression already handles repeated whitespace well.',
      },
      {
        q: 'Why keep comments that start with /*!?',
        a: 'By convention a comment that starts with an exclamation mark holds licence or attribution text that must ship with the code. Minifiers such as cssnano and clean-css keep them, and so does this one.',
      },
      {
        q: 'What is the difference between minifying and beautifying?',
        a: 'Minifying removes everything a browser does not need, to make the file small for production. Beautifying does the reverse: it adds line breaks and indentation so a minified or cramped file is readable again. The two are inverse operations on whitespace only.',
      },
    ],
  },
  htmlToMarkdown: {
    title: 'HTML to Markdown',
    seo: 'HTML to Markdown Converter: Turn HTML into Markdown | XUtil',
    body: `An HTML to Markdown converter turns a page or fragment into Markdown. Headings, lists, links, images, code and regular tables are kept; scripts are dropped.

## How to use

1. Paste HTML or load an \`.html\` file. A fragment or a whole document both work; the Markdown appears as you type.
2. Choose the heading style: \`#\` prefixes (ATX) or underlined (Setext, for the first two levels).
3. Choose the bullet marker (\`-\`, \`*\` or \`+\`) and the code block style: fenced with backticks or indented by four spaces.
4. Copy the Markdown or download it as \`.md\`, named after the loaded file.

## What it does

- Converts with the \`turndown\` library: headings, paragraphs, bold and italic, links, images, ordered and unordered lists, blockquotes, inline code, \`pre\` blocks and horizontal rules all map to their Markdown equivalents.
- Removes \`script\`, \`style\`, \`head\`, \`title\` and \`noscript\` elements, so pasting a full page leaves only its content.
- Writes a GFM pipe table when every row of a table has the same number of cells, using the first row as the header. Tables with spanning or uneven rows fall back to their text content.
- Elements with no Markdown equivalent, such as \`div\`, \`span\` and \`iframe\`, contribute their text and lose their tags. Inline styles, classes and ids are discarded.
- Does not fetch anything: image and link URLs are copied as written, relative paths included.

## Example

\`\`\`
<h2>Install</h2><p>Run <code>npm i</code>, then see the <a href="/docs">docs</a>.</p>
→
## Install

Run \`npm i\`, then see the [docs](/docs).
\`\`\`

## Privacy

Conversion runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Can I convert a whole web page to Markdown?',
        a: 'Yes. Save the page as HTML or copy its source, paste it in, and the converter drops the head, scripts and styles and converts the body. Navigation menus and footers come through as lists and text, so some trimming is normal.',
      },
      {
        q: 'Why are my tables converted to plain text?',
        a: 'Markdown tables need a regular grid. If a row spans columns or rows have different cell counts, there is no faithful pipe-table equivalent, so the cell text is kept in reading order instead.',
      },
      {
        q: 'What is the difference between ATX and Setext headings?',
        a: 'ATX headings use one to six # characters before the text, for example "## Title". Setext headings underline the text with = for level one or - for level two and have no form for deeper levels, so levels three to six use # even in Setext mode.',
      },
    ],
  },
};
