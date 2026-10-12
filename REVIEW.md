# Tool review — changes and optimisations

Reviewed 2026-10-12 after the frontend rebuild: all 63 tool pages, the shared primitives in `src/ui`, and the shell. Items marked **[verified]** were reproduced by running the page's logic. Ordered by priority within each section; "nice to have" items are at the end of each section.

> **Status (2026-10-12):** every item in §1 and §2 has been fixed; the per-tool check scripts in `scripts/check-*.mjs` cover the verified cases. §3 and §4 remain open, except where a §2 fix already delivered them (regex groups/replace, hash files/MD5/HMAC, URL-safe Base64, URL encoder modes, CSV delimiter/typing, cron phrases, timezone offsets/Now, compressor formats, favicon snippet, QR scheme prefix, word-level diff, IEC bytes).

## 1. Fix once in the shared layer (affects most pages)

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | `src/ui/Form.tsx` Field, every page | Inputs set `aria-invalid` but the error Callout has no `id` and nothing sets `aria-describedby`, so screen readers hear "invalid" with no reason. `Field` already has an `error` prop that nobody uses. | Have `Field` generate an id for hint/error and pass `aria-describedby` to its child (cloneElement or render prop); pages pass `error={…}` instead of a separate Callout. |
| 2 | `src/ui/Panel.tsx` Output | `<label htmlFor={id}>` is orphaned whenever `id` is omitted (almost every page) and always in `children` mode, so result areas have no accessible name. | Default `id` from `useId()`; in children mode render `role="region" aria-labelledby`. |
| 3 | `src/ui/Panel.tsx:99`, `ValueBlock`, `StringCounter` | `aria-live="polite"` on the whole result re-announces the entire output (or a 16-char password per slider pixel) on every keystroke. | Remove; announce a short status ("Result updated", "New password") from one visually-hidden live region. |
| 4 | `src/ui/FileDrop.tsx` | Uncontrolled: the panel's Clear empties the text but the file chip stays; re-choosing the same file does nothing; dropped files bypass `accept`; the hidden input has no accessible name; multi-drop extras ignored silently. | Accept a `file` prop (controlled) or `key` it on `fileBase`; check `file.type`/extension against `accept` in `take`; `aria-label={label}`. |
| 5 | `src/hooks/useSourceText.ts` | Two quick loads (or Clear during a load) resolve out of order; `fileBase` keeps naming downloads after the user has replaced the text. | Load counter to drop stale resolutions; reset `fileBase` when `setText` is called by typing. |
| 6 | Heavy work on every keystroke | TextCompare (10k lines ≈ 8.5 s, twice), RegexTester (`(a+)+$` hangs), XML/YAML/CSV/JSON pages (5 MB files), Base58 (O(n²), 40 KB ≈ 2 s), BaseNumber (unbounded digits), BarcodeReader (full-res canvas). | Standard pattern: `useDeferredValue(input)` for cheap cases; debounce + size cap for parsers; Web Worker with timeout for regex and diff; `autoSize={false}` on TextArea above ~200 KB. |
| 7 | `src/ui/Panel.tsx:129` KeyValueList | `dt` is `w-32 truncate` with no tooltip: unit labels and query keys are cut off. | `title` on `dt`, or let it wrap. |
| 8 | `src/ui/Form.tsx` Segmented | Arrow keys change the value but focus stays on the now `tabIndex=-1` button; no Home/End. | Focus the newly selected radio after `onChange`. |
| 9 | `src/utils/color.ts` | `cleanHex` keeps interior `#` (`#12#34` can never become valid) **[verified]**; `#RGB` shorthand never expands. | Strip all `#` then prepend one; expand 3/4-digit hex. |
| 10 | `src/ui/Actions.tsx` | CopyButton `failed` sticks until a later success; `RegenerateButtonProps` names `GenerateButton`. | Reset on `text` change; rename. |
| 11 | `src/ui/RangeInput.tsx` | Out-of-range typed values are silently ignored with no `aria-invalid`. | Mark invalid while text is out of range. |
| 12 | JSON tools (validator, YAML, XML, CSV, type generators) | Integers above 2^53 are silently altered by `JSON.parse` **[verified]**. | Detect `/-?\d{16,}/` and show an info Callout, or use a number-preserving formatter. |
| 13 | `package.json` | `papaparse` and `xml2js` are installed but unused while CSV uses a broken hand parser. | Use papaparse for CSV; remove xml2js. |
| 14 | Three JSON→type pages | `capitalize`/`getType`/`generateClass` triplicated with the same bugs (see §2.2). | One `inferSchema(json)` util returning a type tree + three small emitters. |
| 15 | XML/YAML/CSV pages | Three near-identical two-way shells. | One `TwoWayConverter` taking `{ convert, formats, accept, mimes }`. |
| 16 | 12 unit wrappers | Same 6-line `convert` copied twelve times; `toFixed(8)` applied inside each. | `linearConvert(table)` in UnitConverter; wrappers become data. |

