import UnitConverter from './UnitConverter';

type FuelEconomyUnit = 'mpg_us' | 'mpg_uk' | 'km_l' | 'l_100km';

const UNITS: { value: FuelEconomyUnit; label: string }[] = [
  { value: 'mpg_us', label: 'Miles per Gallon (US)' },
  { value: 'mpg_uk', label: 'Miles per Gallon (UK)' },
  { value: 'km_l', label: 'Kilometers per Liter' },
  { value: 'l_100km', label: 'Liters per 100 Kilometers' },
];

// km per litre for one mile per gallon: 1.609344 km over a US (3.785411784 L)
// or imperial (4.54609 L) gallon.
const UNIT_TO_KM_PER_LITRE: Record<Exclude<FuelEconomyUnit, 'l_100km'>, number> = {
  mpg_us: 1.609344 / 3.785411784,
  mpg_uk: 1.609344 / 4.54609,
  km_l: 1,
};

// Not linear: L/100 km is the inverse of km/L, so it cannot use linearConvert.
function convert(value: number, unit: string): Record<string, number> {
  let kmPerLitre: number;
  if (unit === 'l_100km') kmPerLitre = 100 / value;
  else if (unit in UNIT_TO_KM_PER_LITRE) kmPerLitre = value * UNIT_TO_KM_PER_LITRE[unit as keyof typeof UNIT_TO_KM_PER_LITRE];
  else throw new Error(`Unknown unit: ${unit}`);
  if (!Number.isFinite(kmPerLitre)) throw new Error('The value is too large to convert.');
  return {
    mpg_us: kmPerLitre / UNIT_TO_KM_PER_LITRE.mpg_us,
    mpg_uk: kmPerLitre / UNIT_TO_KM_PER_LITRE.mpg_uk,
    km_l: kmPerLitre,
    l_100km: 100 / kmPerLitre,
  };
}

export default function FuelEconomyConverter() {
  return <UnitConverter id="fuel_economy" defaultValue="20" defaultUnit="mpg_us" units={UNITS} validationMessage="Value must be greater than zero." convert={convert} />;
}
