import { useEffect, useState, useRef } from 'react';
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

function isPalindrome(str: string): boolean {
  const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalized === normalized.split('').reverse().join('');
}

export default function PalindromeChecker() {
  const seo = seoDescriptions.palindromeChecker || {
    title: 'Palindrome Checker',
    body: 'Check if a string is a palindrome by comparing it to its reverse.',
  };
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('palindrome');
  }, []);

  // Auto-check palindrome when input changes
  useEffect(() => {
    if (input.trim()) {
      handleCheck();
    } else {
      setResult('');
      setError('');
    }
  }, [input]);

  const handleCheck = () => {
    if (!input.trim()) {
      setError('Input text cannot be empty');
      setResult('');
      return;
    }
    try {
      const isPal = isPalindrome(input);
      setResult(`The string '${input}' is ${isPal ? '' : 'not '}a palindrome`);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to check palindrome');
      setResult('');
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.focus();
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
            <h3 className="text-lg font-semibold">Palindrome Checker</h3>
            <ClearButton onClick={handleClear} disabled={input === '' && result === '' && error === ''} />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="palindrome-input">
                Input Text:
              </label>
              <AutoTextarea
                id="palindrome-input"
                value={input}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Enter text to check if it's a palindrome"
                ref={inputRef}
                aria-describedby={error ? 'palindrome-error' : undefined}
                aria-label="Text to check for palindrome"
              />
            </div>
          </div>

          {result && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Result</label>
                <CopyButton text={result} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output" aria-label="Palindrome check result">
                    {result}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={error} id={error ? 'palindrome-error' : undefined} />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}