## 2. Bugs by tool

### 2.1 Encode & decode
- **JWT** `JWTDecoder.tsx:77` payload `null` crashes the page (`data.payload.exp`) **[verified]**; `:61` `exp` beyond ±8.64e15 ms throws RangeError **[verified]** → require objects, guard `isFinite(getTime())`. Also: strip `Bearer `; render array/object claims with `JSON.stringify`; add "not yet valid" for `nbf`; warn on `alg: "none"`.
- **HTML entities** `:21` one-pass unescape mangles double-encoded input (`&amp;lt;` → `<`) **[verified]**; `:34` accepts wrong-case names and emits NUL/lone surrogates; only 11 named entities known (`&nbsp;`, `&mdash;` untouched) → decode via `textarea.innerHTML`, which handles all 2,200+ names correctly.
- **Morse** `:35` three-space word gaps decode as one word (`SOSSOS`) **[verified]**; `:56` playback has no cleanup/Stop and sticks on "Playing" if the AudioContext starts suspended; accented letters dropped silently; `_`/`|`/`−` variants rejected.
- **ULID** `:27` validation is length-only, invalid chars show a "Created" time **[verified]** → use `isValid` from `ulid`; `:17` bulk uses `ulid()` not `monotonicFactory()`, so same-millisecond IDs are not sorted **[verified]**; `maxLength={26}` truncates pastes with quotes/spaces.
- **Password** `:52` strength is dominated by set count: 8 chars with all sets reads "Very strong" (~52 bits) **[verified]** → score entropy `length·log2(pool)`.
- **Base64** `:17` valid Base64 of non-UTF-8 bytes reports "Not valid Base64" **[verified]** → separate the two failures; URL-safe alphabet rejected; Base32 length not validated; Base58 O(n²).
- **URL** `:17` encode-direction failures show the decode error message **[verified]**; no `encodeURI` / form (`+`) modes.
- **GUID/ULID** fractional count (`2.5`) generates 2 but shows 2.5; editing the bulk count also regenerates the headline value.
- **Hash** cannot hash the empty string or a file; no MD5/HMAC; stale digests shown during debounce with no cue.

### 2.2 Data formats
- **Timezone** `:174` "To zone" DST label checks the input wall-clock in the target zone, not the converted instant **[verified]**; `:36` nonexistent/ambiguous wall-clocks (spring-forward gap) are silently shifted, the "not valid" error can never fire **[verified]**; `:18` duplicate zone values make New York users see "Alabama / Birmingham" (which is itself wrong: Birmingham is Central) and "Arizona / Phoenix" maps to Denver (DST) **[verified data]**; saved cities keyed by `value` so LA + SF collide; `Europe/Kyiv` missing; unknown local zones become "UTC"; results show no zone abbreviation/offset; `nowInput()` never refreshes; one formatter + DateTime per city per second.
- **Unix ⇄ UTC** `:25` non-ISO dates parse as *local* despite the "treated as UTC" hint **[verified]**; `:26` only the first space becomes `T` (`… +05:30` fails) **[verified]**; `:28` `2025-02-30` rolls to 2 March **[verified]**; "Relative" never re-renders; µs/ns timestamps misread.
- **CSV** hand parser: escaped quotes lost (`"a ""b"""`), quoted newlines split rows, blank lines → null records, headers split on `_` (`first_name` → nested), array cartesian product (3×10 → 1000 rows), `\r` not quoted, quoted padding trimmed **[all verified]** → papaparse; delimiter select; "infer types" option.
- **XML** attributes on leaf elements and mixed content dropped; JSON→XML serialises only the first top-level key and arrays at root; attribute values escape only `"` → wrap in `<root>`, emit `@attributes`/`#text`, escape properly; surface the parser's line/column.
- **YAML** default schema turns `2024-01-01` into a Date string and `0o17` into 15 **[verified]** → `CORE_SCHEMA`; flow-style YAML starting with `{` is sent to `JSON.parse` in auto mode **[verified]** → fall back to YAML; multi-doc `---` throws → `loadAll`.
- **JSON → Pydantic/Python/TS** (shared bugs **[verified]**): `Any` used but not imported (NameError); empty object yields a body-less class (SyntaxError); non-identifier keys emitted verbatim (`first-name: str`, unquoted in TS); nested names collide (`user.address` and `company.address` both `RootAddress`, second dropped); arrays of objects use only the first element; TS root name unvalidated; Pydantic emits the deprecated v1 `@validator`.
- **Text ⇄ bytes** `fromCharCode` wraps above 0xFFFF (`1F600` → U+F600) **[verified]** → `fromCodePoint`; encodes UTF-16 units, not bytes, despite the label.
- **Cron** step unchecked (`*/90`, `*/0`); `at 25:00` accepted; "every day at midnight" throws; "monday and wednesday" keeps one day; weekday ignored in "every N" branch; "in january at 9am" loses January; "between 9 pm and 5 am" emits `21-5`; multiple `at` clauses dropped **[all verified]**; no monthly/weekly/ordinal phrases; no cron → English.
- **Base number** O(n²) parse with no `maxLength`; negatives, `0x` prefixes and `_` grouping rejected.

