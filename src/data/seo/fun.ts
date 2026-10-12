import type { SEODescriptionContent } from './types';

export const funSeo: Record<string, SEODescriptionContent> = {
  palindromeChecker: {
    title: 'Palindrome Checker',
    seo: 'Palindrome Checker: Test Words and Sentences | XUtil',
    body: `A palindrome checker tells you whether a word, phrase or number reads the same backwards as forwards, ignoring case, spaces and punctuation, as you type.

## How to use

1. Type or paste the text. There is nothing to click; the answer updates on every keystroke.
2. Read the result line: "Yes, this is a palindrome" or "No, this is not a palindrome".
3. The Normalised box shows exactly what was compared, with a Copy button.

## What it checks

- Text is lowercased and every character that is not a Latin letter a–z or digit 0–9 is removed before comparison. "A man, a plan, a canal: Panama" becomes \`amanaplanacanalpanama\`.
- Spaces, hyphens, apostrophes and punctuation never affect the result, so sentence palindromes work.
- Digits count, so 12321 is a palindrome.
- Accented letters and other scripts are stripped rather than compared, so a palindrome in Greek or Hindi will not be detected.
- Empty input, or input with no letters or digits, gives no result rather than a false yes.

## Example

\`\`\`
Was it a car or a cat I saw?
→ normalised: wasitacaroracatisaw
→ Yes, this is a palindrome.
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is a palindrome?',
        a: 'A word, phrase or number that reads the same in both directions, such as "level", "racecar" or 2002. Sentence palindromes like "Never odd or even" ignore spaces and punctuation.',
      },
      {
        q: 'Do spaces and punctuation count in a palindrome?',
        a: 'By convention, no. Phrase palindromes are judged on letters and digits only, which is why "A man, a plan, a canal: Panama" qualifies even though the raw characters do not mirror.',
      },
      {
        q: 'Is a single letter a palindrome?',
        a: 'Technically yes, since one character trivially reads the same both ways. Most puzzle definitions ask for at least two or three characters to be interesting.',
      },
      {
        q: 'What is the longest palindrome word in English?',
        a: 'Common dictionaries list "rotator", "deified" and "racecar" (7 letters). "Tattarrattat", 12 letters, appears in James Joyce\'s Ulysses as a knock on the door and is often cited as the longest.',
      },
    ],
  },
  stringReverser: {
    title: 'String Reverser / Rotator',
    seo: 'String Reverser and Rotator: Flip or Shift Text | XUtil',
    body: `A string reverser flips text so the last character comes first; the rotator moves a chosen number of characters from the start of the text to the end instead.

## How to use

1. Choose Reverse or Rotate with the switch at the top of the panel.
2. Type or paste the text. The output updates as you type and has a Copy button.
3. In Rotate mode, set Rotate by: a whole number from −100 to 100. Positive moves characters from the start to the end; negative moves them from the end to the start.

## What it does

- Reversal works on Unicode code points, so emoji and accented characters stay intact rather than splitting into broken bytes. Combining marks (an accent typed as a separate character) will still move away from their base letter.
- Rotation wraps around: rotating a 5-character string by 7 is the same as rotating by 2.
- Line breaks and spaces are ordinary characters and are reversed or rotated with everything else.
- Only whole strings are handled; there is no word-by-word or line-by-line reversal.

## Example

\`\`\`
hello world  → reverse   → dlrow olleh
hello world  → rotate 3  → lo worldhel
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'How do I reverse a string in JavaScript?',
        a: 'Use [...str].reverse().join(""). Spreading into an array splits on code points, so emoji survive; str.split("").reverse().join("") splits on UTF-16 units and corrupts characters outside the Basic Multilingual Plane.',
      },
      {
        q: 'What does rotating a string mean?',
        a: 'A rotation (or circular shift) moves characters off one end and back onto the other, so "abcdef" rotated left by 2 is "cdefab". The length never changes, and rotating by the string length gives the original back.',
      },
      {
        q: 'Why does reversed text with emoji sometimes look wrong?',
        a: 'Some emoji are several code points joined by zero-width joiners (a family or a flag, for example). Reversing the code points reverses those sequences too, which can turn one emoji into several.',
      },
    ],
  },
  romanNumeral: {
    title: 'Roman Numeral Converter',
    seo: 'Roman Numeral Converter: Numbers 1 to 3999 | XUtil',
    body: `A Roman numeral converter turns a whole number from 1 to 3999 into Roman numerals, and reads a numeral such as MCMLXXXIV back into a number.

## How to use

1. Type a number or a Roman numeral. In Auto mode, digits convert to Roman and letters convert to a number; the switch at the top forces either direction.
2. The result appears as you type and has a Copy button.
3. Invalid input shows an error below the panel instead of a result.

## What it supports

- Numbers from 1 to 3999 inclusive. There is no Roman zero, and 4000 and above would need the overline (vinculum) notation, which is not supported.
- Standard subtractive form: IV not IIII, XC not LXXXX, with at most three repeats of I, X, C and M.
- Lowercase input is accepted and read as uppercase.
- Non-standard forms such as IIII, VX or IC are rejected as invalid rather than guessed at.
- Input is limited to 16 characters.

## Example

\`\`\`
1984      → MCMLXXXIV
MMXXVI    → 2026
3999      → MMMCMXCIX
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What are the Roman numeral symbols and their values?',
        a: 'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500 and M = 1000. Symbols are added left to right, except that a smaller symbol before a larger one is subtracted: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.',
      },
      {
        q: 'Why do Roman numerals only go up to 3999?',
        a: 'Because M (1000) is the largest symbol and standard rules allow at most three repeats, MMMCMXCIX = 3999 is the largest number writable without extra notation. Larger numbers used a bar over a numeral to multiply it by 1000.',
      },
      {
        q: 'Is IIII a valid Roman numeral for 4?',
        a: 'Not in the standard subtractive system, which writes IV. IIII does appear on many clock faces, mostly for visual balance against VIII, and was common in ancient inscriptions.',
      },
      {
        q: 'How do I write 2026 in Roman numerals?',
        a: 'MMXXVI: MM = 2000, XX = 20, VI = 6. Film credits and building cornerstones still use this form for years.',
      },
    ],
  },
  natoPhonetic: {
    title: 'NATO Phonetic Alphabet',
    seo: 'NATO Phonetic Alphabet Converter: Spell Text Out | XUtil',
    body: `A NATO phonetic alphabet converter spells text out as Alpha, Bravo, Charlie code words, and turns a list of code words back into letters and digits.

## How to use

1. Type or paste letters, digits and spaces, or a list of NATO code words. Auto mode detects the direction; the switch at the top forces Text → NATO or NATO → Text.
2. The result appears as you type and has a Copy button.
3. Characters that have no code word (punctuation, accents) show an error naming the character.

## What it supports

- All 26 letters using the ICAO (International Civil Aviation Organization) spelling alphabet, with the common spellings Alpha, Juliet and X-ray.
- Digits 0–9 are spelled out as Zero to Nine, and a space becomes (Space).
- Decoding is case-insensitive and also accepts the official ICAO spellings Alfa and Juliett, as well as Xray and Space.
- Code words are separated by whitespace, so "Alpha Bravo" and "alpha\nbravo" both decode. Output letters are uppercase.
- Any word that is not a code word stops decoding with an error, so it is not a general text-to-letters tool.

## Example

\`\`\`
XUTIL 42
→ X-ray Uniform Tango India Lima (Space) Four Two
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is the NATO phonetic alphabet?',
        a: 'A set of 26 code words, one per letter (Alfa, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, X-ray, Yankee, Zulu), chosen so letters are not confused over radio or telephone. It was adopted by the ICAO in 1956 and is formally the ICAO spelling alphabet.',
      },
      {
        q: 'Is it Alpha or Alfa, Juliet or Juliett?',
        a: 'The official ICAO spellings are Alfa and Juliett, chosen so that speakers of French and other languages pronounce them correctly. Alpha and Juliet are the usual English spellings and mean the same thing; this tool outputs Alpha and Juliet and accepts both on input.',
      },
      {
        q: 'How do you say numbers in the NATO alphabet?',
        a: 'Digits are spoken as words: Zero, One, Two, Three, Four, Five, Six, Seven, Eight, Nine. Aviation often says "niner" for 9, "tree" for 3 and "fife" for 5 to avoid confusion over radio.',
      },
    ],
  },
  pigLatin: {
    title: 'Pig Latin Converter',
    seo: 'Pig Latin Translator: English to Pig Latin and Back | XUtil',
    body: `A Pig Latin translator moves the leading consonants of an English word to the end and adds ay, and translates Pig Latin back to English on a best-effort basis.

## How to use

1. Type or paste English or Pig Latin. Auto mode treats the input as Pig Latin when at least 60% of its words end in "ay"; the switch at the top forces either direction.
2. The result appears as you type and has a Copy button.
3. Punctuation, line breaks and capitalisation are kept: "Hello," becomes "Ellohay,".

## Rules used

- Words beginning with one or more consonants: move them to the end and add "ay" (string → ingstray).
- Words beginning with a vowel (a, e, i, o, u): add "way" (apple → appleway).
- Words with no vowel at all: add "ay" (rhythm → rhythmay). Y is treated as a consonant.
- Only words made of Latin letters A–Z are translated; numbers, and words containing an apostrophe or digit, pass through unchanged.

Decoding is best effort. Pig Latin does not record how many consonants were moved, so the decoder moves back every consonant after the stem's last vowel. Words that end in a vowel ("Ellohay" → "Hello") round-trip; words that end in a consonant usually do not ("orldway" → "rldwo", not "world").

## Example

\`\`\`
Hello, world   → Ellohay, orldway
Ethay ietay    → The tie
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What are the rules of Pig Latin?',
        a: 'Move the consonant sound at the start of a word to the end and add "ay": pig → igpay, string → ingstray. Words that start with a vowel just get a suffix, usually "way" or "yay": egg → eggway.',
      },
      {
        q: 'Can Pig Latin be translated back to English?',
        a: 'Only approximately. The code is lossy: "atwer" and "water" both become "aterway", so a decoder cannot know how many consonants to move back. Short words and words ending in a vowel usually recover correctly.',
      },
      {
        q: 'Is Pig Latin related to Latin?',
        a: 'No. It is an English language game dating from at least the 19th century; the name is a joke about it sounding foreign. Similar games exist in other languages, such as French verlan and Swedish rövarspråket.',
      },
    ],
  },
  numeronym: {
    title: 'Numeronym Generator',
    seo: 'Numeronym Generator: i18n, a11y, l10n Abbreviations | XUtil',
    body: `A numeronym generator abbreviates long words to their first letter, the count of letters between, and last letter, the way internationalization becomes i18n.

## How to use

1. Type or paste text. Each word long enough to shorten is replaced as you type; the output has a Copy button.
2. Choose the minimum word length to shorten: 3, 4 (default), 5 or 6 letters. Shorter words are left as they are.
3. Punctuation attached to a word and the spacing between words are kept.

## Rules used

- A word is a run of letters, digits and underscores. The abbreviation is first letter + (length − 2) + last letter, so a 4-letter word such as "word" becomes "w2d".
- Output is lowercase unless the whole word is uppercase, in which case the letters stay uppercase (HTTP → H2P).
- Hyphenated words such as "e-mail" are left unchanged, because the letters are not one continuous run.
- Numbers and words shorter than the minimum pass through unchanged.

## Example

\`\`\`
internationalization and accessibility
→ i18n and a11y        (minimum 4 letters)
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does i18n mean?',
        a: 'i18n is a numeronym for "internationalization": the word starts with i, ends with n, and has 18 letters in between. It refers to designing software so it can be adapted to different languages and regions.',
      },
      {
        q: 'What is the difference between i18n, l10n and a11y?',
        a: 'i18n is internationalization (making software adaptable), l10n is localization (actually translating and adapting it for one locale), and a11y is accessibility (making it usable with assistive technology). k8s for Kubernetes follows the same pattern.',
      },
      {
        q: 'How do you pronounce a11y?',
        a: 'Usually "accessibility" in full, or "ally" (as in a-l-l-y) when spoken as a nickname, since the 1 and 1 look like the letter l.',
      },
    ],
  },
  leetspeak: {
    title: 'Leetspeak Translator',
    seo: 'Leetspeak Translator: Text to 1337 and Back | XUtil',
    body: `A leetspeak translator swaps letters for look-alike digits and symbols (e becomes 3, a becomes 4, t becomes 7) and can read 1337 text back into plain letters.

## How to use

1. Type or paste plain text or leetspeak. Auto mode decodes when at least a quarter of the non-space characters are not letters; the switch at the top forces Text → Leet or Leet → Text.
2. The result appears as you type and has a Copy button.
3. In Text → Leet, every letter picks a random substitution from its list each time; Shuffle generates a different version of the same input.

## What it supports

- All 26 letters have between two and five substitutions, mixing digits (4, 3, 1, 0, 5, 7), ASCII art (|-| for h, |\\/| for m, \\/\\/ for w) and symbols (@, $, €, §).
- Case is ignored on the way in; digits, spaces and punctuation pass through unchanged.
- Decoding matches the longest known token first and maps it to one letter. Some tokens are ambiguous ("1" is both i and l, "6" is both b and g) and decode to one fixed choice, so round-tripping is not guaranteed.
- Pure-letter substitutions such as "vv" and "em" are never decoded, so ordinary words inside leet text survive.

## Example

\`\`\`
elite hacker   → 3|_173 #4(|<3|2    (one random result)
h4ck3r l33t    → hacker leet
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is leetspeak?',
        a: 'Leetspeak (1337, "elite") is an informal writing system from 1980s bulletin boards and later online games in which letters are swapped for similar-looking digits and symbols: "leet" becomes "l33t", "hacker" becomes "h4x0r".',
      },
      {
        q: 'What do the numbers in leetspeak stand for?',
        a: 'The common substitutions are 4 or @ for A, 3 for E, 1 or ! for I and L, 0 for O, 5 or $ for S, 7 for T, 8 for B and 6 or 9 for G. Variants exist, which is why the same word can be written many ways.',
      },
      {
        q: 'Does leetspeak make a password stronger?',
        a: 'Barely. Password crackers apply the standard substitutions automatically, so "p4$$w0rd" falls almost as quickly as "password". Length and randomness matter far more than symbol swaps.',
      },
    ],
  },
  wordFrequencyCounter: {
    title: 'Word Frequency Counter',
    seo: 'Word Frequency Counter: Most Used Words in Text | XUtil',
    body: `A word frequency counter lists every distinct word in a text with how many times it appears, most frequent first, along with the total and unique word counts.

## How to use

1. Paste the text. Counts update as you type; the Words and Unique totals sit above the list.
2. Tick Ignore case (on by default) to count "The" and "the" together, and Ignore common words to drop stop words such as "the", "and" and "is".
3. Each row has a Copy button for the word. Copy on the panel copies the whole list as tab-separated text, and Download saves it as word-frequency.tsv.

## How words are counted

- A word is a run of letters, digits and underscores. Apostrophes and hyphens split words, so "don't" counts as "don" and "t".
- Rows are sorted by count, highest first, then alphabetically for ties.
- The stop-word list has 41 common English words (a, an, and, are, as, at, be, but, by, for, from, has, he, in, is, it, its, of, on, or, that, the, this, to, was, were, will, with, you, your, i, we, they, not, no, so, if, then, than, there, their). It is English-only and cannot be edited.
- Words is the total counted after any stop words are removed; Unique is the number of rows.

## Example

\`\`\`
This is fun, this is great
→ Words 6 · Unique 4
is     2
this   2
fun    1
great  1
\`\`\`

## Privacy

Runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What are stop words?',
        a: 'Very common function words such as "the", "and", "of" and "is" that carry little meaning on their own. Search engines and text analysis usually remove them so that the remaining counts reflect the actual subject matter.',
      },
      {
        q: 'How is word count different from unique word count?',
        a: 'Word count is the total number of words including repeats; unique count is how many different words there are. "The cat and the dog" has 5 words but 4 unique words. The ratio of the two is a rough measure of vocabulary richness.',
      },
      {
        q: 'Why does the counter split words at apostrophes?',
        a: 'It matches words with the regular expression \\b\\w+\\b, which treats only letters, digits and underscores as word characters. A contraction like "it\'s" therefore appears as "it" and "s"; the same happens to hyphenated terms.',
      },
    ],
  },
};
