// Generates public/sitemap.xml and public/llms.txt from the tool registry, so
// neither can drift out of sync with the actual routes.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://xutil.in";

const source = readFileSync(join(root, "src/data/tools.ts"), "utf8");

// Categories: `{ id: 'encode', title: 'Encode & decode' }`
const categories = [...source.matchAll(/\{ id: '(\w+)', title: '([^']+)' \}/g)].map((m) => ({
  id: m[1],
  title: m[2],
}));

// Tools: `{ id: 'jwt', name: '…', category: 'encode', …, blurb: '…', …`
const tools = [...source.matchAll(/\{ id: '([^']+)', name: '([^']+)', category: '(\w+)'.*?blurb: '((?:[^'\\]|\\.)*)'/g)].map(
  (m) => ({ id: m[1], name: m[2], category: m[3], blurb: m[4].replace(/\\'/g, "'") })
);

if (tools.length === 0 || categories.length === 0) {
  throw new Error("No tools found - has src/data/tools.ts changed shape?");
}

const today = new Date().toISOString().split("T")[0];

const entry = (loc, priority) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entry(`${SITE_URL}/`, "1.0"),
  ...tools.map((t) => entry(`${SITE_URL}/${t.id}`, "0.8")),
  "</urlset>",
].join("\n");

writeFileSync(join(root, "public/sitemap.xml"), xml + "\n");
console.log(`sitemap.xml: ${tools.length + 1} URLs written`);

// llms.txt (https://llmstxt.org): a plain index AI crawlers can read in one
// request, one line per tool with what it does.
const llms = [
  "# XUtil",
  "",
  `> ${tools.length} free developer tools that run entirely in the browser: encoders, decoders, converters, generators, formatters and image utilities. No ads, no accounts, no data leaves the page.`,
  "",
  "Every tool is a single page. Paste or type on the left, the result appears on the right as you type, and every result has a Copy button. Each page ends with an explainer and FAQ about the format or conversion it handles.",
  "",
  ...categories.flatMap((c) => [
    `## ${c.title}`,
    "",
    ...tools.filter((t) => t.category === c.id).map((t) => `- [${t.name}](${SITE_URL}/${t.id}): ${t.blurb}`),
    "",
  ]),
  "## Optional",
  "",
  `- [Source on GitHub](https://github.com/RohitPModani/xutil): the full source code (React + TypeScript).`,
  "",
].join("\n");

writeFileSync(join(root, "public/llms.txt"), llms);
console.log(`llms.txt: ${tools.length} tools listed`);
