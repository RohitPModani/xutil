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

export default function PigLatinConverter() {
  const seo = seoDescriptions.pigLatin;

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('pig_latin');
  }, []);

  useEffect(() => {
    if (input.trim()) {
      convertToPigLatin();
    } else {
      setOutput('');
      setError('');
    }
  }, [input]);

  const convertToPigLatin = () => {
    try {
      const result = input
        .split(/(\s+)/)
        .map(word => {
          // Handle whitespace
          if (word.trim() === '') return word;
          
          // Handle punctuation and special characters
          const punctuationMatch = word.match(/^(\W+)(.*?)(\W*)$/);
          if (punctuationMatch) {
            const [_, leadingPunct, mainWord, trailingPunct] = punctuationMatch;
            if (mainWord === '') return word;
            return leadingPunct + convertWord(mainWord) + trailingPunct;
          }
          
          return convertWord(word);
        })
        .join('');

      setOutput(result);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error converting to Pig Latin');
      setOutput('');
    }
  };

  const convertWord = (word: string) => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const lowerWord = word.toLowerCase();
    
    // Find the first vowel index
    let firstVowelIndex = 0;
    while (firstVowelIndex < word.length && !vowels.includes(lowerWord[firstVowelIndex])) {
      firstVowelIndex++;
    }
    
    // Handle words starting with vowels
    if (firstVowelIndex === 0) {
      return word + 'way';
    }
    
    // Handle words starting with consonant clusters
    const beginning = word.slice(0, firstVowelIndex);
    const remaining = word.slice(firstVowelIndex);
    
    // Preserve capitalization
    if (word[0] === word[0].toUpperCase()) {
      return remaining[0].toUpperCase() + 
             remaining.slice(1) + 
             beginning.toLowerCase() + 'ay';
    }
    
    return remaining + beginning + 'ay';
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
            <h3 className="text-lg font-semibold">Pig Latin Converter</h3>
            <ClearButton 
              onClick={handleClear} 
              disabled={input === '' && output === '' && error === ''} 
            />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="pig-latin-input">
                English Text:
              </label>
              <AutoTextarea
                id="pig-latin-input"
                value={input}
                onChange={handleInputChange}
                ref={inputRef}
                className="input-field w-full"
                placeholder="Enter English text to convert to Pig Latin"
                aria-describedby={error ? 'pig-latin-error' : undefined}
                aria-label="Text input for Pig Latin conversion"
              />
            </div>
          </div>
          {output && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Pig Latin Translation</label>
                <CopyButton text={output} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output" aria-label="Pig Latin translation">
                    {output}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={error} id={error ? 'pig-latin-error' : undefined} />
        </SectionCard>

        <SectionCard className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Pig Latin Rules</h3>
          <div className="prose">
            <ul className="text-zinc-900 dark:text-white pl-5 space-y-2">
              <li>For words beginning with vowel sounds, add "way" to the end</li>
              <li>For words beginning with consonant sounds, move all consonants before the first vowel to the end and add "ay"</li>
              <li>Preserves capitalization and punctuation</li>
              <li>Example: "hello" becomes "ellohay", "apple" becomes "appleway"</li>
            </ul>
          </div>
        </SectionCard>
      </div>
    </>
  );
}