import { useEffect, useState, useRef } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';

function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

function rotateString(str: string, n: number): string {
  const len = str.length;
  const rotation = ((n % len) + len) % len;
  return str.slice(rotation) + str.slice(0, rotation);
}

export default function StringReverserRotator() {
  const seo = seoDescriptions.stringReverser;
  const [reverseInput, setReverseInput] = useState('');
  const [rotateInput, setRotateInput] = useState('');
  const [reverseResult, setReverseResult] = useState('');
  const [rotateResult, setRotateResult] = useState('');
  const [rotateBy, setRotateBy] = useState(3);
  const [errorReverse, setErrorReverse] = useState('');
  const [errorRotate, setErrorRotate] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('string_reverser_rotator');
  }, []);

  // Auto-reverse when input changes
  useEffect(() => {
    if (reverseInput.trim()) {
      handleReverse();
    } else {
      setReverseResult('');
      setErrorReverse('');
    }
  }, [reverseInput]);

  // Auto-rotate when input or rotateBy changes
  useEffect(() => {
    if (rotateInput.trim() && Number.isInteger(rotateBy) && rotateBy >= -100 && rotateBy <= 100) {
      handleRotate();
    } else {
      setRotateResult('');
      setErrorRotate('');
    }
  }, [rotateInput, rotateBy]);

  const handleReverse = () => {
    if (!reverseInput.trim()) {
      setErrorReverse('Input text cannot be empty');
      setReverseResult('');
      return;
    }
    try {
      const result = reverseString(reverseInput);
      setReverseResult(result);
      setErrorReverse('');
    } catch (err: any) {
      setErrorReverse(err.message || 'Failed to reverse string');
      setReverseResult('');
    }
  };

  const handleRotate = () => {
    if (!rotateInput.trim()) {
      setErrorRotate('Input text cannot be empty');
      setRotateResult('');
      return;
    }
    if (!Number.isInteger(rotateBy) || rotateBy < -100 || rotateBy > 100) {
      setErrorRotate('Rotation must be an integer between -100 and 100');
      setRotateResult('');
      return;
    }
    try {
      const result = rotateString(rotateInput, rotateBy);
      setRotateResult(result);
      setErrorRotate('');
    } catch (err: any) {
      setErrorRotate(err.message || 'Failed to rotate string');
      setRotateResult('');
    }
  };

  const handleClearReverse = () => {
    setReverseInput('');
    setReverseResult('');
    setErrorReverse('');
  };

  const handleClearRotate = () => {
    setRotateInput('');
    setRotateResult('');
    setRotateBy(3);
    setErrorRotate('');
  };

  const handleReverseInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReverseInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRotateInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRotateInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRotateByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^-?\d*$/.test(value)) {
      const numValue = value === '' ? 0 : Number(value);
      setRotateBy(Math.max(-100, Math.min(100, numValue)));
    }
  };

  const incrementRotateBy = () => {
    setRotateBy((prev) => Math.min(prev + 1, 100));
  };

  const decrementRotateBy = () => {
    setRotateBy((prev) => Math.max(prev - 1, -100));
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

        {/* Reverse String Section */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Reverse String</h3>
            <ClearButton onClick={handleClearReverse} disabled={reverseInput === '' && reverseResult === '' && errorReverse === ''} />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="string-input">
                Input Text:
              </label>
              <AutoTextarea
                id="string-input"
                value={reverseInput}
                onChange={handleReverseInputChange}
                className="input-field w-full"
                placeholder="Enter text to reverse"
                ref={inputRef}
                aria-describedby={errorReverse ? 'string-reverse-error' : undefined}
                aria-label="Text to reverse"
              />
            </div>
          </div>

          {reverseResult && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Reversed Result</label>
                <CopyButton text={reverseResult} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output" aria-label="Reversed result">
                    {reverseResult}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={errorReverse} id={errorReverse ? 'string-reverse-error' : undefined} />
        </SectionCard>

        {/* Rotate String Section */}
        <SectionCard className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Rotate String</h3>
            <ClearButton onClick={handleClearRotate} disabled={rotateInput === '' && rotateResult === '' && rotateBy === 0 && errorRotate === ''} />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="string-input-rotate">
                Input Text:
              </label>
              <AutoTextarea
                id="string-input-rotate"
                value={rotateInput}
                onChange={handleRotateInputChange}
                className="input-field w-full"
                placeholder="Enter text to rotate"
                ref={inputRef}
                aria-describedby={errorRotate ? 'string-rotate-error' : undefined}
                aria-label="Text to rotate"
              />
            </div>
            <div className='flex items-center gap-4 mt-4 mb-2'>
              <label className="form-label" htmlFor="rotate-by-input">
                Rotate By (-100 to 100):
              </label>
              <div className="flex items-center">
                <input
                  id="rotate-by-input"
                  type="number"
                  min="-100"
                  max="100"
                  value={rotateBy}
                  onChange={handleRotateByChange}
                  className="input-field w-20 text-right pr-2"
                  placeholder="-100 to 100"
                  aria-describedby={errorRotate ? 'string-rotate-error' : undefined}
                />
                <div className="flex flex-col ml-1">
                  <button
                    onClick={incrementRotateBy}
                    disabled={rotateBy >= 100}
                    className="toggle-count"
                    aria-label="Increment rotation"
                  >
                    +
                  </button>
                  <button
                    onClick={decrementRotateBy}
                    disabled={rotateBy <= -100}
                    className="toggle-count"
                    aria-label="Decrement rotation"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
            <LoadingButton onClick={handleRotate} isLoading={false}>
              Rotate
            </LoadingButton>
          </div>

          {rotateResult && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Rotated Result</label>
                <CopyButton text={rotateResult} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output" aria-label="Rotated result">
                    {rotateResult}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={errorRotate} id={errorRotate ? 'string-rotate-error' : undefined} />
        </SectionCard>
      </div>
    </>
  );
}