import { useEffect, useState, useRef, useCallback } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';
import ToggleSwitch from '../../components/ToggleSwitch';
import { ArrowDownUp } from 'lucide-react';

function URLEncoderDecoder() {
  const seo = seoDescriptions.urlEncoder;
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('eurl');
  }, []);

  // Auto-process text when input changes or mode changes
  useEffect(() => {
    if (inputText.trim()) {
      processText();
    } else {
      setOutputText('');
      setError('');
    }
  }, [inputText, mode]);

  const processText = useCallback(() => {
    if (!inputText.trim()) {
      setError(`Please enter text to ${mode === 'encode' ? 'encode' : 'decode'}`);
      setOutputText('');
      return;
    }
    
    try {
      const result = mode === 'encode' 
        ? encodeURIComponent(inputText)
        : decodeURIComponent(inputText);
      setOutputText(result);
      setError('');
    } catch (err: any) {
      setError(err.message || 
        (mode === 'encode' 
          ? 'Failed to encode text' 
          : 'Failed to decode text. Ensure the input is a valid URL-encoded string.')
      );
      setOutputText('');
    }
  }, [inputText, mode]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setError('');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textRef.current) {
      textRef.current.focus();
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as 'encode' | 'decode');
  };

  const handleSwapTexts = () => {
    setInputText(outputText);
    setOutputText(inputText);
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {mode === 'encode' ? 'URL Encoder' : 'URL Decoder'}
              </h3>
              <ToggleSwitch
                options={[
                  { value: 'encode', label: 'Encode' },
                  { value: 'decode', label: 'Decode' },
                ]}
                selected={mode}
                onChange={handleModeChange}
              />
            </div>
            <ClearButton 
              onClick={handleClear} 
              disabled={inputText === '' && outputText === '' && error === ''} 
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label" htmlFor="input-text">
                {mode === 'encode' ? 'Text to Encode' : 'Encoded URL to Decode'}
              </label>
              <AutoTextarea
                id="input-text"
                value={inputText}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder={mode === 'encode' ? 'Enter text to encode' : 'Enter encoded URL to decode'}
                ref={textRef}
                aria-describedby={error ? 'url-error' : undefined}
                aria-label={mode === 'encode' ? 'Text to encode' : 'Text to decode'}
              />
            </div>

            {outputText && (
              <div className="flex justify-center my-2">
                <button
                  onClick={handleSwapTexts}
                  className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-2 py-1 rounded"
                  aria-label="Swap input and output"
                  title="Swap input and output"
                >
                  <ArrowDownUp className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                </button>
              </div>
            )}

            {outputText && (
              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label">
                    {mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}
                  </label>
                  <CopyButton text={outputText} />
                </div>
                <div className="inner-result scrollbox max-h-[30rem]">
                  <div className="flex-1 mono-output" aria-label="Result">
                    {outputText}
                  </div>
                </div>
              </div>
            )}

            <ErrorBox message={error} id={error ? 'url-error' : undefined} />
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default URLEncoderDecoder;