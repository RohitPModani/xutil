import { useState } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import api from '../../services/api';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';

interface BaseEncodeResponse {
  input_text: string;
  base_type: string;
  encoded_text: string;
}

interface BaseDecodeResponse {
  encoded_text: string;
  base_type: string;
  decoded_text: string;
}

function BaseEncoderDecoder() {
  const seo = seoDescriptions.baseEncoder;
  const [inputText, setInputText] = useState('');
  const [baseType, setBaseType] = useState('base64');
  const [encodeResult, setEncodeResult] = useState<BaseEncodeResponse | null>(null);
  const [decodeResult, setDecodeResult] = useState<BaseDecodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const encodeText = async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<BaseEncodeResponse>('/base/encode', {
        text: inputText,
        base_type: baseType,
      });
      setEncodeResult(response.data);
      setDecodeResult(null);
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
      const response = await api.post<BaseDecodeResponse>('/base/decode', {
        encoded_text: inputText,
        base_type: baseType,
      });
      setDecodeResult(response.data);
      setEncodeResult(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setInputText('');
    setBaseType('base64');
    setEncodeResult(null);
    setDecodeResult(null);
  }


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
              <h3 className="text-lg font-semibold">Encode or Decode Text</h3>
              <ClearButton onClick={handleClearAll} disabled={inputText === ''} />
            </div>
            <div className="space-y-4 mb-4">
              <div>
                <label className="form-label">Input Text:</label>
                <AutoTextarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="input-field"
                  disabled={isLoading}
                  placeholder="Enter text to encode or decode"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <label className="form-label">Base Type:</label>
                  <select
                    value={baseType}
                    onChange={(e) => setBaseType(e.target.value)}
                    className="input-field w-full h-10"
                    disabled={isLoading}
                  >
                    <option value="base32">Base32</option>
                    <option value="base58">Base58</option>
                    <option value="base64">Base64</option>
                  </select>
                </div>
                <div className="w-full sm:w-1/2 flex sm:items-end gap-2">
                  <LoadingButton onClick={encodeText} isLoading={isLoading} className="flex-1">
                    Encode
                  </LoadingButton>
                  <LoadingButton onClick={decodeText} isLoading={isLoading} className="flex-1">
                    Decode
                  </LoadingButton>
                </div>
              </div>
            </div>

            {(encodeResult || decodeResult) && (
              <div className="result-box">
                <label className="form-label">Result</label>
                <div className="space-y-4">
                  {encodeResult && (
                    <div>
                      <div className="inner-result">
                        <div className="w-full mono-output">{encodeResult.encoded_text}</div>
                        <CopyButton text={encodeResult.encoded_text} />
                      </div>
                      <p className="text-sm mt-2">
                        Encoded Base Type: {encodeResult.base_type.toUpperCase()}
                      </p>
                    </div>
                  )}
                  {decodeResult && (
                    <div>
                      <div className="inner-result">
                        <div className="w-full mono-output">{decodeResult.decoded_text}</div>
                        <CopyButton text={decodeResult.decoded_text} />
                      </div>
                      <p className="text-sm mt-2">
                        Decoded Base Type: {decodeResult.base_type.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <ErrorBox message={error} />
          </SectionCard>
      </div>
    </>
  );
}

export default BaseEncoderDecoder;