import { useEffect, useState, useRef } from "react";
import BackToHome from "../../components/BackToHome";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import CopyButton from "../../components/CopyButton";
import DownloadButton from "../../components/DownloadButton";
import ErrorBox from "../../components/ErrorBox";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import seoDescriptions from "../../data/seoDescriptions";
import { updateToolUsage } from "../../utils/toolUsage";
import { marked } from "marked";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";

// Configure marked to render lists properly
marked.setOptions({
  gfm: true,
  breaks: true,
});

function MarkdownPreviewer() {
  const seo = seoDescriptions.markdownPreviewer;
  const [markdownInput, setMarkdownInput] = useState<string>("");
  const [previewOutput, setPreviewOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage("markdown");
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [markdownInput]);

  // Real-time Markdown preview
  useEffect(() => {
    if (markdownInput) {
      try {
        const html = marked.parse(markdownInput, { async: false }) as string;
        setPreviewOutput(html);
        setError(null);
      } catch (err) {
        setError("Error rendering Markdown. Please check your syntax.");
        setPreviewOutput("");
      }
    } else {
      setPreviewOutput("");
      setError(null);
    }
  }, [markdownInput]);

  const handleClear = () => {
    setMarkdownInput("");
    setPreviewOutput("");
    setError(null);
  };

  const getResultsText = () => previewOutput;

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex justify-between items-center mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Markdown Previewer</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!markdownInput && !previewOutput && !error}
            />
          </div>
          <hr className="line-break" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label htmlFor="markdownInput" className="form-label">
                Markdown Input
              </label>
              <AutoTextarea
                id="markdownInput"
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                placeholder="e.g. # Hello World\n\nThis is a **Markdown** previewer."
                className="input-field w-full h-64"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <label className="form-label">Preview</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={getResultsText()} />
                  <DownloadButton
                    content={previewOutput}
                    fileName="preview.html"
                    fileType="html"
                    disabled={!previewOutput}
                  />
                </div>
              </div>
              <AutoTextarea
                id="markdownOutput"
                value={previewOutput}
                readOnly
                placeholder="e.g. <h1>Hello World</h1><p>This is a <strong>Markdown</strong> previewer.</p>"
                className="input-field w-full h-64"
              />
            </div>
          </div>

          {error && (
            <div aria-live="polite" className="mt-4">
              <ErrorBox message={error} />
            </div>
          )}
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default MarkdownPreviewer;
