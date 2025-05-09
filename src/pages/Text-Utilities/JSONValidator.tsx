import { useState, useEffect } from 'react';
import BackToHome from '../../components/BackToHome';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import DownloadButton from '../../components/DownloadButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import ClearButton from '../../components/ClearButton';
import { updateToolUsage } from '../../utils/toolUsage';
import seoDescriptions from '../../data/seoDescriptions';

const JSONValidator: React.FC = () => {
  const seo = seoDescriptions.jsonValidator;
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    updateToolUsage('json_validator');
  }, []);

  const handleValidation = () => {
    setIsLoading(true);
    setError('');
    setJsonOutput('');
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonOutput(formatted);
      setIsValid(true);
    } catch (err: any) {
      setIsValid(false);
      setError(`Invalid JSON: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setJsonOutput('');
    setIsValid(null);
    setError('');
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <BackToHome />
        </div>

        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={seo.title}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">JSON Validator & Formatter</h3>
            <ClearButton onClick={handleClear} disabled={!jsonInput} />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Input Text Area */}
            <div className="flex-1 space-y-4">
              <label htmlFor="jsonInput" className="form-label">Input JSON:</label>
              <AutoTextarea
                id="jsonInput"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON here..."
                className="input-field w-full h-64"
              />
              <LoadingButton onClick={handleValidation} isLoading={isLoading} disabled={!jsonInput}>
                Validate & Format
              </LoadingButton>
            </div>

            {/* Output Text Area */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor="jsonOutput" className="form-label">Formatted JSON:</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={jsonOutput} />
                  <DownloadButton
                    content={jsonOutput}
                    fileName="formatted.json"
                    fileType="json"
                    disabled={!jsonOutput}
                  />
                </div>
              </div>
              <AutoTextarea
                id="jsonOutput"
                value={jsonOutput}
                readOnly
                placeholder="Formatted JSON will appear here..."
                className="input-field w-full h-64"
              />
            </div>
          </div>

            {isValid !== null && (
            <div className="space-y-2 mt-4 ">
              {isValid ? (
                <div className="text-green-500 text-base font-semibold">Valid JSON</div>
              ) : (
                <div className="text-red-500 text-base font-semibold">{error}</div>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
};

export default JSONValidator;