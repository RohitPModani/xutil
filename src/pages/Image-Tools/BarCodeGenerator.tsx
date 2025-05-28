import { useEffect, useState, useCallback } from "react";
import BackToHome from "../../components/BackToHome";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import ErrorBox from "../../components/ErrorBox";
import CopyButton from "../../components/CopyButton";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import seoDescriptions from "../../data/seoDescriptions";
import { updateToolUsage } from "../../utils/toolUsage";
import { Download } from "lucide-react";
import JsBarcode from "jsbarcode";
import LoadingButton from "../../components/LoadingButton";

type BarcodeOptions = {
  text: string;
  format: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontOptions?: string;
  font?: string;
  textAlign?: string;
  textPosition?: string;
  textMargin?: number;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
};

const DEFAULT_OPTIONS: BarcodeOptions = {
  text: "",
  format: "CODE128",
  width: 2,
  height: 100,
  displayValue: true,
  fontOptions: "",
  font: "monospace",
  textAlign: "center",
  textPosition: "bottom",
  textMargin: 2,
  fontSize: 20,
  background: "#ffffff",
  lineColor: "#000000",
  margin: 10,
};

const BARCODE_FORMATS = [
  { value: "CODE128", label: "CODE128" },
  { value: "CODE128A", label: "CODE128 A" },
  { value: "CODE128B", label: "CODE128 B" },
  { value: "CODE128C", label: "CODE128 C" },
  { value: "EAN13", label: "EAN-13" },
  { value: "EAN8", label: "EAN-8" },
  { value: "UPC", label: "UPC" },
  { value: "CODE39", label: "CODE39" },
  { value: "ITF14", label: "ITF-14" },
  { value: "MSI", label: "MSI" },
  { value: "pharmacode", label: "Pharmacode" },
  { value: "codabar", label: "Codabar" },
];

function BarcodeGenerator() {
  const seo = seoDescriptions.barcodeGenerator;

  const [options, setOptions] = useState<BarcodeOptions>(DEFAULT_OPTIONS);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    updateToolUsage("barcode_generator");
  }, []);

  const generateBarcode = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);

      if (!options.text) {
        throw new Error("Please enter text to generate barcode");
      }

      // Create a canvas element
      const canvas = document.createElement("canvas");

      // Generate barcode on the canvas
      JsBarcode(canvas, options.text, {
        format: options.format,
        width: options.width,
        height: options.height,
        displayValue: options.displayValue,
        fontOptions: options.fontOptions,
        font: options.font,
        textAlign: options.textAlign,
        textPosition: options.textPosition,
        textMargin: options.textMargin,
        fontSize: options.fontSize,
        background: options.background,
        lineColor: options.lineColor,
        margin: options.margin,
        marginTop: options.marginTop,
        marginBottom: options.marginBottom,
        marginLeft: options.marginLeft,
        marginRight: options.marginRight,
      });

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setBarcodeDataUrl(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate barcode"
      );
      console.error("Barcode generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : undefined;

      setOptions((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleNumberInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setOptions((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setOptions((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setOptions((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleClear = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setBarcodeDataUrl("");
    setError(null);
  }, []);

  const downloadBarcode = useCallback(() => {
    if (!barcodeDataUrl) return;

    const link = document.createElement("a");
    link.href = barcodeDataUrl;
    link.download = `barcode-${options.format}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [barcodeDataUrl, options.format]);

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
            <h3 className="text-lg font-semibold">Barcode Generator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!options.text && !barcodeDataUrl}
              aria-label="Clear inputs"
            />
          </div>
          <hr className="line-break" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="text" className="form-label">
                  Barcode Content:
                </label>
                <input
                  id="text"
                  name="text"
                  type="text"
                  className="input-field"
                  value={options.text}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="format" className="form-label">
                  Barcode Format:
                </label>
                <select
                  id="format"
                  name="format"
                  className="input-field"
                  value={options.format}
                  onChange={handleSelectChange}
                >
                  {BARCODE_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="width" className="form-label">
                    Line Width:
                  </label>
                  <input
                    id="width"
                    name="width"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    className="input-field"
                    value={options.width}
                    onChange={handleNumberInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="height" className="form-label">
                    Line Height:
                  </label>
                  <input
                    id="height"
                    name="height"
                    type="number"
                    min="10"
                    max="500"
                    className="input-field"
                    value={options.height}
                    onChange={handleNumberInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fontSize" className="form-label">
                    Text Size:
                  </label>
                  <input
                    id="fontSize"
                    name="fontSize"
                    type="number"
                    min="8"
                    max="72"
                    className="input-field"
                    value={options.fontSize}
                    onChange={handleNumberInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="margin" className="form-label">
                    Margin:
                  </label>
                  <input
                    id="margin"
                    name="margin"
                    type="number"
                    min="0"
                    max="50"
                    className="input-field"
                    value={options.margin}
                    onChange={handleNumberInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lineColor" className="form-label">
                    Line Color:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="lineColor"
                      name="lineColor"
                      type="color"
                      className="h-10 w-10 cursor-pointer"
                      value={options.lineColor}
                      onChange={handleColorChange}
                    />
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={options.lineColor}
                      onChange={handleInputChange}
                      name="lineColor"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="background" className="form-label">
                    Background:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="background"
                      name="background"
                      type="color"
                      className="h-10 w-10 cursor-pointer"
                      value={options.background}
                      onChange={handleColorChange}
                    />
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={options.background}
                      onChange={handleInputChange}
                      name="background"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="displayValue"
                  name="displayValue"
                  type="checkbox"
                  className="checkbox-primary"
                  checked={options.displayValue || false}
                  onChange={handleInputChange}
                />
                <label
                  htmlFor="displayValue"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Display Text
                </label>
              </div>

              <div className="flex justify-center item-center">
                <LoadingButton
                  onClick={generateBarcode}
                  disabled={isGenerating}
                  isLoading={isGenerating}
                >
                  Generate Barcode
                </LoadingButton>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              {barcodeDataUrl ? (
                <>
                  <img
                    src={barcodeDataUrl}
                    alt="Generated Barcode"
                    className="mb-4 border rounded p-2 bg-zinc-100 dark:bg-zinc-800 max-w-full"
                  />
                  <div className="flex justify-center item center gap-4">
                    <CopyButton text={barcodeDataUrl} />
                    <button onClick={downloadBarcode} className="btn-secondary">
                      <Download className="sm:w-6 sm:h-6 w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors duration-100" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                  Barcode will appear here
                </div>
              )}
            </div>
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default BarcodeGenerator;
