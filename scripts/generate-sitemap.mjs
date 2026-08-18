// Generates public/sitemap.xml from the route table so the sitemap referenced
// by robots.txt cannot drift out of sync with the actual routes.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://xutil.in";

const source = readFileSync(join(root, "src/router/routesConfig.tsx"), "utf8");

// Every tool route is declared as createRoute('<path>', Component).
const paths = [...source.matchAll(/createRoute\(\s*'([^']+)'/g)].map((m) => m[1]);

if (paths.length === 0) {
  throw new Error("No routes found - has routesConfig.tsx changed shape?");
}

const unique = [...new Set(paths)].sort();
const today = new Date().toISOString().split("T")[0];

const entry = (loc, priority) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entry(`${SITE_URL}/`, "1.0"),
  ...unique.map((p) => entry(`${SITE_URL}/${p}`, "0.8")),
  "</urlset>",
].join("\n");

writeFileSync(join(root, "public/sitemap.xml"), xml + "\n");
console.log(`sitemap.xml: ${unique.length + 1} URLs written`);
