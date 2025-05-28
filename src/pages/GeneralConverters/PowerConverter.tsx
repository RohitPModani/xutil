import React from "react";
import UnitConverter from "./UnitConverter";
import seoDescriptions from "../../data/seoDescriptions";

type powerUnit = "w" | "kw" | "hp_metric" | "hp_imperial" | "mw" | "ft_lb_s";
type PowerConversionRates = Record<powerUnit, number>;

const UNITS: { value: powerUnit; label: string }[] = [
  { value: "w", label: "Watts (W)" },
  { value: "kw", label: "Kilowatts (kW)" },
  { value: "hp_metric", label: "Horsepower (metric) (hp)" },
  { value: "hp_imperial", label: "Horsepower (imperial) (hp)" },
  { value: "mw", label: "Megawatts (MW)" },
  { value: "ft_lb_s", label: "Foot-pounds per second (ft-lb/s)" },
];

const UNIT_TO_WATTS: PowerConversionRates = {
  w: 1, // Watts
  kw: 1000, // Kilowatts
  hp_metric: 735.49875, // Horsepower (metric)
  hp_imperial: 745.69987158, // Horsepower (imperial)
  mw: 1000 ** 2, // Megawatts
  ft_lb_s: 1.35581794833, // Foot-pounds per second
};

const VALIDATION_MESSAGE = "Power must be greater than zero.";
const CONVERTER_NAME = "Power Converter";

function PowerConverter() {
  const seo = seoDescriptions.power;

  const convertPower = (
    value: number,
    unit: string
  ): Record<string, number> => {
    if (!Object.keys(UNIT_TO_WATTS).includes(unit)) {
      throw new Error(
        `Invalid unit: ${unit}. Supported units: ${Object.keys(
          UNIT_TO_WATTS
        ).join(", ")}`
      );
    }

    // Convert to intermediate unit (watts)
    const wattsUnit = unit as powerUnit; // Type assertion to ensure unit is a valid powerUnit
    const intermediateValue = value * UNIT_TO_WATTS[wattsUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error(
        "Conversion resulted in non-finite value (possible overflow)"
      );
    }

    // Convert from watts to all units and round to 8 decimal places
    const convertedValues: Record<string, number> = {};
    for (const [key, factor] of Object.entries(UNIT_TO_WATTS)) {
      convertedValues[key] = Number((intermediateValue / factor).toFixed(8));
    }

    return convertedValues;
  };

  return (
    <UnitConverter
      seo={seo}
      defaultValue="1"
      defaultUnit="kw"
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertPower}
      toolName="power"
    />
  );
}

export default React.memo(PowerConverter);
