import { useState } from 'react';
import { useClipboard } from '../../hooks/useClipboard';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import api from '../../services/api';
import { CircleCheckBig, Copy } from 'lucide-react';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';

interface GuidResponse {
  guid?: string;
}

interface BulkGuidsResponse {
  guids: string[];
}

function GuidGenerator() {
  const seo = seoDescriptions.guidGenerator;
  const [singleGuid, setSingleGuid] = useState('');
  const [bulkGuids, setBulkGuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [errorSingle, setErrorSingle] = useState<string | null>(null);
  const [errorBulk, setErrorBulk] = useState<string | null>(null);
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);
  const { copy, copiedIndex, copied } = useClipboard();

  const fetchSingleGuid = async () => {
    setIsLoadingSingle(true);
    try {
      const response = await api.get<string | GuidResponse>('/guid/');
      const guid = typeof response.data === 'string' ? response.data : response.data.guid;
      if (!guid) throw new Error('Invalid GUID response');
      setSingleGuid(guid);
      setErrorSingle(null);
    } catch (err: any) {
      setErrorSingle(err.response?.data?.detail || err.message);
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const fetchBulkGuids = async () => {
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      setErrorBulk('Count must be an integer between 1 and 1000');
      return;
    }
    setIsLoadingBulk(true);
    try {
      const response = await api.get<BulkGuidsResponse>(`/guid/bulk?count=${count}`);
      setBulkGuids(response.data.guids);
      setErrorBulk(null);
    } catch (err: any) {
      setErrorBulk(err.response?.data?.detail || err.message);
    } finally {
      setIsLoadingBulk(false);
    }
  };

  const handleClearAll = () => {
    setBulkGuids([]);
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
        <SEODescription title={'a GUID'}>{seo.body}</SEODescription>

        <SectionCard className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Generate Single GUID</h3>
          <LoadingButton onClick={fetchSingleGuid} isLoading={isLoadingSingle}>
            Generate
          </LoadingButton>
          {singleGuid && (
            <div className="result-box mt-4">
              <div className="flex items-center justify-between">
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
              <ClearButton onClick={handleClearAll} disabled = {bulkGuids.length === 0}/>
          </div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center">
              <label className="form-label mr-2">Count (1-1000):</label>
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
              <LoadingButton onClick={fetchBulkGuids} isLoading={isLoadingBulk}>
                Generate
              </LoadingButton>
              <CopyButton text={bulkGuids.join('\n')} copyType='CopyAll'  />
            </div>
          </div>

          <div className="result-box min-h-[100px]">
            {isLoadingBulk ? (
            <p className="text-muted">Loading GUIDs...</p>
            ) : bulkGuids.length > 0 ? (
            <div className="scrollbox space-y-2">
              {bulkGuids.map((guid, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded text-zinc-800 dark:text-zinc-100"
              >
                <span className="truncate">{guid}</span>
                <button
                  onClick={() => copy(guid, { index })}
                  disabled={copied}
                  className="ml-2 p-1 text-zinc-600 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none disabled:cursor-default"
                  aria-label="Copy GUID"
                >
                {copiedIndex === index ? (
                  <CircleCheckBig className="w-5 h-5 text-zinc-800" />
                ) : (
                  <Copy className="w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors duration-100" />
                )}
                </button>
              </div>
              ))}
            </div>
          ) : (
          <p className="text-muted">No GUIDs generated yet.</p>
          )}
          </div>

          <ErrorBox message={errorBulk} />
        </SectionCard>
      </div>
    </>
  );
}

export default GuidGenerator;
