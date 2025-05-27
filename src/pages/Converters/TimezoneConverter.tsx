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
import { ArrowLeftRight, ArrowUpDown, Clock, RefreshCcw, Trash2 } from 'lucide-react';

function TimezoneConverter() {
  const seo = seoDescriptions.timezone;
  // Update state to use datetime-local format (YYYY-MM-DDTHH:mm)
  const [datetimeStr, setDatetimeStr] = useState(moment().format('YYYY-MM-DDTHH:mm'));
  const [fromZone, setFromZone] = useState<TimezoneOption | null>(null);
  const [toZone, setToZone] = useState<TimezoneOption | null>(null);
  const [convertedDatetime, setConvertedDatetime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [multiZoneError, setMultiZoneError] = useState<string | null>(null);
  const [rangeZoneError, setRangeZoneError] = useState<string | null>(null);
  const [isFromZoneDST, setIsFromZoneDST] = useState(false);
  const [isToZoneDST, setIsToZoneDST] = useState(false);
  const [savedTimezones, setSavedTimezones] = useState<TimezoneOption[]>([]);
  const [currentTime, setCurrentTime] = useState(moment().format('YYYY-MM-DD HH:mm:ss')); // Keep for saved timezones
  const [multiZoneDatetime, setMultiZoneDatetime] = useState(moment().format('YYYY-MM-DDTHH:mm'));
  const [selectedMultiZones, setSelectedMultiZones] = useState<TimezoneOption[]>([]);
  const [rangeStartDatetime, setRangeStartDatetime] = useState(moment().format('YYYY-MM-DDTHH:mm'));
  const [rangeEndDatetime, setRangeEndDatetime] = useState(moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
  const [selectedRangeZones, setSelectedRangeZones] = useState<TimezoneOption[]>([]);
  const [multiZoneFromZone, setMultiZoneFromZone] = useState<TimezoneOption | null>(null);
  const [rangeZoneFromZone, setRangeZoneFromZone] = useState<TimezoneOption | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  const allTimezones = CITY_TIMEZONES.flatMap((group) => group.options);

  // Load saved timezones 
  useEffect(() => {
    const saved = localStorage.getItem('savedTimezones');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validTimezones = parsed
          .map((tzLabel: string) => {
            for (const group of CITY_TIMEZONES) {
              const found = group.options.find(option => option.label === tzLabel);
              if (found) return found;
            }
            return null;
          })
          .filter((tz: TimezoneOption | null) => tz !== null) as TimezoneOption[];
        setSavedTimezones(validTimezones);
      } catch (e) {
        console.error('Error parsing saved timezones', e);
      }
    }
  }, []);

  // Save timezones to localStorage 
  useEffect(() => {
    if (savedTimezones.length > 0) {
      localStorage.setItem('savedTimezones', JSON.stringify(savedTimezones.map(tz => tz.label)));
    } else {
      localStorage.removeItem('savedTimezones');
    }
  }, [savedTimezones]);

  // Update current time every second 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dark mode observer 
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

  // Set default timezones
  useEffect(() => {
    let localZone = moment.tz.guess() || 'UTC';
    localZone = localZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : localZone;
    const defaultFromZone = allTimezones.find((tz) => tz.value === localZone) || allTimezones.find((tz) => tz.value === 'UTC');
    setFromZone(defaultFromZone || null);
    setToZone(allTimezones.find((tz) => tz.value === 'UTC') || null);
    setDatetimeStr(moment().format('YYYY-MM-DDTHH:mm'));
    setMultiZoneFromZone(defaultFromZone || null); 
    setRangeZoneFromZone(defaultFromZone || null);
  }, []);

  useEffect(() => {
    updateToolUsage('timezone');
  }, []);

  // Update datetime validation for datetime-local format
  const isValidDatetime = (datetime: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datetime);
  };

  // Update DST check to handle datetime-local format
  const checkDST = (zone: string, datetime: string): boolean => {
    if (!zone || !datetime || !isValidDatetime(datetime)) return false;
    try {
      const dt = moment.tz(datetime, 'YYYY-MM-DDTHH:mm', zone);
      return dt.isValid() && dt.isDST();
    } catch {
      return false;
    }
  };

  // Update conversion to handle datetime-local format
  const convertDatetime = (datetime: string, fromZoneVal: string, toZoneVal: string): string => {
    if (!datetime || !fromZoneVal || !toZoneVal) {
      setError('Please fill in all fields.');
      return '';
    }

    if (!isValidDatetime(datetime)) {
      setError('Invalid datetime format. Use YYYY-MM-DD HH:mm');
      return '';
    }

    try {
      const dt = moment.tz(datetime, 'YYYY-MM-DDTHH:mm', fromZoneVal);
      if (!dt.isValid()) {
        setError('Invalid datetime or timezone.');
        return '';
      }
      const converted = dt.tz(toZoneVal).format('YYYY-MM-DD HH:mm:ss');
      setError(null);
      return converted;
    } catch (err) {
      setError('Conversion failed.');
      return '';
    }
  };

  // Update to handle datetime-local format for saved timezones
  const getCurrentTimeInTimezone = (timezone: string, datetime: string = currentTime): string => {
    try {
      return moment.tz(datetime, 'YYYY-MM-DD HH:mm:ss', 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss');
    } catch {
      return 'Invalid timezone';
    }
  };

  useEffect(() => {
    const result = convertDatetime(datetimeStr, fromZone?.value || '', toZone?.value || '');
    setConvertedDatetime(result);
    setIsFromZoneDST(checkDST(fromZone?.value || '', datetimeStr));
    setIsToZoneDST(checkDST(toZone?.value || '', datetimeStr));
  }, [datetimeStr, fromZone, toZone]);

  const handleSwap = () => {
    setFromZone(toZone);
    setToZone(fromZone);
    setDatetimeStr(convertedDatetime.split(' ')[0] + 'T' + convertedDatetime.split(' ')[1].slice(0, 5));
    setConvertedDatetime('');
    setError(null);
  };

  const handleClear = () => {
    setDatetimeStr(moment().format('YYYY-MM-DDTHH:mm'));
    const localZone = moment.tz.guess() || 'UTC';
    const defaultFromZone = allTimezones.find((tz) => tz.value === localZone) || allTimezones.find((tz) => tz.value === 'UTC');
    setFromZone(defaultFromZone || null);
    setToZone(allTimezones.find((tz) => tz.value === 'UTC') || null);
    setConvertedDatetime('');
    setError(null);
    setIsFromZoneDST(false);
    setIsToZoneDST(false);
  };

  const handleDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDatetimeStr(value);
    if (value && !isValidDatetime(value)) {
      setError('Invalid datetime format. Use YYYY-MM-DD HH:mm');
    } else if (fromZone && toZone) {
      setError(null);
    }
  };

  // Handlers for saved timezones 
  const handleAddTimezone = (option: TimezoneOption | null) => {
    if (!option) return;
    if (savedTimezones.some(tz => tz.label === option.label)) {
      setError('This city is already saved.');
      return;
    }
    if (savedTimezones.length >= 3) {
      setError('Maximum 3 timezones can be saved.');
      return;
    }
    setSavedTimezones([...savedTimezones, option]);
    setError(null);
  };

  const handleRemoveTimezone = (timezone: TimezoneOption) => {
    setSavedTimezones(savedTimezones.filter(tz => tz.label !== timezone.label));
  };

  const handleClearSavedTimezones = () => {
    setSavedTimezones([]);
    localStorage.removeItem('savedTimezones');
    setError(null);
  };

  // Handlers for multi-timezone section
  const handleMultiZoneDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMultiZoneDatetime(value);
    if (value && !isValidDatetime(value)) {
      setMultiZoneError('Invalid datetime format. Use YYYY-MM-DD HH:mm');
    } else {
      setMultiZoneError(null);
    }
  };

  const handleAddMultiZone = (option: TimezoneOption | null) => {
    if (!option) return;
    if (selectedMultiZones.some(tz => tz.label === option.label)) {
      setMultiZoneError('This city is already selected.');
      return;
    }
    if (selectedMultiZones.length >= 10) {
      setMultiZoneError('Maximum 10 timezones can be selected.');
      return;
    }
    setSelectedMultiZones([...selectedMultiZones, option]);
    setMultiZoneError(null);
  };

  const handleClearMultiZones = () => {
    setSelectedMultiZones([]);
    setMultiZoneDatetime(moment().format('YYYY-MM-DDTHH:mm'));
    setMultiZoneError(null);
  };

  // Handlers for range timezone section
  const handleRangeStartDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRangeStartDatetime(value);
    if (value && !isValidDatetime(value)) {
      setRangeZoneError('Invalid start datetime format. Use YYYY-MM-DD HH:mm');
    } else if (rangeEndDatetime && !isValidDatetime(rangeEndDatetime)) {
      setRangeZoneError('Invalid end datetime format. Use YYYY-MM-DD HH:mm');
    } else if (rangeEndDatetime && moment(value).isAfter(moment(rangeEndDatetime))) {
      setRangeZoneError('Start datetime cannot be after end datetime.');
    } else {
      setRangeZoneError(null);
    }
  };

  const handleRangeEndDatetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRangeEndDatetime(value);
    if (value && !isValidDatetime(value)) {
      setRangeZoneError('Invalid end datetime format. Use YYYY-MM-DD HH:mm');
    } else if (rangeStartDatetime && !isValidDatetime(rangeStartDatetime)) {
      setRangeZoneError('Invalid start datetime format. Use YYYY-MM-DD HH:mm');
    } else if (rangeStartDatetime && moment(rangeStartDatetime).isAfter(moment(value))) {
      setRangeZoneError('End datetime cannot be before start datetime.');
    } else {
      setRangeZoneError(null);
    }
  };

  const handleAddRangeZone = (option: TimezoneOption | null) => {
    if (!option) return;
    if (selectedRangeZones.some(tz => tz.label === option.label)) {
      setRangeZoneError('This city is already selected.');
      return;
    }
    if (selectedRangeZones.length >= 10) {
      setRangeZoneError('Maximum 10 timezones can be selected.');
      return;
    }
    setSelectedRangeZones([...selectedRangeZones, option]);
    setRangeZoneError(null);
  };

  const handleClearRangeZones = () => {
    setSelectedRangeZones([]);
    setRangeStartDatetime(moment().format('YYYY-MM-DDTHH:mm'));
    setRangeEndDatetime(moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
    setRangeZoneError(null);
  };

  // Function to convert range datetime to selected timezone
  const convertRangeDatetime = (start: string, end: string, timezone: string): { start: string; end: string } => {
    try {
      const startDt = moment.tz(start, 'YYYY-MM-DDTHH:mm', rangeZoneFromZone?.value || 'UTC')
        .tz(timezone)
        .format('YYYY-MM-DD HH:mm:ss');
      const endDt = moment.tz(end, 'YYYY-MM-DDTHH:mm', rangeZoneFromZone?.value || 'UTC')
        .tz(timezone)
        .format('YYYY-MM-DD HH:mm:ss');
      return { start: startDt, end: endDt };
    } catch {
      return { start: 'Invalid timezone', end: 'Invalid timezone' };
    }
  };

  // Convert selected multi-zones
  const multiZoneResults = selectedMultiZones.reduce((acc, tz) => {
    try {
      const dt = moment.tz(multiZoneDatetime, 'YYYY-MM-DDTHH:mm', multiZoneFromZone?.value || 'UTC')
        .tz(tz.value)
        .format('YYYY-MM-DD HH:mm:ss');
      acc[tz.label] = dt;
    } catch {
      acc[tz.label] = 'Invalid timezone';
    }
    return acc;
  }, {} as Record<string, string>);

  const rangeZoneResults = selectedRangeZones.reduce((acc, tz) => {
    acc[tz.label] = convertRangeDatetime(rangeStartDatetime, rangeEndDatetime, tz.value);
    return acc;
  }, {} as Record<string, { start: string; end: string }>);

  // Custom filter and styles for react-select 
  const filterOption = ({ label }: TimezoneOption, input: string): boolean => {
    return input ? label.toLowerCase().includes(input.toLowerCase()) : true;
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: isDark ? '#27272a' : '#ffffff',
      borderColor: state.isFocused
        ? isDark ? '#52525b' : '#d4d4d8'
        : isDark ? '#3f3f46' : '#e5e7eb',
      color: isDark ? '#ffffff' : '#1f2937',
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
      color: isDark ? '#a1a1aa' : '#9ca3af',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#27272a' : '#ffffff',
      borderRadius: '0.375rem',
      zIndex: 20,
      marginTop: '0.25rem',
      border: '1px solid',
      borderColor: isDark ? '#3f3f46' : '#e5e7eb',
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

        {/* Saved Timezones Section  */}
        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Saved Timezones</h3>
            <button
              onClick={handleClearSavedTimezones}
              disabled={savedTimezones.length === 0}
              aria-label="Clear all saved timezones"
              title="Clear all saved timezones"
              className="transition-all duration-200 flex items-center gap-1 px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={14} />
              Reset
            </button>
          </div>
          <div className="sm:mb-4 mb-2">
            <label htmlFor="saved_timezone" className="form-label">
              Add Timezone (Max 3):
            </label>
            <Select<TimezoneOption, false, GroupBase<TimezoneOption>>
              id="saved_timezone"
              options={CITY_TIMEZONES}
              onChange={handleAddTimezone}
              placeholder="Search and select timezone"
              isSearchable
              filterOption={filterOption}
              styles={customSelectStyles}
              aria-label="Select timezone to save"
            />
          </div>
          {savedTimezones.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4 gap-2">
              {savedTimezones.map((tz) => (
                <div key={tz.label} className="result-box flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label truncate">{tz.label}</label>
                    <button
                      onClick={() => handleRemoveTimezone(tz)}
                      className="p-1 mb-3 ml-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white focus:outline-none"
                      aria-label={`Remove ${tz.label} from saved timezones`}
                      title="Remove timezone"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="inner-result flex-grow">
                    <div className="w-full mono-output break-all text-sm">
                      {getCurrentTimeInTimezone(tz.value)}
                    </div>
                    <CopyButton text={getCurrentTimeInTimezone(tz.value)} aria-label={`Copy current time in ${tz.label}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Timezone Converter Section */}
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
              <Clock size={16} className="mr-1" /> Input Datetime:
            </label>
            <input
              id="datetime"
              type="datetime-local"
              className={`input-field ${error && datetimeStr ? 'border-red-500' : ''}`}
              value={datetimeStr}
              onChange={handleDatetimeChange}
              aria-label="Select datetime for timezone conversion"
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
                value={fromZone}
                onChange={(option) => setFromZone(option || null)}
                placeholder="Select source timezone"
                isSearchable
                filterOption={filterOption}
                styles={customSelectStyles}
                aria-label="Select source timezone"
              />
            </div>
            <div className="flex items-center justify-center sm:mt-6">
              <button
                onClick={handleSwap}
                className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-2 py-1 rounded mt-3 sm:mt-0 transition-colors"
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
                value={toZone}
                onChange={(option) => setToZone(option || null)}
                placeholder="Select target timezone"
                isSearchable
                filterOption={filterOption}
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
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output break-all text-sm">{convertedDatetime}</div>
                </div>
              </div>
            )}
            {(isFromZoneDST || isToZoneDST) && convertedDatetime && (
              <div className="mt-2 text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Warning:</strong> {isFromZoneDST && isToZoneDST
                  ? `Both ${fromZone?.label} and ${toZone?.label} are currently observing Daylight Saving Time (DST).`
                  : isFromZoneDST
                  ? `${fromZone?.label} is currently observing Daylight Saving Time (DST).`
                  : `${toZone?.label} is currently observing Daylight Saving Time (DST).`}
              </div>
            )}
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>

        {/* Multiple Timezone Converter Section */}
        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Multiple Timezone Converter</h3>
            <ClearButton
              onClick={handleClearMultiZones}
              disabled={selectedMultiZones.length === 0}
              aria-label="Clear all selected timezones and reset datetime"
            />
          </div>

          <div className="flex-1 space-y-4">
            <label htmlFor="multi_datetime" className="form-label mb-0 flex items-center">
              <Clock size={16} className="mr-1" /> Input Datetime:
            </label>
            <input
              id="multi_datetime"
              type="datetime-local"
              className={`input-field ${multiZoneError && multiZoneDatetime ? 'border-red-500' : ''}`}
              value={multiZoneDatetime}
              onChange={handleMultiZoneDatetimeChange}
              aria-label="Select datetime for multiple timezone conversion"
            />
            <label htmlFor="multi_from_zone" className="form-label">
              From Timezone:
            </label>
            <Select<TimezoneOption, false, GroupBase<TimezoneOption>>
              id="multi_from_zone"
              options={CITY_TIMEZONES}
              value={multiZoneFromZone}
              onChange={(option) => setMultiZoneFromZone(option || null)}
              placeholder="Select source timezone"
              isSearchable
              filterOption={filterOption}
              styles={customSelectStyles}
              aria-label="Select source timezone for multiple conversions"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="multi_zone" className="form-label">
              Select Timezone (Max 10):
            </label>
            <Select<TimezoneOption, false, GroupBase<TimezoneOption>>
              id="multi_zone"
              options={CITY_TIMEZONES}
              onChange={handleAddMultiZone}
              placeholder="Search and select timezone"
              isSearchable
              filterOption={filterOption}
              styles={customSelectStyles}
              aria-label="Select timezone for multiple conversions"
            />
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center">
              <label className="form-label text-base">Conversion Result</label>
              {Object.keys(multiZoneResults).length > 0 && (
                <div className="flex items-center gap-2">
                  <CopyButton 
                    text={Object.entries(multiZoneResults).map(([k, v]) => `${k}: ${v}`).join('\n')} 
                    copyType='CopyAll'
                    className='mb-2'
                    aria-label="Copy all conversion results"
                  />
                </div>
              )}
            </div>
            {Object.keys(multiZoneResults).length > 0 && (
              <div className="scrollbox mt-2">
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(multiZoneResults).map(([key, val]) => {
                    const displayLabel = key;
                    return (
                      <div key={key} className="inner-result flex justify-between items-center">
                        <span className="font-mono text-zinc-800 dark:text-white whitespace-pre-wrap break-all">
                          {displayLabel}: {val}
                        </span>
                        <CopyButton
                          text={`${displayLabel}: ${val}`}
                          aria-label={`Copy ${displayLabel} value`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedMultiZones.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                No timezones selected. Please select at least one timezone.
              </div>
            )}
          </div>

          <ErrorBox message={multiZoneError} aria-live="polite" />
        </SectionCard>

        {/* Multiple Timezone Range Converter Section */}
        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Multiple Timezone Range Converter</h3>
            <ClearButton
              onClick={handleClearRangeZones}
              disabled={selectedRangeZones.length === 0}
              aria-label="Clear all selected timezones and reset datetime range"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <label htmlFor="range_start_datetime" className="form-label mb-0 flex items-center">
                <Clock size={16} className="mr-1" /> Start Datetime:
              </label>
              <input
                id="range_start_datetime"
                type="datetime-local"
                className={`input-field ${rangeZoneError && rangeStartDatetime ? 'border-red-500' : ''}`}
                value={rangeStartDatetime}
                onChange={handleRangeStartDatetimeChange}
                aria-label="Select start datetime for range conversion"
              />
            </div>
            <div className="flex-1 space-y-4">
              <label htmlFor="range_end_datetime" className="form-label mb-0 flex items-center">
                <Clock size={16} className="mr-1" /> End Datetime:
              </label>
              <input
                id="range_end_datetime"
                type="datetime-local"
                className={`input-field ${rangeZoneError && rangeEndDatetime ? 'border-red-500' : ''}`}
                value={rangeEndDatetime}
                onChange={handleRangeEndDatetimeChange}
                aria-label="Select end datetime for range conversion"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="range_from_zone" className="form-label">
              From Timezone:
            </label>
            <Select<TimezoneOption, false, GroupBase<TimezoneOption>>
              id="range_from_zone"
              options={CITY_TIMEZONES}
              value={rangeZoneFromZone}
              onChange={(option) => setRangeZoneFromZone(option || null)}
              placeholder="Select source timezone"
              isSearchable
              filterOption={filterOption}
              styles={customSelectStyles}
              aria-label="Select source timezone for range conversions"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="range_zone" className="form-label">
              Select Timezone (Max 10):
            </label>
            <Select<TimezoneOption, false, GroupBase<TimezoneOption>>
              id="range_zone"
              options={CITY_TIMEZONES}
              onChange={handleAddRangeZone}
              placeholder="Search and select timezone"
              isSearchable
              filterOption={filterOption}
              styles={customSelectStyles}
              aria-label="Select timezone for range conversions"
            />
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center">
              <label className="form-label text-base">Conversion Range Results</label>
              {Object.keys(rangeZoneResults).length > 0 && (
                <div className="flex items-center gap-2">
                  <CopyButton 
                    text={Object.entries(rangeZoneResults).map(([k, v]) => `${k}: ${v.start} to ${v.end}`).join('\n')} 
                    copyType='CopyAll'
                    className='mb-2'
                    aria-label="Copy all range conversion results"
                  />
                </div>
              )}
            </div>
            {Object.keys(rangeZoneResults).length > 0 && (
              <div className="scrollbox mt-2">
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(rangeZoneResults).map(([key, val]) => {
                    const displayLabel = key;
                    return (
                      <div key={key} className="inner-result flex justify-between items-center">
                        <span className="font-mono text-zinc-800 dark:text-white whitespace-pre-wrap break-all">
                          {displayLabel}: {val.start} to {val.end}
                        </span>
                        <CopyButton
                          text={`${displayLabel}: ${val.start} to ${val.end}`}
                          aria-label={`Copy ${displayLabel} range value`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedRangeZones.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                No timezones selected. Please select at least one timezone.
              </div>
            )}
          </div>

          <ErrorBox message={rangeZoneError} aria-live="polite" />
        </SectionCard>

        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default TimezoneConverter;