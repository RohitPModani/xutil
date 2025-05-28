import React from "react";
import UnitConverter from "./UnitConverter";
import seoDescriptions from "../../data/seoDescriptions";

type TimeUnit =
  | "ns"
  | "μs"
  | "ms"
  | "s"
  | "min"
  | "hr"
  | "day"
  | "week"
  | "month"
  | "year"
  | "decade"
  | "century";
type TimeConversionRates = Record<TimeUnit, number>;

const UNITS: { value: TimeUnit; label: string }[] = [
  { value: "ns", label: "Nanoseconds (ns)" },
  { value: "μs", label: "Microseconds (μs)" },
  { value: "ms", label: "Milliseconds (ms)" },
  { value: "s", label: "Seconds (s)" },
  { value: "min", label: "Minutes (min)" },
  { value: "hr", label: "Hours (hr)" },
  { value: "day", label: "Days (day)" },
  { value: "week", label: "Weeks (week)" },
  { value: "month", label: "Months (month)" },
  { value: "year", label: "Years (year)" },
  { value: "decade", label: "Decades (decade)" },
  { value: "century", label: "Centuries (century)" },
] as const;

const UNIT_TO_SECONDS: TimeConversionRates = {
  ns: 1e-9, // Nanoseconds
  μs: 1e-6, // Microseconds
  ms: 1e-3, // Milliseconds
  s: 1, // Seconds
  min: 60, // Minutes
  hr: 3600, // Hours
  day: 86400, // Days
  week: 604800, // Weeks
  month: 2628000, // Months (average: 30.42 days)
  year: 31536000, // Years (average: 365 days)
  decade: 315360000, // Decades
  century: 3153600000, // Centuries
};

const VALIDATION_MESSAGE = "Time must be greater than zero.";
const CONVERTER_NAME = "Time Unit Converter";

function TimeConverter() {
  const convertTime = (value: number, unit: string): Record<string, number> => {
    if (!Object.keys(UNIT_TO_SECONDS).includes(unit)) {
      throw new Error(
        `Invalid unit: ${unit}. Supported units: ${Object.keys(
          UNIT_TO_SECONDS
        ).join(", ")}`
      );
    }

    // Convert to intermediate unit (seconds)
    const intermediateValue = value * UNIT_TO_SECONDS[unit as TimeUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error(
        "Conversion resulted in non-finite value (possible overflow)"
      );
    }

    // Convert from seconds to all units
    const convertedValues: Record<string, number> = {};
    Object.entries(UNIT_TO_SECONDS).forEach(([key, factor]) => {
      convertedValues[key] = Number((intermediateValue / factor).toFixed(8));
    });

    return convertedValues;
  };

  return (
    <UnitConverter
      seo={seoDescriptions.timeUnit}
      defaultValue="1"
      defaultUnit="hr"
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertTime}
      toolName="time"
    />
  );
}

export default React.memo(TimeConverter);