### 2.3 Text & code
- **Case converter** `:9` camelCase input is not split (`helloWorld` → `helloworld` for snake/kebab/CONSTANT) **[verified]**; Title case doesn't lowercase the rest and capitalises after apostrophes; Sentence case only capitalises the first character of the text.
- **Slug** `ß`, `ø`, `ł` dropped (`København` → `kbenhavn`); non-Latin text yields "" with a misleading error; `_` not treated as a break **[verified]**.
- **JSON validator** `/line (\d+)/` matches inside the quoted user input (`{"b": line 7}` → "Line 7") **[verified]**; multi-line errors dump the input with raw newlines into the Callout.
- **Text compare** trailing-newline difference shows an identical line removed and re-added; the patch is computed twice; 20k rows rendered unvirtualised; no word-level highlighting.
- **Duplicate lines** with "Keep blank lines" on, blank lines are still de-duplicated **[verified]**; "Removed" stat counts dropped blanks.
- **String counter** counts UTF-16 units (😀 = 2); whole stat grid is a live region.
- **Lorem** `.html` name persists after switching unit, served as `text/plain`; fractional counts; "1 paragraphs".
- **URL parser** `origin` shows the literal `"null"` for `mailto:`/custom schemes **[verified]**; no decoded path or `host`.
- **Markdown** `marked.setOptions` mutates the global instance at module load; links navigate the SPA away; `<style>`/`<form>` survive DOMPurify defaults; download lacks `<meta charset>`.
- **Regex tester** no capture groups/named groups/positions/replace (the core reasons to open one); unbounded `<mark>` count; Stat and Output both labelled "Matches".
- **Regex cheatsheet** 25 PCRE-only tokens shown with no badge; POSIX classes written as `[:alnum:]` (wrong, must be `[[:alnum:]]`); hex-colour pattern fails uppercase; URL pattern stops at the TLD **[verified]**.
- **Whitespace remover** "Collapse repeated spaces" also converts a single tab; no "collapse blank lines".

### 2.4 Units & word play
- **All linear converters** `Number(x.toFixed(8))` rounds to 8 *absolute* decimals: 1 eV → 0 J, 1 ns → 0 s, 1 mg → 0 t, 1 bit → 0 PB; small results keep 1–3 significant digits **[verified]** → format with `maximumSignificantDigits`.
- **UnitConverter** copy text is locale-grouped (`1,000`, or `1.000,5` in de-DE) so it can't be pasted back; typing `-`, `.`, `1e` flashes "Enter a number" mid-entry; `Number()` accepts `0x10`; layout jumps on error (Output replaced by Callout); identity row listed; one `Intl.NumberFormat` per row per keystroke.
- **Angle** rejects 0 and negatives → `allowNonPositive`. **Pressure** torr uses the mmHg value (1 atm → 759.99989 torr) → `101325/760` **[verified]**. **Temperature** no absolute-zero floor (−500 °C → −226.85 K) **[verified]**. **Fuel economy** inconsistent rows for tiny inputs. **Speed** knot literal → `1852/3600`. **Length** nautical mile labelled "(nm)". **Power** "Horsepower (metric) (hp)". **Time** month/year averages unstated (365 vs 365.25). **Bits/bytes** SI only, "Kb" ambiguous; no KiB/MiB.
- **Pig Latin** decode moves the whole trailing cluster (`world` → `rldwo`), placeholder round-trips wrong; non-ASCII letters treated as punctuation (`café` → `afcayé`); auto-detect fires on "Stay away today" **[verified]**.
- **Leetspeak** `Math.random()` inside `useMemo` re-randomises already-typed text on every keystroke; auto-detect counts punctuation as leet ("Hello, world! 123" gets "decoded") **[verified]**; letter-only substitutions (`vv`, `em`) aren't decodable.
- **Numeronym** `\w+` abbreviates numbers (`12345` → `135`) and skips non-ASCII words **[verified]**. **Palindrome** strips all non-ASCII letters (`Анна` → nothing) **[verified]**. **Word frequency** `\b\w+\b` is ASCII-only (`don't` → `don`+`t`, CJK → 0 words) **[verified]**; 20k rows with two hooks each re-render per keystroke → top N + "show all". **String reverser** splits grapheme clusters → `Intl.Segmenter`; empty rotate = 0. **NATO** newline in input throws with a raw line break; outputs "Alpha/Juliet" while the registry promises ICAO "Alfa/Juliett". **Roman** `12.5` and `-5` routed to Roman→Number.

