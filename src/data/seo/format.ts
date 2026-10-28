import type { SEODescriptionContent } from './types';

export const formatSeo: Record<string, SEODescriptionContent> = {
  jsFormatter: {
    title: 'JavaScript Beautifier',
    seo: 'JavaScript Beautifier: Format and Unminify JS Online | XUtil',
    body: `A JavaScript beautifier re-indents minified or messy JS into readable code, with your choice of indent and brace style. It formats JSON too.

## How to use

1. Paste JavaScript or JSON, or load a \`.js\`, \`.mjs\`, \`.ts\` or \`.json\` file. The output updates as you type.
2. Choose the indent: 2 spaces, 4 spaces or a tab.
3. Pick a brace style and whether blank lines and spaces inside parentheses are kept.
4. Copy the result or download it as \`.js\`, named after the loaded file.

## Options

- **Indent**: 2 spaces, 4 spaces or tabs.
- **Brace style**: *collapse* keeps the opening brace on the same line (\`if (x) {\`), *expand* puts every brace on its own line, and *end-expand* keeps opening braces on the line but moves \`else\` and \`catch\` onto a new one after the closing brace.
- **Keep blank lines**: preserves the blank lines in the source, at most two in a row. Off, the output has no blank lines.
- **Space in parens**: writes \`foo( a, b )\` instead of \`foo(a, b)\`.
- The formatter is js-beautify, which works on tokens rather than a full parse, so it never rejects input. Broken or partial code comes out indented as well as it can be, and a missing semicolon or a syntax error is not reported.
- Minifying is not offered: shrinking JavaScript safely needs a real parser and scope analysis, which is a build-tool job (esbuild, terser). For stylesheets, the CSS Minifier on this site does minify.

## Example

\`\`\`
function add(a,b){return a+b}const o={a:1,b:[2,3]};
→
function add(a, b) {
  return a + b
}
const o = {
  a: 1,
  b: [2, 3]
};
\`\`\`

## Privacy

Formatting runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does a JavaScript beautifier do?',
        a: 'It adds line breaks, indentation and spacing to JavaScript so the structure is visible, without changing what the code does. It is the reverse of minifying, except that shortened variable names cannot be restored.',
      },
      {
        q: 'Can you unminify JavaScript?',
        a: 'Partly. A beautifier restores formatting, so the control flow and structure become readable again, but names that a minifier shortened to single letters stay short, and comments that were stripped are gone. A source map is needed to get the original back.',
      },
      {
        q: 'Does formatting change what the code does?',
        a: 'No. Whitespace and line breaks outside strings and template literals have no meaning in JavaScript, with one exception: a return, throw, break or continue followed by a newline. The beautifier knows this rule and keeps the expression on the same line.',
      },
      {
        q: 'Which brace style should I use in JavaScript?',
        a: 'Most JavaScript style guides, including Airbnb, Google and StandardJS, put the opening brace on the same line as the statement, which is the "collapse" option here. Allman style (braces on their own lines) is common in C# but rare in JavaScript.',
      },
    ],
  },

  htmlFormatter: {
    title: 'HTML Formatter',
    seo: 'HTML Formatter: Beautify or Minify HTML Online | XUtil',
    body: `An HTML formatter indents markup so nesting is easy to follow, or minifies it by dropping comments and whitespace between tags, with byte sizes shown.

## How to use

1. Paste HTML or load a \`.html\` file. The result updates as you type.
2. Choose Beautify to indent, with 2 spaces, 4 spaces or a tab, or Minify to shrink.
3. Read the byte sizes under the output: original, result, and the percentage saved when minifying.
4. Copy the result or download it as \`.html\` or \`.min.html\`, named after the loaded file.

## What it does

- Beautify uses js-beautify's HTML formatter: one element per line, children indented, inline elements such as \`<a>\`, \`<span>\` and \`<b>\` kept in the text flow, and the contents of \`<script>\` and \`<style>\` formatted as JavaScript and CSS. Lines are never wrapped. *Keep blank lines* preserves a single blank line where the source had one or more.
- Minify is deliberately conservative. It removes HTML comments except conditional comments (\`<!--[if IE]>\`), deletes whitespace that touches a block-level tag such as \`<div>\`, \`<p>\`, \`<li>\` or \`<tr>\` (where it never renders), and collapses every other run of whitespace to a single space, so the space between \`</b>\` and the next word survives. Whitespace inside tags is collapsed outside quoted attribute values.
- \`<pre>\`, \`<textarea>\`, \`<script>\` and \`<style>\` are left byte for byte as they were. Non-breaking spaces are not treated as whitespace.
- Neither mode removes optional closing tags, quotes, or attributes, rewrites entities, or validates the document; invalid HTML is passed through with the same treatment.

## Example

\`\`\`
<ul>
  <li><a href="/">Home</a></li>
  <!-- nav -->
  <li>About <b>us</b> today</li>
</ul>
→ <ul><li><a href="/">Home</a></li><li>About <b>us</b> today</li></ul>
\`\`\`

## Privacy

Formatting and minifying run in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Does minifying HTML change how the page looks?',
        a: 'It can, if whitespace between inline elements is removed, because a newline between two <span>s renders as a space. This minifier keeps a single space in that position and only deletes whitespace next to block-level tags, where browsers never render it.',
      },
      {
        q: 'How much smaller does minified HTML get?',
        a: 'Usually 5 to 20 percent for hand-written or template-generated markup, mostly indentation and comments. After gzip or Brotli the saving is smaller, since repeated whitespace compresses well, so minifying HTML matters less than minifying JavaScript.',
      },
      {
        q: 'Why is whitespace inside <pre> kept?',
        a: 'The pre element, and textarea, display whitespace exactly as written, so collapsing it would change the content. Script and style blocks are kept too, because their whitespace rules belong to JavaScript and CSS, not HTML.',
      },
      {
        q: 'Should I indent HTML with 2 or 4 spaces?',
        a: 'Two spaces is the most common choice for HTML because deeply nested markup gets wide quickly; Google\'s HTML style guide and Prettier both default to two. Four spaces or tabs are fine when the rest of the project uses them.',
      },
    ],
  },

  imageConverter: {
    title: 'Image Converter',
    seo: 'Image Converter: PNG to JPG, WebP to PNG, Resize | XUtil',
    body: `An image converter that turns PNG, JPEG, WebP, GIF, BMP, AVIF or SVG into PNG, JPEG or WebP in the browser, with resizing and a quality slider.

## How to use

1. Choose an image, up to 25 MB. Its dimensions, type and size appear on the right.
2. Pick the output format: PNG (lossless, keeps transparency), JPEG (smallest for photos, no transparency) or WebP (both, where the browser can encode it).
3. For JPEG and WebP, set the quality; 90% is the default. For JPEG, choose the background colour that fills transparent areas.
4. Resize with a preset (50%, 25%, 1920, 1280 or 800 wide, fit in 512 or 256) or type a width or height; with the aspect ratio locked, the other side follows.
5. Download the result. It keeps the original file name with the new extension.

## What it does

- Decodes the image with the browser's own decoder, draws it onto a canvas at the chosen size with high-quality smoothing, and re-encodes it with the canvas encoder. Any format the browser can display can be read, including SVG, which is rasterised at the chosen size.
- Converting to JPEG flattens transparency onto the background colour, white by default, because JPEG has no alpha channel. PNG and WebP keep it.
- Animated GIFs and animated WebP are converted as their first frame; the output formats here are still images.
- EXIF metadata, colour profiles and the camera's orientation tag are not carried over; the browser applies the orientation while decoding, so the pixels come out upright.
- Dimensions are capped at 8192 pixels a side. Some browsers, notably older Safari, cannot encode WebP; the tool says so, and PNG and JPEG still work.

## Example

\`\`\`
logo.png · 2400×1200 · 1.4 MB
→ JPEG, quality 90%, 1280 wide, white background
→ logo.jpg · 1280×640 · 96 KB
\`\`\`

## Privacy

Decoding, resizing and encoding run in the browser. No request is made, and the image never leaves the device.`,
    faq: [
      {
        q: 'How do I convert a PNG to JPG without losing quality?',
        a: 'JPEG is always lossy, but at 90% quality the difference from the PNG is invisible on photos. Flat graphics with sharp edges or text show JPEG artefacts sooner; keep those as PNG or use WebP, which handles both well.',
      },
      {
        q: 'What happens to transparency when converting PNG to JPEG?',
        a: 'JPEG cannot store transparency, so transparent pixels have to become a solid colour. This tool fills them with the background colour you choose, white by default; black backgrounds come from converters that skip this step.',
      },
      {
        q: 'Is WebP better than PNG or JPEG?',
        a: 'WebP files are typically 25 to 35 percent smaller than JPEG at the same visual quality and smaller than PNG for lossless images, and every current browser displays them. JPEG and PNG remain safer for email, older software and print workflows.',
      },
      {
        q: 'Does converting an image reduce its resolution?',
        a: 'Not unless you resize. Converting at the original size keeps every pixel; JPEG and lossy WebP reduce the file size by discarding fine detail, not by removing pixels. The resize options are there when you want a smaller image.',
      },
    ],
  },

  contrastChecker: {
    title: 'Contrast Checker',
    seo: 'Contrast Checker: WCAG Colour Contrast Ratio | XUtil',
    body: `A contrast checker that gives the WCAG 2 contrast ratio between a text colour and a background, pass or fail for AA and AAA, and a fix when normal text fails.

## How to use

1. Set the text colour and the background with the swatches, or type a hex, \`rgb()\` or \`hsl()\` value. The ratio updates as you type.
2. Read the ratio and the table: AA and AAA for normal and large text, and the 3:1 threshold for UI components and graphics.
3. Check the sample block, which renders normal and large text in the chosen colours.
4. If AA fails for normal text, the suggested colour is the nearest lighter or darker shade of the same hue that passes; *Use it* applies it. Swap exchanges the two colours.

## What it does

- Computes relative luminance per the WCAG 2.1 formula: each sRGB channel is linearised (divided by 12.92 below 0.03928, otherwise ((c + 0.055) / 1.055)^2.4) and weighted 0.2126 R, 0.7152 G, 0.0722 B. The ratio is (L1 + 0.05) / (L2 + 0.05) with the lighter colour on top, from 1:1 to 21:1.
- Thresholds: AA needs 4.5:1 for normal text and 3:1 for large text (criterion 1.4.3); AAA needs 7:1 and 4.5:1 (1.4.6); user-interface components, focus indicators and meaningful graphics need 3:1 (1.4.11). Large text means at least 24px, or 18.66px bold.
- Alpha is ignored. A semi-transparent colour has to be flattened onto its actual background before the ratio means anything, so pass the resulting opaque colour.
- The suggestion keeps the hue and saturation of the text colour and steps its lightness one percent at a time away from the background until 4.5:1 is reached.

## Example

\`\`\`
#777777 on #FFFFFF → 4.48:1
AA normal: Fail · AA large: Pass · AAA normal: Fail · AAA large: Fail · UI: Pass
Suggested text colour: #757575 (4.61:1)
\`\`\`

## Privacy

The ratio is computed in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What contrast ratio is needed for WCAG AA?',
        a: 'At least 4.5:1 for normal text and 3:1 for large text (24px, or 18.66px bold). AAA raises these to 7:1 and 4.5:1. Buttons, form borders, focus rings and icons that carry meaning need 3:1 against adjacent colours.',
      },
      {
        q: 'Why does #777 fail on white?',
        a: 'Medium grey #777777 on white gives 4.48:1, just under the 4.5:1 AA threshold for normal text. #767676 is the lightest neutral grey that passes on white, which is why it appears so often in design systems.',
      },
      {
        q: 'Does text colour on background count, or background on text?',
        a: 'The order does not matter. The ratio always puts the lighter colour\'s luminance on top, so black on white and white on black are both 21:1. Swap in this tool only changes which colour the sample renders as text.',
      },
      {
        q: 'Is WCAG contrast the same as APCA?',
        a: 'No. APCA is a newer perceptual model proposed for WCAG 3 that scores text differently depending on which colour is the foreground and on font size and weight. WCAG 2 contrast ratio is what current accessibility law and audits require.',
      },
    ],
  },
};
