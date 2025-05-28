import React from "react";
import UnitConverter from "./UnitConverter";
import seoDescriptions from "../../data/seoDescriptions";

type pressureUnit =
  | "pa"
  | "kpa"
  | "atm"
  | "bar"
  | "mbar"
  | "psi"
  | "mmhg"
  | "torr";
type PressureConversionRates = Record<pressureUnit, number>;

const UNITS: { value: pressureUnit; label: string }[] = [
  { value: "pa", label: "Pascals (Pa)" },
  { value: "kpa", label: "Kilopascals (kPa)" },
  { value: "atm", label: "Atmospheres (atm)" },
  { value: "bar", label: "Bars (bar)" },
  { value: "mbar", label: "Millibars (mbar)" },
  { value: "psi", label: "Pounds per square inch (psi)" },
  { value: "mmhg", label: "Millimeters of mercury (mmHg)" },
  { value: "torr", label: "Torr" },
] as const;

const UNIT_TO_PASCALS: PressureConversionRates = {
  pa: 1, // Pascals
  kpa: 1000, // Kilopascals
  atm: 101325, // Atmospheres
  bar: 100000, // Bars
  mbar: 100, // Millibars
  psi: 6894.75729317, // Pounds per square inch
  mmhg: 133.322387415, // Millimeters of mercury
  torr: 133.322387415, // Torr (same as mmHg)
};

const VALIDATION_MESSAGE = "Pressure must be greater than zero.";
const CONVERTER_NAME = "Pressure Converter";

function PressureConverter() {
  const convertPressure = (
    value: number,
    unit: string
  ): Record<string, number> => {
    if (!Object.keys(UNIT_TO_PASCALS).includes(unit)) {
      throw new Error(
        `Invalid unit: ${unit}. Supported units: ${Object.keys(
          UNIT_TO_PASCALS
        ).join(", ")}`
      );
    }

    // Convert to intermediate unit (watts)
    const intermediateValue = value * UNIT_TO_PASCALS[unit as pressureUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error(
        "Conversion resulted in non-finite value (possible overflow)"
      );
    }

    // Convert from pascals to all units
    const convertedValues: Record<string, number> = {};
    Object.entries(UNIT_TO_PASCALS).forEach(([key, factor]) => {
      convertedValues[key] = Number((intermediateValue / factor).toFixed(8));
    });

    return convertedValues;
  };

  return (
    <UnitConverter
      seo={seoDescriptions.pressure}
      defaultValue="20"
      defaultUnit="psi"
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertPressure}
      toolName="pressure"
    />
  );
}

export default React.memo(PressureConverter);
