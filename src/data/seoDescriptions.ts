import type { SEODescriptionContent } from './seo/types';
import { encodeSeo } from './seo/encode';
import { dataSeo } from './seo/data';
import { unitsSeo } from './seo/units';
import { textSeo } from './seo/text';
import { funSeo } from './seo/fun';
import { imageSeo } from './seo/image';

export type { SEODescriptionContent, FAQ } from './seo/types';

/** Keyed by each tool's registry `seo` field. One file per category. */
const seoDescriptions: Record<string, SEODescriptionContent> = {
  ...encodeSeo,
  ...dataSeo,
  ...unitsSeo,
  ...textSeo,
  ...funSeo,
  ...imageSeo,
};

export default seoDescriptions;
