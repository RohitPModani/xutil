import { useState, useRef, useEffect, ChangeEvent } from 'react';
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

// Define interface for word frequency data
interface WordFrequency {
  word: string;
  count: number;
}

const WordFrequencyCounter: React.FC = () => {
  const seo = seoDescriptions.wordFrequencyCounter;

  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<WordFrequency[]>([]);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('word_frequency_counter');
  }, []);

  useEffect(() => {
    if (input.trim()) {
      calculateFrequencies();
    } else {
      setOutput([]);
      setError('');
    }
  }, [input]);

  const calculateFrequencies = (): void => {
    try {
      // Split input into words, remove punctuation, convert to lowercase
      const words: string[] = input
        .toLowerCase()
        .match(/\b\w+\b/g) || [];
      
      // Count frequencies
      const freqMap: { [key: string]: number } = {};
      words.forEach((word: string) => {
        freqMap[word] = (freqMap[word] || 0) + 1;
      });

      // Convert to array and sort: by frequency (descending), then alphabetically
      const freqArray: WordFrequency[] = Object.entries(freqMap)
        .map(([word, count]: [string, number]) => ({ word, count }))
        .sort((a: WordFrequency, b: WordFrequency) => b.count - a.count || a.word.localeCompare(b.word));

      setOutput(freqArray);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error calculating word frequencies');
      setOutput([]);
    }
  };

  const handleClear = (): void => {
    setInput('');
    setOutput([]);
    setError('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Format output for copying
  const getCopyableText = (): string => {
    if (!output.length) return '';
    const header: string = 'Word\tFrequency\n';
    const rows: string = output
      .map(({ word, count }: WordFrequency) => `${word}\t${count}`)
      .join('\n');
    return header + rows;
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
            <h3 className="text-lg font-semibold">Word Frequency Counter</h3>
            <ClearButton 
              onClick={handleClear} 
              disabled={input === '' && output.length === 0 && error === ''} 
            />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="frequency-input">
                Input Text:
              </label>
              <AutoTextarea
                id="frequency-input"
                value={input}
                onChange={handleInputChange}
                ref={inputRef}
                className="input-field w-full"
                placeholder="Enter text to count word frequencies (e.g., This is fun, this is great!)"
                aria-describedby={error ? 'frequency-error' : undefined}
                aria-label="Text input for word frequency counting"
              />
            </div>
          </div>
          {output.length > 0 && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Word Frequencies</label>
                <CopyButton text={getCopyableText()} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result scrollbar overflow-x-auto">
                  <table aria-label="Word frequency table">
                    <thead>
                      <tr>
                        <th className="text-left pr-4">Word</th>
                        <th className="text-left">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {output.map(({ word, count }: WordFrequency, index: number) => (
                        <tr key={index}>
                          <td className="pr-4">{word}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={error} id={error ? 'frequency-error' : undefined} />
        </SectionCard>

        <SectionCard className="mt-6">
          <h3 className="text-lg font-semibold mb-4">About Word Frequency Counter</h3>
          <div className="prose">
            <ul className="text-zinc-900 dark:text-white pl-5 space-y-2">
              <li>Counts the frequency of each word in your text</li>
              <li>Case-insensitive and ignores punctuation</li>
              <li>Sorts results by frequency (highest to lowest), then alphabetically</li>
              <li>Example: "This is fun, this is great!" shows "this: 2, is: 2, fun: 1, great: 1"</li>
              <li>Useful for text analysis, writing, and SEO optimization</li>
            </ul>
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
};

export default WordFrequencyCounter;