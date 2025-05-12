import { useState } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';

interface JWTDecodedData {
  headers: { [key: string]: any };
  payload: { [key: string]: any };
  signature: string;
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  
  switch (output.length % 4) {
    case 0: break;
    case 2: output += '=='; break;
    case 3: output += '='; break;
    default: throw new Error('Illegal base64url string');
  }
  
  try {
    return decodeURIComponent(escape(atob(output)));
  } catch (e) {
    return atob(output);
  }
}

function JWTDecoder() {
  const seo = seoDescriptions.jwtDecoder;
  const [decodeToken, setDecodeToken] = useState<string>('');
  const [decodedData, setDecodedData] = useState<JWTDecodedData | null>(null);
  const [decodeError, setDecodeError] = useState<string>('');
  const [isDecodeLoading, setIsDecodeLoading] = useState<boolean>(false);

  const decodeJWT = () => {
    setIsDecodeLoading(true);
    setDecodeError('');
    try {
      if (!decodeToken.trim()) throw new Error('Token cannot be empty');
      
      const parts = decodeToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. A valid JWT should contain three parts separated by dots.');
      }

      try {
        const headers = JSON.parse(base64UrlDecode(parts[0]));
        const payload = JSON.parse(base64UrlDecode(parts[1]));
        const signature = parts[2];
        
        setDecodedData({
          headers,
          payload,
          signature
        });
      } catch (e) {
        throw new Error('Invalid JWT - failed to decode parts');
      }
    } catch (err: any) {
      setDecodeError(err?.message || 'Failed to decode JWT');
      setDecodedData(null);
    } finally {
      setIsDecodeLoading(false);
      if (!decodeError) {
        updateToolUsage('jwt-decoder');
      }
    }
  };

  const handleClearDecode = () => {
    setDecodeToken('');
    setDecodedData(null);
    setDecodeError('');
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-row items-center justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={seo.title}>{seo.body}</SEODescription>

        {/* Decode Section */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Decode JWT</h3>
            <ClearButton onClick={handleClearDecode} disabled={!decodeToken} />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <label className="form-label" htmlFor="jwt-input">
                JWT Token:
              </label>
            </div>
            <AutoTextarea
              id="jwt-input"
              value={decodeToken}
              onChange={(e) => setDecodeToken(e.target.value)}
              className="input-field w-full"
              disabled={isDecodeLoading}
              placeholder="Enter JWT token (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c)"
              aria-describedby={decodeError ? 'jwt-decode-error' : undefined}
            />
            <div className="flex space-x-2">
              <LoadingButton onClick={decodeJWT} isLoading={isDecodeLoading}>
                Decode
              </LoadingButton>
            </div>
          </div>

          {decodeError && (
            <ErrorBox message={decodeError} id="jwt-decode-error" />
          )}

          {decodedData && (
            <div className="result-box mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Decoded JWT Data</label>
                <CopyButton text={JSON.stringify(decodedData, null, 2)} />
              </div>
              <div className="inner-result">
                <pre className="mono-output">
                  {JSON.stringify(decodedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}

export default JWTDecoder;