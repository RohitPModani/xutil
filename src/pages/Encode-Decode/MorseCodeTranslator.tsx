import { useState } from 'react';
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

function MorseCodeTranslator() {
  const seo = seoDescriptions.morseCode;
  const [textInput, setTextInput] = useState('');
  const [morseInput, setMorseInput] = useState('');
  const [morseResult, setMorseResult] = useState('');
  const [textResult, setTextResult] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [errorMorse, setErrorMorse] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingMorse, setIsLoadingMorse] = useState(false);

  const handleTextToMorse = async () => {
    if (!textInput.trim()) {
      setErrorText('Input text cannot be empty');
      return;
    }
    setIsLoadingText(true);
    setErrorText(null);
    try {
      const res = await api.post('/morse/char-to-morse', { text: textInput });
      setMorseResult(res.data.morse_code);
    } catch (err: any) {
      setErrorText(err.response?.data?.detail || err.message);
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleMorseToText = async () => {
    if (!morseInput.trim()) {
      setErrorMorse('Morse code input cannot be empty');
      return;
    }
    setIsLoadingMorse(true);
    setErrorMorse(null);
    try {
      const res = await api.post('/morse/morse-to-char', { text: morseInput });
      setTextResult(res.data.decoded_text);
    } catch (err: any) {
      setErrorMorse(err.response?.data?.detail || err.message);
    } finally {
      setIsLoadingMorse(false);
    }
  };

  const handleClearTexttoMorse = () => {
    setTextInput('');
    setMorseResult('');
    setErrorText(null);
  };

  const handleClearMorsetoText = () => {
    setMorseInput('');
    setTextResult('');
    setErrorMorse(null);
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

        <SectionCard className="mb-6">
          <div className='space-y-4'>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Text to Morse Code</h3>
              <ClearButton onClick={handleClearTexttoMorse} disabled = {textInput === ''}/>
            </div>
            <label className="form-label mb-2">Input Text:</label>
            <AutoTextarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="input-field"
              disabled={isLoadingText}
              placeholder="Enter text to convert to Morse code"
            />
            <LoadingButton onClick={handleTextToMorse} isLoading={isLoadingText}>Convert</LoadingButton>
            {morseResult && (
              <div className="result-box">
              <div className="flex gap-2">
              <AutoTextarea
                  value={morseResult}
                  readOnly
                  className="input-field w-full mono-output"
              />
                  <CopyButton text={morseResult} />
              </div>
              </div>
            )}
            <ErrorBox message={errorText} />
          </div>
        </SectionCard>

        <SectionCard>
          <div className='space-y-4'>
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Morse Code to Text</h3>
                  <ClearButton onClick={handleClearMorsetoText} disabled = {morseInput === ''}/>
              </div>
              <label className="form-label mb-2">Input Morse Code:</label>
              <AutoTextarea
                  value={morseInput}
                  onChange={(e) => setMorseInput(e.target.value)}
                  className="input-field"
                  disabled={isLoadingMorse}
                  placeholder="Enter Morse code to decode (use ' ' in between each letter and '/' for word breaks)"
              />
              <LoadingButton onClick={handleMorseToText} isLoading={isLoadingMorse}>Decode</LoadingButton>
              {textResult && (
              <div className="result-box">
                  <div className="flex gap-2">
                  <AutoTextarea
                      value={textResult}
                      readOnly
                      className="input-field w-full mono-output"
                  />
                      <CopyButton text={textResult} />
                  </div>
              </div>
              )}
              <ErrorBox message={errorMorse} />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default MorseCodeTranslator;