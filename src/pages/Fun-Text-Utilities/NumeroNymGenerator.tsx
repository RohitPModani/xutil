import { useState, useRef, useEffect } from 'react';
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
import AutoTextarea from '../../hooks/useAutoSizeTextArea';

export default function NumeronymGenerator() {
  const seo = seoDescriptions.numeronym;

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [minLength, setMinLength] = useState(4);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('numeronym');
  }, []);

  useEffect(() => {
    if (input.trim()) {
      generateNumeronym();
    } else {
      setOutput('');
      setError('');
    }
  }, [input, minLength]);

  const generateNumeronym = () => {
    try {
      const result = input
        .split(/(\s+)/)
        .map(token => {
          // Handle whitespace
          if (token.trim() === '') return token;
          
          // Handle punctuation and special characters
          const punctuationMatch = token.match(/^(\W*)(\w+)(\W*)$/);
          if (!punctuationMatch) return token;
          
          const [_, leadingPunct, word, trailingPunct] = punctuationMatch;
          if (word.length < minLength) return token;
          
          const numeronym = createNumeronym(word);
          return leadingPunct + numeronym + trailingPunct;
        })
        .join('');

      setOutput(result);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error generating numeronym');
      setOutput('');
    }
  };

  const createNumeronym = (word: string) => {
    if (word.length < minLength) return word;
    
    const firstChar = word[0];
    const lastChar = word[word.length - 1];
    const middleCount = word.length - 2;
    
    // Preserve case of first character
    const formattedFirstChar = word === word.toUpperCase()
      ? firstChar.toUpperCase()
      : firstChar.toLowerCase();
    
    // Preserve case of last character if word is all uppercase
    const formattedLastChar = word === word.toUpperCase()
      ? lastChar.toUpperCase()
      : lastChar.toLowerCase();
    
    return `${formattedFirstChar}${middleCount}${formattedLastChar}`;
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleMinLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinLength(Number(e.target.value));
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={'a ' + seo.title}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Numeronym Generator</h3>
            <ClearButton 
              onClick={handleClear} 
              disabled={input === '' && output === '' && error === ''} 
            />
          </div>
          <div className="space-y-4 mb-4">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <label className="form-label" htmlFor="numeronym-input">
                  Input Text:
                </label>
                <AutoTextarea
                  id="numeronym-input"
                  value={input}
                  onChange={handleInputChange}
                  ref={inputRef}
                  className="input-field w-full"
                  placeholder="Enter text to convert to numeronyms"
                  aria-describedby={error ? 'numeronym-error' : undefined}
                  aria-label="Text input for numeronym generation"
                />
              </div>
              <div className='flex flex-row items-center gap-4'>
                <label className="form-label sm:w-40 w-64" htmlFor="min-length">
                  Minimum Length:
                </label>
                <select
                  id="min-length"
                  value={minLength}
                  onChange={handleMinLengthChange}
                  className="input-field w-full"
                >
                  <option value="3">3+ letters</option>
                  <option value="4">4+ letters</option>
                  <option value="5">5+ letters</option>
                  <option value="6">6+ letters</option>
                </select>
              </div>
            </div>
          </div>
          {output && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Numeronym Output</label>
                <CopyButton text={output} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output" aria-label="Numeronym output">
                    {output}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={error} id={error ? 'numeronym-error' : undefined} />
        </SectionCard>

        <SectionCard className="mt-6">
          <h3 className="text-lg font-semibold mb-4">About Numeronyms</h3>
          <div className="prose text-zinc-900 dark:text-white ">
            <p className="mb-4">
              Numeronyms are abbreviations where the middle letters are replaced with their count.
              Commonly used in tech (like i18n for "internationalization" or a11y for "accessibility").
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className='text-zinc-900 dark:text-white'>i18n</strong> - internationalization (18 letters between i and n)</li>
              <li><strong className='text-zinc-900 dark:text-white'>l10n</strong> - localization (10 letters between l and n)</li>
              <li><strong className='text-zinc-900 dark:text-white'>k8s</strong> - kubernetes (8 letters between k and s)</li>
              <li><strong className='text-zinc-900 dark:text-white'>a11y</strong> - accessibility (11 letters between a and y)</li>
            </ul>
          </div>
        </SectionCard>
      </div>
    </>
  );
}