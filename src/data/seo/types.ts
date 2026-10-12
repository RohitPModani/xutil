export interface FAQ {
  /** The question as someone would type it into a search box. */
  q: string;
  /** A self-contained answer, one to three sentences. */
  a: string;
}

export interface SEODescriptionContent {
  /** Display title (legacy; the registry name is what pages show). */
  title: string;
  /** The <title> tag, 60 characters or fewer. */
  seo: string;
  /** Markdown. The first paragraph doubles as the meta description. */
  body: string;
  /** Rendered under the explainer and emitted as FAQPage structured data. */
  faq?: FAQ[];
}
