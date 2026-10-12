import UnitConverter from './UnitConverter';

type FuelEconomyUnit = 'mpg_us' | 'mpg_uk' | 'km_l' | 'l_100km';

const CONVERSION = {
  MPG_US_TO_KM_L: 0.425143707, // 1 MPG (US) = 0.425143707 km/L
  MPG_UK_TO_KM_L: 0.35400619, // 1 MPG (UK) = 0.35400619 km/L
  KM_L_TO_MPG_US: 1 / 0.425143707,
  KM_L_TO_MPG_UK: 1 / 0.35400619,
  MAX_VALUE: 1e6,
} as const;

const UNITS: { value: FuelEconomyUnit; label: string }[] = [
  { value: 'mpg_us', label: 'Miles per Gallon (US)' },
  { value: 'mpg_uk', label: 'Miles per Gallon (UK)' },
  { value: 'km_l', label: 'Kilometers per Liter' },
  { value: 'l_100km', label: 'Liters per 100 Kilometers' },
];

const round = (n: number) => Number(n.toFixed(8));

function toKmPerLiter(value: number, unit: string): number {
  switch (unit) {
    case 'mpg_us':
      return value * CONVERSION.MPG_US_TO_KM_L;
    case 'mpg_uk':
      return value * CONVERSION.MPG_UK_TO_KM_L;
    case 'km_l':
      return value;
    case 'l_100km':
      return 100 / value;
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}

function convert(value: number, unit: string): Record<string, number> {
  if (value > CONVERSION.MAX_VALUE) throw new Error(`Value must be less than ${CONVERSION.MAX_VALUE}.`);
  const kmPerLiter = toKmPerLiter(value, unit);
  return {
    mpg_us: round(kmPerLiter * CONVERSION.KM_L_TO_MPG_US),
    mpg_uk: round(kmPerLiter * CONVERSION.KM_L_TO_MPG_UK),
    km_l: round(kmPerLiter),
    l_100km: kmPerLiter === 0 ? 0 : round(100 / kmPerLiter),
  };
}

export default function FuelEconomyConverter() {
  return <UnitConverter id="fuel_economy" defaultValue="20" defaultUnit="mpg_us" units={UNITS} validationMessage="Value must be greater than zero." convert={convert} />;
}
