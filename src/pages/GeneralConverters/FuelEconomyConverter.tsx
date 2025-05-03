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
import useResultText from '../../hooks/useResultsText';

function FuelEconomyConverter() {
  const seo = seoDescriptions.fuelEconomy || { 
    title: 'Fuel Economy Converter', 
    body: 'Convert fuel efficiency between miles per gallon (US/UK), kilometers per liter, and liters per 100 kilometers.' 
  };
  const [value, setValue] = useState('1');
  const [unit, setUnit] = useState('mpg_us');
  const [result, setResult] = useState<{ mpg_us?: number; mpg_uk?: number; km_l?: number; l_100km?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const units = [
    { value: 'mpg_us', label: 'Miles per Gallon (US)' },
    { value: 'mpg_uk', label: 'Miles per Gallon (UK)' },
    { value: 'km_l', label: 'Kilometers per Liter' },
    { value: 'l_100km', label: 'Liters per 100 Kilometers' },
  ];

  useEffect(() => {
    // Initialize default values
    setValue('1');
    setUnit('mpg_us');
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

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/unit-converter/fuel-economy', {
        value: valueNum,
        unit: unit,
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
    setUnit('mpg_us');
    setResult(null);
    setError(null);
  };

  const getResultsText = useResultText(result, units);

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
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Fuel Economy Converter</h3>
            <ClearButton onClick={handleClear} disabled={!value && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">
                  Value
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Enter value (e.g., 0)"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <label className="form-label">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                >
                  {units.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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

            <div className="result-box mt-1">
                <div className="flex justify-between items-center">
                    <label className="form-label text-base">
                        Conversion Result
                    </label>
                    {result && (
                        <CopyButton text={getResultsText} copyType="CopyAll" />
                    )}
              </div>
              {result && (
                <div className='scrollbox mt-2'>
                  <div className="flex flex-col gap-3">
                    {Object.entries(result).map(([key, val]) => {
                      const unit = units.find(u => u.value === key);
                      const displayLabel = unit ? unit.label : key.toUpperCase();
                      return (
                        <div
                          key={key}
                          className="inner-result"
                        >
                          <span className="font-mono text-zinc-800 dark:text-white">
                            {displayLabel}: {val}
                          </span>
                          <CopyButton text={`${displayLabel}: ${val}`} />
                        </div>
                      );
                    })}
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

export default FuelEconomyConverter;