// Runs after `vite build`. Writes dist/<tool>/index.html for every route with
// the title, description, canonical, Open Graph, JSON-LD, the explainer and a
// nav of every tool already in the HTML, so crawlers that do not run
// JavaScript (Bing, DuckDuckGo, AI bots, link unfurlers) index the same page
// a visitor sees. React clears #root on mount, so the static copy is replaced
// by the live tool. Head tags carry data-rh so react-helmet-async takes them
// over instead of duplicating them.
import { marked } from "marked";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_URL, categories, loadSeo, root, tools } from "./registry.mjs";

const seoByKey = await loadSeo();
const template = readFileSync(join(root, "dist/index.html"), "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

// Mirrors summarise() in ToolPage.tsx.
const summarise = (body) =>
  body.trim().split(/\n\s*\n/)[0].replace(/[*_`#]/g, "").replace(/\s+/g, " ").slice(0, 160);

const head = ({ title, description, url, jsonLd }) =>
  [
    `<title data-rh="true">${esc(title)}</title>`,
    `<meta data-rh="true" name="description" content="${esc(description)}">`,
    `<link data-rh="true" rel="canonical" href="${url}">`,
    `<meta data-rh="true" property="og:type" content="website">`,
    `<meta data-rh="true" property="og:site_name" content="XUtil">`,
    `<meta data-rh="true" property="og:url" content="${url}">`,
    `<meta data-rh="true" property="og:title" content="${esc(title)}">`,
    `<meta data-rh="true" property="og:description" content="${esc(description)}">`,
    `<meta data-rh="true" name="twitter:card" content="summary">`,
    `<meta data-rh="true" name="twitter:title" content="${esc(title)}">`,
    `<meta data-rh="true" name="twitter:description" content="${esc(description)}">`,
    ...jsonLd.map((o) => `<script data-rh="true" type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`),
  ].join("\n    ");

const allToolsNav = categories
  .map(
    (c) =>
      `<section><h2>${esc(c.title)}</h2><ul>${tools
        .filter((t) => t.category === c.id)
        .map((t) => `<li><a href="/${t.id}">${esc(t.name)}</a>: ${esc(t.blurb)}</li>`)
        .join("")}</ul></section>`
  )
  .join("");

const page = ({ title, description, path, jsonLd, body }) => {
  const url = `${SITE_URL}${path}`;
  const html = template
    .replace(/<title[^>]*>[^<]*<\/title>/, "")
    .replace(/<meta\s+data-rh="true"\s+name="description"[^>]*>/, "")
    .replace("</head>", `    ${head({ title, description, url, jsonLd })}\n  </head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root"><main class="px-4 py-5 sm:px-6 lg:px-8"><div class="prose-tool mx-auto w-full max-w-6xl">${body}<nav aria-label="All tools">${allToolsNav}</nav></div></main></div>`
    );
  if (!html.includes(`<title data-rh="true">${esc(title)}</title>`)) throw new Error(`prerender: head not injected for ${path}`);
  return html;
};

// Home
const homeTitle = "XUtil | Developer Tools";
const homeDescription =
  "Free developer tools that run in your browser: JWT decoder, JSON formatter, converters, generators. No ads, no tracking, no signup.";
writeFileSync(
  join(root, "dist/index.html"),
  page({
    title: homeTitle,
    description: homeDescription,
    path: "/",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebSite", name: "XUtil", url: `${SITE_URL}/`, description: homeDescription }],
    body: `<h1>${tools.length} developer tools, all in your browser</h1><p>Nothing you paste leaves this tab.</p>`,
  })
);

// One page per tool. Mirrors the title, description and JSON-LD in ToolPage.tsx.
for (const tool of tools) {
  const seo = seoByKey[tool.seo];
  const description = seo ? summarise(seo.body) : tool.blurb;
  const title = seo?.seo ?? `${tool.name} | XUtil`;
  const path = `/${tool.id}`;
  const url = `${SITE_URL}${path}`;
  const category = categoryById[tool.category];
  const related = tools.filter((t) => t.category === tool.category && t.id !== tool.id);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      url,
      description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any (browser)",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      browserRequirements: "Runs entirely in the browser; no data is uploaded.",
      publisher: { "@type": "Organization", name: "XUtil", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "All tools", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: category?.title, item: `${SITE_URL}/#cat-${tool.category}` },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];
  if (seo?.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  const body = [
    `<h1>${esc(tool.name)}</h1>`,
    `<p>${esc(tool.blurb)}</p>`,
    related.length
      ? `<nav aria-label="More in ${esc(category?.title ?? "")}"><h2>More in ${esc(category?.title ?? "")}</h2><ul>${related
          .map((t) => `<li><a href="/${t.id}">${esc(t.name)}</a></li>`)
          .join("")}</ul></nav>`
      : "",
    seo ? `<section><h2>About ${esc(tool.name)}</h2>${marked.parse(seo.body, { async: false, gfm: true })}</section>` : "",
    seo?.faq?.length
      ? `<section><h2>Frequently asked questions</h2><dl>${seo.faq
          .map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`)
          .join("")}</dl></section>`
      : "",
  ].join("");

  mkdirSync(join(root, "dist", tool.id), { recursive: true });
  writeFileSync(join(root, "dist", tool.id, "index.html"), page({ title, description, path, jsonLd, body }));
}

console.log(`prerender: ${tools.length + 1} pages written`);
