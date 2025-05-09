import { useEffect, useState, useRef } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import CopyButton from '../../components/CopyButton';
import DownloadButton from '../../components/DownloadButton';
import ErrorBox from '../../components/ErrorBox';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import seoDescriptions from '../../data/seoDescriptions';
import { updateToolUsage } from '../../utils/toolUsage';

function LineBreakWhiteSpaceRemover() {
  const seo = seoDescriptions.lineBreakWhiteSpaceRemover || { title: 'Line Break & Whitespace Remover', body: 'Remove line breaks and extra whitespace from your text in real-time.' };
  const [textInput, setTextInput] = useState<string>('');
  const [resultOutput, setResultOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('line_break_whitespace_remover');
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [textInput]);

  // Real-time line break and whitespace removal
  useEffect(() => {
    if (textInput) {
      try {
        const cleanedText = textInput
          .replace(/[\r\n]+/g, ' ') // Replace line breaks with a single space
          .replace(/\s+/g, ' ')     // Replace multiple whitespace with a single space
          .trim();                  // Remove leading/trailing spaces
        setResultOutput(cleanedText);
        setError(null);
      } catch (err) {
        setError('Error processing text. Please check your input.');
        setResultOutput('');
      }
    } else {
      setResultOutput('');
      setError(null);
    }
  }, [textInput]);

  const handleClear = () => {
    setTextInput('');
    setResultOutput('');
    setError(null);
  };

  const getResultsText = () => resultOutput;

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex justify-between items-center mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Line Break & Whitespace Remover</h3>
            <ClearButton onClick={handleClear} disabled={!textInput && !resultOutput && !error} />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label htmlFor="textInput" className="form-label">
                Text Input
              </label>
              <AutoTextarea
                id="textInput"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. Line 1\n\n  Line 2\t  Line 3"
                className="input-field w-full h-64"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <label className="form-label">Cleaned Text</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={getResultsText()}/>
                  <DownloadButton content={resultOutput} fileName="cleaned_text.txt" fileType="text" disabled={!resultOutput} />
                </div>
              </div>
              <AutoTextarea
                id="textOutput"
                value={resultOutput}
                readOnly
                placeholder="e.g. Line 1 Line 2 Line 3"
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
      </div>
    </>
  );
}

export default LineBreakWhiteSpaceRemover;