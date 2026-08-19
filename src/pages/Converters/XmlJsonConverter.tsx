import { useState, useRef, useEffect } from "react";
import ErrorBox from "../../components/ErrorBox";
import LoadingButton from "../../components/LoadingButton";
import SectionCard from "../../components/SectionCard";
import CopyButton from "../../components/CopyButton";
import ClearButton from "../../components/ClearButton";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";
import DownloadButton from "../../components/DownloadButton";
import SEODescription from "../../components/SEODescription";
import FileUploader from "../../components/FileUploader";
import { useFileReset } from "../../hooks/useFileReset";
import seoDescriptions from "../../data/seoDescriptions";
import { PageSEO } from "../../components/PageSEO";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { updateToolUsage } from "../../utils/toolUsage";
import { getErrorMessage } from "../../utils/errors";
import type { JsonObject, JsonValue } from "../../types/json";
import ToolHeader from "../../components/ToolHeader";

interface ConversionResult {
  result: string;
  type: "xml" | "json";
}

enum ConversionType {
  JSON = "json",
  XML = "xml",
}

function XMLJSONConverter() {
  const seo = seoDescriptions.xmlJson;
  const [inputText, setInputText] = useState("");
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [fileResult, setFileResult] = useState("");
  const [error, setError] = useState("");
  const [fileType, setFileType] = useState<ConversionType | null>(null);
  const [fileBaseName, setFileBaseName] = useState("");
  const [fileInputText, setFileInputText] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const textResultRef = useRef<HTMLDivElement | null>(null);
  const fileResultRef = useRef<HTMLDivElement | null>(null);
  const inputTextRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const xmlReset = useFileReset();
  const jsonReset = useFileReset();

  useEffect(() => {
    updateToolUsage("xml_json");
  }, []);

  const scrollToResult = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const xmlToJson = (xmlString: string): string => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Check for parser errors
      const parserErrors = xmlDoc.getElementsByTagName("parsererror");
      if (parserErrors.length > 0) {
        throw new Error("Invalid XML format");
      }

      const result: JsonObject = {};
      const root = xmlDoc.documentElement;

      const parseNode = (node: Element): JsonValue => {
        // If node has no child elements, return its text content directly
        const hasChildElements = Array.from(node.childNodes).some(
          (child) => child.nodeType === Node.ELEMENT_NODE
        );

        if (!hasChildElements) {
          return node.textContent?.trim() || "";
        }

        const obj: JsonObject = {};

        // Handle attributes
        if (node.attributes && node.attributes.length > 0) {
          obj["@attributes"] = {};
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            obj["@attributes"][attr.name] = attr.value;
          }
        }

        // Group child elements by name
        const childGroups: Record<string, Element[]> = {};

        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child as Element;
            const childName = childElement.nodeName;

            if (!childGroups[childName]) {
              childGroups[childName] = [];
            }
            childGroups[childName].push(childElement);
          }
        });

        // Process each group of child elements
        for (const [childName, children] of Object.entries(childGroups)) {
          if (children.length === 1) {
            // Single child - no array needed
            obj[childName] = parseNode(children[0]);
          } else {
            // Multiple children with same name - create array
            obj[childName] = children.map(parseNode);
          }
        }

        return obj;
      };

      result[root.nodeName] = parseNode(root);
      return JSON.stringify(result, null, 2);
    } catch (err) {
      throw new Error(
        "Failed to parse XML: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const jsonToXml = (jsonString: string): string => {
    try {
      const jsonObj = JSON.parse(jsonString);
      const rootName = Object.keys(jsonObj)[0];
      const rootObj = jsonObj[rootName];

      const serializeNode = (
        name: string,
        obj: JsonValue,
        indent = ""
      ): string => {
        const newIndent = indent + "  ";

        // Handle simple values (non-objects and non-arrays)
        if (typeof obj !== "object" || obj === null) {
          return `${indent}<${name}>${escapeXmlText(String(obj))}</${name}>`;
        }

        // A nested array repeats the element rather than emitting numeric
        // tags like <0>, which are not valid XML names.
        if (Array.isArray(obj)) {
          return obj
            .map((item) => serializeNode(name, item, indent))
            .join("\n");
        }

        let xml = `${indent}<${name}`;

        // Handle attributes
        const attributes = obj["@attributes"];
        if (attributes && typeof attributes === "object" && !Array.isArray(attributes)) {
          for (const [attrName, attrValue] of Object.entries(attributes)) {
            xml += ` ${attrName}="${String(attrValue).replace(
              /"/g,
              "&quot;"
            )}"`;
          }
        }

        // Handle empty objects
        const childKeys = Object.keys(obj).filter(
          (key) => key !== "@attributes" && key !== "#text"
        );

        if (childKeys.length === 0) {
          return obj["#text"] !== undefined
            ? `${xml}>${escapeXmlText(String(obj["#text"]))}</${name}>`
            : `${xml}/>`;
        }

        xml += ">\n";

        // Process child elements
        for (const key of childKeys) {
          const value = obj[key];

          if (Array.isArray(value)) {
            for (const item of value) {
              if (
                typeof item === "string" ||
                typeof item === "number" ||
                typeof item === "boolean"
              ) {
                // Handle array of primitives as single element
                xml += `${newIndent}<${key}>${escapeXmlText(
                  String(item)
                )}</${key}>\n`;
              } else {
                // Handle array of objects
                xml += `${serializeNode(key, item, newIndent)}\n`;
              }
            }
          } else if (typeof value === "object" && value !== null) {
            xml += `${serializeNode(key, value, newIndent)}\n`;
          } else {
            xml += `${newIndent}<${key}>${escapeXmlText(
              String(value)
            )}</${key}>\n`;
          }
        }

        xml += `${indent}</${name}>`;
        return xml;
      };

      const escapeXmlText = (text: string): string => {
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      };

      const xmlBody = serializeNode(rootName, rootObj);
      return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
    } catch (err) {
      throw new Error(
        "Failed to convert JSON to XML: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };
  const convertText = async (type: ConversionType) => {
    if (!inputText.trim()) {
      setError("Conversion failed: Input text cannot be empty");
      setConversionResult(null);
      return;
    }

    setError("");
    setIsConverting(true);

    try {
      let result: string;
      if (type === ConversionType.XML) {
        result = xmlToJson(inputText);
        setConversionResult({ result, type: "json" });
      } else {
        result = jsonToXml(inputText);
        setConversionResult({ result, type: "xml" });
      }
      scrollToResult(textResultRef);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(`Conversion failed: ${getErrorMessage(err, "Invalid format")}`);
      setConversionResult(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileConversion = async (file: File, type: ConversionType) => {
    if (!file) {
      setError("File upload failed: No file selected");
      setFileResult("");
      setFileType(null);
      return;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setFileBaseName(baseName);
    setIsConverting(true);

    try {
      const fileText = await file.text();
      setFileInputText(fileText);
      let result: string;

      if (type === ConversionType.XML) {
        result = xmlToJson(fileText);
        setFileType(ConversionType.JSON);
        jsonReset.triggerReset();
      } else {
        result = jsonToXml(fileText);
        setFileType(ConversionType.XML);
        xmlReset.triggerReset();
      }

      setFileResult(result);
      setError("");
      scrollToResult(fileResultRef);
    } catch (err) {
      console.error("File conversion error:", err);
      setError(`File conversion failed: ${getErrorMessage(err, "Invalid format")}`);
      setFileResult("");
      setFileType(null);
    } finally {
      setIsConverting(false);
    }
  };

  const clearTextConversion = () => {
    setInputText("");
    setConversionResult(null);
    setError("");
  };

  const clearFileConversion = () => {
    setFileResult("");
    setFileInputText("");
    setFileType(null);
    setError("");
    xmlReset.triggerReset();
    jsonReset.triggerReset();
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
      <div className="py-6 sm:py-8">
        <ToolHeader title={seo.title} />

        {/* Text Conversion Section */}
        <SectionCard>
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Text Conversion</h3>
              <ClearButton
                onClick={clearTextConversion}
                disabled={!inputText && !conversionResult && !error}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between mb-4"
              ref={textResultRef}
            >
              <h3 className="section-title">Text Conversion</h3>
              <ClearButton
                onClick={clearTextConversion}
                disabled={!inputText && !conversionResult && !error}
              />
            </div>
          )}
          <hr className="line-break" />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label" htmlFor="input-text">
                Input Text:
              </label>
              <AutoTextarea
                id="input-text"
                value={inputText}
                onChange={handleInputTextChange}
                className="input-field w-full"
                placeholder="Enter XML or JSON text to convert"
                ref={inputTextRef}
                aria-describedby={error ? "xml-json-text-error" : undefined}
                aria-label="XML or JSON input text"
              />
              <div className="flex flex-wrap gap-2">
                <LoadingButton
                  onClick={() => convertText(ConversionType.XML)}
                  isLoading={isConverting}
                  disabled={!inputText.trim()}
                >
                  XML to JSON
                </LoadingButton>
                <LoadingButton
                  onClick={() => convertText(ConversionType.JSON)}
                  isLoading={isConverting}
                  disabled={!inputText.trim()}
                >
                  JSON to XML
                </LoadingButton>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Result:</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={conversionResult?.result || ""} />
                  <DownloadButton
                    content={conversionResult?.result || ""}
                    fileName={`converted_result.${
                      conversionResult?.type || "txt"
                    }`}
                    fileType={conversionResult?.type || "txt"}
                    disabled={!conversionResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={conversionResult?.result || ""}
                readOnly
                disabled={!conversionResult}
                placeholder="Converted result will appear here..."
                className={`input-field w-full ${
                  !conversionResult ? "text-faint" : ""
                }`}
                aria-label="Converted XML or JSON result"
              />
              {conversionResult && (
                <p className="text-sm text-muted mt-1">
                  Converted:{" "}
                  {conversionResult.type === "json"
                    ? "XML to JSON"
                    : "JSON to XML"}
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="xml-json-text-error" />}
        </SectionCard>

        {/* File Conversion Section */}
        <SectionCard className="mt-6">
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">File Conversion</h3>
              <ClearButton
                onClick={clearFileConversion}
                disabled={!fileInputText && !fileResult && !error}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between mb-4"
              ref={fileResultRef}
            >
              <h3 className="section-title">File Conversion</h3>
              <ClearButton
                onClick={clearFileConversion}
                disabled={!fileInputText && !fileResult && !error}
              />
            </div>
          )}
          <hr className="line-break" />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label" htmlFor="xml-file-upload">
                Upload XML File
              </label>
              <FileUploader
                accept=".xml"
                label="Choose XML"
                onFileSelected={(file) =>
                  handleFileConversion(file, ConversionType.XML)
                }
                onClear={clearFileConversion}
                resetSignal={xmlReset.resetSignal}
                disabled={isConverting}
              />
            </div>

            <div className="flex-1">
              <label className="form-label" htmlFor="json-file-upload">
                Upload JSON File
              </label>
              <FileUploader
                accept=".json"
                label="Choose JSON"
                onFileSelected={(file) =>
                  handleFileConversion(file, ConversionType.JSON)
                }
                onClear={clearFileConversion}
                resetSignal={jsonReset.resetSignal}
                disabled={isConverting}
              />
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
                  !fileInputText ? "text-faint" : ""
                }`}
                aria-label="Input text from uploaded file"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Result:</label>
                <div>
                  <CopyButton text={fileResult} className="mr-3" />
                  <DownloadButton
                    content={fileResult}
                    fileName={`${fileBaseName}_converted.${fileType || "txt"}`}
                    fileType={fileType || "txt"}
                    disabled={!fileResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={fileResult}
                readOnly
                disabled={!fileResult}
                placeholder="Converted result will appear here after upload..."
                className={`input-field w-full h-64 ${
                  !fileResult ? "text-faint" : ""
                }`}
                aria-label="Converted result from uploaded file"
              />
              {fileResult && (
                <p className="text-sm text-muted mt-1">
                  Converted:{" "}
                  {fileType === ConversionType.JSON
                    ? "XML to JSON"
                    : "JSON to XML"}
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="xml-json-file-error" />}
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default XMLJSONConverter;