### 2.5 Images & colour
- **QR** SMS body is URL-encoded inside `SMSTO:` (scanners pre-fill `Hi%20there`) **[verified]**; Wi-Fi SSID/password unescaped (`;,:\"` corrupt the record) and `P:` emitted for `nopass` **[verified]**; WhatsApp number keeps `+`/spaces (wa.me rejects) **[verified]**; unparsable datetime crashes the page in `toIcs` **[verified]**; vCard/VEVENT values unescaped and multi-line descriptions break the property **[verified]**; on error the stale PNG/SVG stay downloadable; URL kind doesn't add `https://`; per-kind `autoFocus` steals focus when arrowing through the type select.
- **Image compressor** always JPEG: PNG/WebP transparency flattened to black while the blurb promises PNG/WebP → format select, white fill for JPEG; new file keeps the old result through the debounce (stats mix two images); "Longest side" unbounded (20000 → blank canvas); object URL created in `useMemo` (leaks under StrictMode) and a second one per compress; "Saved −20%" with no hint the original is better; slider is ~40 px at phone width.
- **Favicon** non-square sources are stretched → centre-crop; object URLs leaked when the file is swapped mid-run; "Generating…" forever after a read error; single-step downscale aliases → `imageSmoothingQuality='high'`; files named `favicon-180x180.png` while labelled apple-touch-icon; no `<link>` snippet/manifest.
- **Barcode reader** full-resolution synchronous decode (Safari fails above 16.7 MP, reported as "no code found"); every failure is the same message; previous result stays while the next image decodes; no `TRY_HARDER`.
- **Barcode generator** invalid colour silently falls back; `jsOptions` memo keyed on the whole object. **Gradient** position snaps to 0 when the field is cleared; "Add stop" duplicates 100%; no free angle/alpha/conic. **Colour picker** hex-only input (`rgb(…)`/`#F00` rejected), no alpha/HSV/CMYK; converters belong in `utils/color.ts`. **Box shadow** single layer; preset state is colour-only (no `aria-pressed`); Reset never disabled.

## 3. Functional gaps worth adding (core, not nice-to-have)
- Regex tester: capture groups, match positions, replace field.
- Hash: file hashing, empty-string hash, MD5 (small inline implementation).
- Base64: URL-safe variant; file → Base64; binary download.
- URL encoder: component / full URL / form-data modes.
- CSV: delimiter choice, type inference, TSV.
- Cron: monthly/weekly/ordinal phrases; cron → English with next runs.
- Timezone: zone abbreviation/offset in results; Now button; merge the "many zones" and "range" panels.
- Image compressor: output format selection.
- Favicon: HTML snippet output.
- QR: scheme-prefix URLs; transparent background.
- Text compare: word-level highlighting inside changed lines.
- Bits/bytes: IEC (1024) units or a toggle.

## 4. Nice to have
JWT signature check with a pasted secret · ULID ⇄ UUID · UUID v5/nil · passphrase mode and "exclude ambiguous" for passwords · Caesar encode/decode toggle · HMAC and Base64 hash output · JSON sort-keys and JSONC tolerance · Markdown link targets option · more units (in², UK gallon, cups, µm, Rankine) · Roman vinculum · word-frequency percentages · reverse words/lines · barcode text position options · multiple box shadows · camera scanning and multi-code decode in the reader · conic gradients.
