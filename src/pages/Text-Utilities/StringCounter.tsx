import { useEffect, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import ErrorBox from '../../components/ErrorBox';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { updateToolUsage } from '../../utils/toolUsage';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';

function StringCounter() {
  const seo = seoDescriptions.stringCounter;
  const [textInput, setTextInput] = useState<string>('');
  const [result, setResult] = useState<{
    charCount: number;
    charCountNoSpaces: number;
    wordCount: number;
    lineCount: number;
    uniqueWordCount: number;
    sentenceCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage('string_counter');
  }, []);

  // Real-time counting on every key press
  useEffect(() => {
    if (textInput) {
      try {
        const charCount = textInput.length;
        const charCountNoSpaces = textInput.replace(/\s/g, '').length;
        const words = textInput.split(/\s+/).filter(word => word.trim() !== '');
        const wordCount = words.length;
        const uniqueWordCount = [...new Set(words)].length;
        const lines = textInput.split('\n').filter(line => line.trim() !== '');
        const lineCount = lines.length;
        const sentences = textInput
          .split(/[.!?]+(?=\s|$)/)
          .filter(sentence => sentence.trim() !== '');
        const sentenceCount = sentences.length;

        setResult({
          charCount,
          charCountNoSpaces,
          wordCount,
          lineCount,
          uniqueWordCount,
          sentenceCount,
        });
        setError(null);
      } catch (err) {
        setError('Error processing text. Please check your input.');
        setResult(null);
      }
    } else {
      setResult(null);
      setError(null);
    }
  }, [textInput]);

  const handleClear = () => {
    setTextInput('');
    setResult(null);
    setError(null);
  };

  const getResultsText = () => {
    if (!result) return '';
    return `
Characters (with spaces): ${result.charCount}
Characters (no spaces): ${result.charCountNoSpaces}
Words: ${result.wordCount}
Lines: ${result.lineCount}
Unique Words: ${result.uniqueWordCount}
Sentences: ${result.sentenceCount}
    `.trim();
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex justify-between items-center mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-3xl font-bold mb-6">{seo.title}</h2>

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">String, Word, Character, Line & Sentence Counter</h3>
            <ClearButton onClick={handleClear} disabled={!textInput && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">Text</label>
                <AutoTextarea
                    id="textInput"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="e.g. Hello world\nHello again\nWorld"
                    className="input-field w-full h-64"
                />
              </div>
            </div>

            <div className="result-box mt-1">
              <div className="flex justify-between items-center">
                <label className="form-label text-base">Count Results</label>
                {result && <CopyButton text={getResultsText()} copyType="CopyAll" />}
              </div>
              {result && (
                <div className="scrollbox mt-2">
                  <div className="flex flex-col gap-3">
                    {Object.entries(result).map(([key, val]) => {
                      const displayLabel = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace('Char', 'Characters')
                        .replace('No Spaces', '(no spaces)')
                        .replace('Word', 'Words')
                        .replace('Unique', 'Unique ')
                        .trim();
                      return (
                        <div key={key} className="inner-result">
                          <span className="font-mono text-zinc-800 dark:text-white">
                            {displayLabel}: {val}
                          </span>
                          <CopyButton text={`${displayLabel}: ${val}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div aria-live="polite">
                <ErrorBox message={error} />
              </div>
            )}
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default StringCounter;