// src/components/PageSEO.tsx
import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export const PageSEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
}: PageSEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph (for social media previews) */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
    </Helmet>
  );
};
