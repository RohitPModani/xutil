import { useState, useRef, useEffect } from "react";
import BackToHome from "../../components/BackToHome";
import ErrorBox from "../../components/ErrorBox";
import LoadingButton from "../../components/LoadingButton";
import SectionCard from "../../components/SectionCard";
import CopyButton from "../../components/CopyButton";
import ClearButton from "../../components/ClearButton";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";
import DownloadButton from "../../components/DownloadButton";
import SEODescription from "../../components/SEODescription";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import FileUploader from "../../components/FileUploader";
import { useFileReset } from "../../hooks/useFileReset";
import seoDescriptions from "../../data/seoDescriptions";
import { PageSEO } from "../../components/PageSEO";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { updateToolUsage } from "../../utils/toolUsage";
import { validateClassName } from "../../utils/jsonPythonUtils";

interface ConversionResult {
  result: string;
  type: "py";
}

enum ConversionType {
  PY = "py",
}

type AnyDict = { [key: string]: any };
type AnyList = any[];

function jsonToPython(jsonData: string, className: string): string {
  try {
    if (!jsonData.trim()) {
      throw new Error("JSON data cannot be empty");
    }

    const data = JSON.parse(jsonData);
    const classes: string[] = [];
    const classMap = new Map<string, string>();

    // Add imports only once at the beginning
    const imports = [
      "from dataclasses import dataclass",
      "from typing import List, Any, Union",
      "from datetime import date, datetime",
      "",
    ].join("\n");

    function capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getType(value: any, key: string, depth: number): string {
      if (value === null) {
        return "None";
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          return "List[Any]";
        }

        // Handle arrays with mixed types
        const types = new Set<string>();
        value.forEach((item) => {
          const itemType = getType(item, key, depth);
          // Skip duplicates and simplify basic types
          if (!types.has(itemType)) {
            types.add(itemType);
          }
        });

        // Simplify when we have multiple types
        if (types.size > 1) {
          // Check if we have both integer and float - just use float
          if (types.has("int") && types.has("float")) {
            types.delete("int");
          }
          // Check if we have multiple number types
          if (types.has("int") && types.has("float")) {
            types.delete("int");
          }
        }

        const baseType =
          types.size > 1
            ? `Union[${Array.from(types).join(", ")}]`
            : Array.from(types)[0];

        return `List[${baseType}]`;
      } else if (value && typeof value === "object") {
        const subClassName = `${className}${capitalize(key)}`;
        if (!classMap.has(subClassName)) {
          generateClass(value, subClassName, depth + 1);
        }
        return subClassName;
      } else if (typeof value === "string") {
        if (
          /^\d{4}-\d{2}-\d{2}$/.test(value) ||
          /^\d{2}-\d{2}-\d{4}$/.test(value)
        ) {
          return "date";
        } else if (
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(
            value
          )
        ) {
          return "datetime";
        }
        return "str";
      } else if (typeof value === "number") {
        return Number.isInteger(value) ? "int" : "float";
      } else if (typeof value === "boolean") {
        return "bool";
      } else {
        return "Any";
      }
    }

    function generateClass(
      obj: AnyDict | AnyList,
      name: string,
      depth: number
    ): void {
      if (classMap.has(name)) {
        return;
      }

      const lines: string[] = [`@dataclass`, `class ${name}:`];
      const properties: AnyDict = Array.isArray(obj)
        ? obj.length > 0
          ? obj[0]
          : {}
        : obj;

      for (const [key, value] of Object.entries(properties)) {
        const type = getType(value, key, depth);
        lines.push(`    ${key}: ${type}`);
      }

      classMap.set(name, lines.join("\n"));
      classes.push(lines.join("\n"));
    }

    generateClass(data, className, 0);
    return [imports, ...classes].join("\n\n");
  } catch (e: any) {
    throw new Error(
      `JSON to Python conversion failed: ${e.message || "Invalid format"}`
    );
  }
}

