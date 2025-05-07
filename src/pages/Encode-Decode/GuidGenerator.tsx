import { useEffect, useState } from 'react';
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
import { updateToolUsage } from '../../utils/toolUsage';

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

  useEffect(() => {
    updateToolUsage('guid');
  }, []);

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
    if (bulkGuids.length > 0) {
      setBulkGuids([]);
    }
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

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setCount(Number(value));
    }
  };

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
            <ClearButton onClick={handleClearAll} disabled = {bulkGuids.length === 0}/>
          </div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center">
              <label className="form-label text-base mr-2">Count (1-1000):</label>
              <input
                type="text"
                value={count}
                onChange={handleLengthChange}
                className="input-field w-20"
                disabled={isLoadingBulk}
                placeholder="Enter Count (1 - 1000)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <LoadingButton onClick={fetchBulkGuids} isLoading={isLoadingBulk}>
                Generate
              </LoadingButton>
              <CopyButton text={bulkGuids.join('\n')} copyType='CopyAll'  />
            </div>
          </div>

          <div className="result-box min-h-[100px] max-h-96 overflow-y-auto scrollbox">
            {isLoadingBulk ? (
              <p className="text-muted">Loading GUIDs...</p>
            ) : bulkGuids.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bulkGuids.map((guid, index) => (
                  <div
                    key={index}
                    className="inner-result"
                  >
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

          <ErrorBox message={errorBulk} />
        </SectionCard>
      </div>
    </>
  );
}

export default GuidGenerator;
