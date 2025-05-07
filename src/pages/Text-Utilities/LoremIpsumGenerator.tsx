import { useEffect, useState } from 'react';
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
import { updateToolUsage } from '../../utils/toolUsage';

function LoremIpsumGenerator() {
  const seo = seoDescriptions.loremIpsum;

  useEffect(() => {
    updateToolUsage('lorem');
  }, []);

  const [type, setType] = useState('paragraph');
  const [count, setCount] = useState('5');
  const [format, setFormat] = useState('text');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const types = [
    { value: 'paragraph', label: 'Paragraph (1-20)' },
    { value: 'sentence', label: 'Sentence (1-50)' },
    { value: 'word', label: 'Word (1-100)' },
  ];

  const formats = [
    { value: 'text', label: 'Text' },
    { value: 'html', label: 'HTML' },
  ];

  const handleGenerate = async () => {
    setError(null);
    setResult(null);

    if (!count) {
      setError('Please enter a count.');
      return;
    }

    const countNum = parseInt(count);

    if (isNaN(countNum) || countNum < 1) {
      setError('Please enter a valid positive number.');
      return;
    }

    if (type === 'paragraph' && countNum > 20) {
      setError('Paragraph count must be between 1 and 20.');
      return;
    }
    if (type === 'sentence' && countNum > 50) {
      setError('Sentence count must be between 1 and 50.');
      return;
    }
    if (type === 'word' && countNum > 100) {
      setError('Word count must be between 1 and 100.');
      return;
    }
    setIsLoading(true);

    try {
      const res = await api.post('/lorem-ipsum/generate', {
        type: type,
        count: countNum,
        format: format,
      });

      if (res.data && res.data.content) {
        setResult(res.data.content);
      } else {
        setError('No result returned from the server.');
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Generation failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setType('paragraph');
    setCount('5');
    setFormat('text');
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
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Lorem Ipsum Generator</h3>
            <ClearButton onClick={handleClear} disabled={!count && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                >
                  {types.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="form-label">
                  Count {type === 'paragraph' ? '(1-20)' : type === 'sentence' ? '(1-50)' : '(1-100)'}
                </label>
                <input
                  type="number"
                  className="input-field w-full"
                  placeholder="Enter count"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  disabled={isLoading}
                  min="1"
                  max={type === 'paragraph' ? '20' : type === 'sentence' ? '50' : '100'}
                />
              </div>
              <div className="flex-1">
                <label className="form-label">Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                >
                  {formats.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
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
                <label className="form-label text-base">Generated Text</label>
                {result && (
                  <CopyButton text={result}/>
                )}
              </div>
              {result && (
                <div className="scrollbox mt-2">
                  <div className="inner-result font-mono whitespace-pre-wrap">
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

export default LoremIpsumGenerator;