import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';

function GuidGenerator() {
  const seo = seoDescriptions.guidGenerator;
  const [singleGuid, setSingleGuid] = useState('');
  const [bulkGuids, setBulkGuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [errorSingle, setErrorSingle] = useState('');
  const [errorBulk, setErrorBulk] = useState('');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);

  useEffect(() => {
    updateToolUsage('guid');
    // Generate initial single GUID and bulk GUIDs on mount
    fetchSingleGuid();
    fetchBulkGuids();
  }, []);

  // Auto-generate bulk GUIDs when count changes
  useEffect(() => {
    fetchBulkGuids();
  }, [count]);

  const fetchSingleGuid = () => {
    setIsLoadingSingle(true);
    try {
      const guid = uuidv4();
      setSingleGuid(guid);
      setErrorSingle('');
    } catch (err) {
      setErrorSingle('Failed to generate GUID');
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const fetchBulkGuids = () => {
    if (bulkGuids.length > 0) {
      setBulkGuids([]);
    }
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      setErrorBulk('Count must be an integer between 1 and 1000');
      return;
    }
    setIsLoadingBulk(true);
    try {
      const guids = Array.from({ length: count }, () => uuidv4());
      setBulkGuids(guids);
      setErrorBulk('');
    } catch (err) {
      setErrorBulk('Failed to generate bulk GUIDs');
    } finally {
      setIsLoadingBulk(false);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      const numValue = value === '' ? 0 : Number(value);
      setCount(Math.max(0, Math.min(1000, numValue))); // Clamp between 0 and 1000
    }
  };

  const incrementCount = () => {
    setCount((prev) => Math.min(prev + 1, 1000));
  };

  const decrementCount = () => {
    setCount((prev) => Math.max(prev - 1, 1));
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Generate Single GUID</h3>
          <LoadingButton onClick={fetchSingleGuid} isLoading={isLoadingSingle}>
            Generate
          </LoadingButton>
          {singleGuid && (
            <div className="result-box mt-4">
              <div className="inner-result">
                <span className="truncate">{singleGuid}</span>
                <CopyButton text={singleGuid} />
              </div>
            </div>
          )}
          <ErrorBox message={errorSingle} />
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generate Bulk GUIDs</h3>
              <CopyButton text={bulkGuids.join('\n')} copyType="CopyAll" />
          </div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center">
              <label className="form-label text-base mr-2">Count (1-1000):</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={count}
                  onChange={handleCountChange}
                  className="input-field w-20 text-right pr-2"
                  disabled={isLoadingBulk}
                  placeholder="1-1000"
                  aria-describedby={errorBulk ? 'bulk-error' : undefined}
                />
                <div className="flex flex-col ml-1">
                  <button
                    onClick={incrementCount}
                    disabled={isLoadingBulk || count >= 1000}
                    className="toggle-count"
                    aria-label='Increment count'
                  >
                    +
                  </button>
                  <button
                    onClick={decrementCount}
                    disabled={isLoadingBulk || count <= 1}
                    className="toggle-count"
                    aria-label='Decrement count'
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="result-box min-h-[100px] max-h-96 overflow-y-auto scrollbox">
            {isLoadingBulk ? (
              <p className="text-muted">Loading GUIDs...</p>
            ) : bulkGuids.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bulkGuids.map((guid, index) => (
                  <div key={index} className="inner-result">
                    <span className="font-mono text-zinc-800 dark:text-white truncate">
                      {guid}
                    </span>
                    <CopyButton text={guid} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No GUIDs generated yet.</p>
            )}
          </div>

          <ErrorBox message={errorBulk} id={errorBulk ? 'bulk-error' : undefined} />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default GuidGenerator;