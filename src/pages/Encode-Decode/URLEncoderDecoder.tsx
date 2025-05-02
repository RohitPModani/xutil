import { useState, useCallback } from 'react';
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

function URLEncoderDecoder() {
  const seo = seoDescriptions.urlEncoder;
  const [text, setText] = useState('');
  const [encodedText, setEncodedText] = useState('');
  const [encoded, setEncoded] = useState('');
  const [decoded, setDecoded] = useState('');
  const [errorEncode, setErrorEncode] = useState<string | null>(null);
  const [errorDecode, setErrorDecode] = useState<string | null>(null);
  const [isLoadingEncode, setIsLoadingEncode] = useState(false);
  const [isLoadingDecode, setIsLoadingDecode] = useState(false);

  const handleApiError = useCallback((err: any) => {
    return err.response?.data?.detail || err.message || 'An unexpected error occurred';
  }, []);

  const encodeText = useCallback(async () => {
    if (!text.trim()) {
      setErrorEncode('Please enter text to encode');
      return;
    }
    setIsLoadingEncode(true);
    setErrorEncode(null);
    try {
      const { data } = await api.get('/url/encode', {
        params: { text },
      });
      setEncoded(data.encoded_text);
    } catch (err) {
      setErrorEncode(handleApiError(err));
    } finally {
      setIsLoadingEncode(false);
    }
  }, [text, handleApiError]);

  const decodeText = useCallback(async () => {
    if (!text.trim()) {
      setErrorDecode('Please enter encoded text to decode');
      return;
    }
    setIsLoadingDecode(true);
    setErrorDecode(null);
    try {
      const { data } = await api.get('/url/decode', {
        params: { encoded_text: text },
      });
      setDecoded(data.decoded_text);
    } catch (err) {
      setErrorDecode(handleApiError(err));
    } finally {
      setIsLoadingDecode(false);
    }
  }, [text, handleApiError]);

  const handleClearEncode = useCallback(() => {
    setText('');
    setEncoded('');
    setErrorEncode(null);
  }, []);

  const handleClearDecode = useCallback(() => {
    setEncodedText('');
    setDecoded('');
    setErrorDecode(null);
  }, []);

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
            <h3 className="text-lg font-semibold">Encode URL</h3>
            <ClearButton onClick={handleClearEncode} disabled={isLoadingEncode || text === ''} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Input Text</label>
              <AutoTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-field"
                disabled={isLoadingEncode}
                placeholder="Enter text to encode"
                aria-label="Text to encode"
              />
            </div>

            <LoadingButton
              onClick={encodeText}
              isLoading={isLoadingEncode}
            >
              Encode
            </LoadingButton>

            {encoded && (
              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label">Encoded URL</label>
                  <CopyButton text={encoded} />
                </div>
                <div className="inner-result">
                  <div className="flex-1 mono-output" aria-label="Encoded result">
                    {encoded}
                  </div>
                </div>
              </div>
            )}

            <ErrorBox message={errorEncode} />
          </div>
        </SectionCard>

        <SectionCard className='mt-6'>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Decode URL</h3>
            <ClearButton onClick={handleClearDecode} disabled={isLoadingDecode || encodedText === '' } />
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Encoded URL</label>
              <AutoTextarea
                value ={encodedText}
                onChange={(e) => setEncodedText(e.target.value)}
                className="input-field"
                disabled={isLoadingDecode}
                placeholder="Enter encoded URL to decode"
                aria-label="Text to decode"
              />
            </div>

            <LoadingButton
              onClick={decodeText}
              isLoading={isLoadingDecode}
            >
              Decode
            </LoadingButton>

            {decoded && (
              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label">Decoded URL</label>
                  <CopyButton text={decoded} />
                </div>
                <div className="inner-result">
                  <div className="flex-1 mono-output" aria-label="Decoded result">
                    {decoded}
                  </div>
                </div>
              </div>
            )}

            <ErrorBox message={errorDecode} />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default URLEncoderDecoder;