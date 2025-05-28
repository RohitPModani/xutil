import React from "react";
import UnitConverter from "./UnitConverter";
import seoDescriptions from "../../data/seoDescriptions";

// Define types for better type safety
type FrequencyUnit = "hz" | "khz" | "mhz" | "ghz" | "rpm";
type FrequencyConversionRates = Record<FrequencyUnit, number>;

// Memoize constant data outside component to prevent recreation on every render
const UNITS: { value: FrequencyUnit; label: string }[] = [
  { value: "hz", label: "Hertz (Hz)" },
  { value: "khz", label: "Kilohertz (kHz)" },
  { value: "mhz", label: "Megahertz (MHz)" },
  { value: "ghz", label: "Gigahertz (GHz)" },
  { value: "rpm", label: "Revolutions per minute (RPM)" },
];

const UNIT_TO_HERTZ: FrequencyConversionRates = {
  hz: 1, // Hertz
  khz: 1000, // Kilohertz (10^3)
  mhz: 1000000, // Megahertz (10^6)
  ghz: 1000000000, // Gigahertz (10^9)
  rpm: 1 / 60, // Revolutions per minute (1 RPM = 1/60 Hz)
};

const VALIDATION_MESSAGE = "Frequency must be greater than zero.";
const CONVERTER_NAME = "Frequency Converter";

function FrequencyConverter() {
  const seo = seoDescriptions.frequency;

  const convertFrequency = (
    value: number,
    unit: string
  ): Record<FrequencyUnit, number> => {
    // Validate input unit
    if (!Object.keys(UNIT_TO_HERTZ).includes(unit)) {
      throw new Error(
        `Invalid unit: ${unit}. Supported units: ${Object.keys(
          UNIT_TO_HERTZ
        ).join(", ")}`
      );
    }

    // Convert to intermediate unit (hertz)
    const hertzUnit = unit as FrequencyUnit; // Type assertion to ensure unit is a valid FrequencyUnit
    const hertzValue = value * UNIT_TO_HERTZ[hertzUnit];

    if (!Number.isFinite(hertzValue)) {
      throw new Error(
        "Conversion resulted in non-finite value (possible overflow)"
      );
    }

    // Convert from hertz to all units
    return Object.entries(UNIT_TO_HERTZ).reduce((acc, [key, factor]) => {
      acc[key as FrequencyUnit] = Number((hertzValue / factor).toFixed(8));
      return acc;
    }, {} as Record<FrequencyUnit, number>);
  };

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="ghz"
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertFrequency}
      toolName="frequency"
    />
  );
}

export default React.memo(FrequencyConverter);
