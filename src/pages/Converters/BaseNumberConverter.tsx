import { useEffect, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import { updateToolUsage } from '../../utils/toolUsage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react';

const BASES = [
  { value: 2, name: 'Binary' },
  { value: 3, name: 'Ternary' },
  { value: 4, name: 'Quaternary' },
  { value: 5, name: 'Quinary' },
  { value: 6, name: 'Senary' },
  { value: 7, name: 'Septenary' },
  { value: 8, name: 'Octal' },
  { value: 9, name: 'Nonary' },
  { value: 10, name: 'Decimal' },
  { value: 11, name: 'Undecimal' },
  { value: 12, name: 'Duodecimal' },
  { value: 13, name: 'Tridecimal' },
  { value: 14, name: 'Tetradecimal' },
  { value: 15, name: 'Pentadecimal' },
  { value: 16, name: 'Hexadecimal' },
  { value: 17, name: 'Heptadecimal' },
  { value: 18, name: 'Octodecimal' },
  { value: 19, name: 'Nonadecimal' },
  { value: 20, name: 'Vigesimal' },
  { value: 21, name: 'Unvigesimal' },
  { value: 22, name: 'Duovigesimal' },
  { value: 23, name: 'Trivigesimal' },
  { value: 24, name: 'Tetravigesimal' },
  { value: 25, name: 'Pentavigesimal' },
  { value: 26, name: 'Hexavigesimal' },
  { value: 27, name: 'Heptavigesimal' },
  { value: 28, name: 'Octovigesimal' },
  { value: 29, name: 'Nonavigesimal' },
  { value: 30, name: 'Trigesimal' },
  { value: 31, name: 'Untrigesimal' },
  { value: 32, name: 'Duotrigesimal' },
  { value: 33, name: 'Tritrigesimal' },
  { value: 34, name: 'Tetratrigesimal' },
  { value: 35, name: 'Pentatrigesimal' },
  { value: 36, name: 'Hexatrigesimal' },
];

function BaseNumberConverter() {
  const seo = seoDescriptions.baseNumber; 
  const [inputNumber, setInputNumber] = useState('');
  const [sourceBase, setSourceBase] = useState('10');
  const [targetBase, setTargetBase] = useState('2');
  const [convertedNumber, setConvertedNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const validateNumber = (number: string, base: number): boolean => {
    if (!number) return false;
    const validDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base).toLowerCase();
    return new RegExp(`^[${validDigits}]+$`, 'i').test(number);
  };

  const convertBase = (numStr: string, fromBase: number, toBase: number): string => {
    if (!numStr.trim()) return '';
    
    // First convert from source base to decimal
    const decimal = parseInt(numStr, fromBase);
    if (isNaN(decimal)) {
      setError(`Invalid number for base ${fromBase}`);
      return '';
    }
    
    // Then convert from decimal to target base
    return decimal.toString(toBase).toUpperCase();
  };

  useEffect(() => {
    updateToolUsage('base_number');
  }, []);

  useEffect(() => {
    const sourceBaseNum = parseInt(sourceBase, 10);
    const targetBaseNum = parseInt(targetBase, 10);
    
    if (!inputNumber.trim()) {
      setError(null);
      setConvertedNumber('');
      return;
    }

    if (!validateNumber(inputNumber, sourceBaseNum)) {
      setError(`Number contains invalid digits for base ${sourceBaseNum}`);
      setConvertedNumber('');
      return;
    }

    setError(null);
    try {
      const result = convertBase(inputNumber, sourceBaseNum, targetBaseNum);
      setConvertedNumber(result);
    } catch (err) {
      setError('Conversion failed. Please check your input.');
      setConvertedNumber('');
    }
  }, [inputNumber, sourceBase, targetBase]);

  const handleSwap = () => {
    setSourceBase(targetBase);
    setTargetBase(sourceBase);
  };

  const handleClear = () => {
    setInputNumber('');
    setSourceBase('10');
    setTargetBase('2');
    setConvertedNumber('');
    setError(null);
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex justify-between items-center mb-6">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">{seo.title}</h2>
        <SEODescription title={'a ' + seo.title}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Base Number Converter</h3>
            <ClearButton onClick={handleClear} disabled={!inputNumber && !convertedNumber && !error} />
          </div>

          <div className="flex flex-col gap-6">
            {/* Input and Result Section */}
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="number" className="form-label">
                  Input Number
                </label>
                <AutoTextarea
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  className="input-field"
                  placeholder="Enter your number (e.g., 1010)"
                  aria-label="Input number for conversion"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="source_base" className="form-label">
                    Source Base
                  </label>
                  <select
                    id="source_base"
                    value={sourceBase}
                    onChange={(e) => setSourceBase(e.target.value)}
                    className="input-field"
                    aria-label="Select source base"
                  >
                    {BASES.map((base) => (
                      <option key={base.value} value={base.value}>
                        {`${base.value} (${base.name})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-center sm:mt-6">
                  <button
                    onClick={handleSwap}
                    className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-2 py-1 rounded"
                    title="Swap Source and Target Bases"
                    aria-label="Swap source and target bases"
                  >
                   {isMobile ? <ArrowUpDown size={15}/> : <ArrowLeftRight size={20}/>}
                  </button>
                </div>
                <div className="flex-1">
                  <label htmlFor="target_base" className="form-label">
                    Target Base
                  </label>
                  <select
                    id="target_base"
                    value={targetBase}
                    onChange={(e) => setTargetBase(e.target.value)}
                    className="input-field"
                    aria-label="Select target base"
                  >
                    {BASES.map((base) => (
                      <option key={base.value} value={base.value}>
                        {`${base.value} (${base.name})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label">Converted Number</label>
                  <CopyButton text={convertedNumber} />
                </div>
                {convertedNumber && (
                  <div className='scrollbox mt-2'>
                    <div className="inner-result">
                      <div className="mono-output">{convertedNumber}</div>
                    </div>
                  </div>
                )}
              </div>
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

export default BaseNumberConverter;