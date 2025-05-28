import { useState, useRef, useEffect } from "react";
import BackToHome from "../../components/BackToHome";
import ErrorBox from "../../components/ErrorBox";
import SectionCard from "../../components/SectionCard";
import CopyButton from "../../components/CopyButton";
import ClearButton from "../../components/ClearButton";
import SEODescription from "../../components/SEODescription";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import seoDescriptions from "../../data/seoDescriptions";
import { PageSEO } from "../../components/PageSEO";
import { updateToolUsage } from "../../utils/toolUsage";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";

const NATO_PHONETIC_ALPHABET: { [key: string]: string } = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliet",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  " ": "(Space)",
};

export default function NATOPhoneticAlphabetConverter() {
  const seo = seoDescriptions.natoPhonetic;

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage("nato_phonetic");
  }, []);

  useEffect(() => {
    if (input.trim()) {
      convertToPhonetic();
    } else {
      setOutput("");
      setError("");
    }
  }, [input]);

  const convertToPhonetic = () => {
    try {
      const result = input
        .toUpperCase()
        .split("")
        .map((char) => {
          const phonetic = NATO_PHONETIC_ALPHABET[char];
          if (!phonetic && char !== " ") {
            throw new Error(`Invalid character: ${char}`);
          }
          return phonetic || "";
        })
        .filter(Boolean)
        .join(" ");

      setOutput(result);
      setError("");
    } catch (err: any) {
      setError(err.message || "Invalid input");
      setOutput("");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Phonetic Alphabet Converter
            </h3>
            <ClearButton
              onClick={handleClear}
              disabled={input === "" && output === "" && error === ""}
            />
          </div>
          <hr className="line-break" />
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="string-input">
                Input Text:
              </label>
              <AutoTextarea
                id="nato-input"
                value={input}
                onChange={handleInputChange}
                ref={inputRef}
                className="input-field w-full"
                placeholder="Enter letters or numbers (A-Z, 0-9)"
                aria-describedby={error ? "nato-error" : undefined}
                aria-label="Text input for NATO phonetic conversion"
              />
            </div>
          </div>
          {output && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Phonetic Equivalent</label>
                <CopyButton text={output} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div
                    className="w-full mono-output"
                    aria-label="Phonetic equivalent"
                  >
                    {output}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={error} id={error ? "nato-error" : undefined} />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}
