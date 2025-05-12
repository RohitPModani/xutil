import React from 'react';
import UnitConverter from './UnitConverter';
import seoDescriptions from '../../data/seoDescriptions';

// Define types for better type safety
type FuelEconomyUnit = 'mpg_us' | 'mpg_uk' | 'km_l' | 'l_100km';
type FuelEconomyRates = Record<FuelEconomyUnit, number>;

// Conversion constants for fuel economy
const CONVERSION = {
  MPG_US_TO_KM_L: 0.425143707,    // 1 MPG (US) = 0.425143707 km/L
  MPG_UK_TO_KM_L: 0.35400619,     // 1 MPG (UK) = 0.35400619 km/L
  KM_L_TO_MPG_US: 1 / 0.425143707,
  KM_L_TO_MPG_UK: 1 / 0.35400619,
  MAX_VALUE: 1e6,                 // Prevent extremely large values
} as const;

// Memoize constant data outside component
const UNITS: { value: FuelEconomyUnit; label: string }[] = [
  { value: 'mpg_us', label: 'Miles per Gallon (US)' },
  { value: 'mpg_uk', label: 'Miles per Gallon (UK)' },
  { value: 'km_l', label: 'Kilometers per Liter' },
  { value: 'l_100km', label: 'Liters per 100 Kilometers' },
];

const VALIDATION_MESSAGE = "Value must be greater than zero for L/100km, non-negative for other units";
const CONVERTER_NAME = "Fuel Economy Converter";
const DEFAULT_VALUE = "20";
const DEFAULT_UNIT: FuelEconomyUnit = "mpg_us";

function FuelEconomyConverter() {
  const seo = seoDescriptions.fuelEconomy;

  const convertFuelEconomy = (value: number, unit: string): FuelEconomyRates => {
    // Input validation
    if (!Number.isFinite(value)) {
      throw new Error('Value must be a finite number');
    }

    if (value > CONVERSION.MAX_VALUE) {
      throw new Error(`Value must be less than ${CONVERSION.MAX_VALUE}`);
    }

    if (unit === 'l_100km') {
      if (value <= 0) throw new Error(VALIDATION_MESSAGE);
    } else if (value < 0) {
      throw new Error(VALIDATION_MESSAGE);
    }

    // Convert to km/L (intermediate unit)
    const fuelEconomyUnit = unit as FuelEconomyUnit;
    const kmPerLiter = convertToKmPerLiter(value, fuelEconomyUnit);

    // Convert to all target units
    return {
      mpg_us: round(kmPerLiter * CONVERSION.KM_L_TO_MPG_US),
      mpg_uk: round(kmPerLiter * CONVERSION.KM_L_TO_MPG_UK),
      km_l: round(kmPerLiter),
      l_100km: kmPerLiter === 0 ? 0 : round(100 / kmPerLiter),
    };
  };

  // Helper function for conversion to intermediate unit
  const convertToKmPerLiter = (value: number, unit: FuelEconomyUnit): number => {
    switch (unit) {
      case 'mpg_us': return value * CONVERSION.MPG_US_TO_KM_L;
      case 'mpg_uk': return value * CONVERSION.MPG_UK_TO_KM_L;
      case 'km_l': return value;
      case 'l_100km': return 100 / value;
      default: throw new Error(`Invalid unit: ${unit}`);
    }
  };

  // Helper function for consistent rounding
  const round = (num: number): number => Number(num.toFixed(8));

  return (
    <UnitConverter
      seo={seo}
      defaultValue={DEFAULT_VALUE}
      defaultUnit={DEFAULT_UNIT}
      units={UNITS}
      converterName={CONVERTER_NAME}
      validationMessage={VALIDATION_MESSAGE}
      convertFunction={convertFuelEconomy}
      toolName='fuel_economy'
    />
  );
}

export default React.memo(FuelEconomyConverter);