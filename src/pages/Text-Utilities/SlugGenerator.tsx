import { useEffect, useState, useCallback } from 'react';
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
import AutoTextarea from '../../hooks/useAutoSizeTextArea';

// Constants
const MAX_INPUT_LENGTH = 1000;
const PRESETS = [
  { 
    name: 'URL Slug',
    separator: '-',
    caseType: 'lowercase',
    description: 'Standard URL format (hyphen-separated, lowercase)'
  },
  {
    name: 'Filename',
    separator: '_',
    caseType: 'lowercase',
    description: 'Filesystem-friendly format (underscore-separated)'
  },
  {
    name: 'Constant Case',
    separator: '_',
    caseType: 'uppercase',
    description: 'CONSTANT_CASE format (uppercase with underscores)'
  }
] as const;

const SEPARATORS = [
  { value: '-', label: 'Hyphen (-)' },
  { value: '_', label: 'Underscore (_)' },
  { value: '.', label: 'Dot (.)' },
  { value: '', label: 'None (concatenated)' },
] as const;

const CASES = [
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'preserve', label: 'Preserve Original' },
] as const;

function SlugGenerator() {
  const seo = seoDescriptions.slug;
  const [text, setText] = useState('');
  const [separator, setSeparator] = useState<typeof SEPARATORS[number]['value']>('-');
  const [caseType, setCaseType] = useState<typeof CASES[number]['value']>('lowercase');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    updateToolUsage('slug');
  }, []);

  const generateSlug = useCallback((text: string, separator: string, caseType: string): string => {
    if (!text.trim()) return '';

    try {
      let slug = text
        .normalize('NFKD') // Normalize Unicode
        .replace(/[^\w\s~-]/g, '') // Remove non-alphanumeric (except spaces, ~, -)
        .trim()
        .replace(/[-\s]+/g, separator) // Replace spaces and hyphens with separator
        .replace(new RegExp(`\\${separator}{2,}`, 'g'), separator) // Replace multiple separators
        .replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), ''); // Trim separators

      if (!slug) {
        setError('Input text produced an empty slug. Please use alphanumeric characters.');
        return '';
      }

      switch (caseType) {
        case 'uppercase':
          return slug.toUpperCase();
        case 'lowercase':
          return slug.toLowerCase();
        default:
          return slug;
      }
    } catch (err) {
      setError('Slug generation failed. Please check your inputs.');
      return '';
    }
  }, []);

  useEffect(() => {
    setError(null);
    const generated = generateSlug(text, separator, caseType);
    setResult(generated);
  }, [text, separator, caseType, generateSlug]);

  const handleClear = () => {
    setText('');
    setSeparator('-');
    setCaseType('lowercase');
    setResult('');
    setError(null);
    setCopied(false);
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setSeparator(preset.separator);
    setCaseType(preset.caseType);
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
            <h3 className="text-lg font-semibold">Slug Generator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!text && !result && !error}
              aria-label="Clear all inputs and results"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="text" className="form-label">
              Text ({text.length}/{MAX_INPUT_LENGTH} characters):
            </label>
            <AutoTextarea
              id="text"
              className="input-field"
              placeholder="e.g., Hello World! This is a Test"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_INPUT_LENGTH}
              aria-label="Input text for slug generation"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="separator" className="form-label">
                Separator:
              </label>
              <select
                id="separator"
                value={separator}
                onChange={(e) => setSeparator(e.target.value as typeof SEPARATORS[number]['value'])}
                className="input-field"
                aria-label="Select separator"
              >
                {SEPARATORS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="case" className="form-label">
                Case:
              </label>
              <select
                id="case"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value as typeof CASES[number]['value'])}
                className="input-field"
                aria-label="Select case type"
              >
                {CASES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Quick Presets:</label>
              <select
                onChange={(e) => {
                  const preset = PRESETS.find(p => p.name === e.target.value);
                  if (preset) applyPreset(preset);
                }}
                className="input-field"
                aria-label="Select preset"
                defaultValue=""
              >
                <option value="" disabled>Select a preset...</option>
                {PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} - {p.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Generated Slug</label>
              <div className="flex items-center gap-2">
                {copied && <span className="text-sm text-green-600">Copied!</span>}
                <CopyButton 
                  text={result} 
                  aria-label="Copy generated slug" 
                />
              </div>
            </div>
            {result && (
              <div className="scrollbox mt-2">
                <div className="inner-result whitespace-pre-wrap break-all">
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

export default SlugGenerator;