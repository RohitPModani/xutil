// Asserts a few known conversions per unit table. Run: node scripts/check-units.mjs
import ts from 'typescript';
import { readFileSync } from 'node:fs';

const DIR = 'src/pages/GeneralConverters/';
const opts = { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } };

// Transpiles the slice of a page between `start` and its default export.
async function load(file, start, names) {
  const src = readFileSync(DIR + file, 'utf8');
  const a = src.indexOf(start);
  const b = src.indexOf('\nexport default', a);
  if (a < 0 || b < 0) throw new Error(`markers not found in ${file}`);
  const js = ts.transpileModule(src.slice(a, b) + `\nexport { ${names} };`, opts).outputText;
  return import('data:text/javascript,' + encodeURIComponent(js));
}

const unitsJs = ts.transpileModule(readFileSync('src/utils/units.ts', 'utf8'), opts).outputText;
const { linearConvert } = await import('data:text/javascript,' + encodeURIComponent(unitsJs));
const table = async (file, name) => linearConvert((await load(file, `const ${name}`, name))[name]);

const converters = {
  angle: await table('AngleConverter.tsx', 'UNIT_TO_RADIANS'),
  area: await table('AreaConverter.tsx', 'UNIT_TO_SQUARE_METERS'),
  bits: await table('BitByteConverter.tsx', 'UNIT_TO_BITS'),
  energy: await table('EnergyConverter.tsx', 'UNIT_TO_JOULES'),
  frequency: await table('FrequencyConverter.tsx', 'UNIT_TO_HERTZ'),
  fuel: (await load('FuelEconomyConverter.tsx', 'const UNIT_TO_KM_PER_LITRE', 'convert')).convert,
  length: await table('LengthConverter.tsx', 'UNIT_TO_METERS'),
  power: linearConvert((await load('PowerConverter.tsx', 'const FT_LBF_S', 'UNIT_TO_WATTS')).UNIT_TO_WATTS),
  pressure: await table('PressureConverter.tsx', 'UNIT_TO_PASCALS'),
  speed: await table('SpeedConverter.tsx', 'UNIT_TO_METERS_PER_SECOND'),
  temperature: (await load('TemperatureConverter.tsx', 'function convert', 'convert')).convert,
  time: await table('TimeUnitConverter.tsx', 'UNIT_TO_SECONDS'),
  volume: await table('VolumeConverter.tsx', 'UNIT_TO_LITERS'),
  weight: await table('WeightConverter.tsx', 'UNIT_TO_KILOGRAMS'),
};

// [table, value, fromUnit, toUnit, expected]
const cases = [
  ['angle', 180, 'deg', 'rad', Math.PI],
  ['angle', 1, 'turn', 'grad', 400],
  ['angle', 1, 'deg', 'arcsec', 3600],
  ['angle', -90, 'deg', 'turn', -0.25],
  ['area', 1, 'acre', 'm2', 4046.8564224],
  ['area', 1, 'hectare', 'acre', 2.4710538146716534],
  ['area', 1, 'yd2', 'ft2', 9],
  ['bits', 1, 'KiB', 'B', 1024],
  ['bits', 1, 'kB', 'bit', 8000],
  ['bits', 1, 'GB', 'GiB', 1e9 / 1024 ** 3],
  ['bits', 1, 'TiB', 'MiB', 1024 ** 2],
  ['bits', 1, 'PB', 'Pbit', 8],
  ['energy', 1, 'ev', 'j', 1.602176634e-19],
  ['energy', 1, 'kwh', 'j', 3.6e6],
  ['energy', 1, 'kcal', 'cal', 1000],
  ['energy', 1, 'btu', 'j', 1055.05585262],
  ['frequency', 60, 'rpm', 'hz', 1],
  ['frequency', 1, 'ghz', 'khz', 1e6],
  ['fuel', 1, 'mpg_us', 'km_l', 0.42514370749],
  ['fuel', 1, 'mpg_uk', 'km_l', 0.35400618996],
  ['fuel', 100, 'km_l', 'l_100km', 1],
  ['fuel', 20, 'mpg_us', 'l_100km', 11.7607291667],
  ['fuel', 5, 'l_100km', 'km_l', 20],
  ['length', 1, 'mi', 'm', 1609.344],
  ['length', 1, 'nm', 'm', 1852],
  ['length', 1, 'yd', 'inch', 36],
  ['power', 1, 'hp_imperial', 'ft_lb_s', 550],
  ['power', 1, 'hp_imperial', 'w', 745.6998715822702],
  ['power', 1, 'hp_metric', 'w', 735.49875],
  ['pressure', 1, 'atm', 'torr', 760],
  ['pressure', 1, 'atm', 'mmhg', 760.0000000000001, 1e-6],
  ['pressure', 1, 'bar', 'mbar', 1000],
  ['pressure', 1, 'atm', 'psi', 14.695948775],
  ['speed', 1, 'kn', 'km_h', 1.852],
  ['speed', 1, 'mph', 'ft_s', 1.4666666666666666],
  ['temperature', -40, 'celsius', 'fahrenheit', -40],
  ['temperature', 0, 'kelvin', 'celsius', -273.15],
  ['temperature', 212, 'fahrenheit', 'kelvin', 373.15],
  ['time', 1, 'year', 'month', 12],
  ['time', 1, 'week', 'day', 7],
  ['time', 1, 'ns', 's', 1e-9],
  ['time', 1, 'century', 'decade', 10],
  ['volume', 1, 'gal', 'l', 3.785411784],
  ['volume', 1, 'gal', 'fl_oz', 128],
  ['volume', 1, 'ft3', 'in3', 1728],
  ['weight', 1, 'lb', 'oz', 16],
  ['weight', 1, 'st', 'lb', 14],
  ['weight', 1, 'mg', 't', 1e-9],
];

let bad = 0;
for (const [t, value, from, to, want, tol = 1e-9] of cases) {
  const got = converters[t](value, from)[to];
  if (!(Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)))) {
    bad++;
    console.log('FAIL', t, value, from, '→', to, 'got', got, 'want', want);
  }
}
for (const [t, value, unit] of [['temperature', -300, 'celsius'], ['temperature', -1, 'kelvin'], ['temperature', -500, 'fahrenheit']]) {
  let threw = false;
  try { converters[t](value, unit); } catch { threw = true; }
  if (!threw) { bad++; console.log('FAIL', t, value, unit, 'should be below absolute zero'); }
}
console.log(bad ? `${bad} failures` : `all ${cases.length + 3} cases pass`);
process.exit(bad ? 1 : 0);
