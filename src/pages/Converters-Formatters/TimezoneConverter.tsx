import { useEffect, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import LoadingButton from '../../components/LoadingButton';
import ErrorBox from '../../components/ErrorBox';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import api from '../../services/api';
import seoDescriptions from '../../data/seoDescriptions';

function TimezoneConverter() {
  const seo = seoDescriptions.csvJson;
  const [datetimeStr, setDatetimeStr] = useState('');
  const [fromZone, setFromZone] = useState('');
  const [toZone, setToZone] = useState('');
  const [timezones, setTimezones] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get('/timezone-converter/all-timezones')
      .then((res) => {
        setTimezones(res.data.timezones);
        setFromZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        setToZone('UTC');
        setDatetimeStr(getLocalDatetimeStr());
      })
      .catch(() => setError('Failed to fetch timezone list.'));
  }, []);

  const getLocalDatetimeStr = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };  

  const handleConvert = async () => {
    if (!datetimeStr || !fromZone || !toZone) {
      setError('Please fill in all fields.');
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setResult(null);
  
    try {
      const res = await api.post('/timezone-converter/', {
        datetime_str: datetimeStr,
        from_timezone: fromZone,
        to_timezone: toZone,
      });
  
      if (res.data.result) {
        setResult(res.data.result);
      } else if (res.data.error) {
        setError(res.data.error);
      }      
    } catch (err: any) {
      const message = err.response?.data?.error || 'Conversion failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };  

  const handleSwap = () => {
    const temp = fromZone;
    setFromZone(toZone);
    setToZone(temp);
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setDatetimeStr(getLocalDatetimeStr());
    setFromZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setToZone('UTC');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex justify-between items-center mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">{seo.title}</h2>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Timezone Converter</h3>
            <ClearButton onClick={handleClear} disabled={!datetimeStr && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Input Datetime (YYYY-MM-DD HH:mm:ss)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="2025-05-01 13:00:00"
                value={datetimeStr}
                onChange={(e) => setDatetimeStr(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  From Timezone
                </label>
                <select
                  value={fromZone}
                  onChange={(e) => setFromZone(e.target.value)}
                  className="input-field"
                  disabled={isLoading}
                >
                  <option value="">Select</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center sm:mt-6">
                <button
                  onClick={handleSwap}
                  className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-2 py-1 rounded"
                  disabled={isLoading}
                  title="Swap Source and Target"
                  aria-label="Swap source and target timezones"
                >
                  ⇄
                </button>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  To Timezone
                </label>
                <select
                  value={toZone}
                  onChange={(e) => setToZone(e.target.value)}
                  className="input-field"
                  disabled={isLoading}
                >
                  <option value="">Select</option>
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-2">
              <LoadingButton onClick={handleConvert} isLoading={isLoading}>
                Convert
              </LoadingButton>
            </div>

            {result && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Converted Datetime
                </label>
                <div className="input-field flex justify-between items-center">
                  <span className="text-zinc-800 dark:text-white break-all">{result}</span>
                  <CopyButton text={result} />
                </div>
              </div>
            )}

            {error && (
              <div aria-live="polite">
                <ErrorBox message={error} />
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default TimezoneConverter;