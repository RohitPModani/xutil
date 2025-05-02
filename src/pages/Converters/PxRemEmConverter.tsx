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

function PxRemEmConverter() {
  const seo = seoDescriptions.pxRemEm;
  const [value, setValue] = useState('');
  const [conversionType, setConversionType] = useState('px-to-rem-em');
  const [rootFontSize, setRootFontSize] = useState('16');
  const [parentFontSize, setParentFontSize] = useState('16');
  const [result, setResult] = useState<{ px?: number; rem?: number; em?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const conversionTypes = [
    { value: 'px-to-rem-em', label: 'PX to REM/EM' },
    { value: 'rem-to-px-em', label: 'REM to PX/EM' },
    { value: 'em-to-px-rem', label: 'EM to PX/REM' },
  ];

  useEffect(() => {
    // Initialize default values
    setValue('16');
    setRootFontSize('16');
    setParentFontSize('16');
    setConversionType('px-to-rem-em');
  }, []);

  const handleConvert = async () => {
    if (!value || !rootFontSize || !parentFontSize || !conversionType) {
      setError('Please fill in all fields.');
      return;
    }

    const valueNum = parseFloat(value);
    const rootFontSizeNum = parseFloat(rootFontSize);
    const parentFontSizeNum = parseFloat(parentFontSize);

    if (isNaN(valueNum) || isNaN(rootFontSizeNum) || isNaN(parentFontSizeNum)) {
      setError('Please enter valid numbers.');
      return;
    }

    if (valueNum <= 0 || rootFontSizeNum <= 0 || parentFontSizeNum <= 0) {
      setError('Values must be greater than 0.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.get('/px-rem-em/', {
        params: {
          conversion_type: conversionType,
          value: valueNum,
          root_font_size: rootFontSizeNum,
          parent_font_size: parentFontSizeNum,
        },
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
    setValue('16');
    setRootFontSize('16');
    setParentFontSize('16');
    setConversionType('px-to-rem-em');
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
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">PX-REM-EM Converter</h3>
            <ClearButton onClick={handleClear} disabled={!value && !result && !error} />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <label className="form-label">
                Value
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter value (e.g., 16)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="form-label">
                Conversion Type
              </label>
              <select
                value={conversionType}
                onChange={(e) => setConversionType(e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                {conversionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">
                  Root Font Size (px)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter root font size (e.g., 16)"
                  value={rootFontSize}
                  onChange={(e) => setRootFontSize(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex-1">
                <label className="form-label">
                  Parent Font Size (px)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter parent font size (e.g., 16)"
                  value={parentFontSize}
                  onChange={(e) => setParentFontSize(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-center mt-2">
              <LoadingButton onClick={handleConvert} isLoading={isLoading}>
                Convert
              </LoadingButton>
            </div>

            <div className="result-box max-h-[400px] overflow-y-auto">
                <label className="form-label">
                Conversion Result
                </label>
                {result && (
                    <div>
                        <div className="flex flex-col gap-3">
                        {Object.entries(result).map(([key, val]) => (
                            <div
                                key={key}
                                className="inner-result"
                                >
                                <span className="font-mono text-zinc-800 dark:text-white">
                                    {key.toUpperCase()}: {val}
                                </span>
                                <CopyButton text={`${key.toUpperCase()}: ${val}`} />
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

export default PxRemEmConverter;