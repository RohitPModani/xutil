import { useEffect, useState, useRef } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';
import { AudioLines, Music } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

// Extended Morse code mapping with punctuation and special characters
const MORSE_CODE_MAP: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
  'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
  'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--',
  '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', ' ': '/'
};

// Reverse mapping for Morse to text
const MORSE_TO_TEXT_MAP: { [key: string]: string } = Object.fromEntries(
  Object.entries(MORSE_CODE_MAP).map(([char, code]) => [code, char])
);

// Common Morse code sequences
const COMMON_SEQUENCES = {
  'SOS': '... --- ...',
  'OK': '--- -.-',
  'HELP': '.... . .-.. .--.',
  'LOVE': '.-.. --- ...- .',
  'HI': '.... ..'
};

function textToMorse(text: string): string {
  if (!text.trim()) {
    return '';
  }

  // Convert to uppercase and replace multiple spaces with single space
  const normalizedText = text.toUpperCase().replace(/\s+/g, ' ');
  
  return normalizedText
    .split(' ')
    .map(word =>
      word
        .split('')
        .map(char => MORSE_CODE_MAP[char] || '')
        .filter(code => code)
        .join(' ')
    )
    .filter(word => word)
    .join(' / ');
}

function morseToText(morse: string): string {
  if (!morse.trim()) {
    return '';
  }

  // Normalize input: replace multiple slashes with single, trim spaces
  const normalizedMorse = morse
    .replace(/\/+/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/^[.\-\/ ]+$/.test(normalizedMorse)) {
    throw new Error('Morse code must contain only dots (.), dashes (-), spaces, and word separators (/).');
  }

  const words = normalizedMorse.split(' / ').filter(word => word);
  
  return words
    .map(word => {
      const letters = word.split(' ').filter(letter => letter);
      return letters
        .map(code => {
          const char = MORSE_TO_TEXT_MAP[code];
          if (!char) {
            throw new Error(`Invalid Morse code sequence: ${code}`);
          }
          return char;
        })
        .join('');
    })
    .join(' ');
}

