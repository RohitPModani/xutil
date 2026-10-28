// Reads the tool registry and the explainers without a bundler, for the build
// scripts that emit sitemap.xml, llms.txt and the prerendered pages.
import ts from "typescript";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SITE_URL = "https://xutil.in";

const source = readFileSync(join(root, "src/data/tools.ts"), "utf8");

// `{ id: 'encode', title: 'Encode & decode' }`
export const categories = [...source.matchAll(/\{ id: '(\w+)', title: '([^']+)' \}/g)].map((m) => ({
  id: m[1],
  title: m[2],
}));

// `{ id: 'jwt', name: '…', category: 'encode', …, blurb: '…', …, seo: 'jwtDecoder', load: () => import('../pages/…') }`
export const tools = [
  ...source.matchAll(
    /\{ id: '([^']+)', name: '([^']+)', category: '(\w+)'.*?blurb: '((?:[^'\\]|\\.)*)'.*?seo: '(\w+)', load: \(\) => import\('([^']+)'\)/g
  ),
].map((m) => ({
  id: m[1],
  name: m[2],
  category: m[3],
  blurb: m[4].replace(/\\'/g, "'"),
  seo: m[5],
  file: join("src/data", m[6] + ".tsx"),
}));

if (tools.length === 0 || categories.length === 0) {
  throw new Error("No tools found - has src/data/tools.ts changed shape?");
}

const loadModule = async (file) => {
  const src = readFileSync(file, "utf8").replace(/^import type.*\n/m, "");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return Object.values(await import("data:text/javascript," + encodeURIComponent(js)))[0];
};

/** `{ [seoKey]: { seo, body, faq } }` across every file in src/data/seo. */
export const loadSeo = async () => {
  const dir = join(root, "src/data/seo");
  const all = {};
  for (const f of readdirSync(dir).filter((f) => f !== "types.ts")) Object.assign(all, await loadModule(join(dir, f)));
  return all;
};
