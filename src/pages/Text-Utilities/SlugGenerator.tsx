import { useState } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import LoadingButton from '../../components/LoadingButton';
import ErrorBox from '../../components/ErrorBox';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import api from '../../services/api';
import seoDescriptions from '../../data/seoDescriptions';

function SlugGenerator() {
  const seo = seoDescriptions.slug || { 
    title: 'Slug Generator', 
    body: 'Convert text into URL-friendly slugs with customizable separators and case.'
  };
  const [text, setText] = useState('');
  const [separator, setSeparator] = useState('-');
  const [caseType, setCaseType] = useState('lowercase');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const separators = [
    { value: '-', label: 'Hyphen (-)' },
    { value: '_', label: 'Underscore (_)' },
    { value: '.', label: 'Dot (.)' },
  ];

  const cases = [
    { value: 'lowercase', label: 'Lowercase' },
    { value: 'uppercase', label: 'Uppercase' },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter text to convert.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/slug/generate', {
        text: text,
        separator: separator,
        case: caseType,
      });

      if (res.data && res.data.slug) {
        setResult(res.data.slug);
      } else {
        setError('No slug returned from the server.');
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Slug generation failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setSeparator('-');
    setCaseType('lowercase');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex justify-between items-center mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">{seo.title}</h2>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Slug Generator</h3>
            <ClearButton onClick={handleClear} disabled={!text && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">Text</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Enter text (e.g., Hello World! This is a Test)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <label className="form-label">Separator</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                >
                  {separators.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="form-label">Case</label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                >
                  {cases.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-2">
              <LoadingButton onClick={handleGenerate} isLoading={isLoading}>
                Generate
              </LoadingButton>
            </div>

            <div className="result-box mt-1">
              <div className="flex justify-between items-center">
                <label className="form-label text-base">Generated Slug</label>
                {result && (
                  <CopyButton text={result} />
                )}
              </div>
              {result && (
                <div className="scrollbox mt-2">
                  <div className="font-mono inner-result whitespace-pre-wrap">
                    {result}
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
      </div>
    </>
  );
}

export default SlugGenerator;