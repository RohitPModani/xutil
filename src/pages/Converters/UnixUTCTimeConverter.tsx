import { useEffect, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import ClearButton from '../../components/ClearButton';
import CopyButton from '../../components/CopyButton';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import { PageSEO } from '../../components/PageSEO';
import SEODescription from '../../components/SEODescription';
import api from '../../services/api';
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
    const [loadingUnixToUtc, setLoadingUnixToUtc] = useState(false);
    const [loadingUtcToUnix, setLoadingUtcToUnix] = useState(false);

    useEffect(() => {
      updateToolUsage('unix_utc');
    }, []);

    // Validate unix timestamp input (digits only)
    const isValidUnix = (input_unix: string) => /^\d+$/.test(input_unix.trim());

    // Validate UTC datetime input format YYYY-MM-DD HH:MM:SS
    const isValidUtc = (input_utc: string) =>
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input_utc.trim());

    const convertUnixToUtc = async () => {
        setUnixError(null);
        if (!isValidUnix(unixInput)) {
          setUnixError('Invalid Unix timestamp. Must be a positive integer.');
          return;
        }
        setLoadingUnixToUtc(true);
        try {
          const response = await api.post('/unix-utc/unix-to-utc', {
            timestamp: parseInt(unixInput, 10), // correct property name
          });
          setUnixToUtcResult(response.data.datetime_utc); // update correct state
        } catch (err: any) {
          let errorMessage = err.response?.data?.detail || err.message;
          if (Array.isArray(errorMessage)) {
            errorMessage = errorMessage.map((e: any) => e.msg).join(', ');
          } else if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
          }
          setUnixToUtcResult('');
          setUnixError(errorMessage);
        } finally {
          setLoadingUnixToUtc(false);
        }
      };
    
    const convertUTCToUnix = async () => {
        setUtcError(null);
        if (!isValidUtc(utcInput)) {
          setUtcError(
            "Invalid UTC datetime. Use format 'YYYY-MM-DD HH:MM:SS', e.g. 2025-05-01 13:57:00"
          );
          return;
        }
        setLoadingUtcToUnix(true);
        try {
          const response = await api.post('/unix-utc/utc-to-unix', {
            datetime_utc: utcInput,
          });
          setUtcToUnixResult(response.data.timestamp.toString()); // store as string for display
        } catch (err: any) {
          let errorMessage = err.response?.data?.detail || err.message;
          if (Array.isArray(errorMessage)) {
            errorMessage = errorMessage.map((e: any) => e.msg).join(', ');
          } else if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
          }
          setUtcToUnixResult('');
          setUtcError(errorMessage);
        } finally {
          setLoadingUtcToUnix(false);
        }
      };

    const clearUnixToUtc = () => {
        setUnixInput('');
        setUnixToUtcResult('');
        setUnixError(null);
    };

    const clearUtcToUnix = () => {
        setUtcInput('');
        setUtcToUnixResult('');
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

            <SectionCard className='mb-4'>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Unix ➔ UTC Conversion</h3>
                <ClearButton onClick={clearUnixToUtc} disabled={unixInput.trim() === ''} />
            </div>
            <div className="flex-1 space-y-4 mb-4">
                <label className="form-label mb-0">Unix Input:</label>
                <input
                    type="text"
                    maxLength={100}
                    value={unixInput}
                    onChange={(e) => setUnixInput(e.target.value)}
                    className="input-field"
                    placeholder="Enter Unix timestamp (e.g. 1714583820)"
                />
            </div>
            <LoadingButton onClick={convertUnixToUtc} isLoading={loadingUnixToUtc}>Convert</LoadingButton>

            {unixToUtcResult && (
              <div className="result-box mt-4">
                <div className="inner-result">
                  <div className="w-full mono-output break-all">
                    <strong>UTC Datetime:</strong> {unixToUtcResult}
                  </div>
                  <CopyButton text={unixToUtcResult} />
                </div>
              </div>
            )}
          <ErrorBox message={errorUnix} />
        </SectionCard>

        <SectionCard className='mb-4'>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">UTC ➔ Unix Conversion</h3>
                <ClearButton onClick={clearUtcToUnix} disabled={utcInput.trim() === ''} />
            </div>
            <div className="flex-1 space-y-4 mb-4">
                <label className="form-label mb-0">Input UTC:</label>
                <input
                    type="text"
                    maxLength={100}
                    value={utcInput}
                    onChange={(e) => setUtcInput(e.target.value)}
                    className="input-field"
                    placeholder="Enter UTC datetime (YYYY-MM-DD HH:MM:SS)"
                />
            </div>
            <LoadingButton onClick={convertUTCToUnix} isLoading={loadingUtcToUnix}>Convert</LoadingButton>

            {utcToUnixResult && (
              <div className="result-box mt-4">
                <div className="inner-result flex items-center justify-between">
                  <div className="w-full mono-output break-all">
                    <strong>Unix Timestamp:</strong> {utcToUnixResult}
                  </div>
                  <CopyButton text={utcToUnixResult} />
                </div>
              </div>
            )}
          <ErrorBox message={errorUTC} />
        </SectionCard>
        </div>
    </>
  );
}

export default UnixUtcConverter;