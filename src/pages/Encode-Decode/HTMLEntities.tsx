import { useEffect, useRef, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import api from '../../services/api';
import CopyButton from '../../components/CopyButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { updateToolUsage } from '../../utils/toolUsage';

interface HtmlEncodeResponse {
  original_text: string;
  encoded_text: string;
}

interface HtmlDecodeResponse {
  encoded_text: string;
  decoded_text: string;
}

function HtmlEntities() {
  const seo = seoDescriptions.htmlEntities;
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [inputText, setInputText] = useState('');
  const [encodeResult, setEncodeResult] = useState<HtmlEncodeResponse | null>(null);
  const [decodeResult, setDecodeResult] = useState<HtmlDecodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textResultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    updateToolUsage('html');
  }, []);
  
  const scrollToTextResult = () => {
    setTimeout(() => {
      textResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const encodeText = async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<HtmlEncodeResponse>('/html-entities/encode', {
        text: inputText,
      });
      setEncodeResult(response.data);
      setDecodeResult(null);
      scrollToTextResult();      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const decodeText = async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<HtmlDecodeResponse>('/html-entities/decode', {
        text: inputText,
      });
      setDecodeResult(response.data);
      setEncodeResult(null);
      scrollToTextResult();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setInputText('');
    setEncodeResult(null);
    setDecodeResult(null);
    setError(null);
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
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Encode or Decode HTML</h3>
              <ClearButton onClick={handleClearAll} disabled = {inputText === ''}/>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4" ref={textResultRef}>
              <h3 className="text-lg font-semibold">Encode or Decode HTML</h3>
              <ClearButton onClick={handleClearAll} disabled = {inputText === ''}/>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Input Pane */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Input Text:</label>
              </div>
              <AutoTextarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input-field w-full"
                disabled={isLoading}
                placeholder="Enter text with special characters or HTML entities"
              />
              <div className="flex space-x-2">
                <LoadingButton onClick={encodeText} isLoading={isLoading}>
                  Encode
                </LoadingButton>
                <LoadingButton onClick={decodeText} isLoading={isLoading}>
                  Decode
                </LoadingButton>
              </div>
            </div>

            {/* Output Pane */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Result:</label>
                {(encodeResult || decodeResult) && (
                  <CopyButton
                    text={encodeResult?.encoded_text || decodeResult?.decoded_text || ''}
                  />
                )}
              </div>

              {encodeResult && (
                <>
                  <AutoTextarea
                    value={encodeResult.encoded_text}
                    readOnly
                    className="input-field w-full"
                  />
                  <p className="text-sm text-muted">Converted: HTML Encoded</p>
                </>
              )}

              {decodeResult && (
                <>
                  <AutoTextarea
                    value={decodeResult.decoded_text}
                    readOnly
                    className="input-field w-full"
                  />
                  <p className="text-sm text-muted mt-1">Converted: HTML Decoded</p>
                </>
              )}

              {!encodeResult && !decodeResult && (
                <AutoTextarea
                  value=""
                  readOnly
                  disabled
                  placeholder="Converted result will appear here..."
                  className="input-field w-full text-zinc-400 dark:text-zinc-500"
                />
              )}
            </div>
          </div>
          <ErrorBox message={error} />
        </SectionCard>
      </div>
    </>
  );
}

export default HtmlEntities;