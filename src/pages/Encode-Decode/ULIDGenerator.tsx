import { useEffect, useState } from 'react';
import { ulid, decodeTime } from 'ulid';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';

function ULIDGenerator() {
  const seo = seoDescriptions.ulidGenerator;
  const [singleUlid, setSingleUlid] = useState('');
  const [bulkUlids, setBulkUlids] = useState<string[]>([]);
  const [ulidInput, setUlidInput] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [count, setCount] = useState(5);
  const [errorSingle, setErrorSingle] = useState('');
  const [errorBulk, setErrorBulk] = useState('');
  const [errorTimestamp, setErrorTimestamp] = useState('');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);
  const [isLoadingTimestamp, setIsLoadingTimestamp] = useState(false);

  useEffect(() => {
    updateToolUsage('ulid');
    // Generate initial single ULID and bulk ULIDs on mount
    fetchSingleUlid();
    fetchBulkUlids();
  }, []);

  // Auto-generate bulk ULIDs when count changes
  useEffect(() => {
    fetchBulkUlids();
  }, [count]);

  const fetchSingleUlid = () => {
    setIsLoadingSingle(true);
    try {
      const ulidStr = ulid();
      setSingleUlid(ulidStr);
      setErrorSingle('');
    } catch (err) {
      setErrorSingle('Failed to generate ULID');
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const fetchBulkUlids = () => {
    if (bulkUlids.length > 0) {
      setBulkUlids([]);
    }
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      setErrorBulk('Count must be an integer between 1 and 1000');
      return;
    }
    setIsLoadingBulk(true);
    try {
      const ulids = Array.from({ length: count }, () => ulid());
      setBulkUlids(ulids);
      setErrorBulk('');
    } catch (err) {
      setErrorBulk('Failed to generate bulk ULIDs');
    } finally {
      setIsLoadingBulk(false);
    }
  };

  const fetchTimestamp = (input: string) => {
    setIsLoadingTimestamp(true);
    try {
      if (!input || input.length !== 26) {
        throw new Error('Invalid ULID: Must be 26 characters long');
      }
      const timestampMs = decodeTime(input);
      const date = new Date(timestampMs);
      setTimestamp(date.toISOString());
      setErrorTimestamp('');
    } catch (err) {
      setErrorTimestamp(err instanceof Error ? err.message : 'Failed to extract timestamp');
    } finally {
      setIsLoadingTimestamp(false);
    }
  };

  const handleClearTimestamp = () => {
    setUlidInput('');
    setTimestamp(null);
    setErrorTimestamp('');
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

        {/* Single ULID */}
        <SectionCard className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Generate Single ULID</h3>
          <LoadingButton onClick={fetchSingleUlid} isLoading={isLoadingSingle}>
            Generate
          </LoadingButton>
          {singleUlid && (
            <div className="result-box mt-4">
              <div className="inner-result">
                <span className="truncate">{singleUlid}</span>
                <CopyButton text={singleUlid} />
              </div>
            </div>
          )}
          <ErrorBox message={errorSingle} id={errorSingle ? 'single-error' : undefined} />
        </SectionCard>

        {/* Bulk ULIDs */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generate Bulk ULIDs</h3>
          </div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center">
              <label className="form-label text-base mr-2" htmlFor="bulk-count">
                Count (1-1000):
              </label>
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
                    aria-label="Increment count"
                  >
                    +
                  </button>
                  <button
                    onClick={decrementCount}
                    disabled={isLoadingBulk || count <= 1}
                    className="toggle-count"
                    aria-label="Decrement count"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CopyButton text={bulkUlids.join('\n')} copyType="CopyAll" />
            </div>
          </div>

          <div className="result-box min-h-[100px] max-h-96 overflow-y-auto scrollbox">
            {isLoadingBulk ? (
              <p className="text-muted">Loading ULIDs...</p>
            ) : bulkUlids.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bulkUlids.map((ulid, index) => (
                  <div key={index} className="inner-result">
                    <span className="font-mono text-zinc-800 dark:text-white truncate">
                      {ulid}
                    </span>
                    <CopyButton text={ulid} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No ULIDs generated yet.</p>
            )}
          </div>

          <ErrorBox message={errorBulk} id={errorBulk ? 'bulk-error' : undefined} />
        </SectionCard>

        {/* ULID Timestamp */}
        <SectionCard className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Get Timestamp from ULID</h3>
            <ClearButton onClick={handleClearTimestamp} disabled={!ulidInput} />
          </div>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              id="ulid-input"
              placeholder="Enter ULID"
              value={ulidInput}
              onChange={(e) => {
                const newValue = e.target.value;
                setUlidInput(newValue);
                setTimestamp(null); // Clear result
                setErrorTimestamp('');
                fetchTimestamp(newValue);
              }}
              className="input-field w-full"
              disabled={isLoadingTimestamp}
              aria-describedby={errorTimestamp ? 'timestamp-error' : undefined}
            />
          </div>

          {timestamp && (
            <div className="result-box mt-4">
              <div className="inner-result">
                <span className="truncate">DateTime: {timestamp}</span>
                <CopyButton text={new Date(timestamp).toLocaleString()} />
              </div>
            </div>
          )}

          <ErrorBox message={errorTimestamp} id={errorTimestamp ? 'timestamp-error' : undefined} />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default ULIDGenerator;