function JSONPythonClassConverter() {
  const seo = seoDescriptions.jsonToPython;
  const [inputText, setInputText] = useState("");
  const [textClassName, setTextClassName] = useState("Root");
  const [fileClassName, setFileClassName] = useState("Root");
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [fileResult, setFileResult] = useState("");
  const [textError, setTextError] = useState("");
  const [fileError, setFileError] = useState("");
  const [, setFileType] = useState<ConversionType | null>(null);
  const [fileBaseName, setFileBaseName] = useState("");
  const [fileInputText, setFileInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const textResultRef = useRef<HTMLDivElement | null>(null);
  const fileResultRef = useRef<HTMLDivElement | null>(null);
  const inputTextRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const fileReset = useFileReset();

  useEffect(() => {
    updateToolUsage("json_python");
  }, []);

  const scrollToResult = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const convertText = async () => {
    if (!inputText.trim()) {
      setTextError("Conversion failed: Input text cannot be empty");
      setConversionResult(null);
      return;
    }

    const error = validateClassName(textClassName);
    if (error) {
      setTextError(error);
      setConversionResult(null);
      return;
    }

    setTextError("");
    setIsConverting(true);

    try {
      const result = jsonToPython(inputText, textClassName);
      setConversionResult({ result, type: "py" });
      scrollToResult(textResultRef);
    } catch (err: any) {
      console.error("Conversion error:", err);
      setTextError(`Conversion failed: ${err.message || "Invalid format"}`);
      setConversionResult(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileSelection = async (file: File) => {
    if (!file) {
      setFileError("File upload failed: No file selected");
      setFileInputText("");
      setSelectedFile(null);
      return;
    }

    try {
      const fileText = await file.text();
      setFileInputText(fileText);
      setSelectedFile(file);
      setFileBaseName(file.name.replace(/\.[^/.]+$/, ""));
      setFileError("");
    } catch (err: any) {
      console.error("File read error:", err);
      setFileError(`File read failed: ${err.message || "Unable to read file"}`);
      setFileInputText("");
      setSelectedFile(null);
    }
  };

  const handleFileConversion = async () => {
    if (!selectedFile || !fileInputText.trim()) {
      setFileError(
        "Conversion failed: No file selected or file content is empty"
      );
      setFileResult("");
      setFileType(null);
      return;
    }

    const error = validateClassName(fileClassName);
    if (error) {
      setFileError(error);
      setFileResult("");
      setFileType(null);
      return;
    }

    setFileError("");
    setIsConverting(true);

    try {
      const result = jsonToPython(fileInputText, fileClassName);
      setFileResult(result);
      setFileType(ConversionType.PY);
      scrollToResult(fileResultRef);
    } catch (err: any) {
      console.error("File conversion error:", err);
      setFileError(`Conversion failed: ${err.message || "Invalid format"}`);
      setFileResult("");
      setFileType(null);
    } finally {
      setIsConverting(false);
    }
  };

  const clearTextConversion = () => {
    setInputText("");
    setTextClassName("Root");
    setConversionResult(null);
    setTextError("");
  };

  const clearFileConversion = () => {
    setFileResult("");
    setFileInputText("");
    setSelectedFile(null);
    setFileType(null);
    setFileBaseName("");
    setFileClassName("Root");
    setFileError("");
    fileReset.triggerReset();
  };

  const handleInputTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (inputTextRef.current) {
      inputTextRef.current.focus();
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

        {/* Text Conversion Section */}
        <SectionCard>
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Text Conversion</h3>
              <ClearButton
                onClick={clearTextConversion}
                disabled={!inputText && !conversionResult && !textError}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between mb-4"
              ref={textResultRef}
            >
              <h3 className="text-lg font-semibold">Text Conversion</h3>
              <ClearButton
                onClick={clearTextConversion}
                disabled={!inputText && !conversionResult && !textError}
              />
            </div>
          )}
          <hr className="line-break" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label" htmlFor="input-text">
                Input JSON:
              </label>
              <AutoTextarea
                id="input-text"
                value={inputText}
                onChange={handleInputTextChange}
                className="input-field w-full"
                placeholder="Enter JSON text to convert"
                ref={inputTextRef}
                aria-describedby={
                  textError ? "json-python-text-error" : undefined
                }
                aria-label="JSON input text"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <label className="form-label text-base mr-2">
                      Class Name:
                    </label>
                    <input
                      value={textClassName}
                      onChange={(e) => setTextClassName(e.target.value)}
                      className="input-field rounded-md w-32 "
                      placeholder="Root"
                    />
                  </div>
                </div>
                <LoadingButton
                  onClick={convertText}
                  isLoading={isConverting}
                  disabled={!inputText.trim()}
                >
                  Convert
                </LoadingButton>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Python:</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={conversionResult?.result || ""} />
                  <DownloadButton
                    content={conversionResult?.result || ""}
                    fileName={`${textClassName}.py`}
                    fileType="py"
                    disabled={!conversionResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={conversionResult?.result || ""}
                readOnly
                disabled={!conversionResult}
                placeholder="Converted Python classes will appear here..."
                className={`input-field w-full ${
                  !conversionResult ? "text-zinc-400 dark:text-zinc-500" : ""
                }`}
                style={{ whiteSpace: "pre" }}
                aria-label="Converted Python result"
              />
              {conversionResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: JSON to Python
                </p>
              )}
            </div>
          </div>
          {textError && (
            <ErrorBox message={textError} id="json-python-text-error" />
          )}
        </SectionCard>

        {/* File Conversion Section */}
        <SectionCard className="mt-6">
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">File Conversion</h3>
              <ClearButton
                onClick={clearFileConversion}
                disabled={!fileInputText && !fileResult && !fileError}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between mb-4"
              ref={fileResultRef}
            >
              <h3 className="text-lg font-semibold">File Conversion</h3>
              <ClearButton
                onClick={clearFileConversion}
                disabled={!fileInputText && !fileResult && !fileError}
              />
            </div>
          )}
          <hr className="line-break" />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label" htmlFor="json-file-upload">
                Upload JSON File
              </label>
              <FileUploader
                accept=".json"
                label="Choose JSON"
                onFileSelected={handleFileSelection}
                onClear={clearFileConversion}
                resetSignal={fileReset.resetSignal}
                disabled={isConverting}
              />
              <div className="flex flex-wrap gap-2 items-center mt-4">
                <div className="flex items-center">
                  <label className="form-label text-base mr-2">
                    Class Name:
                  </label>
                  <input
                    value={fileClassName}
                    onChange={(e) => setFileClassName(e.target.value)}
                    className="input-field rounded-md w-32"
                    placeholder="Root"
                  />
                </div>
                <LoadingButton
                  onClick={handleFileConversion}
                  isLoading={isConverting}
                  disabled={!selectedFile || !fileInputText.trim()}
                >
                  Convert
                </LoadingButton>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label mb-3">Input Text (from file):</label>
              <AutoTextarea
                value={fileInputText}
                readOnly
                disabled={!fileInputText}
                placeholder="Input text from file..."
                className={`input-field w-full h-64 ${
                  !fileInputText ? "text-zinc-400 dark:text-zinc-500" : ""
                }`}
                style={{ whiteSpace: "pre" }}
                aria-label="Input text from uploaded file"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Python:</label>
                <div>
                  <CopyButton text={fileResult} className="mr-3" />
                  <DownloadButton
                    content={fileResult}
                    fileName={`${fileBaseName || fileClassName}_converted.py`}
                    fileType="py"
                    disabled={!fileResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={fileResult}
                readOnly
                disabled={!fileResult}
                placeholder="Converted result will appear here..."
                className={`input-field w-full h-64 ${
                  !fileResult ? "text-zinc-400 dark:text-zinc-500" : ""
                }`}
                style={{ whiteSpace: "pre" }}
                aria-label="Converted result from uploaded file"
              />
              {fileResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: JSON to Python
                </p>
              )}
            </div>
          </div>
          {fileError && (
            <ErrorBox message={fileError} id="json-python-file-error" />
          )}
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default JSONPythonClassConverter;
