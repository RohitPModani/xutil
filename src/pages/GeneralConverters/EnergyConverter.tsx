import React from "react";
import UnitConverter from "./UnitConverter";
import seoDescriptions from "../../data/seoDescriptions";

// Define types for better type safety
type EnergyUnit = "j" | "kj" | "cal" | "kcal" | "wh" | "kwh" | "ev" | "btu";
type EnergyConversionRates = Record<EnergyUnit, number>;

// Memoize constant data outside component to prevent recreation on every render
const UNITS: { value: EnergyUnit; label: string }[] = [
  { value: "j", label: "Joules (J)" },
  { value: "kj", label: "Kilojoules (kJ)" },
  { value: "cal", label: "Calories (cal)" },
  { value: "kcal", label: "Kilocalories (kcal)" },
  { value: "wh", label: "Watt-hours (Wh)" },
  { value: "kwh", label: "Kilowatt-hours (kWh)" },
  { value: "ev", label: "Electronvolts (eV)" },
  { value: "btu", label: "British Thermal Units (BTU)" },
];

const UNIT_TO_JOULES: EnergyConversionRates = {
  j: 1.0, // Joules
  kj: 1000.0, // Kilojoules
  cal: 4.184, // Calories
  kcal: 4184.0, // Kilocalories
  wh: 3600.0, // Watt-hours
  kwh: 3600000.0, // Kilowatt-hours
  ev: 1.602176634e-19, // Electronvolts
  btu: 1055.05585262, // British Thermal Units
};

const VALIDATION_MESSAGE = "Energy must be greater than zero.";
const CONVERTER_NAME = "Energy Converter";

function EnergyConverter() {
  const seo = seoDescriptions.energy;

  const convertEnergy = (
    value: number,
    unit: string
  ): Record<EnergyUnit, number> => {
    // Validate input unit
    if (!Object.keys(UNIT_TO_JOULES).includes(unit)) {
      throw new Error(
        `Invalid unit: ${unit}. Supported units: ${Object.keys(
          UNIT_TO_JOULES
        ).join(", ")}`
      );
    }

    // Convert to intermediate unit (joules)
    const joulesUnit = unit as EnergyUnit;
    const joulesValue = value * UNIT_TO_JOULES[joulesUnit];

    if (!Number.isFinite(joulesValue)) {
      throw new Error(
        "Conversion resulted in non-finite value (possible overflow)"
      );
    }

    // Convert from joules to all units
    return Object.entries(UNIT_TO_JOULES).reduce((acc, [key, factor]) => {
      acc[key as EnergyUnit] = Number((joulesValue / factor).toFixed(8));
      return acc;
    }, {} as Record<EnergyUnit, number>);
  };

  return (
    <UnitConverter
      seo={seo}
      defaultValue="100"
      defaultUnit="kcal"
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertEnergy}
      toolName="energy"
    />
  );
}

export default React.memo(EnergyConverter);