function MorseCodeTranslator() {
  const seo = seoDescriptions.morseCode;
  const [textInput, setTextInput] = useState('');
  const [morseInput, setMorseInput] = useState('');
  const [morseResult, setMorseResult] = useState('');
  const [textResult, setTextResult] = useState('');
  const [errorText, setErrorText] = useState('');
  const [errorMorse, setErrorMorse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const morseRef = useRef<HTMLTextAreaElement>(null);

  const debouncedTextInput = useDebounce(textInput, 300);
  const debouncedMorseInput = useDebounce(morseInput, 300);

  useEffect(() => {
    updateToolUsage('morse');
  }, []);

  // Auto-convert text to Morse when debouncedTextInput changes
  useEffect(() => {
    if (debouncedTextInput.trim()) {
      handleTextToMorse();
    } else {
      setMorseResult('');
      setErrorText('');
    }
  }, [debouncedTextInput]);

  // Auto-convert Morse to text when debouncedMorseInput changes
  useEffect(() => {
    if (debouncedMorseInput.trim()) {
      handleMorseToText();
    } else {
      setTextResult('');
      setErrorMorse('');
    }
  }, [debouncedMorseInput]);

  const handleTextToMorse = () => {
    try {
      const result = textToMorse(textInput);
      setMorseResult(result);
      setErrorText('');
    } catch (err: any) {
      setErrorText(err.message || 'Failed to convert text to Morse code');
      setMorseResult('');
    }
  };

  const handleMorseToText = () => {
    try {
      const result = morseToText(morseInput);
      setTextResult(result);
      setErrorMorse('');
    } catch (err: any) {
      setErrorMorse(err.message || 'Failed to convert Morse code to text');
      setTextResult('');
    }
  };

  const handleClearTexttoMorse = () => {
    setTextInput('');
    setMorseResult('');
    setErrorText('');
  };

  const handleClearMorsetoText = () => {
    setMorseInput('');
    setTextResult('');
    setErrorMorse('');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const handleMorseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMorseInput(e.target.value);
  };

  const handleInsertSequence = (sequence: string) => {
    setMorseInput(prev => prev ? `${prev} ${sequence}` : sequence);
    if (morseRef.current) {
      morseRef.current.focus();
    }
  };

  const playMorseCode = () => {
    if (!morseResult || isPlaying) return;

    setIsPlaying(true);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 600;
    gainNode.gain.value = 0;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    const timeUnit = 0.1; // seconds
    let time = audioContext.currentTime;

    const morse = morseResult.replace(/\s/g, '');
    let index = 0;

    const playNext = () => {
      if (index >= morse.length) {
        gainNode.gain.value = 0;
        oscillator.stop();
        setIsPlaying(false);
        return;
      }

      const char = morse[index++];
      if (char === '.') {
        gainNode.gain.setValueAtTime(1, time);
        time += timeUnit;
        gainNode.gain.setValueAtTime(0, time);
        time += timeUnit;
      } else if (char === '-') {
        gainNode.gain.setValueAtTime(1, time);
        time += timeUnit * 3;
        gainNode.gain.setValueAtTime(0, time);
        time += timeUnit;
      } else if (char === '/') {
        time += timeUnit * 2; // Extra space between words
      }

      setTimeout(playNext, (time - audioContext.currentTime) * 1000);
    };

    playNext();
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
            <h3 className="text-lg font-semibold">Text to Morse Code</h3>
            <div className="flex gap-2">
              <ClearButton 
                onClick={handleClearTexttoMorse} 
                disabled={textInput === '' && morseResult === '' && errorText === ''} 
              />
            </div>
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="text-input">
                Input Text:
              </label>
              <AutoTextarea
                id="text-input"
                value={textInput}
                onChange={handleTextChange}
                className="input-field w-full"
                placeholder="Enter text to convert into Morse code (letters, numbers, and common punctuation)"
                ref={textRef}
                aria-describedby={errorText ? 'morse-text-error' : undefined}
              />
            </div>
          </div>

          {morseResult && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Morse Code Result</label>
                <div className="flex gap-2">
                  <button
                    onClick={playMorseCode}
                    disabled={isPlaying || !morseResult}
                    className="btn-secondary text-sm"
                    aria-label="Play Morse code as sound"
                  >
                    {isPlaying ? <AudioLines className="sm:w-5 sm:h-5 w-4 h-4 text-zinc-500 dark:text-zinc-400"/> : <Music className="sm:w-5 sm:h-5 w-4 h-4 text-zinc-500 dark:text-zinc-400"/>}
                  </button>
                  <CopyButton text={morseResult} />
                </div>
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output">{morseResult}</div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={errorText} id={errorText ? 'morse-text-error' : undefined} />
        </SectionCard>

        <SectionCard className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Morse Code to Text</h3>
            <ClearButton 
              onClick={handleClearMorsetoText} 
              disabled={morseInput === '' && textResult === '' && errorMorse === ''} 
            />
          </div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="morse-input">
                Morse Code:
              </label>
              <AutoTextarea
                id="morse-input"
                value={morseInput}
                onChange={handleMorseChange}
                className="input-field w-full"
                placeholder="Enter Morse code (e.g., .- -... / -.- -..) with spaces between letters and / for word breaks"
                ref={morseRef}
                aria-describedby={errorMorse ? 'morse-code-error' : undefined}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Common sequences:</span>
              {Object.entries(COMMON_SEQUENCES).map(([text, code]) => (
                <button
                  key={text}
                  onClick={() => handleInsertSequence(code)}
                  className="btn-secondary text-xs"
                  aria-label={`Insert ${text} Morse code`}
                >
                  {text} ({code})
                </button>
              ))}
            </div>
          </div>

          {textResult && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Text Result</label>
                <CopyButton text={textResult} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output">{textResult}</div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={errorMorse} id={errorMorse ? 'morse-code-error' : undefined} />
        </SectionCard>
      </div>
    </>
  );
}

export default MorseCodeTranslator;