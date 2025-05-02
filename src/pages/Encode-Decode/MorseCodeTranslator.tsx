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

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Text to Morse Code </h3>
            <ClearButton onClick={handleClearTexttoMorse} disabled={textInput === ''} />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label">Input Text:</label>
              <AutoTextarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="input-field w-full"
                disabled={isLoadingText}
                placeholder="Enter Text to convert into Morse code"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2 flex sm:items-end">
                <LoadingButton onClick={handleTextToMorse} isLoading={isLoadingText} className="w-full">
                  Convert
                </LoadingButton>
              </div>
            </div>
          </div>

          <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Text to Morse Result</label>
                <CopyButton text={morseResult} />
              </div>
              {morseResult && (
                <div className="scrollbox mt-2">
                  <div className="inner-result">
                    <div className="w-full mono-output">{morseResult}</div>
                  </div>
                </div>
              )}
          </div>

          <ErrorBox message={errorText} />
        </SectionCard>

        <SectionCard className='mt-4'>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Morse Code to Text</h3>
            <ClearButton onClick={handleClearMorsetoText} disabled={morseInput === ''} />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label">Morse Code:</label>
              <AutoTextarea
                value={morseInput}
                onChange={(e) => setMorseInput(e.target.value)}
                className="input-field w-full"
                disabled={isLoadingMorse}
                placeholder="Enter Morse code to convert into text (use ' ' in between each letter and '/' for word breaks)"
              />
            </div>
                <LoadingButton onClick={handleMorseToText} isLoading={isLoadingMorse} className="w-full">
                  Convert
                </LoadingButton>
          </div>

          <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Morse to Text Result</label>
                <CopyButton text={textResult} />
              </div>
              {textResult && (
                <div className="scrollbox mt-2">
                  <div className="inner-result">
                    <div className="w-full mono-output">{textResult}</div>
                  </div>
                </div>
              )}
            </div>

          <ErrorBox message={errorMorse} />
        </SectionCard>
      </div>
    </>
  );
}

export default MorseCodeTranslator;