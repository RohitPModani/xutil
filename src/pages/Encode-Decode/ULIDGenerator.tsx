import { useState } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import api from '../../services/api';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';

interface ULIDResponse {
    ulid?: string;
  }

interface BulkUlidsResponse {
   ulids: string[];
}

function ULIDGenerator() {
  const seo = seoDescriptions.ulidGenerator;
  const [singleUlid, setSingleUlid] = useState('');
  const [bulkUlids, setBulkUlids] = useState<string[]>([]);
  const [ulidInput, setUlidInput] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [count, setCount] = useState(5);
  const [errorSingle, setErrorSingle] = useState<string | null>(null);
  const [errorBulk, setErrorBulk] = useState<string | null>(null);
  const [errorTimestamp, setErrorTimestamp] = useState<string | null>(null);
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);
  const [isLoadingTimestamp, setIsLoadingTimestamp] = useState(false);

  const fetchSingleUlid = async () => {
    setIsLoadingSingle(true);
    try {
      const response = await api.get<string | ULIDResponse>('/ulid/');
      const ulid = typeof response.data === 'string' ? response.data : response.data.ulid;
      if (!ulid) throw new Error('Invalid GUID response');
      setSingleUlid(ulid);
      setErrorSingle(null);
    } catch (err: any) {
      setErrorSingle(err.response?.data?.detail || err.message);
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const fetchBulkUlids = async () => {
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      setErrorBulk('Count must be an integer between 1 and 1000');
      return;
    }
    setIsLoadingBulk(true);
    try {
      const response = await api.get<BulkUlidsResponse>(`/ulid/bulk?count=${count}`);
      setBulkUlids(response.data.ulids);
      setErrorBulk(null);
    } catch (err: any) {
      setErrorBulk(err.response?.data?.detail || err.message);
    } finally {
      setIsLoadingBulk(false);
    }
  };

  const fetchTimestamp = async () => {
    setIsLoadingTimestamp(true);
    try {
        const response = await api.get<{ Timestamp: string }>(`/ulid/timestamp?ULID_str=${ulidInput}`);
        setTimestamp(response.data.Timestamp);        
        setErrorTimestamp(null);
    } catch (err: any) {
      setErrorTimestamp(err.response?.data?.detail || err.message);
    } finally {
      setIsLoadingTimestamp(false);
    }
  };

  const handleClearAll = () => {
    setBulkUlids([]);
    setCount(5);
  }

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={'a ULID'}>{seo.body}</SEODescription>

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
          <ErrorBox message={errorSingle} />
        </SectionCard>

        {/* Bulk ULIDs */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generate Bulk ULIDs</h3>
            <ClearButton onClick={handleClearAll} disabled={bulkUlids.length === 0} />
          </div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center">
              <label className="form-label text-base mr-2">Count (1-1000):</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
                className="input-field w-20"
                disabled={isLoadingBulk}
              />
            </div>
            <div className="flex items-center space-x-2">
              <LoadingButton onClick={fetchBulkUlids} isLoading={isLoadingBulk}>
                Generate
              </LoadingButton>
              <CopyButton text={bulkUlids.join('\n')} copyType='CopyAll'  />
            </div>
          </div>

          <div className="result-box min-h-[100px] max-h-96 overflow-y-auto scrollbox">
            {isLoadingBulk ? (
              <p className="text-muted">Loading ULIDs...</p>
            ) : bulkUlids.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bulkUlids.map((ulid, index) => (
                  <div
                    key={index}
                    className="inner-result"
                  >
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

          <ErrorBox message={errorBulk} />
        </SectionCard>

        {/* ULID Timestamp */}
      <SectionCard className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Get Timestamp from ULID</h3>
      <div className="flex gap-4 mb-4">
          <input
          type="text"
          placeholder="Enter ULID"
          value={ulidInput}
          onChange={(e) => {
              setUlidInput(e.target.value);
              setTimestamp(null);          // clear result
              setErrorTimestamp(null); 
          }}
          className="input-field w-full"
          />
          <LoadingButton onClick={fetchTimestamp} isLoading={isLoadingTimestamp}>
          Fetch
          </LoadingButton>
      </div>

      {timestamp && (
          <div className="result-box mt-4">
            <div className="inner-result">
              <span className="truncate">DateTime: {timestamp}</span>
              <CopyButton text={new Date(timestamp).toLocaleString()} />
            </div>
          </div>
      )}

      <ErrorBox message={errorTimestamp} />
      </SectionCard>
      </div>
    </>
  );
}

export default ULIDGenerator;