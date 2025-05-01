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

function TimeConverter() {
  const seo = seoDescriptions.timeUnit;

  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('s');
  const [result, setResult] = useState<{
    ns?: number; μs?: number; ms?: number; s?: number; min?: number; hr?: number;
    day?: number; week?: number; month?: number; year?: number; decade?: number; century?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const units = [
    { value: 'ns', label: 'Nanoseconds (ns)' },
    { value: 'μs', label: 'Microseconds (μs)' },
    { value: 'ms', label: 'Milliseconds (ms)' },
    { value: 's', label: 'Seconds (s)' },
    { value: 'min', label: 'Minutes (min)' },
    { value: 'hr', label: 'Hours (hr)' },
    { value: 'day', label: 'Days (day)' },
    { value: 'week', label: 'Weeks (week)' },
    { value: 'month', label: 'Months (month)' },
    { value: 'year', label: 'Years (year)' },
    { value: 'decade', label: 'Decades (decade)' },
    { value: 'century', label: 'Centuries (century)' },
  ];

  useEffect(() => {
    setValue('1');
    setUnit('s');
  }, []);

  const handleConvert = async () => {
    if (!value || !unit) {
      setError('Please fill in all fields.');
      return;
    }

    const valueNum = parseFloat(value);
    if (isNaN(valueNum)) {
      setError('Please enter a valid number.');
      return;
    }

    if (valueNum <= 0) {
      setError('Value must be greater than 0.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/time/convert', {
        value: valueNum,
        unit,
      });

      if (res.data) {
        setResult(res.data);
      } else {
        setError('No result returned from the server.');
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Conversion failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setValue('1');
    setUnit('s');
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
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Time Unit Converter</h3>
            <ClearButton onClick={handleClear} disabled={!value && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  className="input-field w-full"
                  placeholder="Enter numeric value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="input-field w-full"
                  disabled={isLoading}
                >
                  {units.map((unitOption) => (
                    <option key={unitOption.value} value={unitOption.value}>
                      {unitOption.label}
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

            <div className="result-box min-h-[100px]">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Conversion Result
              </label>
              {result && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(result).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded flex justify-between items-center"
                      >
                        <span className="font-mono text-zinc-800 dark:text-white">
                          {key}: {val}
                        </span>
                        <CopyButton text={`${key}: ${val}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

export default TimeConverter;