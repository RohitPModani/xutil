import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ErrorBox from '../../components/ErrorBox';
import ClearButton from '../../components/ClearButton';
import CopyButton from '../../components/CopyButton';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import { PageSEO } from '../../components/PageSEO';
import SEODescription from '../../components/SEODescription';
import seoDescriptions from '../../data/seoDescriptions';
import { updateToolUsage } from '../../utils/toolUsage';

function UnixUtcConverter() {
  const seo = seoDescriptions.unixUtc;
  const [unixInput, setUnixInput] = useState('');
  const [utcInput, setUtcInput] = useState('');
  const [unixToUtcResult, setUnixToUtcResult] = useState<string>('');
  const [utcToUnixResult, setUtcToUnixResult] = useState<string>('');
  const [errorUnix, setUnixError] = useState<string | null>(null);
  const [errorUTC, setUtcError] = useState<string | null>(null);

  const getDefaultValues = () => {
    const now = DateTime.utc();
    const utcStr = now.toFormat('yyyy-MM-dd HH:mm:ss');
    const unixStr = now.toUnixInteger().toString();
    return { utcStr, unixStr };
  };

  useEffect(() => {
    const { utcStr, unixStr } = getDefaultValues();
    setUnixInput(unixStr);
    setUtcInput(utcStr);
    setUnixToUtcResult(utcStr);
    setUtcToUnixResult(unixStr);
  }, []);

  useEffect(() => {
    updateToolUsage('unix_utc');
  }, []);

  const isValidUnix = (input_unix: string) => /^\d+$/.test(input_unix.trim());

  const isValidUtc = (input_utc: string) =>
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input_utc.trim());

  const convertUnixToUtc = (input: string): string => {
    if (!input.trim()) {
      setUnixError('Please enter a Unix timestamp.');
      return '';
    }
    if (!isValidUnix(input)) {
      setUnixError('Invalid Unix timestamp. Must be a positive integer.');
      return '';
    }
    try {
      const timestamp = parseInt(input, 10);
      const dt = DateTime.fromSeconds(timestamp, { zone: 'utc' });
      if (!dt.isValid) {
        setUnixError('Invalid Unix timestamp.');
        return '';
      }
      setUnixError(null);
      return dt.toFormat('yyyy-MM-dd HH:mm:ss');
    } catch (err) {
      setUnixError('Conversion failed.');
      return '';
    }
  };

  const convertUtcToUnix = (input: string): string => {
    if (!input.trim()) {
      setUtcError('Please enter a UTC datetime.');
      return '';
    }
    if (!isValidUtc(input)) {
      setUtcError('Invalid UTC datetime. Use format YYYY-MM-DD HH:mm:ss');
      return '';
    }
    try {
      const dt = DateTime.fromFormat(input, 'yyyy-MM-dd HH:mm:ss', { zone: 'utc' });
      if (!dt.isValid) {
        setUtcError('Invalid UTC datetime.');
        return '';
      }
      setUtcError(null);
      return dt.toUnixInteger().toString();
    } catch (err) {
      setUtcError('Conversion failed.');
      return '';
    }
  };

  useEffect(() => {
    const result = convertUnixToUtc(unixInput);
    setUnixToUtcResult(result);
  }, [unixInput]);

  useEffect(() => {
    const result = convertUtcToUnix(utcInput);
    setUtcToUnixResult(result);
  }, [utcInput]);

  const clearUnixToUtc = () => {
    const { unixStr, utcStr } = getDefaultValues();
    setUnixInput(unixStr);
    setUnixToUtcResult(utcStr);
    setUnixError(null);
  };

  const clearUtcToUnix = () => {
    const { utcStr, unixStr } = getDefaultValues();
    setUtcInput(utcStr);
    setUtcToUnixResult(unixStr);
    setUtcError(null);
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={seo.title}>{seo.body}</SEODescription>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Unix ➔ UTC Conversion</h3>
            <ClearButton
              onClick={clearUnixToUtc}
              disabled={!unixInput && !unixToUtcResult && !errorUnix}
              aria-label="Clear Unix to UTC input and result"
            />
          </div>
          <div className="flex-1 space-y-4">
            <label htmlFor="unix_input" className="form-label">
              Unix Timestamp:
            </label>
            <input
              id="unix_input"
              type="text"
              maxLength={100}
              value={unixInput}
              onChange={(e) => setUnixInput(e.target.value)}
              className="input-field"
              placeholder="e.g., 1714583820"
              aria-label="Input Unix timestamp"
            />
          </div>
          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">UTC Datetime</label>
              <CopyButton text={unixToUtcResult} aria-label="Copy UTC datetime result" />
            </div>
            {unixToUtcResult && (
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output break-all">{unixToUtcResult}</div>
                </div>
              </div>
            )}
          </div>
          <ErrorBox message={errorUnix} aria-live="polite" />
        </SectionCard>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">UTC ➔ Unix Conversion</h3>
            <ClearButton
              onClick={clearUtcToUnix}
              disabled={!utcInput && !utcToUnixResult && !errorUTC}
              aria-label="Clear UTC to Unix input and result"
            />
          </div>
          <div className="flex-1 space-y-4">
            <label htmlFor="utc_input" className="form-label">
              UTC Datetime:
            </label>
            <input
              id="utc_input"
              type="text"
              maxLength={19}
              value={utcInput}
              onChange={(e) => setUtcInput(e.target.value)}
              className="input-field"
              placeholder="e.g., 2025-05-01 13:57:00"
              aria-label="Input UTC datetime"
            />
          </div>
          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Unix Timestamp</label>
              <CopyButton text={utcToUnixResult} aria-label="Copy Unix timestamp result" />
            </div>
            {utcToUnixResult && (
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output break-all">{utcToUnixResult}</div>
                </div>
              </div>
            )}
          </div>
          <ErrorBox message={errorUTC} aria-live="polite" />
        </SectionCard>
      </div>
    </>
  );
}

export default UnixUtcConverter;