import { useEffect, useState, useRef, useCallback } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';

// Constants
const ROMAN_NUMERAL_REGEX = /^[IVXLCDM]*$/i;
const NUMERIC_REGEX = /^\d*$/;
const MAX_ROMAN_VALUE = 3999;
const MIN_ROMAN_VALUE = 1;

// Type for valid Roman numeral characters
type RomanNumeral = 'I' | 'V' | 'X' | 'L' | 'C' | 'D' | 'M';

const romanToArabicMap: { [key in RomanNumeral]: number } = {
  'I': 1,
  'V': 5,
  'X': 10,
  'L': 50,
  'C': 100,
  'D': 500,
  'M': 1000
};

const isValidRomanNumeral = (roman: string): boolean => {
  if (!/^[IVXLCDM]+$/i.test(roman)) return false;
  const validPattern = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
  return validPattern.test(roman.toUpperCase());
};

export default function RomanNumeralConverter() {
  const seo = seoDescriptions.romanNumeral;

  // State management
  const [state, setState] = useState({
    romanInput: '',
    arabicInput: '',
    romanResult: '',
    arabicResult: '',
    errorRoman: '',
    errorArabic: ''
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Conversion functions
  const romanToArabic = useCallback((roman: string): number => {
    if (!roman) return 0;
    
    const upperRoman = roman.toUpperCase();
    if (!isValidRomanNumeral(upperRoman)) {
      throw new Error('Invalid Roman numeral format');
    }

    let result = 0;
    let prevValue = 0;

    for (let i = upperRoman.length - 1; i >= 0; i--) {
      const char = upperRoman[i] as RomanNumeral;
      const value = romanToArabicMap[char];
      result += value >= prevValue ? value : -value;
      prevValue = value;
    }
    
    return result;
  }, []);

  const arabicToRoman = useCallback((num: number): string => {
    if (num < MIN_ROMAN_VALUE || num > MAX_ROMAN_VALUE) {
      throw new Error(`Number must be between ${MIN_ROMAN_VALUE} and ${MAX_ROMAN_VALUE}`);
    }

    const romanValues = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];

    let result = '';
    for (const { value, numeral } of romanValues) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  }, []);

  // Track tool usage
  useEffect(() => {
    updateToolUsage('roman_numeral');
  }, []);

  // Auto-convert Roman to Arabic
  useEffect(() => {
    if (state.romanInput.trim()) {
      handleRomanToArabic();
    } else {
      setState(prev => ({ ...prev, arabicResult: '', errorRoman: '' }));
    }
  }, [state.romanInput]);

  // Auto-convert Arabic to Roman
  useEffect(() => {
    if (state.arabicInput.trim()) {
      handleArabicToRoman();
    } else {
      setState(prev => ({ ...prev, romanResult: '', errorArabic: '' }));
    }
  }, [state.arabicInput]);

  const handleRomanToArabic = useCallback(() => {
    if (!state.romanInput.trim()) {
      setState(prev => ({ ...prev, errorRoman: 'Roman numeral input cannot be empty', arabicResult: '' }));
      return;
    }
    
    try {
      const result = romanToArabic(state.romanInput);
      if (result < MIN_ROMAN_VALUE || result > MAX_ROMAN_VALUE) {
        throw new Error(`Result must be between ${MIN_ROMAN_VALUE} and ${MAX_ROMAN_VALUE}`);
      }
      setState(prev => ({ ...prev, arabicResult: result.toString(), errorRoman: '' }));
    } catch (err: any) {
      setState(prev => ({ ...prev, errorRoman: err.message || 'Invalid Roman numeral', arabicResult: '' }));
    }
  }, [state.romanInput, romanToArabic]);

  const handleArabicToRoman = useCallback(() => {
    if (!state.arabicInput.trim()) {
      setState(prev => ({ ...prev, errorArabic: 'Number input cannot be empty', romanResult: '' }));
      return;
    }
    
    const num = Number(state.arabicInput);
    if (!Number.isInteger(num) || num < MIN_ROMAN_VALUE || num > MAX_ROMAN_VALUE) {
      setState(prev => ({ 
        ...prev, 
        errorArabic: `Number must be an integer between ${MIN_ROMAN_VALUE} and ${MAX_ROMAN_VALUE}`,
        romanResult: '' 
      }));
      return;
    }
    
    try {
      const result = arabicToRoman(num);
      setState(prev => ({ ...prev, romanResult: result, errorArabic: '' }));
    } catch (err: any) {
      setState(prev => ({ ...prev, errorArabic: err.message || 'Failed to convert to Roman numeral', romanResult: '' }));
    }
  }, [state.arabicInput, arabicToRoman]);

  const handleClearRoman = useCallback(() => {
    setState(prev => ({ ...prev, romanInput: '', arabicResult: '', errorRoman: '' }));
  }, []);

  const handleClearArabic = useCallback(() => {
    setState(prev => ({ ...prev, arabicInput: '', romanResult: '', errorArabic: '' }));
  }, []);

  const handleRomanInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      if (ROMAN_NUMERAL_REGEX.test(value) || value === '') {
        setState(prev => ({ ...prev, romanInput: value }));
      }
      inputRef.current?.focus();
    }, []);

  const handleArabicInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (NUMERIC_REGEX.test(value) || value === '') {
      setState(prev => ({ ...prev, arabicInput: value }));
    }
    inputRef.current?.focus();
  }, []);

  // Destructure state for cleaner template
  const { romanInput, arabicInput, romanResult, arabicResult, errorRoman, errorArabic } = state;

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        {/* Roman to Arabic Section */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Roman to Arabic</h3>
            <ClearButton 
              onClick={handleClearRoman} 
              disabled={!romanInput && !arabicResult && !errorRoman} 
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label" htmlFor="roman-input">
                Roman Numeral:
              </label>
              <input
                id="roman-input"
                value={romanInput}
                onChange={handleRomanInputChange}
                className="input-field w-full  min-h-[44px]"
                placeholder="Enter Roman numeral (I, V, X, L, C, D, M)"
                aria-describedby={errorRoman ? 'roman-error' : undefined}
                aria-label="Roman numeral input"
              />
            </div>
            <div className="flex-1">
              <label className="form-label">
                Arabic Number:
              </label>
              <div className="relative">
                <div className="input-field min-h-[44px]">
                  {arabicResult || ' '}
                </div>
                {arabicResult && (
                  <div className="absolute right-2 top-2">
                    <CopyButton text={arabicResult} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <ErrorBox message={errorRoman} id={errorRoman ? 'roman-error' : undefined} />
        </SectionCard>

        {/* Arabic to Roman Section */}
        <SectionCard className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Arabic to Roman</h3>
            <ClearButton 
              onClick={handleClearArabic} 
              disabled={!arabicInput && !romanResult && !errorArabic} 
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label" htmlFor="arabic-input">
                Arabic Number (1-3999):
              </label>
              <input
                id="arabic-input"
                value={arabicInput}
                onChange={handleArabicInputChange}
                className="input-field w-full  min-h-[44px]"
                placeholder="Enter number (1-3999)"
                aria-describedby={errorArabic ? 'arabic-error' : undefined}
                aria-label="Arabic number input"
              />
            </div>
            <div className="flex-1">
              <label className="form-label">
                Roman Numeral:
              </label>
              <div className="relative">
                <div className="input-field w-full mono-output bg-gray-100 p-2 min-h-[44px]">
                  {romanResult || ' '}
                </div>
                {romanResult && (
                  <div className="absolute right-2 top-2">
                    <CopyButton text={romanResult} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <ErrorBox message={errorArabic} id={errorArabic ? 'arabic-error' : undefined} />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}