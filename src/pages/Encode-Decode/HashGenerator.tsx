import { useCallback, useEffect, useState, useMemo } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';
import useDebounce from '../../hooks/useDebounce';

type HashAlgorithm = 'sha1' | 'sha256' | 'sha512';

interface HashResponse {
  text: string;
  algorithm: HashAlgorithm;
  hashedText: string;
  timestamp: number;
}

const ALGORITHM_MAP: Record<HashAlgorithm, string> = {
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512',
};

const ALGORITHM_OPTIONS: { value: HashAlgorithm; label: string }[] = [
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha512', label: 'SHA-512' },
];

async function generateHash(text: string, algorithm: HashAlgorithm): Promise<HashResponse> {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(trimmedText);
    const hashBuffer = await crypto.subtle.digest(ALGORITHM_MAP[algorithm], data);
    
    // Convert buffer to hex string more efficiently
    const hashArray = new Uint8Array(hashBuffer);
    const hashedText = Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      text: trimmedText,
      algorithm,
      hashedText,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Failed to generate hash: ${error.message}`
        : 'Failed to generate hash: Unknown error'
    );
  }
}

function HashGenerator() {
  const seo = seoDescriptions.hashGenerator;
  const [inputText, setInputText] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha256');
  const [hashResult, setHashResult] = useState<HashResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedInputText = useDebounce(inputText, 300);
  const hasInput = useMemo(() => debouncedInputText.trim() !== '', [debouncedInputText]);

  // Track tool usage
  useEffect(() => {
    updateToolUsage('hash');
  }, []);

  // Generate hash when input or algorithm changes
  useEffect(() => {
    if (!hasInput) {
      setHashResult(null);
      setError('');
      return;
    }

    const fetchHash = async () => {
      setIsLoading(true);
      try {
        const result = await generateHash(debouncedInputText, algorithm);
        setHashResult(result);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate hash');
        setHashResult(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHash();
  }, [debouncedInputText, algorithm, hasInput]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  }, []);

  const handleAlgorithmChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setAlgorithm(e.target.value as HashAlgorithm);
  }, []);

  const handleClearAll = useCallback(() => {
    setInputText('');
    setAlgorithm('sha256');
    setHashResult(null);
    setError('');
  }, []);

  const isClearDisabled = useMemo(
    () => inputText === '' && algorithm === 'sha256',
    [inputText, algorithm]
  );

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h1 className="text-2xl font-bold mb-6">{seo.title}</h1>
        <SEODescription title={'a ' + seo.title}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Generate Cryptographic Hash</h2>
            <ClearButton 
              onClick={handleClearAll} 
              disabled={isClearDisabled} 
              aria-label="Clear all inputs"
            />
          </div>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="hash-input">
                Input Text:
              </label>
              <AutoTextarea
                id="hash-input"
                value={inputText}
                onChange={handleInputChange}
                className="input-field"
                disabled={isLoading}
                placeholder="Enter text to hash"
                aria-describedby={error ? 'hash-error' : undefined}
                aria-busy={isLoading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="form-label" htmlFor="hash-algorithm">
                  Algorithm:
                </label>
                <select
                  id="hash-algorithm"
                  value={algorithm}
                  onChange={handleAlgorithmChange}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                  aria-label="Select hash algorithm"
                >
                  {ALGORITHM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="my-4" aria-live="polite">
              <p className="text-muted">Generating hash...</p>
            </div>
          )}

          {hashResult && (
            <div className="result-box" aria-live="polite">
              <label className="form-label">Result</label>
              <div className="inner-result">
                <div className="w-full mono-output" aria-label="Hashed result">
                  {hashResult.hashedText}
                </div>
                <CopyButton text={hashResult.hashedText} aria-label="Copy hash to clipboard" />
              </div>
              <p className="text-sm mt-2">
                Algorithm: {hashResult.algorithm.toUpperCase()}
              </p>
            </div>
          )}

          <ErrorBox message={error} id={error ? 'hash-error' : undefined} />
        </SectionCard>
      </div>
    </>
  );
}

export default HashGenerator;