import { useEffect, useState } from "react";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import CopyButton from "../../components/CopyButton";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import seoDescriptions from "../../data/seoDescriptions";
import { updateToolUsage } from "../../utils/toolUsage";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";
import ToolHeader from "../../components/ToolHeader";

function TextCaseConverter() {
  const seo = seoDescriptions.textCase || {
    title: "Text Case Converter",
    body: "Convert text to various cases such as camel case, snake case, uppercase, lowercase, and more.",
  };
  const [text, setText] = useState("");
  type ResultType = {
    lowercase: string;
    uppercase: string;
    camelCase: string;
    dotCase: string;
    capitalCase: string;
    constantCase: string;
    headerCase: string;
    paramCase: string;
    pathCase: string;
    pascalCase: string;
    sentenceCase: string;
    snakeCase: string;
    mockingCase: string;
  };

  const [result, setResult] = useState<ResultType | null>(null);

  const toCamelCase = (str: string) =>
    str
      .replace(/(?:^|\s)([a-z])/g, (_m: string, p1: string) => p1.toUpperCase())
      .replace(/\s+/g, "");
  const toDotCase = (str: string) => str.replace(/\s+/g, ".").toLowerCase();
  const toCapitalCase = (str: string) =>
    str.replace(/\b\w/g, (match: string) => match.toUpperCase());
  const toConstantCase = (str: string) =>
    str.replace(/\s+/g, "_").toUpperCase();
  const toHeaderCase = (str: string) =>
    str
      .replace(/\b\w/g, (match: string) => match.toUpperCase())
      .replace(/\s+/g, "-");
  const toParamCase = (str: string) => str.replace(/\s+/g, "-").toLowerCase();
  const toPathCase = (str: string) => str.replace(/\s+/g, "/").toLowerCase();
  const toPascalCase = (str: string) =>
    str
      .replace(/(?:^|\s)([a-z])/g, (_m: string, p1: string) => p1.toUpperCase())
      .replace(/\s+/g, "");
  const toSentenceCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const toSnakeCase = (str: string) => str.replace(/\s+/g, "_").toLowerCase();
  const toMockingCase = (str: string) =>
    str
      .split("")
      .map((char: string, idx: number) =>
        idx % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      )
      .join("");

  useEffect(() => {
    updateToolUsage("text_case");
  }, []);

  useEffect(() => {
    if (text) {
      setResult({
        lowercase: text.toLowerCase(),
        uppercase: text.toUpperCase(),
        camelCase: toCamelCase(text),
        dotCase: toDotCase(text),
        capitalCase: toCapitalCase(text),
        constantCase: toConstantCase(text),
        headerCase: toHeaderCase(text),
        paramCase: toParamCase(text),
        pathCase: toPathCase(text),
        pascalCase: toPascalCase(text),
        sentenceCase: toSentenceCase(text),
        snakeCase: toSnakeCase(text),
        mockingCase: toMockingCase(text),
      });
    } else {
      setResult(null);
    }
  }, [text]);

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  const getResultsText = (result: ResultType | null) => {
    if (!result) return "";
    return Object.entries(result)
      .map(([key, val]) => {
        const displayLabel = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        return `${displayLabel}: ${val}`;
      })
      .join("\n\n");
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="py-6 sm:py-8">
        <ToolHeader title={seo.title} />

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title">
              Text Case Converter
            </h3>
            <div className="flex items-center gap-2">
              {result && (
                <CopyButton text={getResultsText(result)} copyType="CopyAll" />
              )}
              <ClearButton onClick={handleClear} disabled={!text && !result} />
            </div>
          </div>
          <hr className="line-break" />
          <div className="flex flex-col gap-6">
            <AutoTextarea
              className="input-field w-full"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {result &&
              Object.entries(result).map(([key, val]) => {
                const displayLabel = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();
                return (
                  <div key={key} className="result-box mt-0">
                    <div className="flex justify-between items-center mb-2">
                      <label className="form-label sm:text-base font-semibold">
                        {displayLabel}
                      </label>
                      <CopyButton text={val} />
                    </div>
                    <div className="inner-result">
                      <span className="mono-output text-ink">
                        {val}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default TextCaseConverter;
