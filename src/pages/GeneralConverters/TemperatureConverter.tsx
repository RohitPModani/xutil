import UnitConverter from './UnitConverter';

const UNITS = [
  { value: 'celsius', label: 'Celsius (°C)' },
  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
  { value: 'kelvin', label: 'Kelvin (K)' },
];

function convert(value: number, unit: string): Record<string, number> {
  let celsius: number;
  if (unit === 'celsius') celsius = value;
  else if (unit === 'fahrenheit') celsius = ((value - 32) * 5) / 9;
  else if (unit === 'kelvin') celsius = value - 273.15;
  else throw new Error(`Unknown unit: ${unit}`);
  return { celsius, fahrenheit: (celsius * 9) / 5 + 32, kelvin: celsius + 273.15 };
}

export default function TemperatureConverter() {
  return <UnitConverter id="temperature" defaultValue="0" defaultUnit="celsius" units={UNITS} validationMessage="Enter a temperature." convert={convert} allowNonPositive />;
}
