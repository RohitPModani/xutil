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

interface JWTEncodeResponse {
  token: string;
  expires_at?: string;
}

interface JWTDecodeResponse {
  payload: { [key: string]: any };
  headers: { [key: string]: any };
  issued_at?: string;
  expires_at?: string;
}

function JWTEncoderDecoder() {
  const seo = seoDescriptions.jwtEncoder;
  const [payload, setPayload] = useState('');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState('HS256');
  const [headers, setHeaders] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState('');
  const [token, setToken] = useState('');
  const [verifyExpiry, setVerifyExpiry] = useState(true);
  const [encodeResult, setEncodeResult] = useState<JWTEncodeResponse | null>(null);
  const [decodeResult, setDecodeResult] = useState<JWTDecodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const encodeJWT = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payloadObj = JSON.parse(payload);
      const headerObj = headers.trim() ? JSON.parse(headers) : undefined;
      const response = await api.post<JWTEncodeResponse>('/jwt/encode', {
        payload: payloadObj,
        secret,
        algorithm,
        headers: headerObj,
        expiry_minutes: expiryMinutes ? parseInt(expiryMinutes, 10) : undefined,
      });
      setEncodeResult(response.data);
      setDecodeResult(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const decodeJWT = async () => {
    if (!token.trim()) {
      setError('Token cannot be empty');
      return;
    }
    if (!secret.trim()) {
      setError('Secret key cannot be empty');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<JWTDecodeResponse>('/jwt/decode', {
        token,
        secret,
        algorithm,
        verify_expiry: verifyExpiry,
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
    setPayload('');
    setSecret('')
    setHeaders('');
    setAlgorithm('HS256');
    setExpiryMinutes('');
    setToken('');
    setEncodeResult(null);
    setDecodeResult(null);
    setVerifyExpiry(true);
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
            <h3 className="text-lg font-semibold">Encode or Decode JWT</h3>
            <ClearButton onClick={handleClearAll} disabled={payload === '' && headers === '' && secret === '' && expiryMinutes === '' && algorithm === 'HS256' && token === '' && verifyExpiry === true} />
          </div>
          <div className="form-grid">
            <div>
              <label className="form-label">Payload (JSON):</label>
              <AutoTextarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="input-field"
                disabled={isLoading}
                placeholder='{"sub": "user123", "name": "John Doe"}'
              />
            </div>

            <div>
              <label className="form-label">Custom Headers (Optional):</label>
              <AutoTextarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="input-field"
                disabled={isLoading}
                placeholder='{"typ": "JWT"}'
              />
            </div>

            <div>
              <label className="form-label">Secret Key:</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="input-field"
                disabled={isLoading}
                placeholder="Enter secret key"
              />
            </div>

            <div>
              <label className="form-label">Algorithm:</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                <option value="HS256">HS256</option>
                <option value="HS384">HS384</option>
                <option value="HS512">HS512</option>
                <option value="RS256">RS256</option>
                <option value="RS384">RS384</option>
                <option value="RS512">RS512</option>
              </select>
            </div>

            <div>
              <label className="form-label">Expiry (Minutes):</label>
              <input
                type="number"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                min="1"
                className="input-field"
                disabled={isLoading}
                placeholder="Enter expiry in minutes"
              />
            </div>

            <div>
              <label className="form-label block">Verify Expiry:</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={verifyExpiry}
                  onChange={(e) => setVerifyExpiry(e.target.checked)}
                  className="checkbox-primary"
                  disabled={isLoading}
                />
                <span className="checkbox-label">Enable expiry check during decode</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">JWT Token (for Decode):</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="input-field"
              disabled={isLoading}
              placeholder="Enter JWT token to decode"
            />
          </div>

          <div className="flex space-x-2 mb-4">
            <LoadingButton onClick={encodeJWT} isLoading={isLoading}>Encode</LoadingButton>
            <LoadingButton onClick={decodeJWT} isLoading={isLoading}>Decode</LoadingButton>
          </div>

          {encodeResult && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Encoded Result</label>
                <CopyButton text={encodeResult.token} />
              </div>
              <div className="inner-result flex items-center">
                <div className="w-full mono-output">{encodeResult.token}</div>
              </div>
              {encodeResult.expires_at && (
                <p className="text-sm text-muted mt-2">
                  Expires At: {new Date(encodeResult.expires_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {decodeResult && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Decoded Result</label>
                <CopyButton text={JSON.stringify(decodeResult.payload)} />
              </div>
              <div className="inner-result flex items-center">
                <div className="w-full mono-output">
                  <pre>{JSON.stringify(decodeResult.payload, null, 2)}</pre>
                </div>
              </div>
              <p className="text-sm text-muted mt-2">
                Headers: {JSON.stringify(decodeResult.headers)}
              </p>
              {decodeResult.issued_at && (
                <p className="text-sm text-muted">Issued At: {new Date(decodeResult.issued_at).toLocaleString()}</p>
              )}
              {decodeResult.expires_at && (
                <p className="text-sm text-muted">Expires At: {new Date(decodeResult.expires_at).toLocaleString()}</p>
              )}
            </div>
          )}

          <ErrorBox message={error} />
        </SectionCard>
      </div>
    </>
  );
}

export default JWTEncoderDecoder;