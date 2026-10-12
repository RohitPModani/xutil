import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** Markdown (GFM, tables included) to sanitised HTML for trusted site copy. */
export const renderMarkdown = (md: string) =>
  DOMPurify.sanitize(marked.parse(md, { async: false, gfm: true, breaks: false }) as string);
