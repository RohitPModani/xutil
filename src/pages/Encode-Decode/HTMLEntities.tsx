import { useEffect, useRef, useReducer } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';
import ToggleSwitch from '../../components/ToggleSwitch';

type Mode = 'encode' | 'decode';

interface HtmlResult {
  input: string;
  output: string;
}

// Expanded HTML entity encoding/decoding maps
const encodeMap: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&apos;',
  '©': '&copy;',
  '®': '&reg;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
};

const decodeMap: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&copy;': '©',
  '&reg;': '®',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&amp;lt;': '<',
  '&amp;gt;': '>',
  '&amp;amp;': '&',
  '&amp;quot;': '"',
  '&amp;apos;': "'",
};

type State = {
  inputText: string;
  result: HtmlResult | null;
  error: string;
  mode: Mode;
  characterCount: number;
  isLoading: boolean;
};

type Action =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_RESULT'; payload: HtmlResult | null }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

const initialState: State = {
  inputText: '',
  result: null,
  error: '',
  mode: 'encode',
  characterCount: 0,
  isLoading: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        inputText: action.payload,
        characterCount: action.payload.length,
        error: '',
      };
    case 'SET_RESULT':
      return { ...state, result: action.payload, error: '' };
    case 'SET_ERROR':
      return { ...state, error: action.payload, result: null };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function htmlEncode(text: string): string {
  return text.replace(/[&<>"' ©®€£¥¢]/g, (char) => encodeMap[char] || char);
}

function htmlDecode(text: string): string {
  try {
    return text.replace(/&(?:amp;)?(?:[a-z]+|#\d+|#x[\da-f]+);/gi, (match) => {
      const lowerMatch = match.toLowerCase();
      if (decodeMap[lowerMatch]) return decodeMap[lowerMatch];
      
      const numericMatch = match.match(/&#(x[\da-f]+|\d+);/i);
      if (numericMatch) {
        const code = numericMatch[1].startsWith('x') 
          ? parseInt(numericMatch[1].substring(1), 16) 
          : parseInt(numericMatch[1], 10);
        return code <= 0x10FFFF ? String.fromCharCode(code) : match;
      }
      
      return match;
    });
  } catch {
    throw new Error('Invalid HTML entities in input');
  }
}

function HtmlEntities() {
  const seo = seoDescriptions.htmlEntities;
  const [state, dispatch] = useReducer(reducer, initialState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage('html');
  }, []);

  // Process input automatically when mode or input changes
  useEffect(() => {
    if (!state.inputText.trim()) {
      dispatch({ type: 'SET_RESULT', payload: null });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const output = state.mode === 'encode'
        ? htmlEncode(state.inputText)
        : htmlDecode(state.inputText);
      
      dispatch({
        type: 'SET_RESULT',
        payload: {
          input: state.inputText,
          output
        }
      });
    } catch (err: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: err.message.includes('Invalid HTML')
          ? 'Contains invalid HTML entities'
          : 'Processing failed. Please check your input.'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.inputText, state.mode]);

  const handleClearAll = () => {
    dispatch({ type: 'RESET' });
    textareaRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_INPUT', payload: e.target.value });
  };

  const handleModeChange = (mode: string) => {
    dispatch({ type: 'SET_MODE', payload: mode as Mode });
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={'a ' + seo.title}>{seo.body}</SEODescription>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">HTML Entities Converter</h3>
            <ClearButton onClick={handleClearAll} disabled={!state.inputText} />
          </div>
          
          <div className="mb-4 flex items-center justify-between">
            <ToggleSwitch
              options={[
                { value: 'encode', label: 'Encode' },
                { value: 'decode', label: 'Decode' },
              ]}
              selected={state.mode}
              onChange={handleModeChange}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Input Section */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="html-input" className="form-label">
                  {state.mode === 'encode' ? 'Original Text' : 'Encoded HTML'}
                </label>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {state.characterCount} chars
                </span>
              </div>
              <AutoTextarea
                id="html-input"
                ref={textareaRef}
                value={state.inputText}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder={
                  state.mode === 'encode'
                    ? 'Enter text to encode as HTML entities'
                    : 'Enter HTML entities to decode'
                }
                aria-describedby={state.error ? 'html-error' : undefined}
              />
            </div>

            {/* Output Section */}
            <div className="flex-1 space-y-4 mt-1">
              <div className="flex items-center justify-between">
                <label className="form-label mb-1">
                  {state.mode === 'encode' ? 'Encoded HTML' : 'Decoded Text'}
                </label>
                {state.result && (
                  <CopyButton text={state.result.output} />
                )}
              </div>
              <AutoTextarea
                value={state.result?.output || ''}
                readOnly
                className="input-field w-full"
                placeholder={
                  state.isLoading
                    ? 'Processing...'
                    : 'Converted result will appear here'
                }
              />
              {state.result && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted">
                    {state.mode === 'encode' ? 'HTML Encoded' : 'HTML Decoded'}
                  </p>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {state.result.output.length} chars
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <ErrorBox 
            message={state.error} 
            id={state.error ? 'html-error' : undefined} 
          />
        </SectionCard>
      </div>
    </>
  );
}

export default HtmlEntities;