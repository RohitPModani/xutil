import { useEffect, useState, useCallback } from "react";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import ErrorBox from "../../components/ErrorBox";
import CopyButton from "../../components/CopyButton";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import useResultText from "../../hooks/useResultsText";
import { updateToolUsage } from "../../utils/toolUsage";
import ToolHeader from "../../components/ToolHeader";

interface Unit {
  value: string;
  label: string;
}

interface UnitConverterProps {
  seo: { title: string; body: string; seo: string };
  defaultValue: string;
  defaultUnit: string;
  units: Unit[];
  converterName: string;
  validationMessage: string;
  convertFunction: (value: number, unit: string) => Record<string, number>;
  toolName: string;
}

function UnitConverter({
  seo,
  defaultValue,
  defaultUnit,
  units,
  converterName,
  validationMessage,
  convertFunction,
  toolName,
}: UnitConverterProps) {
  const [value, setValue] = useState(defaultValue);
  const [unit, setUnit] = useState(defaultUnit);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage(toolName);
  }, [toolName]);

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 8,
    }).format(num);
  }, []);

  const performConversion = useCallback(
    (inputValue: string, inputUnit: string) => {
      if (!inputValue.trim()) {
        setError("Please enter a value");
        setResult(null);
        return;
      }

      const valueNum = parseFloat(inputValue);
      if (isNaN(valueNum)) {
        setError("Please enter a valid number");
        setResult(null);
        return;
      }

      if (valueNum <= 0) {
        setError(validationMessage);
        setResult(null);
        return;
      }

      try {
        const convertedValues = convertFunction(valueNum, inputUnit);
        if (!convertedValues || Object.keys(convertedValues).length === 0) {
          throw new Error("No conversion results returned");
        }
        setResult(convertedValues);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Conversion failed");
        setResult(null);
      }
    },
    [convertFunction, validationMessage]
  );

  useEffect(() => {
    performConversion(value, unit);
  }, [value, unit]);

  const handleClear = () => {
    setValue(defaultValue);
    setUnit(defaultUnit);
    setResult(null);
    setError(null);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(input) || input === "") {
      setValue(input);
    }
  };

  const getResultsText = useResultText(result, units);

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="py-6 sm:py-8">
        <ToolHeader title={seo.title} />

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="label">Convert</h2>
            <ClearButton
              onClick={handleClear}
              disabled={value == defaultValue && unit == defaultUnit}
              aria-label="Reset converter to default values"
            />
          </div>
          <hr className="line-break" />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="converter-value" className="form-label">
                  {converterName == "Fuel Economy Converter"
                    ? "Value"
                    : "Value (Max length: 20)"}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field w-full"
                  placeholder="Enter value"
                  value={value}
                  onChange={handleValueChange}
                  maxLength={20}
                  aria-label="Input value for conversion"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="converter-unit" className="form-label">
                  Unit
                </label>
                <select
                  id="converter-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="input-field w-full"
                  aria-label="Select unit for conversion"
                >
                  {units.map((unitOption) => (
                    <option key={unitOption.value} value={unitOption.value}>
                      {unitOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="result-box mt-1">
              <div className="flex justify-between items-center">
                <label className="form-label">
                  Conversion Result
                </label>
                {result && (
                  <div className="flex items-center gap-2">
                    <CopyButton text={getResultsText} copyType="CopyAll" />
                  </div>
                )}
              </div>
              {result && (
                <div className="scrollbox mt-2">
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(result).map(([key, val]) => {
                      const unit = units.find((u) => u.value === key);
                      const displayLabel = unit
                        ? unit.label
                        : key.toUpperCase();
                      const formattedVal = formatNumber(val);
                      return (
                        <div key={key} className="inner-result">
                          <span className="font-mono text-ink whitespace-pre-wrap break-all">
                            {displayLabel}: {formattedVal}
                          </span>
                          <CopyButton
                            text={`${displayLabel}: ${formattedVal}`}
                            aria-label={`Copy ${displayLabel} value`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div aria-live="polite">
                <ErrorBox message={error} />
              </div>
            )}
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default UnitConverter;
