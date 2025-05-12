import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import ErrorBox from '../../components/ErrorBox';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { updateToolUsage } from '../../utils/toolUsage';
import { TIMEZONES } from '../../data/timezones';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';

function TimezoneConverter() {
  const seo = seoDescriptions.timezone;
  const [datetimeStr, setDatetimeStr] = useState('');
  const [fromZone, setFromZone] = useState('');
  const [toZone, setToZone] = useState('');
  const [convertedDatetime, setConvertedDatetime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    const localZone = DateTime.local().zoneName;
    console.log('Local timezone:', localZone);
    // Validate local timezone against TIMEZONES list, fallback to UTC
    const defaultFromZone = TIMEZONES.includes(localZone) ? localZone : 'UTC';
    setFromZone(defaultFromZone);
    setToZone('UTC');
    setDatetimeStr(getLocalDatetimeStr());
  }, []);

  useEffect(() => {
    updateToolUsage('timezone');
  }, []);

  const getLocalDatetimeStr = () => {
    const now = DateTime.local();
    return now.toFormat('yyyy-MM-dd HH:mm:ss');
  };

  const isValidDatetime = (datetime: string): boolean => {
    return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime);
  };

  const convertDatetime = (datetime: string, fromZone: string, toZone: string): string => {
    if (!datetime || !fromZone || !toZone) {
      setError('Please fill in all fields.');
      return '';
    }

    if (!isValidDatetime(datetime)) {
      setError('Invalid datetime format. Use YYYY-MM-DD HH:mm:ss');
      return '';
    }

    try {
      const dt = DateTime.fromFormat(datetime, 'yyyy-MM-dd HH:mm:ss', { zone: fromZone });
      if (!dt.isValid) {
        setError('Invalid datetime or timezone.');
        return '';
      }
      const converted = dt.setZone(toZone).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ');
      setError(null);
      return converted;
    } catch (err) {
      setError('Conversion failed.');
      return '';
    }
  };

  useEffect(() => {
    const result = convertDatetime(datetimeStr, fromZone, toZone);
    setConvertedDatetime(result);
  }, [datetimeStr, fromZone, toZone]);

  const handleSwap = () => {
    setFromZone(toZone);
    setToZone(fromZone);
    setDatetimeStr(convertedDatetime.split(' ')[0] + ' ' + convertedDatetime.split(' ')[1]);
    setConvertedDatetime('');
    setError(null);
  };

  const handleClear = () => {
    setDatetimeStr(getLocalDatetimeStr());
    const localZone = DateTime.local().zoneName;
    setFromZone(TIMEZONES.includes(localZone) ? localZone : 'UTC');
    setToZone('UTC');
    setConvertedDatetime('');
    setError(null);
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
            <h3 className="text-lg font-semibold">Timezone Converter</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!datetimeStr && !convertedDatetime && !error}
              aria-label="Clear all inputs and results"
            />
          </div>

          <div className="flex-1 space-y-4">
            <label htmlFor="datetime" className="form-label mb-0">
              Input Datetime (YYYY-MM-DD HH:mm:ss):
            </label>
            <input
              id="datetime"
              type="text"
              className="input-field"
              placeholder="e.g., 2025-05-01 13:00:00"
              value={datetimeStr}
              onChange={(e) => setDatetimeStr(e.target.value)}
              maxLength={19}
              aria-label="Input datetime for timezone conversion"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="flex-1">
              <label htmlFor="from_zone" className="form-label">
                From Timezone:
              </label>
              <select
                id="from_zone"
                value={fromZone}
                onChange={(e) => setFromZone(e.target.value)}
                className="input-field"
                aria-label="Select source timezone"
              >
                <option value="">Select</option>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center sm:mt-6">
              <button
                onClick={handleSwap}
                className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-2 py-1 rounded mt-6 sm:mt-0"
                title="Swap source and target timezones"
                aria-label="Swap source and target timezones"
              >
                {isMobile ? <ArrowUpDown size={15} /> : <ArrowLeftRight size={20} />}
              </button>
            </div>
            <div className="flex-1">
              <label htmlFor="to_zone" className="form-label">
                To Timezone:
              </label>
              <select
                id="to_zone"
                value={toZone}
                onChange={(e) => setToZone(e.target.value)}
                className="input-field"
                aria-label="Select target timezone"
              >
                <option value="">Select</option>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Converted Datetime</label>
              <CopyButton text={convertedDatetime} aria-label="Copy converted datetime" />
            </div>
            {convertedDatetime && (
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output break-all">{convertedDatetime}</div>
                </div>
              </div>
            )}
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
      </div>
    </>
  );
}

export default TimezoneConverter;