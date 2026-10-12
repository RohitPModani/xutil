import UnitConverter from './UnitConverter';

const UNITS = [
  { value: 'celsius', label: 'Celsius (°C)' },
  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
  { value: 'kelvin', label: 'Kelvin (K)' },
];

// Not linear: the scales have different zero points, so this keeps its own convert.
function convert(value: number, unit: string): Record<string, number> {
  let celsius: number;
  if (unit === 'celsius') celsius = value;
  else if (unit === 'fahrenheit') celsius = ((value - 32) * 5) / 9;
  else if (unit === 'kelvin') celsius = value - 273.15;
  else throw new Error(`Unknown unit: ${unit}`);
  const kelvin = celsius + 273.15;
  if (kelvin < 0) throw new Error('Below absolute zero (−273.15 °C, −459.67 °F, 0 K).');
  return { celsius, fahrenheit: (celsius * 9) / 5 + 32, kelvin };
}

export default function TemperatureConverter() {
  return <UnitConverter id="temperature" defaultValue="0" defaultUnit="celsius" units={UNITS} convert={convert} allowNonPositive />;
}
