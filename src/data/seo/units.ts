import type { SEODescriptionContent } from './types';

export const unitsSeo: Record<string, SEODescriptionContent> = {
  angle: {
    title: 'Angle Converter',
    seo: 'Angle Converter: Degrees, Radians, Gradians, Turns | XUtil',
    body: `Convert an angle between degrees, radians, gradians, arcminutes, arcseconds and turns. Enter one value and every other unit is shown at once as you type.

## How to use

1. Type a value and pick its unit. The default is 90 degrees.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale. Reset returns to 90°.

## Conversion factors

All units convert through radians:

| Unit | Radians |
| --- | --- |
| degree | π / 180 |
| gradian | π / 200 |
| arcminute | π / 10 800 |
| arcsecond | π / 648 000 |
| turn | 2π |

The value must be greater than zero; zero and negative angles show an error. Angles are not reduced to one revolution, so 450° stays 450° (1.25 turns), not 90°.

## Example

\`\`\`
90 deg → 1.57079633 rad · 100 grad · 5 400 arcmin · 324 000 arcsec · 0.25 turn
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How many degrees is one radian?',
        a: 'About 57.2958 degrees. A full circle is 2π radians, so one radian is 180/π degrees, and 1 degree is π/180 or 0.0174533 radians.',
      },
      {
        q: 'What is a gradian?',
        a: 'A gradian (also called a gon or grade) divides a right angle into 100 parts, so a full circle is 400 gradians and 1 gradian is 0.9 degrees. It is used in some surveying and in the GRAD mode of scientific calculators.',
      },
      {
        q: 'How many arcseconds are in a degree?',
        a: '3,600. A degree is divided into 60 arcminutes and each arcminute into 60 arcseconds, the same sexagesimal split used for hours, minutes and seconds.',
      },
    ],
  },
  area: {
    title: 'Area Converter',
    seo: 'Area Converter: Square Metres, Acres, Hectares | XUtil',
    body: `Convert an area between square metres, square kilometres, square feet, square yards, acres and hectares. Enter one value and every other unit is shown at once.

## How to use

1. Type a value and pick its unit. The default is 1 square kilometre.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through square metres:

| Unit | Square metres |
| --- | --- |
| square foot | 0.09290304 |
| square yard | 0.83612736 |
| acre | 4 046.8564224 |
| hectare | 10 000 |
| square kilometre | 1 000 000 |

These are the exact international definitions (the square foot is 0.3048² m²; the international acre is 43,560 square feet). The value must be greater than zero.

## Example

\`\`\`
1 acre → 4 046.8564224 m² · 0.40468564 ha · 43 560 ft² · 4 840 yd²
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How many acres are in a hectare?',
        a: 'About 2.4711 acres. A hectare is exactly 10,000 square metres and an international acre is 4,046.8564224 square metres.',
      },
      {
        q: 'How many square feet are in an acre?',
        a: 'Exactly 43,560 square feet, or 4,840 square yards. The acre was originally a furlong (660 ft) by a chain (66 ft).',
      },
      {
        q: 'How do I convert square metres to square feet?',
        a: 'Multiply by 10.7639. One square foot is exactly 0.09290304 square metres, so 100 m² is about 1,076.39 ft².',
      },
      {
        q: 'How big is a square kilometre in acres?',
        a: 'About 247.1 acres, or exactly 100 hectares. A square mile, by comparison, is 640 acres (about 2.59 km²).',
      },
    ],
  },
  bitByte: {
    title: 'Bit ↔ Byte Converter',
    seo: 'Bits to Bytes Converter: KB, MB, GB, TB | XUtil',
    body: `Convert between bits, bytes, kilobytes, megabytes, gigabytes, terabytes and petabytes, and their bit equivalents, using decimal (1000-based) prefixes.

## How to use

1. Type a value and pick its unit. The default is 1 gigabit.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through bits. One byte is 8 bits, and every prefix is a power of 1000, as in the SI and IEC decimal definitions:

| Unit | Bits |
| --- | --- |
| byte | 8 |
| kilobit (Kb) | 1 000 |
| kilobyte (KB) | 8 000 |
| megabyte (MB) | 8 000 000 |
| gigabyte (GB) | 8 000 000 000 |
| terabyte (TB) | 8 × 10¹² |
| petabyte (PB) | 8 × 10¹⁵ |

This tool does not use 1024-based (binary) units. A kibibyte (KiB, 1,024 bytes) or mebibyte (MiB, 1,048,576 bytes) will show as a slightly larger decimal figure. The value must be greater than zero.

## Example

\`\`\`
1 GB → 8 Gb · 1 000 MB · 8 000 Mb · 1 000 000 KB · 0.001 TB · 8 000 000 000 bits
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Is 1 MB 1000 KB or 1024 KB?',
        a: 'Both conventions exist. Under the SI decimal definition used by drive manufacturers, networking and this tool, 1 MB is 1,000 KB (1,000,000 bytes). The 1,024-based unit is properly called a mebibyte (MiB, 1,048,576 bytes), which Windows still labels as MB.',
      },
      {
        q: 'What is the difference between Mb and MB?',
        a: 'A lowercase b is bits, an uppercase B is bytes, and a byte is 8 bits. Internet speeds are sold in megabits per second (Mbps), so a 100 Mbps connection downloads at most 12.5 megabytes per second.',
      },
      {
        q: 'How many bytes are in a gigabyte?',
        a: 'One billion (1,000,000,000) bytes in the decimal definition, or 8 billion bits. A gibibyte (GiB) is 1,073,741,824 bytes, about 7.4% more.',
      },
      {
        q: 'Why does a 1 TB drive show as 931 GB?',
        a: 'The drive holds 1,000,000,000,000 bytes, but the operating system divides by 1,024 three times and reports 931 GiB while labelling it GB. Nothing is missing; the two systems use different prefixes.',
      },
    ],
  },
  energy: {
    title: 'Energy Converter',
    seo: 'Energy Converter: Joules, Calories, kWh, BTU | XUtil',
    body: `Convert energy between joules, kilojoules, calories, kilocalories, watt-hours, kilowatt-hours, electronvolts and BTU. Every other unit is shown as you type.

## How to use

1. Type a value and pick its unit. The default is 100 kilocalories.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through joules:

| Unit | Joules |
| --- | --- |
| calorie (thermochemical) | 4.184 |
| kilocalorie (food Calorie) | 4 184 |
| watt-hour | 3 600 |
| kilowatt-hour | 3 600 000 |
| BTU (International Table) | 1 055.05585262 |
| electronvolt | 1.602176634 × 10⁻¹⁹ |

The calorie is the thermochemical calorie (exactly 4.184 J), and the BTU is the International Table British thermal unit. The value must be greater than zero.

## Example

\`\`\`
100 kcal → 418 400 J · 418.4 kJ · 116.22222222 Wh · 0.11622222 kWh · 396.56668314 BTU
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Is a food Calorie the same as a kilocalorie?',
        a: 'Yes. The Calorie on a nutrition label (capital C) is one kilocalorie, 1,000 small calories or 4,184 joules. A 2,000 Calorie diet is about 8.4 megajoules.',
      },
      {
        q: 'How many joules are in a kilowatt-hour?',
        a: 'Exactly 3,600,000 joules (3.6 MJ), because a kilowatt-hour is 1,000 watts sustained for 3,600 seconds. It is also about 860 kilocalories or 3,412 BTU.',
      },
      {
        q: 'What is a BTU?',
        a: 'A British thermal unit is the energy needed to raise one pound of water by one degree Fahrenheit, defined here as 1,055.05585262 joules. It is still used for heating and air conditioning capacity, usually as BTU per hour.',
      },
      {
        q: 'What is an electronvolt used for?',
        a: 'An electronvolt is the energy an electron gains crossing one volt, exactly 1.602176634 × 10⁻¹⁹ joules. It is the natural unit for atomic physics, chemistry bond energies and particle accelerators, where joules would be absurdly small numbers.',
      },
    ],
  },
  frequency: {
    title: 'Frequency Converter',
    seo: 'Frequency Converter: Hz, kHz, MHz, GHz, RPM | XUtil',
    body: `Convert a frequency between hertz, kilohertz, megahertz, gigahertz and revolutions per minute. Enter one value and every other unit is shown at once.

## How to use

1. Type a value and pick its unit. The default is 1 gigahertz.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through hertz (cycles per second):

| Unit | Hertz |
| --- | --- |
| kilohertz | 1 000 |
| megahertz | 1 000 000 |
| gigahertz | 1 000 000 000 |
| revolution per minute | 1 / 60 |

RPM is treated as one revolution per cycle, so 60 RPM is 1 Hz. The value must be greater than zero. Very small results, such as 1 Hz in gigahertz, round to zero at eight decimal places.

## Example

\`\`\`
3 000 RPM → 50 Hz · 0.05 kHz · 0.00005 MHz
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert RPM to Hz?',
        a: 'Divide by 60. Hertz counts cycles per second and RPM counts revolutions per minute, so a motor at 1,800 RPM turns at 30 Hz.',
      },
      {
        q: 'How many Hz is 1 GHz?',
        a: 'One billion hertz (1,000,000,000 Hz), or 1,000 MHz. A 3.5 GHz processor clock ticks 3.5 billion times per second, with each cycle lasting about 0.29 nanoseconds.',
      },
      {
        q: 'What is the relationship between frequency and period?',
        a: 'They are reciprocals: period = 1 / frequency. A 50 Hz mains supply completes one cycle every 20 milliseconds, and a 1 kHz tone every 1 millisecond.',
      },
    ],
  },
  fuelEconomy: {
    title: 'Fuel Economy Converter',
    seo: 'Fuel Economy Converter: MPG to L/100km, km/L | XUtil',
    body: `Convert fuel economy between US and UK miles per gallon, kilometres per litre and litres per 100 km. Enter one value and the other three are shown at once.

## How to use

1. Type a value and pick its unit. The default is 20 miles per gallon (US).
2. The other three units update as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

Values convert through kilometres per litre:

| Unit | km/L |
| --- | --- |
| mile per US gallon | 0.425143707 |
| mile per UK (imperial) gallon | 0.35400619 |
| litres per 100 km | 100 / value |

Litres per 100 km is an inverse measure: a lower number means better economy, so it is computed as 100 divided by km/L rather than multiplied by a factor. The value must be greater than zero and below 1,000,000.

## Example

\`\`\`
20 mpg (US) → 24.01899848 mpg (UK) · 8.50287414 km/L · 11.76072918 L/100 km
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert MPG to litres per 100 km?',
        a: 'Divide 235.215 by the US MPG figure (or 282.481 by UK MPG). For example, 30 mpg (US) is 7.84 L/100 km, and 30 mpg (UK) is 9.42 L/100 km.',
      },
      {
        q: 'Why are US and UK MPG different?',
        a: 'The gallons differ. A US gallon is 3.785 litres and an imperial (UK) gallon is 4.546 litres, so the same car scores about 20% more miles per gallon in UK figures.',
      },
      {
        q: 'Is a lower L/100km better?',
        a: 'Yes. L/100 km measures fuel used per distance, so 5 L/100 km is more economical than 8. MPG and km/L measure distance per fuel, so for those a higher number is better.',
      },
    ],
  },
  length: {
    title: 'Length Converter',
    seo: 'Length Converter: Metres, Feet, Miles, Inches | XUtil',
    body: `Convert a length between millimetres, centimetres, metres, kilometres, inches, feet, yards, miles and nautical miles, all shown at once as you type.

## How to use

1. Type a value and pick its unit.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through metres:

| Unit | Metres |
| --- | --- |
| inch | 0.0254 |
| foot | 0.3048 |
| yard | 0.9144 |
| mile | 1609.344 |
| nautical mile | 1852 |

These are the exact international definitions (the inch has been defined as 25.4 mm since 1959), so chained conversions do not drift.

## Example

\`\`\`
5 km → 3.10686 mi · 16 404.2 ft · 5 000 m · 2.69978 nmi
\`\`\``,
    faq: [
      {
        q: 'How many feet are in a mile?',
        a: 'Exactly 5,280 feet. A mile is defined as 1,609.344 metres and a foot as 0.3048 metres.',
      },
      {
        q: 'What is the difference between a mile and a nautical mile?',
        a: 'A nautical mile is 1,852 metres, about 15% longer than a statute mile (1,609.344 m). It is based on one minute of latitude and is used at sea and in aviation.',
      },
      {
        q: 'How do I convert centimetres to inches?',
        a: 'Divide by 2.54. One inch is exactly 2.54 centimetres, so 100 cm is 39.37 inches.',
      },
    ],
  },
  power: {
    title: 'Power Converter',
    seo: 'Power Converter: Watts, Kilowatts, Horsepower | XUtil',
    body: `Convert power between watts, kilowatts, megawatts, metric and imperial horsepower and foot-pounds per second. Every other unit is shown as you type.

## How to use

1. Type a value and pick its unit. The default is 1 kilowatt.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through watts:

| Unit | Watts |
| --- | --- |
| kilowatt | 1 000 |
| megawatt | 1 000 000 |
| horsepower (metric, PS) | 735.49875 |
| horsepower (imperial, mechanical) | 745.69987158 |
| foot-pound per second | 1.35581794833 |

Both horsepower definitions are listed because car makers use them interchangeably; the metric figure is about 1.4% smaller. The value must be greater than zero.

## Example

\`\`\`
1 kW → 1 000 W · 1.35962162 hp (metric) · 1.34102209 hp (imperial) · 737.56214928 ft-lb/s
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How many watts is one horsepower?',
        a: 'Imperial (mechanical) horsepower is 745.7 watts, defined as 550 foot-pounds per second. Metric horsepower (PS, CV) is 735.5 watts, defined as 75 kilogram-force metres per second.',
      },
      {
        q: 'What is the difference between metric and imperial horsepower?',
        a: 'Metric horsepower is about 1.4% smaller: 100 PS is 98.6 imperial hp, or 73.5 kW. European car brochures usually quote PS, while US and UK figures are usually mechanical hp.',
      },
      {
        q: 'How do I convert kW to hp?',
        a: 'Multiply by 1.341 for imperial horsepower or 1.36 for metric. A 150 kW engine is about 201 hp or 204 PS.',
      },
    ],
  },
  pressure: {
    title: 'Pressure Converter',
    seo: 'Pressure Converter: PSI, Bar, Pascal, atm, mmHg | XUtil',
    body: `Convert pressure between pascals, kilopascals, bar, millibar, atmospheres, psi, mmHg and torr. Enter one value and every other unit is shown at once.

## How to use

1. Type a value and pick its unit. The default is 20 psi.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through pascals:

| Unit | Pascals |
| --- | --- |
| kilopascal | 1 000 |
| millibar | 100 |
| bar | 100 000 |
| standard atmosphere | 101 325 |
| psi (pound-force per square inch) | 6 894.75729317 |
| mmHg | 133.322387415 |
| torr | 133.322387415 |

mmHg and torr share one factor here; the true definitions differ by less than one part in a million. The value must be greater than zero, so this tool converts absolute pressures, not gauge readings relative to atmosphere.

## Example

\`\`\`
20 psi → 137 895.1458634 Pa · 1.37895146 bar · 1.36091928 atm · 1 034.29850408 mmHg
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How many psi is 1 bar?',
        a: 'About 14.504 psi. A bar is exactly 100,000 pascals, and one psi is 6,894.757 pascals. Tyre pressures of 2.2 bar and 32 psi are therefore nearly the same.',
      },
      {
        q: 'What is the difference between bar and atm?',
        a: 'A standard atmosphere is 101,325 Pa, about 1.3% more than a bar (100,000 Pa). 1 atm is 14.696 psi, 760 mmHg or 1,013.25 millibar, which is why weather maps centre around 1013 hPa.',
      },
      {
        q: 'Are mmHg and torr the same?',
        a: 'Almost. A torr is defined as 1/760 of a standard atmosphere (133.3224 Pa) and a millimetre of mercury as 133.3224 Pa based on mercury density; they differ by less than 0.0002%, so blood pressure and vacuum figures use them interchangeably.',
      },
      {
        q: 'How do I convert kPa to psi?',
        a: 'Divide by 6.895. A 250 kPa tyre is about 36.3 psi, and 100 kPa is 14.5 psi.',
      },
    ],
  },
  speed: {
    title: 'Speed Converter',
    seo: 'Speed Converter: km/h, mph, m/s, Knots | XUtil',
    body: `Convert a speed between metres per second, kilometres per hour, miles per hour, feet per second and knots. Every other unit is shown as you type.

## How to use

1. Type a value and pick its unit. The default is 1 km/h.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through metres per second:

| Unit | Metres per second |
| --- | --- |
| kilometre per hour | 1 / 3.6 |
| mile per hour | 0.44704 |
| foot per second | 0.3048 |
| knot | 0.51444444444 |

The mph and ft/s factors are exact (from the 1959 international yard); a knot is one nautical mile (1,852 m) per hour. The value must be greater than zero.

## Example

\`\`\`
100 km/h → 27.77777778 m/s · 62.13711922 mph · 53.99568035 kn · 91.13444153 ft/s
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert km/h to mph?',
        a: 'Divide by 1.609344, or multiply by 0.6214. 100 km/h is 62.14 mph, and 70 mph is 112.65 km/h.',
      },
      {
        q: 'What is a knot in km/h?',
        a: 'One knot is 1.852 km/h or 1.1508 mph, because it is one nautical mile per hour. Ships and aircraft use knots since a nautical mile matches one minute of latitude on charts.',
      },
      {
        q: 'How do I convert m/s to km/h?',
        a: 'Multiply by 3.6, since there are 3,600 seconds in an hour and 1,000 metres in a kilometre. A sprinter at 10 m/s is running at 36 km/h.',
      },
    ],
  },
  temperature: {
    title: 'Temperature Converter',
    seo: 'Temperature Converter: Celsius, Fahrenheit, Kelvin | XUtil',
    body: `Convert a temperature between Celsius, Fahrenheit and Kelvin. Enter one value, including zero or a negative, and the other two scales are shown at once.

## How to use

1. Type a value and pick its scale. The default is 0 °C.
2. The other two scales update as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Formulas

Unlike the other unit converters, temperature scales have different zero points, so the conversion is an offset as well as a scale:

| From | To Celsius |
| --- | --- |
| Fahrenheit | (°F − 32) × 5 / 9 |
| Kelvin | K − 273.15 |

Then °F = °C × 9 / 5 + 32 and K = °C + 273.15. Zero and negative values are accepted. The tool does not reject values below absolute zero (−273.15 °C, −459.67 °F), so a negative Kelvin result means the input was physically impossible.

## Example

\`\`\`
100 °C → 212 °F · 373.15 K
-40 °C → -40 °F · 233.15 K
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I convert Celsius to Fahrenheit?',
        a: 'Multiply by 9/5 (1.8) and add 32. So 20 °C is 68 °F, 37 °C (body temperature) is 98.6 °F, and 100 °C is 212 °F.',
      },
      {
        q: 'At what temperature are Celsius and Fahrenheit equal?',
        a: 'At −40 degrees. Setting C = C × 1.8 + 32 gives C = −40, the only point where the two scales read the same.',
      },
      {
        q: 'What is 0 Kelvin in Celsius?',
        a: '−273.15 °C, which is absolute zero, the lowest possible temperature. Kelvin has the same step size as Celsius but no degree symbol and no negative values.',
      },
      {
        q: 'Why is there no degree sign for Kelvin?',
        a: 'Because the kelvin is an absolute SI unit, like the metre, rather than a scale measured from an arbitrary zero. Since 1967 the correct form is "300 K", not "300 °K".',
      },
    ],
  },
  timeUnit: {
    title: 'Time Unit Converter',
    seo: 'Time Unit Converter: Seconds, Minutes, Hours, Days | XUtil',
    body: `Convert a duration between nanoseconds, milliseconds, seconds, minutes, hours, days, weeks, months, years and centuries. Every unit is shown as you type.

## How to use

1. Type a value and pick its unit. The default is 1 hour.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through seconds:

| Unit | Seconds |
| --- | --- |
| millisecond | 0.001 |
| minute | 60 |
| hour | 3 600 |
| day | 86 400 |
| week | 604 800 |
| month | 2 628 000 (30.4167 days, 1/12 of a year) |
| year | 31 536 000 (365 days) |
| decade | 315 360 000 |
| century | 3 153 600 000 |

Months and years are fixed averages: a year is 365 days with no leap days, and a month is exactly one twelfth of that. This is a duration converter, not a calendar; it does not count real months, leap years or time zones. The value must be greater than zero.

## Example

\`\`\`
1 day → 86 400 s · 1 440 min · 24 hr · 0.14285714 week · 0.00273973 year
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How many seconds are in a day?',
        a: '86,400 seconds: 24 hours × 60 minutes × 60 seconds. A week is 604,800 seconds and a 365-day year is 31,536,000 seconds.',
      },
      {
        q: 'How many milliseconds are in an hour?',
        a: '3,600,000 milliseconds. Timeouts in code are often set in milliseconds, so 900,000 ms is 15 minutes and 86,400,000 ms is one day.',
      },
      {
        q: 'How many seconds are in a month?',
        a: 'It depends on the month: 2,419,200 for February, 2,592,000 for a 30-day month and 2,678,400 for a 31-day month. This converter uses the average of 2,628,000 seconds (30.42 days).',
      },
      {
        q: 'What is the difference between a microsecond and a millisecond?',
        a: 'A millisecond is one thousandth of a second (10⁻³ s) and a microsecond is one millionth (10⁻⁶ s), so there are 1,000 microseconds in a millisecond. A nanosecond is a further 1,000 times smaller.',
      },
    ],
  },
  volume: {
    title: 'Volume Converter',
    seo: 'Volume Converter: Litres, Gallons, Pints, ml | XUtil',
    body: `Convert a volume between litres, millilitres, cubic metres, cubic feet, cubic inches and US gallons, quarts, pints and fluid ounces. See every unit at once.

## How to use

1. Type a value and pick its unit. The default is 1 litre.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through litres:

| Unit | Litres |
| --- | --- |
| cubic metre | 1 000 |
| cubic inch | 0.016387064 |
| cubic foot | 28.316846592 |
| US gallon | 3.785411784 |
| US quart | 0.946352946 |
| US pint | 0.473176473 |
| US fluid ounce | 0.0295735295625 |

The gallon, quart, pint and fluid ounce are US customary units only; imperial (UK) gallons and pints are not included and are about 20% larger. The value must be greater than zero.

## Example

\`\`\`
1 US gal → 3.78541178 L · 4 qt · 8 pt · 128 fl oz · 231 in³ · 0.13368056 ft³
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How many litres are in a US gallon?',
        a: 'Exactly 3.785411784 litres, because a US gallon is defined as 231 cubic inches. An imperial (UK) gallon is 4.54609 litres.',
      },
      {
        q: 'What is the difference between a US pint and a UK pint?',
        a: 'A US pint is 473 ml (16 US fluid ounces) and an imperial pint is 568 ml (20 imperial fluid ounces). A UK pub pint is therefore about 20% larger than a US one.',
      },
      {
        q: 'How many millilitres are in a cup?',
        a: 'A US customary cup is 236.6 ml (8 US fluid ounces), while a metric cup used in recipes is 250 ml. This converter does not list cups; use fluid ounces or millilitres instead.',
      },
      {
        q: 'How many litres are in a cubic metre?',
        a: 'Exactly 1,000 litres. A litre is one cubic decimetre, so a 1 m × 1 m × 1 m box holds 1,000 L, and 1 ml is 1 cm³.',
      },
    ],
  },
  weight: {
    title: 'Weight Converter',
    seo: 'Weight Converter: Kilograms, Pounds, Ounces, Stone | XUtil',
    body: `Convert weight between milligrams, grams, kilograms, metric tonnes, ounces, pounds and stone. Enter one value and every other unit is shown at once as you type.

## How to use

1. Type a value and pick its unit. The default is 1 kilogram.
2. Every other unit updates as you type; each row has its own Copy button, and Copy on the panel copies the whole table.
3. Results are rounded to eight decimal places and formatted for your locale.

## Conversion factors

All units convert through kilograms:

| Unit | Kilograms |
| --- | --- |
| gram | 0.001 |
| metric tonne | 1 000 |
| ounce (avoirdupois) | 0.028349523125 |
| pound | 0.45359237 |
| stone | 6.35029318 |

The pound has been defined as exactly 0.45359237 kg since 1959; an ounce is 1/16 lb and a stone is 14 lb. The ton listed is the metric tonne (1,000 kg), not the US short ton (907.18 kg) or UK long ton (1,016.05 kg). Troy ounces are not included. The value must be greater than zero.

## Example

\`\`\`
70 kg → 154.32358353 lb · 11.02311311 st · 2 469.17733647 oz · 70 000 g
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How many pounds are in a kilogram?',
        a: 'About 2.20462 pounds. One pound is exactly 0.45359237 kg, so 10 kg is 22.05 lb and 100 lb is 45.36 kg.',
      },
      {
        q: 'How many pounds are in a stone?',
        a: '14 pounds, or 6.35029 kg. Stone is used for body weight in the UK and Ireland, so 11 st 4 lb is 158 lb or 71.7 kg.',
      },
      {
        q: 'What is the difference between a ton and a tonne?',
        a: 'A tonne (metric ton) is 1,000 kg. A US short ton is 2,000 lb (907.18 kg) and a UK long ton is 2,240 lb (1,016.05 kg). This converter uses the metric tonne.',
      },
      {
        q: 'How many grams are in an ounce?',
        a: '28.3495 grams for the avoirdupois ounce used for food and body weight. A troy ounce, used for precious metals, is 31.1035 grams.',
      },
    ],
  },
};
