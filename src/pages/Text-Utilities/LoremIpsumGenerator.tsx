import { useEffect, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import ErrorBox from '../../components/ErrorBox';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { updateToolUsage } from '../../utils/toolUsage';

// Classic Lorem Ipsum words
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum'
];

function LoremIpsumGenerator() {
  const seo = seoDescriptions.loremIpsum;
  const [type, setType] = useState('paragraph');
  const [count, setCount] = useState('2');
  const [format, setFormat] = useState('text');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const types = [
    { value: 'paragraph', label: 'Paragraph (1-50)' },
    { value: 'sentence', label: 'Sentence (1-100)' },
    { value: 'word', label: 'Word (1-1000)' },
  ];

  const formats = [
    { value: 'text', label: 'Text' },
    { value: 'html', label: 'HTML' },
  ];

  useEffect(() => {
    updateToolUsage('lorem');
  }, []);

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateWords = (count: number) => {
    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    return words;
  };

  const generateSentence = (isFirst: boolean = false) => {
    const wordCount = getRandomInt(5, 15);
    let words: string[];
    if (isFirst) {
      words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
      if (wordCount > 5) {
        words = words.concat(generateWords(wordCount - 5));
      }
    } else {
      words = generateWords(wordCount);
    }
    return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
  };

  const generateParagraph = () => {
    const sentenceCount = getRandomInt(3, 8);
    const sentences = ['Lorem ipsum dolor sit amet, ' + generateWords(getRandomInt(5, 10)).join(' ').toLowerCase() + '.'];
    for (let i = 1; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  };

  const generateLoremIpsum = (type: string, count: string, format: string): string => {
    setError(null);
    const countNum = parseInt(count, 10);

    if (!count || isNaN(countNum) || countNum < 1) {
      setError('Please enter a valid positive number.');
      return '';
    }

    if (type === 'paragraph' && countNum > 50) {
      setError('Paragraph count must be between 1 and 50.');
      return '';
    }
    if (type === 'sentence' && countNum > 100) {
      setError('Sentence count must be between 1 and 100.');
      return '';
    }
    if (type === 'word' && countNum > 1000) {
      setError('Word count must be between 1 and 1000.');
      return '';
    }

    try {
      let output: string[] = [];
      if (type === 'paragraph') {
        for (let i = 0; i < countNum; i++) {
          output.push(generateParagraph());
        }
        if (format === 'html') {
          return output.map(p => `<p>${p}</p>`).join('\n\n');
        }
        return output.join('\n\n');
      } else if (type === 'sentence') {
        output.push(generateSentence(true)); // First sentence starts with "Lorem ipsum dolor sit amet"
        for (let i = 1; i < countNum; i++) {
          output.push(generateSentence());
        }
      } else if (type === 'word') {
        output = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
        if (countNum > 5) {
          output = output.concat(generateWords(countNum - 5));
        } else {
          output = output.slice(0, countNum);
        }
      }
      return output.join(format === 'html' ? ' ' : ' ');
    } catch (err) {
      setError('Generation failed.');
      return '';
    }
  };

  useEffect(() => {
    const generated = generateLoremIpsum(type, count, format);
    setResult(generated);
  }, [type, count, format]);

  const handleClear = () => {
    setType('paragraph');
    setCount('2');
    setFormat('text');
    setResult('');
    setError(null);
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

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Lorem Ipsum Generator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!count && !result && !error}
              aria-label="Clear all inputs and results"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4 items-center">
            <div className="flex-1">
              <label htmlFor="type" className="form-label">
                Type:
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-field"
                aria-label="Select Lorem Ipsum type"
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="count" className="form-label">
                Count {type === 'paragraph' ? '(1-50)' : type === 'sentence' ? '(1-100)' : '(1-1000)'}:
              </label>
              <input
                id="count"
                type="number"
                className="input-field"
                placeholder="Enter count"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max={type === 'paragraph' ? '20' : type === 'sentence' ? '50' : '100'}
                aria-label="Input count for Lorem Ipsum generation"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="format" className="form-label">
                Output Format:
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="input-field"
                aria-label="Select output format"
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Generated Text</label>
              <CopyButton text={result} aria-label="Copy generated Lorem Ipsum text" />
            </div>
            {result && (
              <div className="scrollbox mt-2">
                <div className="inner-result font-mono whitespace-pre-wrap break-all">
                  {result}
                </div>
              </div>
            )}
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
      </div>
    </>
  );
}

export default LoremIpsumGenerator;