import { useEffect, useState } from "react";
import BackToHome from "../../components/BackToHome";
import SectionCard from "../../components/SectionCard";
import ErrorBox from "../../components/ErrorBox";
import ClearButton from "../../components/ClearButton";
import CopyButton from "../../components/CopyButton";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import { PageSEO } from "../../components/PageSEO";
import SEODescription from "../../components/SEODescription";
import seoDescriptions from "../../data/seoDescriptions";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";
import { updateToolUsage } from "../../utils/toolUsage";

const BASE_OPTIONS = [
  { value: 2, label: "2 (Binary)" },
  { value: 8, label: "8 (Octal)" },
  { value: 10, label: "10 (Decimal)" },
  { value: 16, label: "16 (Hexadecimal)" },
];

function TextBaseConverter() {
  const seo = seoDescriptions.textBase;
  const [inputText, setInputText] = useState("");
  const [baseInput, setBaseInput] = useState("");
  const [targetBase, setTargetBase] = useState("2");
  const [sourceBase, setSourceBase] = useState("2");
  const [convertedToBase, setConvertedToBase] = useState<string>("");
  const [convertedToText, setConvertedToText] = useState<string>("");
  const [textError, setTextError] = useState<string | null>(null);
  const [baseError, setBaseError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage("text_base");
  }, []);

  const isValidInput = (text: string) => /^[0-9a-zA-Z\s]*$/.test(text);

  const textToBase = (text: string, base: number) => {
    if (!text.trim()) {
      setTextError(null);
      return "";
    }

    if (!isValidInput(text)) {
      setTextError("Only alphanumeric characters are allowed.");
      return "";
    }

    setTextError(null);
    try {
      return text
        .split("")
        .map((char) => {
          const code = char.charCodeAt(0);
          return code.toString(base);
        })
        .join(" ");
    } catch (err) {
      setTextError("Conversion failed");
      return "";
    }
  };

  const baseToText = (input: string, base: number) => {
    if (!input.trim()) {
      setBaseError(null);
      return "";
    }

    if (!isValidInput(input)) {
      setBaseError("Only alphanumeric characters and spaces are allowed.");
      return "";
    }

    setBaseError(null);
    try {
      const numbers = input.split(/\s+/).filter(Boolean);
      return numbers
        .map((num) => {
          const code = parseInt(num, base);
          if (isNaN(code)) throw new Error("Invalid number for base");
          return String.fromCharCode(code);
        })
        .join("");
    } catch (err) {
      setBaseError("Invalid input for the selected base");
      return "";
    }
  };

  useEffect(() => {
    const result = textToBase(inputText, parseInt(targetBase, 10));
    setConvertedToBase(result);
  }, [inputText, targetBase]);

  useEffect(() => {
    const result = baseToText(baseInput, parseInt(sourceBase, 10));
    setConvertedToText(result);
  }, [baseInput, sourceBase]);

  const handleTextClear = () => {
    setInputText("");
    setConvertedToBase("");
    setTextError(null);
  };

  const handleBaseClear = () => {
    setBaseInput("");
    setConvertedToText("");
    setBaseError(null);
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Text ➔ Base Conversion</h3>
            <ClearButton onClick={handleTextClear} disabled={!inputText} />
          </div>
          <hr className="line-break" />
          <div className="flex-1 space-y-4">
            <label className="form-label">Input Text:</label>
            <input
              type="text"
              maxLength={100}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field"
              placeholder="Enter text (max 100 characters)"
            />
          </div>
          <div className="flex gap-2 mt-4 items-center">
            <label className="form-label mr-2 text-sm sm:text-base">
              Target Base:
            </label>
            <select
              value={targetBase}
              onChange={(e) => setTargetBase(e.target.value)}
              className="input-field flex-1"
            >
              {BASE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Text to Base Result</label>
              <CopyButton text={convertedToBase} />
            </div>
            {convertedToBase && (
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output break-all">
                    {convertedToBase}
                  </div>
                </div>
              </div>
            )}
          </div>
          <ErrorBox message={textError} />
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Base ➔ Text Conversion</h3>
            <ClearButton onClick={handleBaseClear} disabled={!baseInput} />
          </div>
          <hr className="line-break" />
          <div className="flex-1 space-y-4">
            <label className="form-label">Base Input:</label>
            <AutoTextarea
              value={baseInput}
              onChange={(e) => setBaseInput(e.target.value)}
              className="input-field"
              placeholder="Enter text (max 100 characters)"
            />
          </div>
          <div className="flex gap-2 mt-4 items-center">
            <label className="form-label mr-2 text-sm sm:text-base">
              Source Base:
            </label>
            <select
              value={sourceBase}
              onChange={(e) => setSourceBase(e.target.value)}
              className="input-field flex-1"
            >
              {BASE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Base to Text Result</label>
              <CopyButton text={convertedToText} />
            </div>
            {convertedToText && (
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output break-all">
                    {convertedToText}
                  </div>
                </div>
              </div>
            )}
          </div>
          <ErrorBox message={baseError} />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default TextBaseConverter;
