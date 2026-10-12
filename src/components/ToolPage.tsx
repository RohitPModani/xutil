import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categoryById, toolById, toolPath, toolsInCategory } from '../data/tools';
import seoDescriptions from '../data/seoDescriptions';
import { recordToolUse } from '../utils/toolUsage';
import { renderMarkdown } from '../utils/markdown';
import { PageSEO, SITE_URL } from './PageSEO';
import { Signature } from './Signature';

interface ToolPageProps {
  /** Registry id, e.g. "jwt". Name, signature, blurb and SEO come from it. */
  id: string;
  children: ReactNode;
}

/** First paragraph of the explainer, for the meta description. */
const summarise = (body: string) =>
  body
    .trim()
    .split(/\n\s*\n/)[0]
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 160);

/**
 * The frame every tool shares: title + signature above, related tools, the
 * explainer and FAQ below. Pages only supply what is between.
 */
export default function ToolPage({ id, children }: ToolPageProps) {
  const tool = toolById.get(id);
  if (!tool) throw new Error(`Unknown tool id "${id}"`);
  const category = categoryById.get(tool.category);
  const seo = seoDescriptions[tool.seo];
  const related = toolsInCategory(tool.category).filter((t) => t.id !== tool.id);
  const description = seo ? summarise(seo.body) : tool.blurb;
  const url = `${SITE_URL}${toolPath(tool)}`;

  useEffect(() => recordToolUse(tool.id), [tool.id]);

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      url,
      description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (browser)',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      browserRequirements: 'Runs entirely in the browser; no data is uploaded.',
      publisher: { '@type': 'Organization', name: 'XUtil', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'All tools', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: category?.title, item: `${SITE_URL}/#cat-${tool.category}` },
        { '@type': 'ListItem', position: 3, name: tool.name, item: url },
      ],
    },
  ];
  if (seo?.faq?.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return (
    <>
      <PageSEO title={seo?.seo ?? `${tool.name} | XUtil`} description={description} jsonLd={jsonLd} />

      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{tool.name}</h1>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted">
          <span>{tool.blurb}</span>
          <Signature tool={tool} />
        </p>
      </header>

      <div className="space-y-5">{children}</div>

      <footer className="mt-10 space-y-6">
        {related.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              More in {category?.title}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {related.map((t) => (
                <Link
                  key={t.id}
                  to={toolPath(t)}
                  className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs text-muted transition-colors duration-150 hover:border-control hover:text-ink"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {seo && (
          <details className="group rounded-md border border-line bg-panel">
            <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-ink">
              About {tool.name}
              <ChevronDown className="h-4 w-4 text-muted transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="prose-tool border-t border-line px-4 pb-4 pt-3">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(seo.body) }} />
              {seo.faq && seo.faq.length > 0 && (
                <>
                  <h2>Frequently asked questions</h2>
                  <dl>
                    {seo.faq.map((f) => (
                      <div key={f.q}>
                        <dt className="font-semibold text-ink">{f.q}</dt>
                        <dd className="mb-3 ml-0">{f.a}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </div>
          </details>
        )}
      </footer>
    </>
  );
}
