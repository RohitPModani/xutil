import type { SEODescriptionContent } from './types';

export const calcSeo: Record<string, SEODescriptionContent> = {
  cronParser: {
    title: 'Cron Expression Parser',
    seo: 'Cron Expression Parser: Explain Crontab Online | XUtil',
    body: `A cron expression parser explains a crontab schedule in plain English and lists its next five run times, with each of the five fields decoded as you type.

## How to use

1. Paste a 5-field expression such as \`*/15 9-17 * * 1-5\`, or click an example. Macros like \`@daily\` and \`@hourly\` are expanded.
2. Read the description, the per-field breakdown and the next five runs. Switch the run times between UTC and your own time zone.
3. If a field is wrong the error names it, for example an hour of 24 or a backwards range.

## What it does

- Reads the standard five fields: minute, hour, day-of-month, month and day-of-week, in that order. Each accepts \`*\`, single values, ranges (\`1-5\`), steps (\`*/15\`, \`1-5/2\`) and comma lists.
- Accepts three-letter month and weekday names (\`JAN\`, \`MON\`) in any case; weekday 7 means Sunday, like 0.
- Follows cron's day rule: when both day-of-month and day-of-week are set, the job runs when either one matches, and the page says so.
- Walks forward from now to find the next five instants, and reports when a schedule can never run, such as the 31st of a 30-day month.
- Does not read six-field (seconds) or seven-field (year) formats used by Quartz and some cloud schedulers.

## Example

\`\`\`
30 9 * * 1-5
→ At 09:30 on Monday through Friday.

*/15 9-17 * * *
→ Every 15 minutes, between 09:00 and 17:59.
\`\`\`

## Privacy

The expression is parsed in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What do the 5 fields in a cron expression mean?',
        a: 'From left to right: minute (0-59), hour (0-23), day of month (1-31), month (1-12 or JAN-DEC) and day of week (0-7 or SUN-SAT, where 0 and 7 are both Sunday). A star in a field means every value.',
      },
      {
        q: 'What does */15 mean in cron?',
        a: 'Every 15th value of that field, counting from the start. In the minute field it means at :00, :15, :30 and :45 of each hour. 1-30/5 limits the step to a range: 1, 6, 11, up to 26.',
      },
      {
        q: 'What time zone does cron use?',
        a: 'The system time zone of the machine running the cron daemon, which on most servers is UTC. Some systems let you set CRON_TZ at the top of the crontab. This page shows next runs in UTC or in your browser zone so you can compare.',
      },
      {
        q: 'What happens when both day of month and day of week are set?',
        a: 'In standard cron the job runs when either field matches, not both. 0 0 13 * 5 runs on the 13th of every month and on every Friday, not only on Friday the 13th.',
      },
    ],
  },
  dateDifference: {
    title: 'Days Between Dates',
    seo: 'Days Between Dates Calculator | XUtil',
    body: `A days between dates calculator counts the exact time from one date to another: total days, weeks, months, years, hours and the number of weekdays in between.

## How to use

1. Pick a start date and an end date. The start date defaults to today, and the Swap button exchanges the two.
2. Tick "Include end date" to count both ends, the way deadlines and bookings are often counted.
3. Read the results, or copy any row. An end date earlier than the start is counted backwards and labelled "before".

## What it does

- Counts whole calendar days between the two dates, so daylight saving changes never produce a fractional day.
- Breaks the span into weeks and days, months and days, and years, months and days, following the calendar: a month is the same date in the next month, and a span that starts on the 31st steps to the last day of a shorter month.
- Counts the weekdays (Monday to Friday) in the span without any holiday calendar.
- Shows which day of the week each date falls on.

## Example

\`\`\`
2024-01-31 → 2025-03-01
Total days: 395
Weeks: 56 weeks, 3 days
Years: 1 year, 1 month, 1 day
Weekdays: 283
\`\`\`

## Privacy

The dates are compared in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do you calculate the number of days between two dates?',
        a: 'Convert both dates to a day count from a fixed point and subtract, which is what every calendar library does under the hood. Counting by hand, add the days left in the start month, the full months in between and the days into the end month, remembering 29 February in leap years.',
      },
      {
        q: 'Do you count the start day or the end day?',
        a: 'By default neither is counted in full: Monday to Wednesday is 2 days. Tick "Include end date" to get 3, which is how hotel nights are not counted but rental days and some legal notice periods are.',
      },
      {
        q: 'How many weekdays are between two dates?',
        a: 'Every full week contributes 5 weekdays; the leftover days depend on the weekday the span starts on. This tool does that calculation but does not subtract public holidays, which vary by country.',
      },
      {
        q: 'Why is a month not always 30 days here?',
        a: 'Because the result follows the calendar rather than an average. 15 January to 15 February is one month whether that is 31 days or, from 15 February to 15 March, 28 or 29 days.',
      },
    ],
  },
  ageCalculator: {
    title: 'Age Calculator',
    seo: 'Age Calculator: Exact Age in Years, Months, Days | XUtil',
    body: `An age calculator works out an exact age in years, months and days from a date of birth, on today or any date, plus the next birthday and the weekday of birth.

## How to use

1. Enter the date of birth. The age appears immediately, counted to today.
2. Change the "Age on" date to see the age on a past or future date, for example an enrolment cut-off or a retirement date.
3. Copy any row from the details list.

## What it does

- Counts full years first, then full months, then the remaining days, following the calendar. A birthday on the 31st falls on the last day of shorter months.
- Shows the age as a total in months, weeks and days as well.
- Finds the next birthday, its weekday, how many days away it is and the age reached. On a birthday it says "Today".
- Reports the weekday of birth and whether the birth year was a leap year.
- Shows an error if the date of birth is after the "Age on" date.

## Example

\`\`\`
Born 1990-07-15, on 2026-10-28
Age: 36 years, 3 months, 13 days
In days: 13,254 days
Next birthday: 2027-07-15 (Thursday), in 260 days, turning 37
Born on a: Sunday
\`\`\`

## Privacy

The dates are compared in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How is age calculated in years, months and days?',
        a: 'Count the full years from the birth date, then the full months after the last birthday, then the days left over. Born 15 July 1990 and counted on 28 October 2026 gives 36 years, 3 months and 13 days.',
      },
      {
        q: 'When does someone born on 29 February have a birthday?',
        a: 'In a common year there is no 29 February, so this tool uses 28 February. Legally it varies: England and Hong Kong treat 1 March as the birthday, while New Zealand and Taiwan use 28 February.',
      },
      {
        q: 'How many days old am I?',
        a: 'Multiply your age in full years by 365, add one for each leap day you have lived through and add the days since your last birthday. The "In days" row does this exactly.',
      },
      {
        q: 'What day of the week was I born on?',
        a: 'Enter your date of birth and read the "Born on a" row. The weekday repeats on the same date every 5, 6 or 11 years depending on where the leap years fall, so it cannot be worked out from the year alone.',
      },
    ],
  },
  randomNumber: {
    title: 'Random Number Generator',
    seo: 'Random Number Generator: Pick Numbers in a Range | XUtil',
    body: `A random number generator picks one or many whole numbers between a minimum and a maximum, with or without repeats, using the browser's secure randomness.

## How to use

1. Set the minimum and maximum (default 1 to 100) and how many numbers you want, up to 1,000.
2. Tick "No repeats" to draw each number at most once, and "Sort results" to list them in order.
3. Click "Pick again" or "Generate" for a fresh draw. Copy the result, or download it one number per line, comma or space separated.

## Options

- Whole numbers only, negative values included; the range can span up to nine quadrillion values.
- Uses \`crypto.getRandomValues\` with rejection sampling, so every value in the range is equally likely and there is no modulo bias.
- "No repeats" is unavailable when you ask for more numbers than the range holds, and the page says why.
- A single number is shown large with a copy button; a list goes to the output box with Copy and Download.

## Example

\`\`\`
Min 1, Max 49, How many 6, No repeats, Sort results
→ 3, 11, 19, 27, 38, 44
\`\`\`

## Privacy

The numbers are drawn in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Is this random number generator truly random?',
        a: 'It uses the browser\'s crypto.getRandomValues, a cryptographically secure generator seeded from operating-system entropy. That is far stronger than Math.random and suitable for draws, passwords and tokens, though nothing in software is "true" randomness in the physical sense.',
      },
      {
        q: 'How do I pick a random number between 1 and 100?',
        a: 'Leave the defaults (min 1, max 100, how many 1) and read the large number. Click "Pick again" for another. Every value from 1 to 100 has the same 1 in 100 chance.',
      },
      {
        q: 'What is modulo bias?',
        a: 'Taking a random 32-bit value modulo the range size slightly favours the lower numbers whenever the range does not divide 2^32 evenly. Rejection sampling discards the few values that would cause the skew, so the result is exactly uniform.',
      },
      {
        q: 'Can I generate random numbers without repeats?',
        a: 'Yes. Tick "No repeats" and each number appears at most once, like drawing balls from a bag. The option needs a range at least as large as the count: six unique numbers from 1 to 49 works, 10 from 1 to 5 cannot.',
      },
    ],
  },
  sortLines: {
    title: 'Sort Lines',
    seo: 'Sort Lines Alphabetically or Numerically Online | XUtil',
    body: `A sort lines tool puts lines of text in alphabetical, natural, numeric or length order, reverses or shuffles them, and can drop duplicates and trim spaces.

## How to use

1. Paste the lines. The sorted result appears as you type.
2. Pick an order: Alphabetical, Natural, Numeric, Length, Shuffle or Reverse.
3. Tick Descending, Case-sensitive, Remove duplicates or Trim lines as needed, then copy or download \`sorted.txt\`.

## Options

- **Alphabetical** compares characters using your locale, so accented letters sort next to their base letter. With Case-sensitive on, it uses plain character codes and uppercase comes first.
- **Natural** compares digits inside text by value, so \`file2\` comes before \`file10\`.
- **Numeric** sorts by the number each line starts with (\`-3\`, \`2.5\`, \`10\`); lines with no leading number go last in their original order.
- **Length** sorts shortest to longest; **Reverse** flips the current order; **Shuffle** randomises it.
- Remove duplicates keeps the first copy of each line, ignoring case unless Case-sensitive is on. Trim lines strips leading and trailing spaces first.

## Example

\`\`\`
file10.txt
file2.txt
File1.txt
→ Natural:  File1.txt, file2.txt, file10.txt
→ Alphabetical: file10.txt, File1.txt, file2.txt
\`\`\`

## Privacy

The text is sorted in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I sort lines alphabetically?',
        a: 'Paste the text, keep the Alphabetical order and copy the result. Each line is compared from its first character; tick Descending for Z to A.',
      },
      {
        q: 'What is natural sort order?',
        a: 'An order where runs of digits are compared as numbers rather than character by character, so "item 2" comes before "item 10". Plain alphabetical order puts "item 10" first because the character 1 is lower than 2.',
      },
      {
        q: 'Why do capital letters sort before lowercase?',
        a: 'In ASCII and Unicode, A to Z are codes 65 to 90 and a to z are 97 to 122, so a byte-wise sort puts every capital first. Turn off Case-sensitive to compare letters regardless of case.',
      },
      {
        q: 'How do I sort lines and remove duplicates at the same time?',
        a: 'Tick "Remove duplicates" with any order. The first copy of each line is kept and the rest are dropped before sorting, like running sort -u on the command line.',
      },
    ],
  },
};
