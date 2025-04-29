import { useState } from 'react';
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

const BASE_OPTIONS = [
  { value: 2, label: '2 (Binary)' },
  { value: 8, label: '8 (Octal)' },
  { value: 10, label: '10 (Decimal)' },
  { value: 16, label: '16 (Hexadecimal)' },
];

function TextBaseConverter() {
  const seo = seoDescriptions.textBase;

  const [inputText, setInputText] = useState('');
  const [baseInput, setBaseInput] = useState('');
  const [targetBase, setTargetBase] = useState('2');
  const [sourceBase, setSourceBase] = useState('2');
  const [convertedToBase, setConvertedToBase] = useState<string>('');
  const [convertedToText, setConvertedToText] = useState<string>('');
  const [textError, setTextError] = useState<string | null>(null);
  const [baseError, setBaseError] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingBase, setIsLoadingBase] = useState(false);

  const isValidInput = (text: string) => /^[0-9a-zA-Z\s]*$/.test(text);

  const handleTextToBase = async () => {
    if (!inputText.trim()) return setTextError('Input text cannot be empty');
    if (!isValidInput(inputText)) return setTextError('Only alphanumeric characters are allowed.');

    setIsLoadingText(true);
    setTextError(null);
    try {
      const response = await api.post('/text-base/text-to-base', {
        input_text: inputText,
        target_base: parseInt(targetBase, 10),
      });
      setConvertedToBase(response.data.result);
    } catch (err: any) {
      setConvertedToBase('');
      setTextError(err.response?.data?.detail || 'Error converting text to base.');
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleBaseToText = async () => {
    if (!baseInput.trim()) return setBaseError('Base input cannot be empty');
    if (!isValidInput(baseInput)) return setBaseError('Only alphanumeric characters and spaces are allowed.');

    setIsLoadingBase(true);
    setBaseError(null);
    try {
      const response = await api.post('/text-base/base-to-text', {
        base_text: baseInput,
        source_base: parseInt(sourceBase, 10),
      });
      setConvertedToText(response.data.result);
    } catch (err: any) {
      setConvertedToText('');
      setBaseError(err.response?.data?.detail || 'Error converting base to text.');
    } finally {
      setIsLoadingBase(false);
    }
  };

  const handleTextClear = () => {
    setInputText('');
    setConvertedToBase('');
    setTextError(null);
  };

  const handleBaseClear = () => {
    setBaseInput('');
    setConvertedToText('');
    setBaseError(null);
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
                <h3 className="text-lg font-semibold">Text ➔ Base Conversion</h3>
                <ClearButton onClick={handleTextClear} disabled={!inputText} />
            </div>
            <div className="flex-1 space-y-4">
                <label className="form-label">Input Text:</label>
                <input
                type="text"
                maxLength={100}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input-field"
                placeholder="Enter text (max 100 characters)"
                />
            </div>
            <div className="flex gap-2 mt-4 items-center">
                <label className="form-label w-24 whitespace-nowrap">Target Base:</label>
                <select
                    value={targetBase}
                    onChange={(e) => setTargetBase(e.target.value)}
                    className="input-field flex-1"
                >
                    {BASE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))}
                </select>
                <LoadingButton onClick={handleTextToBase} isLoading={isLoadingText}>Convert</LoadingButton>
            </div>

            {convertedToBase && (
              <div className="result-box mt-4">
                <div className="flex items-center justify-between">
                  <div className="w-full mono-output break-all">{convertedToBase}</div>
                  <CopyButton text={convertedToBase} />
                </div>
              </div>
            )}
          <ErrorBox message={textError} />
        </SectionCard>

        <SectionCard>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Base ➔ Text Conversion</h3>
                <ClearButton onClick={handleBaseClear} disabled={!baseInput} />
            </div>
            <div className="flex-1 space-y-4">
                <label className="form-label">Base Input:</label>
                <input
                type="text"
                maxLength={100}
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                className="input-field"
                placeholder="Enter text (max 100 characters)"
                />
            </div>
            <div className="flex gap-2 mt-4 items-center">
                <label className="form-label w-24 whitespace-nowrap">Source Base:</label>
                <select
                    value={sourceBase}
                    onChange={(e) => setSourceBase(e.target.value)}
                    className="input-field flex-1"
                >
                    {BASE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))}
                </select>
                <LoadingButton onClick={handleBaseToText} isLoading={isLoadingBase}>Convert</LoadingButton>
            </div>

            {convertedToText && (
              <div className="result-box mt-4">
                <div className="flex items-center justify-between">
                  <div className="w-full mono-output break-all">{convertedToText}</div>
                  <CopyButton text={convertedToText} />
                </div>
              </div>
            )}
          <ErrorBox message={baseError} />
        </SectionCard>
      </div>
    </>
  );
}

export default TextBaseConverter;
