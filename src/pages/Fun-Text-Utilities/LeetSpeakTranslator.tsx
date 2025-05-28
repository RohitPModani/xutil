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

export default function LeetSpeakTranslator() {
  const seo = seoDescriptions.leetspeak;

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateToolUsage("leetspeak");
  }, []);

  useEffect(() => {
    if (input.trim()) {
      convertToLeet();
    } else {
      setOutput("");
      setError("");
    }
  }, [input]);

  // LeetSpeak character mappings
  const leetMap: Record<string, string[]> = {
    a: ["4", "@", "/\\", "^", "∂"],
    b: ["8", "6", "|3", "ß"],
    c: ["(", "<", "©"],
    d: ["|)", "o|", "[)", "∂"],
    e: ["3", "€", "є"],
    f: ["|=", "ƒ"],
    g: ["6", "9", "&"],
    h: ["#", "|-|", "}{", "]-[", ")-("],
    i: ["1", "!", "|", "]["],
    j: ["_|", "</", "_]"],
    k: ["|<", "|{", "|("],
    l: ["1", "|_", "|", "£"],
    m: ["|\\/|", "/\\/\\", "(v)", "em"],
    n: ["|\\|", "/\\/", "/V", "И"],
    o: ["0", "()", "[]", "Ω"],
    p: ["|*", "|o", "|>", '|"'],
    q: ["9", "0_", "(,)", "kw"],
    r: ["|2", "|?", "lz", "Я"],
    s: ["5", "$", "z", "§"],
    t: ["7", "+", "-|-", "†"],
    u: ["|_|", "(_)", "µ"],
    v: ["\\/", "|/", "\\\\//"],
    w: ["\\/\\/", "vv", "\\^/", "Ш"],
    x: ["><", "}{", "×"],
    y: ["`/", "¥", "\\|/", "Ч"],
    z: ["2", "7_", "≥", "z"],
  };

  const convertToLeet = () => {
    try {
      let result = "";
      for (let i = 0; i < input.length; i++) {
        const char = input[i].toLowerCase();
        if (leetMap[char]) {
          // Randomly select a leet replacement for variety
          const replacements = leetMap[char];
          const randomIndex = Math.floor(Math.random() * replacements.length);
          result += replacements[randomIndex];
        } else {
          result += input[i];
        }
      }
      setOutput(result);
      setError("");
    } catch (err: any) {
      setError(err.message || "Error converting to LeetSpeak");
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
            <h3 className="text-lg font-semibold">LeetSpeak Translator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={input === "" && output === "" && error === ""}
            />
          </div>
          <hr className="line-break" />
          <div className="space-y-4 mb-4">
            <div>
              <label className="form-label" htmlFor="leet-input">
                Normal Text:
              </label>
              <AutoTextarea
                id="leet-input"
                value={input}
                onChange={handleInputChange}
                ref={inputRef}
                className="input-field w-full"
                placeholder="Enter normal text to convert to LeetSpeak"
                aria-describedby={error ? "leet-error" : undefined}
                aria-label="Text input for LeetSpeak conversion"
              />
            </div>
          </div>
          {output && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">LeetSpeak Translation</label>
                <CopyButton text={output} />
              </div>
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div
                    className="w-full mono-output"
                    aria-label="LeetSpeak translation"
                  >
                    {output}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ErrorBox message={error} id={error ? "leet-error" : undefined} />
        </SectionCard>

        <SectionCard className="mt-6">
          <h3 className="text-lg font-semibold mb-4">About LeetSpeak (1337)</h3>
          <hr className="line-break" />
          <div className="prose">
            <ul className="text-zinc-900 dark:text-white pl-5 space-y-2">
              <li>
                LeetSpeak (or "1337") is an alternative alphabet that replaces
                letters with similar-looking numbers or special characters
              </li>
              <li>
                Originally used by hackers and gamers to bypass text filters or
                appear elite
              </li>
              <li>
                Now commonly used in internet culture for stylistic purposes
              </li>
              <li>Example: "leet" becomes "1337" or "l33t"</li>
              <li>
                This translator creates randomized LeetSpeak variations for more
                authentic results
              </li>
            </ul>
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}
