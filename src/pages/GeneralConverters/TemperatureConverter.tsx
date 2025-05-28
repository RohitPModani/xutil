import { useCallback, useEffect, useState } from "react";
import BackToHome from "../../components/BackToHome";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import ErrorBox from "../../components/ErrorBox";
import CopyButton from "../../components/CopyButton";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import seoDescriptions from "../../data/seoDescriptions";
import useResultText from "../../hooks/useResultsText";
import { updateToolUsage } from "../../utils/toolUsage";

function TemperatureConverter() {
  const seo = seoDescriptions.temperature || {
    title: "Temperature Converter",
    body: "Convert temperatures between Celsius, Fahrenheit, and Kelvin.",
  };
  const [value, setValue] = useState("0");
  const [unit, setUnit] = useState("celsius");
  const [result, setResult] = useState<{
    celsius?: number;
    fahrenheit?: number;
    kelvin?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const units = [
    { value: "celsius", label: "Celsius" },
    { value: "fahrenheit", label: "Fahrenheit" },
    { value: "kelvin", label: "Kelvin" },
  ];

  useEffect(() => {
    updateToolUsage("temperature");
    setResult(convertTemperature(0, "celsius"));
  }, []);

  const convertTemperature = (valueNum: number, unit: string) => {
    let celsius, fahrenheit, kelvin;
    if (unit === "celsius") {
      celsius = valueNum;
      fahrenheit = (valueNum * 9) / 5 + 32;
      kelvin = valueNum + 273.15;
    } else if (unit === "fahrenheit") {
      celsius = ((valueNum - 32) * 5) / 9;
      fahrenheit = valueNum;
      kelvin = celsius + 273.15;
    } else {
      celsius = valueNum - 273.15;
      fahrenheit = (celsius * 9) / 5 + 32;
      kelvin = valueNum;
    }
    return { celsius, fahrenheit, kelvin };
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    const valueNum = parseFloat(inputValue);
    if (isNaN(valueNum)) {
      setError("Please enter a valid number.");
      setResult(null);
      return;
    }
    setError(null);
    const converted = convertTemperature(valueNum, unit);
    setResult(converted);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnit(e.target.value);
    const valueNum = parseFloat(value);
    if (!isNaN(valueNum)) {
      const converted = convertTemperature(valueNum, e.target.value);
      setResult(converted);
    }
  };

  const handleClear = () => {
    setValue("0");
    setUnit("celsius");
    setResult({ celsius: 0, fahrenheit: 32, kelvin: 273.15 });
    setError(null);
  };

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 8,
    }).format(num);
  }, []);

  const getResultsText = useResultText(result, units);

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex justify-between items-center mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">
          {seo.title}
        </h2>

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Temperature Converter
            </h3>
            <ClearButton
              onClick={handleClear}
              disabled={!value && !result && !error}
            />
          </div>
          <hr className="line-break" />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="form-label">Value (Max Length: 8)</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Enter value (e.g., 0)"
                  value={value}
                  maxLength={8}
                  onChange={handleValueChange}
                />
              </div>
              <div className="flex-1">
                <label className="form-label">Unit</label>
                <select
                  value={unit}
                  onChange={handleUnitChange}
                  className="input-field w-full h-10"
                >
                  {units.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="result-box mt-1">
              <div className="flex justify-between items-center">
                <label className="form-label text-base">
                  Conversion Result
                </label>
                {result && (
                  <CopyButton text={getResultsText} copyType="CopyAll" />
                )}
              </div>
              {result && (
                <div className="scrollbox mt-2">
                  <div className="flex flex-col gap-3">
                    {Object.entries(result).map(([key, val]) => {
                      const unit = units.find((u) => u.value === key);
                      const displayLabel = unit
                        ? unit.label
                        : key.toUpperCase();
                      const formattedVal = formatNumber(val);
                      return (
                        <div key={key} className="inner-result">
                          <span className="whitespace-pre-wrap break-all">
                            {displayLabel}: {formattedVal}
                          </span>
                          <CopyButton
                            text={`${displayLabel}: ${formattedVal}`}
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

export default TemperatureConverter;
