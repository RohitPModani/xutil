// Generates public/sitemap.xml and public/llms.txt from the tool registry, so
// neither can drift out of sync with the actual routes.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { SITE_URL, categories, root, tools } from "./registry.mjs";

const today = new Date().toISOString().split("T")[0];

// Last commit that touched a file, so lastmod means something to crawlers
// instead of being the build date on every URL.
const lastmod = (...files) => {
  try {
    return execSync(`git log -1 --format=%cs -- ${files.map((f) => JSON.stringify(f)).join(" ")}`, { cwd: root, encoding: "utf8" }).trim() || today;
  } catch {
    return today;
  }
};

const entry = (loc, date, priority) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${date}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entry(`${SITE_URL}/`, lastmod("src/data/tools.ts", "src/pages/Home.tsx"), "1.0"),
  ...tools.map((t) => entry(`${SITE_URL}/${t.id}`, lastmod(t.file, "src/data/seo"), "0.8")),
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
