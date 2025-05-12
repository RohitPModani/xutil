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

// Base64 encoding/decoding
function base64Encode(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

function base64Decode(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch (e) {
    throw new Error('Invalid Base64 input');
  }
}

// Base32 encoding/decoding (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bits = 0;
  let value = 0;
  let result = '';
  for (const byte of bytes) {
    value = (value << 8) + byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >>> bits) & 31];
    }
  }
  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    while (result.length % 8 !== 0) {
      result += '=';
    }
  }
  return result;
}

function base32Decode(encoded: string): string {
  const cleanEncoded = encoded.toUpperCase().replace(/=+$/, '');
  if (!/^[A-Z2-7]*$/.test(cleanEncoded)) {
    throw new Error('Invalid Base32 input');
  }
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleanEncoded) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error('Invalid Base32 character');
    }
    value = (value << 5) + index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// Base58 encoding/decoding (Bitcoin alphabet)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let num = BigInt(0);
  for (const byte of bytes) {
    num = num * BigInt(256) + BigInt(byte);
  }
  let result = '';
  while (num > 0) {
    const remainder = Number(num % BigInt(58));
    result = BASE58_ALPHABET[remainder] + result;
    num = num / BigInt(58);
  }
  for (const byte of bytes) {
    if (byte === 0) {
      result = '1' + result;
    } else {
      break;
    }
  }
  return result || '1';
}

function base58Decode(encoded: string): string {
  if (!/^[1-9A-HJ-NP-Za-km-z]*$/.test(encoded)) {
    throw new Error('Invalid Base58 input');
  }
  let num = BigInt(0);
  for (const char of encoded) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error('Invalid Base58 character');
    }
    num = num * BigInt(58) + BigInt(index);
  }
  const bytes: number[] = [];
  while (num > 0) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }
  // Add leading zeros
  for (const char of encoded) {
    if (char === '1') {
      bytes.unshift(0);
    } else {
      break;
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function BaseEncoderDecoder() {
  const seo = seoDescriptions.baseEncoder;
  const [inputText, setInputText] = useState('');
  const [baseType, setBaseType] = useState('base64');
  const [encodeResult, setEncodeResult] = useState<BaseEncodeResponse | null>(null);
  const [decodeResult, setDecodeResult] = useState<BaseDecodeResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('base');
  }, []);

  // Auto-encode when inputText or baseType changes
  useEffect(() => {
    if (inputText.trim()) {
      encodeText();
    } else {
      setEncodeResult(null);
      setDecodeResult(null);
      setError('');
    }
  }, [inputText, baseType]);

  const encodeText = () => {
    if (!inputText.trim()) {
      setEncodeResult(null);
      setDecodeResult(null);
      setError('');
      return;
    }

    setIsLoading(true);
    try {
      let encodedText: string;
      switch (baseType) {
        case 'base32':
          encodedText = base32Encode(inputText);
          break;
        case 'base58':
          encodedText = base58Encode(inputText);
          break;
        case 'base64':
          encodedText = base64Encode(inputText);
          break;
        default:
          throw new Error(`Unsupported base type: ${baseType}`);
      }
      setEncodeResult({
        input_text: inputText,
        base_type: baseType,
        encoded_text: encodedText,
      });
      setDecodeResult(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to encode text');
      setEncodeResult(null);
      setDecodeResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const decodeText = () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty');
      setEncodeResult(null);
      setDecodeResult(null);
      return;
    }

    setIsLoading(true);
    try {
      let decodedText: string;
      switch (baseType) {
        case 'base32':
          decodedText = base32Decode(inputText);
          break;
        case 'base58':
          decodedText = base58Decode(inputText);
          break;
        case 'base64':
          decodedText = base64Decode(inputText);
          break;
        default:
          throw new Error(`Unsupported base type: ${baseType}`);
      }
      setDecodeResult({
        encoded_text: inputText,
        base_type: baseType,
        decoded_text: decodedText,
      });
      setEncodeResult(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to decode text');
      setEncodeResult(null);
      setDecodeResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setInputText('');
    setBaseType('base64');
    setEncodeResult(null);
    setDecodeResult(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Ensure focus remains on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Encode or Decode Text</h3>
            <ClearButton onClick={handleClearAll} disabled={inputText === '' && baseType === 'base64'} />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="base-input">
                Input Text:
              </label>
              <AutoTextarea
                id="base-input"
                value={inputText}
                onChange={handleInputChange}
                className="input-field"
                disabled={isLoading}
                placeholder="Enter text to encode or decode"
                aria-describedby={error ? 'base-error' : undefined}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="form-label" htmlFor="base-type">
                  Base Type:
                </label>
                <select
                  id="base-type"
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

          {isLoading && (
            <p className="text-muted">Processing...</p>
          )}

          <ErrorBox message={error} id={error ? 'base-error' : undefined} />
        </SectionCard>
      </div>
    </>
  );
}

export default BaseEncoderDecoder;