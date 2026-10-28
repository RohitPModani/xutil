# ⚙️ XUtil

**XUtil** is your no-nonsense, privacy-first toolbox for developers, built to eliminate the clutter and bloat from typical online utilities. No ads, no trackers, no signups—just fast, reliable tools that work.

---

## 💡 Why XUtil?

Most "free" online tools come at a hidden cost:
- Intrusive ads and popups  
- Data tracking and analytics  
- Account walls just to get results  
- Sluggish performance and bloated interfaces  

**XUtil fixes all that.**  
Whether you're debugging JSON at 2AM or whipping up a UUID between meetings, XUtil is your always-ready, always-private companion.

---

## 🚀 Features

- **Privacy-First:** No cookies, no analytics, no data retention—your inputs stay on your device  
- **Fast as Lightning:** Built with performance in mind. Tools load instantly  
- **Ad-Free & Account-Free:** No signups. No ads. No BS  
- **Dev-First UX:** Tailored for developers who just want tools that work  
- **Fun Included:** From Morse code to Pig Latin, utility meets personality  

---

## 🧰 Tech Stack

- **Frontend:** React + TypeScript + Vite  
- **Styling:** Tailwind CSS, tokens in `src/index.css`  
- **Hosting:** Vercel. `vercel.json` only pins no trailing slash and the SPA fallback; `npm run build` prerenders every route into `dist/<tool>/index.html` (`scripts/prerender.mjs`) so crawlers get the full page without running JavaScript  
- **Analytics:** Cloudflare Web Analytics, one beacon tag in `index.html`; visitors and per-tool pageviews at dash.cloudflare.com

## 🗂️ How the frontend is organised

- `src/data/tools.ts` — the registry. Every tool is one entry (id, name, category, signature, blurb, SEO key, lazy import). The sidebar, index, command palette, router, breadcrumb and sitemap all read from it, so adding a tool is one entry plus one page file.
- `src/ui/` — the primitives every page is built from: `Panel`, `TwoPane`, `Field`, `Input`, `TextArea`, `Select`, `Segmented`, `Output` (read-only result with Copy/Download built in), `KeyValueList`, `Callout`, `Stat`, `FileDrop`, `Dialog`, `Button`.
- `src/components/` — the shell: `Layout` (sidebar + topbar + content), `Sidebar`, `Topbar`, `CommandPalette` (⌘K / Ctrl K from anywhere), `ToolPage` (the frame every tool renders inside: title, signature, related tools, explainer).
- `src/pages/<category>/` — one file per tool. Pages render `<ToolPage id="…">` and compose primitives; synchronous tools compute as you type, so there are no Convert buttons.
- `.tastemaker/` — the design lock (palette, type, spacing, motion) and decision log for the current look.

---

## 🛠️ Available Tools

### 🔐 Encoding / Decoding
- GUID & ULID Generators  
- Password & Hash Generator  
- JWT Decoder  
- Base64, URL, and HTML Encode/Decode  
- ROT13 / Caesar Cipher  
- Morse Code Parser  

### 🔄 Data Converters
- JSON ↔ XML, YAML, CSV  
- JSON → TypeScript, Python Dataclass, Pydantic Model  
- Unix ↔ UTC Timestamp  
- Timezone Converter  
- Text ↔ Binary / Hex / Decimal  
- Base Number Converter  

### 📐 Unit Conversions
- Angle, Area, Length, Volume, Weight  
- Speed, Temperature, Time Units  
- Bits & Bytes, Power, Pressure, Energy, Frequency, Fuel Economy  

### ✍️ Text & Code Utilities
- Lorem Ipsum & Slug Generators  
- Text Compare & Case Converter  
- Whitespace, Line Break & Duplicate Remover  
- JSON Validator & Formatter  
- Regex Tester + Cheatsheet  
- URL Parser, String Counter, Markdown Preview  

### 🤪 Fun Text Tools
- Palindrome Checker  
- Roman Numeral Converter  
- Leetspeak & Pig Latin Translator  
- NATO Phonetic Converter  
- String Reverser / Rotator  
- Numeronym Generator  
- Word Frequency Counter  

### 🖼️ Visual & Image Tools
- QR Code & Barcode Generator  
- Barcode Reader  
- Image Compressor  
- Color Picker  
- CSS Gradient & Box Shadow Generators  
- Favicon Generator  

---

<a href="https://www.producthunt.com/posts/xutil?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-xutil" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=969882&theme=light&t=1748242685186" alt="XUtil - A&#0032;minimalist&#0032;one&#0032;stop&#0032;destination&#0032;for&#0032;all&#0032;Dev&#0032;tools | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

---

## 🧪 Run Locally

Clone the repository and start the development server:

```bash
git clone https://github.com/RohitPModani/xutil.git
cd xutil
npm install
npm run dev
