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

interface ROT13Response {
  input_text: string;
  output_text: string;
}

interface CaesarResponse {
  input_text: string;
  shift: number;
  output_text: string;
}

function CipherEncoderDecoder() {
  const seo = seoDescriptions.cipherEncoder;
  const [inputText, setInputText] = useState('');
  const [cipherType, setCipherType] = useState('rot13');
  const [shift, setShift] = useState('3');
  const [result, setResult] = useState<ROT13Response | CaesarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const applyCipher = async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty');
      return;
    }
    if (cipherType === 'caesar') {
      const num = Number(shift);
      if (!Number.isInteger(num) || num < -100 || num > 100) {
        setError('Shift must be an integer between -100 and 100');
        return;
      }
    }    
    setIsLoading(true);
    setError(null);
    try {
      const response =
        cipherType === 'rot13'
          ? await api.post<ROT13Response>('/cipher/rot13', { text: inputText })
          : await api.post<CaesarResponse>('/cipher/caesar', { text: inputText, shift });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
  
    // Allow empty, just "-", or valid integer strings
    if (
      value === '' ||
      value === '-' ||
      /^-?\d+$/.test(value)
    ) {
      if (value === '-' || value === '') {
        setShift(value); // allow typing "-" temporarily
        return;
      }
  
      const num = Number(value);
      if (num >= -100 && num <= 100) {
        setShift(value);
      }
    }
  }; 

  const handleClearAll = () => {
    setInputText('');
    setCipherType('rot13');
    setShift('3');
    setResult(null);
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
                className="input-field w-full"
                disabled={isLoading}
                placeholder="Enter text to encode/decode"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="form-label">Cipher Type:</label>
                <select
                  value={cipherType}
                  onChange={(e) => setCipherType(e.target.value)}
                  className="input-field w-full h-10"
                  disabled={isLoading}
                >
                  <option value="rot13">ROT13</option>
                  <option value="caesar">Caesar</option>
                </select>
                {cipherType === 'caesar' && (
                  <div className="mt-4">
                    <label className="form-label">Shift (-100 to 100):</label>
                    <input
                      type="text"
                      value={shift}
                      onChange={handleLengthChange}
                      className="input-field w-full"
                      disabled={isLoading}
                      placeholder="Enter shift value (-100 to 100)"
                    />
                  </div>
                )}
              </div>
              <div className="w-full sm:w-1/2 flex sm:items-end">
                <LoadingButton onClick={applyCipher} isLoading={isLoading} className="w-full">
                  Apply Cipher
                </LoadingButton>
              </div>
            </div>
          </div>

          {result && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Result</label>
                <CopyButton text={result.output_text} />
              </div>
              <div className="inner-result">
                <div className="w-full mono-output">{result.output_text}</div>
              </div>
              <p className="text-sm mt-2">
                Cipher: {cipherType === 'rot13' ? 'ROT13' : `Caesar (Shift: ${(result as CaesarResponse).shift})`}
              </p>
            </div>
          )}

          <ErrorBox message={error} />
        </SectionCard>
      </div>
    </>
  );
}

export default CipherEncoderDecoder;