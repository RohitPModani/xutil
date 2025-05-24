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

// Utility functions for GUID generation
const generateGuidV7 = (): string => {
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');
  const version = '7';
  const variant = '8';
  const randomPart = crypto.getRandomValues(new Uint8Array(8));
  randomPart[0] = (randomPart[0] & 0x3f) | 0x80;
  const randomHex = Array.from(randomPart)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return constructUuidV7(timestampHex, version, variant, randomHex);
};

const constructUuidV7 = (
  timestampHex: string,
  version: string,
  variant: string,
  randomHex: string
): string => {
  return (
    `${timestampHex.substring(0, 8)}-${timestampHex.substring(8, 12)}-${version}${randomHex.substring(
      1,
      4
    )}-${variant}${randomHex.substring(5, 8)}-${randomHex.substring(8, 16)}`
  );
};

const GUID_FORMATS = [
  { value: 'v4', label: 'Version 4 (Random)' },
  { value: 'v7', label: 'Version 7 (Timestamp)' },
] as const;

type GuidVersion = 'v4' | 'v7';

function GuidGenerator() {
  const seo = seoDescriptions.guidGenerator;
  const [singleGuid, setSingleGuid] = useState('');
  const [bulkGuids, setBulkGuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [errorSingle, setErrorSingle] = useState('');
  const [errorBulk, setErrorBulk] = useState('');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);
  const [singleGuidFormat, setSingleGuidFormat] = useState<GuidVersion>('v4');
  const [bulkGuidFormat, setBulkGuidFormat] = useState<GuidVersion>('v4');

  useEffect(() => {
    updateToolUsage('guid');
    generateGuids('single', singleGuidFormat);
    generateGuids('bulk', bulkGuidFormat);
  }, []);

  useEffect(() => {
    generateGuids('bulk', bulkGuidFormat);
  }, [bulkGuidFormat, count]);

  const generateGuids = (type: 'single' | 'bulk', format: GuidVersion) => {
    const isSingle = type === 'single';
    const setLoading = isSingle ? setIsLoadingSingle : setIsLoadingBulk;
    const setError = isSingle ? setErrorSingle : setErrorBulk;

    if (!isSingle && (!Number.isInteger(count) || count < 1 || count > 1000)) {
      setError('Count must be an integer between 1 and 1000');
      return;
    }

    setLoading(true);
    try {
      if (isSingle) {
        const guid = format === 'v4' ? uuidv4() : generateGuidV7();
        setSingleGuid(guid);
      } else {
        const guids = Array.from(
          { length: count },
          () => (format === 'v4' ? uuidv4() : generateGuidV7())
        );
        setBulkGuids(guids);
      }
      setError('');
    } catch (err) {
      setError(`Failed to generate ${isSingle ? 'GUID' : 'bulk GUIDs'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      const numValue = value === '' ? 0 : Number(value);
      setCount(Math.max(0, Math.min(1000, numValue)));
    }
  };

  const incrementCount = () => setCount((prev) => Math.min(prev + 1, 1000));
  const decrementCount = () => setCount((prev) => Math.max(prev - 1, 1));

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
          <div className="flex items-center justify-start mb-4">
            <label htmlFor="single-guid-format" className="sr-only">
              GUID Format
            </label>
            <select
              id="single-guid-format"
              className="input-field w-auto form-select mr-4"
              value={singleGuidFormat}
              onChange={(e) => {
                const format = e.target.value as GuidVersion;
                setSingleGuidFormat(format);
                generateGuids('single', format);
              }}
            >
              {GUID_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            <LoadingButton onClick={() => generateGuids('single', singleGuidFormat)} isLoading={isLoadingSingle}>
              Generate
            </LoadingButton>
          </div>
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
            <div className="flex items-center justify-start sm:flex-row gap-4 flex-col">
              <div className="flex items-center">
                <label htmlFor="bulk-guid-format" className="sr-only">
                  GUID Format
                </label>
                <select
                  id="bulk-guid-format"
                  className="input-field w-auto form-select sm:mr-4 mr-10"
                  value={bulkGuidFormat}
                  onChange={(e) => {
                    const format = e.target.value as GuidVersion;
                    setBulkGuidFormat(format);
                  }}
                >
                  {GUID_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label htmlFor="guid-count" className="form-label text-base mr-2">
                  Count (1-1000):
                </label>
                <div className="flex items-center">
                  <input
                    id="guid-count"
                    type="text"
                    value={count}
                    onChange={handleCountChange}
                    className="input-field w-20 text-right pr-2"
                    disabled={isLoadingBulk}
                    placeholder='1-1000'
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    aria-label="Number of GUIDs to generate"
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
            </div>
          </div>

          <div className="result-box min-h-[100px] max-h-96 overflow-y-auto scrollbox">
            {isLoadingBulk ? (
              <p className="text-muted">Generating {count} GUIDs...</p>
            ) : bulkGuids.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bulkGuids.map((guid, index) => (
                  <div key={index} className="inner-result">
                    <span className="font-mono text-zinc-800 dark:text-white truncate">{guid}</span>
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