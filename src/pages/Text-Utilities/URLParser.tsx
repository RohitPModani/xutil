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

function URLParser() {
  const seo = seoDescriptions.urlParser;
  const [urlInput, setUrlInput] = useState<string>('');
  const [result, setResult] = useState<{
    href: string;
    origin: string;
    protocol: string;
    username: string;
    password: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    searchParams: Record<string, string>;
    hash: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');

  useEffect(() => {
    updateToolUsage('url_parser');
  }, []);

  useEffect(() => {
    if (urlInput) {
      try {
        const url = new URL(urlInput);
        const searchParams: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          searchParams[key] = value;
        });

        const parsedResult = {
          href: url.href,
          origin: url.origin,
          protocol: url.protocol,
          username: url.username,
          password: url.password,
          host: url.host,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          search: url.search,
          searchParams,
          hash: url.hash
        };

        setResult(parsedResult);
        setJsonOutput(JSON.stringify(parsedResult, null, 2));
        setError(null);
      } catch (err) {
        setError('Invalid URL. Please enter a valid URL including protocol (http/https).');
        setResult(null);
        setJsonOutput('');
      }
    } else {
      setResult(null);
      setJsonOutput('');
      setError(null);
    }
  }, [urlInput]);

  const handleClear = () => {
    setUrlInput('');
    setResult(null);
    setJsonOutput('');
    setError(null);
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
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">URL Parser</h3>
            <ClearButton onClick={handleClear} disabled={!urlInput && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">URL</label>
                <AutoTextarea
                  id="urlInput"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="e.g. https://example.com:8080/path/to/page?param1=value1&param2=value2#section"
                  className="input-field w-full h-24"
                />
              </div>
            </div>

            <div className="result-box mt-1">
              <div className="flex justify-between items-center">
                <label className="form-label text-base">Parsed URL (JSON)</label>
                {result && <CopyButton text={jsonOutput}/>}
              </div>
              {result && (
                <div className="scrollbox inner-result mt-2">
                  <pre>
                    {jsonOutput}
                  </pre>
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

export default URLParser;