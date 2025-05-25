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
import useDebounce from '../../hooks/useDebounce';

type CipherType = 'rot13' | 'caesar';

interface ROT13Response {
  input_text: string;
  output_text: string;
}

interface CaesarResponse {
  input_text: string;
  shift: number;
  output_text: string;
}

type CipherResponse = ROT13Response | CaesarResponse;

const MAX_SHIFT = 100;
const MIN_SHIFT = -100;
const DEBOUNCE_DELAY = 300;

function rot13(text: string): string {
  return text.replace(/[A-Za-z]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

function caesar(text: string, shift: number): string {
  const normalizedShift = ((shift % 26) + 26) % 26;
  return text.replace(/[A-Za-z]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + normalizedShift) % 26) + base);
  });
}

function CipherEncoderDecoder() {
  const seo = seoDescriptions.cipherEncoder;
  const [inputText, setInputText] = useState('');
  const [cipherType, setCipherType] = useState<CipherType>('rot13');
  const [shift, setShift] = useState(3);
  const [shiftInput, setShiftInput] = useState('3'); // New state for input field
  const [result, setResult] = useState<CipherResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedInputText = useDebounce(inputText, DEBOUNCE_DELAY);
  const debouncedShift = useDebounce(shift, DEBOUNCE_DELAY);

  useEffect(() => {
    updateToolUsage('cipher');
  }, []);

  const applyCipher = useCallback(() => {
    if (!debouncedInputText.trim()) {
      setResult(null);
      setError('');
      setCharacterCount(0);
      return;
    }

    if (cipherType === 'caesar') {
      const num = Number(debouncedShift);
      if (!Number.isInteger(num) || num < MIN_SHIFT || num > MAX_SHIFT) {
        setError(`Shift must be an integer between ${MIN_SHIFT} and ${MAX_SHIFT}`);
        setResult(null);
        return;
      }
    }

    setIsLoading(true);
    try {
      let outputText: string;
      if (cipherType === 'rot13') {
        outputText = rot13(debouncedInputText);
        setResult({
          input_text: debouncedInputText,
          output_text: outputText,
        });
      } else {
        outputText = caesar(debouncedInputText, debouncedShift);
        setResult({
          input_text: debouncedInputText,
          shift: debouncedShift,
          output_text: outputText,
        });
      }
      setCharacterCount(debouncedInputText.length);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to apply cipher');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedInputText, cipherType, debouncedShift]);

  useEffect(() => {
    applyCipher();
  }, [debouncedInputText, cipherType, debouncedShift, applyCipher]);

  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow: '', '-', '+', or valid numbers (e.g., '-123', '123')
    if (/^[-+]?\d*$/.test(value)) {
      setShiftInput(value); // Update the input field value

      // Only update shift if the input is a valid number
      if (value !== '' && value !== '-' && value !== '+') {
        const num = Number(value);
        if (num >= MIN_SHIFT && num <= MAX_SHIFT) {
          setShift(num);
          setError('');
        } else {
          setError(`Shift must be between ${MIN_SHIFT} and ${MAX_SHIFT}`);
          setShift(num); // Still update shift for debouncing, but show error
        }
      } else {
        setError(''); // Clear error for incomplete inputs
      }
    }
  };

  const incrementShift = () => {
    const newShift = Math.min(shift + 1, MAX_SHIFT);
    setShift(newShift);
    setShiftInput(newShift.toString()); // Sync input field
    if (newShift >= MIN_SHIFT && newShift <= MAX_SHIFT) {
      setError('');
    }
  };

  const decrementShift = () => {
    const newShift = Math.max(shift - 1, MIN_SHIFT);
    setShift(newShift);
    setShiftInput(newShift.toString()); // Sync input field
    if (newShift >= MIN_SHIFT && newShift <= MAX_SHIFT) {
      setError('');
    }
  };

  const handleClearAll = () => {
    setInputText('');
    setCipherType('rot13');
    setShift(3);
    setShiftInput('3'); // Reset input field
    setResult(null);
    setError('');
    setCharacterCount(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
            <h3 className="text-lg font-semibold">Encode or Decode Text</h3>
            <ClearButton 
              onClick={handleClearAll} 
              disabled={inputText === '' && cipherType === 'rot13' && shift === 3} 
            />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="form-label" htmlFor="cipher-input">
                  Input Text:
                </label>
                {characterCount > 0 && (
                  <span className="text-sm text-gray-500">
                    {characterCount} character{characterCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <AutoTextarea
                id="cipher-input"
                value={inputText}
                onChange={handleInputChange}
                className="input-field w-full"
                disabled={isLoading}
                placeholder="Enter text to encode/decode"
                ref={textareaRef}
                aria-describedby={error ? 'cipher-error' : undefined}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="form-label" htmlFor="cipher-type">
                  Cipher Type:
                </label>
                <select
                  id="cipher-type"
                  value={cipherType}
                  onChange={(e) => setCipherType(e.target.value as CipherType)}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                >
                  <option value="rot13">ROT13</option>
                  <option value="caesar">Caesar</option>
                </select>
                {cipherType === 'caesar' && (
                  <div className="flex items-center gap-4 mt-4">
                    <label className="form-label" htmlFor="shift-input">
                      Shift ({MIN_SHIFT} to {MAX_SHIFT}):
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        id="shift-input"
                        value={shiftInput} // Bind to shiftInput
                        onChange={handleShiftChange}
                        className="input-field w-20 text-right pr-2"
                        disabled={isLoading}
                        aria-describedby={error ? 'cipher-error' : undefined}
                      />
                      <div className="flex flex-col ml-1">
                        <button
                          onClick={incrementShift}
                          disabled={isLoading || shift >= MAX_SHIFT}
                          className="toggle-count"
                          aria-label="Increment shift"
                        >
                          +
                        </button>
                        <button
                          onClick={decrementShift}
                          disabled={isLoading || shift <= MIN_SHIFT}
                          className="toggle-count"
                          aria-label="Decrement shift"
                        >
                          −
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {result && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Result</label>
                <CopyButton text={result.output_text} />
              </div>
              <div className="inner-result">
                <div className="w-full mono-output">{result.output_text}</div>
              </div>
              <p className="text-sm mt-2">
                Cipher: {cipherType === 'rot13' ? 'ROT13' : `Caesar (Shift: ${(result as CaesarResponse).shift})`}
              </p>
            </div>
          )}

          {isLoading && (
            <p className="text-muted">Processing...</p>
          )}

          <ErrorBox message={error} id={error ? 'cipher-error' : undefined} />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default CipherEncoderDecoder;