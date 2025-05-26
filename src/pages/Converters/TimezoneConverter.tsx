import { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import Select, { GroupBase } from 'react-select';
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
import { CITY_TIMEZONES, TimezoneOption } from '../../data/cityTimezones';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ArrowLeftRight, ArrowUpDown, Clock } from 'lucide-react';

function TimezoneConverter() {
  const seo = seoDescriptions.timezone;
  const [datetimeStr, setDatetimeStr] = useState('');
  const [fromZone, setFromZone] = useState('');
  const [toZone, setToZone] = useState('');
  const [convertedDatetime, setConvertedDatetime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  // Flatten CITY_TIMEZONES for validation
  const allTimezones = CITY_TIMEZONES.flatMap((group) => group.options);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let localZone = moment.tz.guess() || 'UTC';
    localZone = localZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : localZone;
    const defaultFromZone = allTimezones.some((tz) => tz.value === localZone) ? localZone : 'UTC';
    setFromZone(defaultFromZone);
    setToZone('UTC');
    setDatetimeStr(moment().format('YYYY-MM-DD HH:mm:ss'));
  }, []);

  useEffect(() => {
    updateToolUsage('timezone');
  }, []);

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
      const dt = moment.tz(datetime, 'YYYY-MM-DD HH:mm:ss', fromZone);
      if (!dt.isValid()) {
        setError('Invalid datetime or timezone.');
        return '';
      }
      const converted = dt.tz(toZone).format('YYYY-MM-DD HH:mm:ss z');
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
    setDatetimeStr(moment().format('YYYY-MM-DD HH:mm:ss'));
    const localZone = moment.tz.guess() || 'UTC';
    const defaultFromZone = allTimezones.some((tz) => tz.value === localZone) ? localZone : 'UTC';
    setFromZone(defaultFromZone);
    setToZone('UTC');
    setConvertedDatetime('');
    setError(null);
  };

  const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDatetimeStr(value);
    if (value && !isValidDatetime(value)) {
      setError('Invalid datetime format. Use YYYY-MM-DD HH:mm:ss');
    } else if (fromZone && toZone) {
      setError(null);
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: isDark ? '#27272a' : '#ffffff', // dark:bg-zinc-800 or bg-white
      borderColor: state.isFocused
        ? isDark ? '#52525b' : '#d4d4d8'                 // dark:border-zinc-600 or zinc-300
        : isDark ? '#3f3f46' : '#e5e7eb',                // dark:border-zinc-700 or zinc-200
      color: isDark ? '#ffffff' : '#1f2937',             // dark:text-white or zinc-800
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      minHeight: '2.5rem',
      transition: 'all 0.2s ease',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(156,163,175,0.5)' : 'none',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDark ? '#ffffff' : '#1f2937',
    }),
    input: (provided: any) => ({
      ...provided,
      color: isDark ? '#ffffff' : '#1f2937',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: isDark ? '#a1a1aa' : '#9ca3af', // dark:zinc-400 or zinc-400
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#27272a' : '#ffffff',
      borderRadius: '0.375rem',
      zIndex: 20,
      marginTop: '0.25rem',
      border: '1px solid',
      borderColor: isDark ? '#3f3f46' : '#e5e7eb', // dark:border-zinc-700 or border-zinc-200
      boxShadow: isDark
        ? '0 1px 3px rgba(0,0,0,0.5)'
        : '0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 
        state.isFocused
        ? isDark ? '#3f3f46' : '#f3f4f6'
        : isDark ? '#27272a' : '#ffffff',
      color: state.isSelected ? '#ffffff' : isDark ? '#f4f4f5' : '#1f2937',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
    }),
    groupHeading: (provided: any) => ({
      ...provided,
      fontWeight: 600,
      color: isDark ? '#a1a1aa' : '#4b5563',
      padding: '0.5rem 0.75rem',
      backgroundColor: isDark ? '#1e1e1e' : '#f9fafb',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
    }),
  };

  // Find timezone option, return undefined if not found
  const findTimezoneOption = (value: string): TimezoneOption | undefined =>
    allTimezones.find((tz) => tz.value === value);

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Clock className="mr-2" size={24} /> {seo.title}
        </h2>

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
            <label htmlFor="datetime" className="form-label mb-0 flex items-center">
              <Clock size={16} className="mr-1" /> Input Datetime (YYYY-MM-DD HH:mm:ss):
            </label>
            <input
              id="datetime"
              type="text"
              className={`input-field ${error && datetimeStr ? 'border-red-500' : ''}`}
              placeholder="e.g., 2025-05-01 13:00:00"
              value={datetimeStr}
              onChange={handleDatetimeChange}
              maxLength={19}
              aria-label="Input datetime for timezone conversion"
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="flex-1">
              <label htmlFor="from_zone" className="form-label">
                From Timezone:
              </label>
              <Select<TimezoneOption, false, GroupBase<TimezoneOption>>
                id="from_zone"
                options={CITY_TIMEZONES}
                value={findTimezoneOption(fromZone)}
                onChange={(option) => setFromZone(option?.value || '')}
                placeholder="Select source timezone"
                isSearchable
                styles={customSelectStyles}
                aria-label="Select source timezone"
              />
            </div>
            <div className="flex items-center justify-center sm:mt-6">
              <button
                onClick={handleSwap}
                className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-2 py-1 rounded mt-6 sm:mt-0 transition-colors"
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
              <Select<TimezoneOption, false, GroupBase<TimezoneOption>>
                id="to_zone"
                options={CITY_TIMEZONES}
                value={findTimezoneOption(toZone)}
                onChange={(option) => setToZone(option?.value || '')}
                placeholder="Select target timezone"
                isSearchable
                styles={customSelectStyles}
                aria-label="Select target timezone"
              />
            </div>
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Converted Datetime</label>
              <CopyButton text={convertedDatetime} aria-label="Copy converted datetime" />
            </div>
            {convertedDatetime && (
              <div className="scrollbox mt-2 ">
                <div className="inner-result">
                  <div className="w-full mono-output break-all text-sm">{convertedDatetime}</div>
                </div>
              </div>
            )}
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default TimezoneConverter;