import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export const SITE_URL = 'https://xutil.in';

interface PageSEOProps {
  title: string;
  description: string;
  /** One or more schema.org objects, emitted as JSON-LD. */
  jsonLd?: Record<string, unknown>[];
  /** Keep the page out of search results (the SPA 404 answers with 200). */
  noindex?: boolean;
}

/**
 * Title, description, canonical URL, Open Graph and structured data for a
 * page. Search engines and AI crawlers read the same tags, so one set does.
 */
export const PageSEO = ({ title, description, jsonLd, noindex }: PageSEOProps) => {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={url} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="XUtil" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {jsonLd?.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};
