import type { SEODescriptionContent } from './types';

export const imageSeo: Record<string, SEODescriptionContent> = {
  qrCodeGenerator: {
    title: 'QR Code Generator',
    seo: 'QR Code Generator: URL, Wi-Fi, vCard, PNG and SVG | XUtil',
    body: `A QR code generator for a URL, text, vCard, email, SMS, Wi-Fi login, phone number, WhatsApp message or calendar event, downloaded as PNG or SVG.

## How to use

1. Pick the payload type from the menu: Website URL, Plain text, Contact (vCard), Email, SMS, Wi-Fi, Phone number, WhatsApp message or Calendar event.
2. Fill in the fields. The code renders as you type, and the exact string it encodes is shown under "Encoded payload" with a Copy button.
3. Set the size, error-correction level and colours.
4. Download PNG or Download SVG.

## Options

- Size: 100 to 1000 px, default 300. The SVG scales without loss at any size.
- Error correction: L (7%), M (15%, default), Q (25%) or H (30%). The percentage is how much of the code can be damaged or covered and still scan.
- Foreground and background: six-digit hex colours, default black on white. Keep strong contrast; scanners expect dark modules on a light background.
- Quiet zone: one module on every side.
- Payload formats: vCard 3.0 for contacts, \`mailto:\` for email, \`sms:\` with a \`?body=\` query for SMS, \`tel:\` for phone, \`WIFI:\` for networks (WPA/WPA2, WEP or open, with a hidden-network flag; backslash, semicolon, comma, colon and double quote in the name or password are escaped), \`https://wa.me/\` for WhatsApp, and a VEVENT block for events with times in UTC.

The tool does not shorten links, track scans or add a logo.

## Example

\`\`\`
Type: Wi-Fi · SSID: Home · Password: secret · Security: WPA/WPA2
→ WIFI:T:WPA;S:Home;P:secret;;
\`\`\`

## Privacy

The code is drawn in the browser with the \`qrcode\` library. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does the error-correction level on a QR code do?',
        a: 'It adds redundant data so the code still scans when part of it is dirty, damaged or covered. The four levels in ISO/IEC 18004 recover about 7% (L), 15% (M), 25% (Q) or 30% (H) of the code; higher levels make the code denser for the same content.',
      },
      {
        q: 'How much text can a QR code hold?',
        a: 'Up to 4,296 alphanumeric or 2,953 bytes of text at the lowest error-correction level in the largest version (177 by 177 modules). Short payloads scan more reliably, so keep URLs brief.',
      },
      {
        q: 'Should I download the QR code as PNG or SVG?',
        a: 'Use SVG for print and anything that will be resized, because it is vector and stays sharp at any size. Use PNG where a raster image is required, such as a website or a document that does not accept SVG.',
      },
      {
        q: 'Does a Wi-Fi QR code expose my password?',
        a: 'Yes. The password is stored in plain text inside the code (WIFI:T:WPA;S:name;P:password;;), so anyone who scans or decodes it can read it. Only share the code with people you would give the password to.',
      },
    ],
  },
  barcodeGenerator: {
    title: 'Barcode Generator',
    seo: 'Barcode Generator: EAN-13, UPC-A, Code 128 as SVG | XUtil',
    body: `A barcode generator for EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF-14, MSI, Pharmacode and Codabar. It renders as you type and downloads as SVG or PNG.

## How to use

1. Choose a format. The hint under the value field tells you what that format accepts.
2. Type the value. The barcode appears as you type; invalid input for the format shows an error instead.
3. Adjust bar width, height, text size, margin and colours, or hide the printed value.
4. Download SVG or Download PNG.

## Formats

| Format | Input |
| --- | --- |
| Code 128 (auto, A, B, C) | Any ASCII; set A limits to upper case and control characters, set C needs an even number of digits |
| EAN-13 | 12 digits; the check digit is added |
| EAN-8 | 7 digits; the check digit is added |
| UPC-A | 11 digits; the check digit is added |
| Code 39 | Upper-case letters, digits and - . $ / + % space |
| ITF-14 | 13 digits; the check digit is added |
| MSI | Digits only |
| Pharmacode | A number from 3 to 131070 |
| Codabar | Digits and - $ : / . +, optionally wrapped in A to D |

Defaults: bar width 2, height 100 px, text size 20, margin 10, black bars on white, value shown under the bars. Rendering uses the JsBarcode library, which rejects values that do not fit the chosen format.

The tool does not register or validate GS1 numbers; a retail EAN or UPC must come from GS1 to be accepted by shops.

## Example

\`\`\`
Format: EAN-13 · Value: 590123412345
→ barcode encoding 5901234123457 (check digit 7 added)
\`\`\`

## Privacy

Everything is rendered in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between EAN-13 and UPC-A?',
        a: 'Both are GS1 retail barcodes that encode a product number. UPC-A has 12 digits and is used mainly in North America; EAN-13 has 13 digits and is used worldwide. A UPC-A code is the same as an EAN-13 code with a leading zero, and most scanners read both.',
      },
      {
        q: 'How is the EAN-13 check digit calculated?',
        a: 'Multiply the first 12 digits alternately by 1 and 3 starting from the left, add the products, and take the amount needed to reach the next multiple of 10. For 590123412345 the sum is 83, so the check digit is 7.',
      },
      {
        q: 'Which barcode format should I use for text, not just numbers?',
        a: 'Code 128 encodes the full ASCII set and is compact, so it is the usual choice for shipping labels and internal tracking. Code 39 also accepts letters but only upper case and a few symbols, and it produces wider codes.',
      },
      {
        q: 'Can I sell a product with a barcode made here?',
        a: 'The image is a valid barcode, but the number inside it must be licensed from GS1 for retailers to accept it. Any number you make up will scan but will not be linked to your product in retail databases.',
      },
    ],
  },
  barcodeReader: {
    title: 'Barcode / QR Reader',
    seo: 'Barcode Reader: Decode a QR or Barcode From an Image | XUtil',
    body: `A barcode and QR code reader that decodes a photo or screenshot in your browser. Drop an image to see the format and decoded value; no camera, no upload.

## How to use

1. Choose an image or drop it on the page. JPEG, PNG, WebP, GIF and other browser-readable formats work, up to 10 MB.
2. The image is scanned as soon as it loads; the format and decoded value appear beside the preview, each with a Copy button.
3. Drop another image to decode a new code. Choosing a file clears the previous result.

## What it supports

- Decodes with the ZXing ("Zebra Crossing") multi-format reader, which covers QR Code, Data Matrix, Aztec, PDF417, EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, Code 93, ITF and Codabar.
- Returns the first code it finds. If an image contains several codes, crop it to the one you want.
- Works from a still image only. It does not use the camera, so take a photo with your phone first and then open it here.
- Does not open or follow the decoded value; a URL is shown as text for you to check before visiting.

If nothing is found, the error suggests a sharper, larger or better-lit picture. Blur, low contrast, glare and a missing quiet zone around the code are the usual causes.

## Example

\`\`\`
Input: photo of a retail label
→ Format: EAN 13
→ Value: 5901234123457
\`\`\`

## Privacy

The image is decoded in the browser from a local object URL. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I read a QR code from a screenshot?',
        a: 'Save the screenshot and open it in a browser-based decoder such as this one. The code is located and decoded in the page, so the screenshot does not need to be uploaded anywhere.',
      },
      {
        q: 'Why does the reader not find a barcode in my photo?',
        a: 'The most common reasons are blur, a code that is too small in the frame, glare across the bars, and no white margin (quiet zone) around the code. Retake the photo closer, straight on and in even light.',
      },
      {
        q: 'Is it safe to scan a QR code from an unknown source?',
        a: 'Decoding is safe; the risk is in what the value points to. This reader shows the decoded text without opening it, so you can inspect a URL for misspelt domains or unexpected redirects before visiting it.',
      },
    ],
  },
  colorPicker: {
    title: 'Colour Picker',
    seo: 'Colour Picker: Convert HEX, RGB, HSL, HSV and CMYK | XUtil',
    body: `A colour picker that converts between HEX, RGB, HSL, HSV and CMYK. Pick with the swatch or type a hex, rgb() or hsl() value and copy each format.

## How to use

1. Click the swatch to open your browser's native colour picker, or type a colour such as #2563EB, #25E, rgb(37, 99, 235) or hsl(221, 83%, 53%).
2. The HEX, RGB, HSL, HSV and CMYK values update as you type, each with a Copy button; Copy on the panel copies all five lines.
3. The large swatch beneath the input shows the colour at full size.

## What it supports

- Input: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba(), hsl() or hsla(). Alpha is accepted but dropped from the output.
- Output: HEX in upper case, \`rgb(r, g, b)\` with values 0 to 255, \`hsl(h, s%, l%)\` and \`hsv(h, s%, v%)\` with hue in degrees and percentages rounded to whole numbers, and \`cmyk(c%, m%, y%, k%)\`.
- Default colour: #2563EB.

The tool does not pick colours from an uploaded image, build palettes or check contrast ratios.

## Example

\`\`\`
#2563EB
→ rgb(37, 99, 235)
→ hsl(221, 83%, 53%)
→ hsv(221, 84%, 92%)
→ cmyk(84%, 58%, 0%, 8%)
\`\`\`

## Privacy

Conversion runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert a hex colour to RGB?',
        a: 'Split the six hex digits into three pairs and convert each pair from base 16 to decimal. #2563EB gives 25 → 37, 63 → 99 and EB → 235, so the colour is rgb(37, 99, 235).',
      },
      {
        q: 'What is the difference between RGB and HSL?',
        a: 'RGB describes a colour by the amount of red, green and blue light (0 to 255 each). HSL describes the same colour by hue (0 to 360 degrees on the colour wheel), saturation and lightness (0 to 100%), which makes it easier to lighten, darken or shift a colour by changing one number.',
      },
      {
        q: 'Why does hsl() sometimes not round-trip exactly to the same hex?',
        a: 'Hue, saturation and lightness are rounded to whole numbers for display, and a whole-number HSL value can map to a neighbouring RGB value. The difference is at most one or two units per channel and is not visible.',
      },
    ],
  },
  faviconGenerator: {
    title: 'Favicon Generator',
    seo: 'Favicon Generator: PNG Sizes and Multi-Size ICO | XUtil',
    body: `A favicon generator that resizes one image into 16, 32, 48, 180 and 192 px PNG icons plus a multi-size favicon.ico, all made in your browser with no upload.

## How to use

1. Choose an image or drop it on the page. Any format your browser can display works, up to 5 MB; a square PNG or SVG with a transparent background gives the best result.
2. The icons appear in a list as soon as the image loads, each with a preview and its own Download button.
3. Download favicon.ico for the classic \`<link rel="icon">\`, apple-touch-icon.png for iOS and android-chrome-192x192.png for Android and web app manifests. Copy the HTML snippet beneath the list into your \`<head>\`.

## What it produces

| File | Use |
| --- | --- |
| favicon.ico | Contains 16, 32 and 48 px frames; browsers pick the one they need |
| favicon-16x16.png, 32x32, 48x48 | Browser tabs, bookmarks and the Windows taskbar |
| apple-touch-icon.png | 180 px icon for iOS home screens |
| android-chrome-192x192.png | Android home screen and \`manifest.json\` |

- The ICO is a real multi-image container with PNG-compressed frames, which every current browser and Windows Vista or later read.
- A non-square source is centre-cropped to a square, then scaled down in steps with high-quality smoothing.
- Transparency is kept in the PNGs and the ICO.

The tool does not generate a manifest file, or 512 px or maskable icons.

## Example

\`\`\`
logo.png (1024×1024)
→ favicon.ico (16+32+48), favicon-16x16.png, favicon-32x32.png,
  favicon-48x48.png, apple-touch-icon.png, android-chrome-192x192.png
\`\`\`

## Privacy

Resizing uses a canvas in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What sizes should a favicon be?',
        a: 'A favicon.ico with 16, 32 and 48 px frames covers browser tabs and bookmarks, a 180 px PNG serves as the apple-touch-icon, and a 192 px PNG is the minimum for an Android home-screen icon in a web app manifest. Modern browsers also accept an SVG icon that scales to any size.',
      },
      {
        q: 'What is the difference between favicon.ico and a PNG favicon?',
        a: 'An ICO file is a container that holds several sizes of the same icon, so one file serves every context; it is also the only format old browsers and Windows shortcuts understand. A PNG is a single size, so you link one PNG per size.',
      },
      {
        q: 'Why does my favicon look blurry?',
        a: 'The browser is scaling an icon that is the wrong size, or the source image had fine detail that does not survive at 16 px. Provide the exact sizes and design the icon as a simple shape that still reads at 16 by 16.',
      },
    ],
  },
  imageCompressor: {
    title: 'Image Compressor',
    seo: 'Image Compressor: Shrink a JPEG, PNG or WebP | XUtil',
    body: `An image compressor that shrinks a JPEG, PNG or WebP in your browser. Pick the output format, quality and maximum size, compare file sizes and download.

## How to use

1. Choose an image or drop it on the page, up to 10 MB.
2. Pick the output format (it defaults to the input's), move the quality slider and set the longest side. The image is recompressed as you change them, and the Original, Compressed and Saved figures update.
3. Compare the two previews and click Download. The file is saved as \`<name>-compressed.jpg\`, \`.png\` or \`.webp\`.

## Options

- Quality: 10% to 100% in 5% steps, default 80%. Lower is smaller; around 70 to 85% is usually hard to tell from the original.
- Longest side: default 1920 px, from 16 to 8192. Images larger than this are scaled down proportionally; smaller images are never enlarged.
- Output format: JPEG, PNG or WebP. JPEG has no transparency, so transparent areas become white; PNG is lossless and ignores the quality setting. If the result is larger than the original, the page says so.
- Metadata such as EXIF orientation, location and camera details is not copied to the output.

The tool does not batch-process folders or crop.

## Example

\`\`\`
photo.png · 4032×3024 · 8.4 MB
quality 80% · longest side 1920
→ photo-compressed.jpg · 1920×1440 · about 350 KB · saved 96%
\`\`\`

The exact size depends on the picture's detail; smooth images compress further than noisy ones.

## Privacy

Compression uses a canvas in the browser. The image is never uploaded, no request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What JPEG quality should I use for the web?',
        a: 'Between 70% and 85% is the usual range. Below 70% blocking and ringing artefacts become visible around edges, while above 85% the file grows quickly for little visible gain.',
      },
      {
        q: 'Does compressing an image reduce its quality?',
        a: 'JPEG is lossy, so some detail is discarded every time an image is encoded, and re-saving a JPEG repeatedly compounds the loss. Compress once from the best source you have, and keep the original.',
      },
      {
        q: 'Why is a PNG so much larger than a JPEG of the same photo?',
        a: 'PNG is lossless and stores every pixel exactly, which suits flat graphics and screenshots but not photographs full of fine gradation. JPEG discards detail the eye barely notices, so a photo is typically 5 to 10 times smaller as a JPEG.',
      },
      {
        q: 'Is it safe to compress private photos online?',
        a: 'Only with a tool that works locally. This one reads the file in your browser and never sends it to a server, and it also drops the EXIF metadata that can contain the location where a photo was taken.',
      },
    ],
  },
  gradientGenerator: {
    title: 'Gradient Generator',
    seo: 'CSS Gradient Generator: Linear and Radial | XUtil',
    body: `A CSS gradient generator for linear and radial gradients with two to ten colour stops. Set the direction and stops, preview it and copy the background rule.

## How to use

1. Switch between Linear and Radial. Linear offers a direction (to right, to left, to bottom, to top, to bottom right, or a custom angle in degrees); radial offers the centre point (centre, top, bottom, left or right).
2. Set each stop's colour and its position as a percentage. Add stop inserts a white stop in the middle of the widest gap, up to ten; a stop can be removed while more than two remain.
3. The preview and the CSS update as you edit. Copy the rule, or download it as gradient.css.

## Options

- Colours are six-digit hex values, or eight digits to include alpha; the rule is withheld until every stop is valid.
- Positions run from 0 to 100% and are sorted before the rule is written, so stop order in the list does not matter.
- Radial gradients are always circular (\`circle at <position>\`).
- Default: linear, to right, #FF0000 at 0% to #0000FF at 100%.

The tool does not produce conic or repeating gradients.

## Example

\`\`\`
Linear · To right · #FF0000 0% · #0000FF 100%
→ background: linear-gradient(to right, #FF0000 0%, #0000FF 100%);
\`\`\`

## Privacy

The rule is built in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between a linear and a radial gradient in CSS?',
        a: 'A linear gradient changes colour along a straight line in one direction, such as left to right or at 45 degrees. A radial gradient starts at a centre point and changes colour outward in circles or ellipses.',
      },
      {
        q: 'What do the percentages in a CSS gradient mean?',
        a: 'Each percentage is a colour stop: the point along the gradient line where that colour is fully shown. Between two stops the browser blends the colours; before the first and after the last stop the colour is solid.',
      },
      {
        q: 'Why does "to right" mean the same as 90deg?',
        a: 'CSS angles for linear-gradient start at the top and increase clockwise, so 0deg points up, 90deg points right and 180deg points down. The keyword forms are easier to read, while degrees allow any angle.',
      },
    ],
  },
  boxShadowGenerator: {
    title: 'Box Shadow Generator',
    seo: 'Box Shadow Generator: CSS box-shadow Builder | XUtil',
    body: `A CSS box-shadow generator with sliders for offset, blur and spread, an eight-digit hex colour for alpha and an inset option. Preview it and copy the rule.

## How to use

1. Drag the sliders for horizontal offset, vertical offset, blur and spread, or start from a preset (Soft, Hard, Deep, Inset glow, Subtle inset).
2. Set the colour as six hex digits, or eight to include alpha, for example #00000040 for black at 25% opacity.
3. Tick Inset to draw the shadow inside the box.
4. The preview and the CSS update as you edit. Copy the rule, or download it as box-shadow.css.

## Options

| Property | Range | Default |
| --- | --- | --- |
| Horizontal offset | -50 to 50 px | 5 px |
| Vertical offset | -50 to 50 px | 5 px |
| Blur | 0 to 100 px | 10 px |
| Spread | -50 to 50 px | 0 px |
| Colour | #RRGGBB or #RRGGBBAA | #000000 |
| Inset | on or off | off |

The rule is written as \`box-shadow: [inset] x y blur spread colour;\`. Up to five layers can be added and edited one at a time; the rule joins them with commas.

## Example

\`\`\`
Soft preset
→ box-shadow: 3px 3px 15px 0px #00000040;
\`\`\`

## Privacy

The rule is built in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What do the four numbers in box-shadow mean?',
        a: 'In order: horizontal offset (positive moves the shadow right), vertical offset (positive moves it down), blur radius (0 is a hard edge, larger is softer) and spread (positive grows the shadow, negative shrinks it). The colour follows, and the optional inset keyword draws the shadow inside the element.',
      },
      {
        q: 'How do I make a box-shadow transparent?',
        a: 'Give the colour an alpha channel. An eight-digit hex such as #00000040 is black at 25% opacity (40 hex is 64 of 255), and rgba(0, 0, 0, 0.25) means the same thing. Transparent shadows look more natural than solid ones.',
      },
      {
        q: 'What is the difference between blur and spread?',
        a: 'Blur softens the edge of the shadow without changing its overall size much; spread enlarges or shrinks the shadow shape before the blur is applied. A spread equal to the negative of the blur keeps a soft shadow from leaking past the element.',
      },
      {
        q: 'Does box-shadow affect layout?',
        a: 'No. A shadow is painted outside the box but takes no space, so it does not push neighbouring elements or change the element’s size, unlike border or outline with an offset.',
      },
    ],
  },
};
