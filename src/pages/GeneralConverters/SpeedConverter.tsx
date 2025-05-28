import React from "react";
import UnitConverter from "./UnitConverter";
import seoDescriptions from "../../data/seoDescriptions";

type SpeedUnit = "m_s" | "km_h" | "mph" | "ft_s" | "kn";
type SpeedConversionRates = Record<SpeedUnit, number>;

const UNITS: { value: SpeedUnit; label: string }[] = [
  { value: "m_s", label: "Meters per Second (m/s)" },
  { value: "km_h", label: "Kilometers per Hour (km/h)" },
  { value: "mph", label: "Miles per Hour (mph)" },
  { value: "ft_s", label: "Feet per Second (ft/s)" },
  { value: "kn", label: "Knots (kn)" },
] as const;

const UNIT_TO_METERS_PER_SECOND: SpeedConversionRates = {
  m_s: 1, // Meters per Second
  km_h: 1 / 3.6, // Kilometers per Hour (1 km/h = 1/3.6 m/s)
  mph: 0.44704, // Miles per Hour (1 mph = 0.44704 m/s)
  ft_s: 0.3048, // Feet per Second (1 ft/s = 0.3048 m/s)
  kn: 0.51444444444, // Knots (1 kn = 0.51444444444 m/s)
};

const VALIDATION_MESSAGE = "Speed must be greater than zero.";
const CONVERTER_NAME = "Speed Converter";

function SpeedConverter() {
  const convertSpeed = (
    value: number,
    unit: string
  ): Record<string, number> => {
    if (!Object.keys(UNIT_TO_METERS_PER_SECOND).includes(unit)) {
      throw new Error(
        `Invalid unit: ${unit}. Supported units: ${Object.keys(
          UNIT_TO_METERS_PER_SECOND
        ).join(", ")}`
      );
    }

    // Convert to intermediate unit (meters per second)
    const intermediateValue =
      value * UNIT_TO_METERS_PER_SECOND[unit as SpeedUnit];

    if (!Number.isFinite(intermediateValue)) {
      throw new Error(
        "Conversion resulted in non-finite value (possible overflow)"
      );
    }

    // Convert from meters per second to all units
    const convertedValues: Record<string, number> = {};
    Object.entries(UNIT_TO_METERS_PER_SECOND).forEach(([key, factor]) => {
      convertedValues[key] = Number((intermediateValue / factor).toFixed(8));
    });

    return convertedValues;
  };

  return (
    <UnitConverter
      seo={seoDescriptions.speed}
      defaultValue="1"
      defaultUnit="km_h"
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertSpeed}
      toolName="speed"
    />
  );
}

export default React.memo(SpeedConverter);
