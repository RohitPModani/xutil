import { useEffect, useState, useCallback } from "react";
import BackToHome from "../../components/BackToHome";
import ClearButton from "../../components/ClearButton";
import CopyButton from "../../components/CopyButton";
import SectionCard from "../../components/SectionCard";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import seoDescriptions from "../../data/seoDescriptions";
import * as Diff from "diff";
import LoadingButton from "../../components/LoadingButton";
import { updateToolUsage } from "../../utils/toolUsage";
import DOMPurify from "dompurify";

interface DiffLine {
  type: "added" | "removed" | "common";
  text: string;
  html?: string;
  lineNumber: number;
}

const CHUNK_SIZE = 1000; // Process 1000 lines at a time
const MAX_LINES = 10000; // Maximum lines to process

const TextCompare: React.FC = () => {
  const seo = seoDescriptions.textCompare;
  const [text1, setText1] = useState<string>("");
  const [text2, setText2] = useState<string>("");
  const [diffLines, setDiffLines] = useState<
    { left: DiffLine; right: DiffLine }[]
  >([]);
  const [removals, setRemovals] = useState<number>(0);
  const [additions, setAdditions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedChunks, setProcessedChunks] = useState<number>(0);
  const [totalChunks, setTotalChunks] = useState<number>(0);

  useEffect(() => {
    updateToolUsage("text_compare");
  }, []);

  const detectFormat = (text: string): 'json' | 'xml' | 'text' => {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        return 'text';
      }
    }
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      return 'xml';
    }
    return 'text';
  };

  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const formatText = (text: string, format: 'json' | 'xml' | 'text'): string => {
    switch (format) {
      case 'json':
        try {
          return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          return text;
        }
      case 'xml':
        // Preserve original XML structure
        return text;
      default:
        return text;
    }
  };

  const processChunk = useCallback((lines1: string[], lines2: string[], startIndex: number): { left: DiffLine; right: DiffLine }[] => {
    const chunkLines: { left: DiffLine; right: DiffLine }[] = [];
    const endIndex = Math.min(startIndex + CHUNK_SIZE, Math.max(lines1.length, lines2.length));

    for (let i = startIndex; i < endIndex; i++) {
      const line1 = lines1[i] ?? "";
      const line2 = lines2[i] ?? "";

      const trimmedLine1 = ignoreWhitespace ? line1.replace(/\s+/g, "").trim() : line1;
      const trimmedLine2 = ignoreWhitespace ? line2.replace(/\s+/g, "").trim() : line2;

      if (trimmedLine1 === trimmedLine2) {
        chunkLines.push({
          left: {
            type: "common",
            text: line1,
            html: escapeXml(line1),
            lineNumber: i + 1,
          },
          right: {
            type: "common",
            text: line2,
            html: escapeXml(line2),
            lineNumber: i + 1,
          },
        });
      } else {
        // For XML content, preserve whitespace and do a character-level diff
        const diff: Diff.Change[] = Diff.diffChars(line1, line2);

        const leftHtml = DOMPurify.sanitize(
          diff
            .map((part) => {
              if (part.removed) {
                return `<span class="bg-red-300 dark:bg-red-400 dark:text-zinc-900">${escapeXml(part.value)}</span>`;
              }
              return part.added ? "" : escapeXml(part.value);
            })
            .join("")
        );

        const rightHtml = DOMPurify.sanitize(
          diff
            .map((part) => {
              if (part.added) {
                return `<span class="bg-green-300 dark:bg-green-400 dark:text-zinc-900">${escapeXml(part.value)}</span>`;
              }
              return part.removed ? "" : escapeXml(part.value);
            })
            .join("")
        );

        chunkLines.push({
          left: {
            type: line1 ? "removed" : "common",
            text: line1,
            html: leftHtml,
            lineNumber: i + 1,
          },
          right: {
            type: line2 ? "added" : "common",
            text: line2,
            html: rightHtml,
            lineNumber: i + 1,
          },
        });
      }
    }

    return chunkLines;
  }, [ignoreWhitespace]);

  const compareTexts = async (): Promise<void> => {
    if (!text1.trim() || !text2.trim()) {
      setDiffLines([
        {
          left: {
            type: "common",
            text: "Please enter text in both fields.",
            lineNumber: 1,
          },
          right: {
            type: "common",
            text: "Please enter text in both fields.",
            lineNumber: 1,
          },
        },
      ]);
      setRemovals(0);
      setAdditions(0);
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setProcessedChunks(0);

    try {
      // Detect and format the input texts
      const format1 = detectFormat(text1);
      const format2 = detectFormat(text2);
      const formattedText1 = formatText(text1, format1);
      const formattedText2 = formatText(text2, format2);

      const lines1 = formattedText1
        .split("\n")
        .filter((line, i, arr) => line || i < arr.length - 1);
      const lines2 = formattedText2
        .split("\n")
        .filter((line, i, arr) => line || i < arr.length - 1);

      // Check if text is too large
      if (lines1.length > MAX_LINES || lines2.length > MAX_LINES) {
        setDiffLines([
          {
            left: {
              type: "common",
              text: `Text is too large. Maximum ${MAX_LINES} lines allowed.`,
              lineNumber: 1,
            },
            right: {
              type: "common",
              text: `Text is too large. Maximum ${MAX_LINES} lines allowed.`,
              lineNumber: 1,
            },
          },
        ]);
        return;
      }

      const maxLines = Math.max(lines1.length, lines2.length);
      setTotalChunks(Math.ceil(maxLines / CHUNK_SIZE));
      
      let allLines: { left: DiffLine; right: DiffLine }[] = [];
      let removalCount = 0;
      let additionCount = 0;

      // Process in chunks
      for (let i = 0; i < maxLines; i += CHUNK_SIZE) {
        const chunkLines = processChunk(lines1, lines2, i);
        allLines = [...allLines, ...chunkLines];
        
        // Update counts
        chunkLines.forEach(line => {
          if (line.left.type === "removed") removalCount++;
          if (line.right.type === "added") additionCount++;
        });

        setDiffLines(allLines);
        setRemovals(removalCount);
        setAdditions(additionCount);
        setProcessedChunks(prev => prev + 1);

        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } catch (error) {
      setDiffLines([
        {
          left: {
            type: "common",
            text: "Error during comparison",
            lineNumber: 1,
          },
          right: {
            type: "common",
            text: "Error during comparison",
            lineNumber: 1,
          },
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const clearTexts = (): void => {
    setText1("");
    setText2("");
    setDiffLines([]);
    setRemovals(0);
    setAdditions(0);
    setIsLoading(false);
    setIgnoreWhitespace(false);
  };

  const lineCount1 = text1 ? text1.split("\n").length : 0;
  const lineCount2 = text2 ? text2.split("\n").length : 0;

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-row items-center justify-start gap-3 mb-4">
          <BackToHome />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard>
          <div className="flex sm:items-center sm:flex-row flex-col justify-between mb-4">
            <h3 className="text-lg font-semibold mb-2 sm:mb-0">Text Compare</h3>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 mr-2">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="checkbox-primary mr-1"
                  aria-label="Ignore whitespace in comparison"
                />
                Ignore Whitespace
              </label>
              <LoadingButton
                onClick={compareTexts}
                isLoading={isLoading}
                disabled={!text1 || !text2}
              >
                {isProcessing ? `Processing... ${Math.round((processedChunks / totalChunks) * 100)}%` : 'Compare'}
              </LoadingButton>
              <ClearButton onClick={clearTexts} disabled={!text1 && !text2} />
            </div>
          </div>
          <hr className="line-break w-full sm:w-auto" />
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="text1" className="form-label mb-0">
                  Text 1:
                </label>
                <CopyButton text={text1} />
              </div>
              <AutoTextarea
                id="text1"
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="input-field"
                placeholder="Enter first text to compare"
                aria-label="First text input for comparison"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="text2" className="form-label mb-0">
                  Text 2:
                </label>
                <CopyButton text={text2} />
              </div>
              <AutoTextarea
                id="text2"
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="input-field"
                placeholder="Enter second text to compare"
                aria-label="Second text input for comparison"
              />
            </div>
          </div>
          {diffLines.length > 0 && (
            <div className="space-y-4">
              <label className="form-label mb-0">Differences:</label>
              <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                <div className="flex gap-4">
                  <span
                    className="flex items-center"
                    aria-label={`${removals} removals`}
                  >
                    <span className="w-4 h-4 bg-red-500 rounded-full mr-1"></span>
                    {removals} removal{removals !== 1 ? "s" : ""}
                  </span>
                  <span aria-label={`${lineCount1} lines in first text`}>
                    {lineCount1} line{lineCount1 !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span aria-label={`${lineCount2} lines in second text`}>
                    {lineCount2} line{lineCount2 !== 1 ? "s" : ""}
                  </span>
                  <span
                    className="flex items-center"
                    aria-label={`${additions} additions`}
                  >
                    <span className="w-4 h-4 bg-green-500 rounded-full mr-1"></span>
                    {additions} addition{additions !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse text-sm font-mono"
                  aria-label="Text comparison differences"
                >
                  <tbody>
                    {diffLines.map((line, index) => (
                      <tr key={index} className="dark:bg-zinc-800">
                        <td className="w-12 text-right pr-2 border border-gray-300 dark:border-gray-700">
                          {line.left.lineNumber}
                        </td>
                        <td
                          className={`w-1/2 p-1 text-sm sm:text-base ${
                            line.left.type === "removed"
                              ? "bg-red-100 dark:bg-red-200 dark:text-zinc-900"
                              : line.left.type === "added"
                              ? "bg-green-100 dark:bg-green-200 dark:text-zinc-900"
                              : ""
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: line.left.html || line.left.text,
                          }}
                          aria-label={
                            line.left.type === "removed"
                              ? "Removed text"
                              : line.left.type === "added"
                              ? "Added text"
                              : "Common text"
                          }
                        />
                        <td className="w-12 text-right pr-2 border-r border-gray-300 dark:border-gray-700">
                          {line.right.lineNumber}
                        </td>
                        <td
                          className={`w-1/2 p-1 text-sm sm:text-base ${
                            line.right.type === "added"
                              ? "bg-green-100 dark:bg-green-200 dark:text-zinc-900"
                              : line.right.type === "removed"
                              ? "bg-red-100 dark:bg-red-200 dark:text-zinc-900"
                              : ""
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: line.right.html || line.right.text,
                          }}
                          aria-label={
                            line.right.type === "added"
                              ? "Added text"
                              : line.right.type === "removed"
                              ? "Removed text"
                              : "Common text"
                          }
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
};

export default TextCompare;
