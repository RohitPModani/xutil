export interface SEODescriptionContent {
  title: string;
  seo: string;
  body: string;
}

const seoDescriptions: Record<string, SEODescriptionContent> = {
  yamlJson: {
    title: "YAML ↔ JSON Transformer",
    seo: "Instant YAML to JSON Converter | Free Online Tool",
    body: `Ever feel like you're translating between two data languages that refuse to get along? Our YAML ↔ JSON converter is the diplomatic peacekeeper your projects need.

**Why you'll love this tool:**
- Flawlessly converts complex nested structures in milliseconds
- Convert data directly from files
- Handles all the edge cases that make you question your career choices
- Works entirely in your browser - no data leaves your computer

Perfect for:
- Kubernetes warriors wrestling with config files
- API developers switching between formats
- Anyone who's ever screamed "Why won't these brackets work?!"

Pro tip: Bookmark this for when your YAML suddenly needs to be JSON (or vice versa) at 2 AM. No judgment here.`
  },

  xmlJson: {
    title: "XML ↔ JSON Alchemist",
    seo: "XML to JSON Converter Online | Free & No Ads",
    body: `Converting XML to JSON shouldn't feel like decoding ancient hieroglyphics. Our tool makes it as easy as flipping a switch.

**Why this beats your current solution:**
- Handles attributes, namespaces, and all that XML weirdness
- Clean output with proper indentation (because readability counts)
- No "premium version" nonsense - all features are free
- Processes 100% client-side (your sensitive data stays yours)

Real-world uses:
- Modernizing legacy systems without losing hair
- Making SOAP APIs play nice with REST clients
- When your boss says "Make it work" and you just need it done

Fun fact: This tool has prevented approximately 1.2 million developer meltdowns (estimate may be low).`
  },

  baseEncoder: {
    title: "Base64 Wizard",
    seo: "Base64 Encoder/Decoder | Free Online Tool",
    body: `Base64 encoding shouldn't require a computer science degree. Our tool makes it as simple as paste → transform → profit.

**Why developers keep coming back:**
- Supports all major variants (Standard, URL-safe, MIME)
- Handles huge inputs without breaking a sweat
- Zero-configuration - just works the way you expect
- Dark mode friendly (because night coding is life)

When to use:
- Preparing data URLs for your masterpiece website
- Debugging JWT tokens without going cross-eyed
- That moment when you need to email binary data safely

PS: We don't track your data. At all. Pinky promise.`
  },

  cipherEncoder: {
    title: "Cipher Cryptologist",
    seo: "ROT13 & Caesar Cipher Tool | Free Online Encoder",
    body: `Turn "hello world" into secret spy messages with our cipher toolkit. James Bond-level encryption, minus the tuxedo.

**What's in our crypto toolkit:**
- ROT13 (the hacker's hello world)
- Custom Caesar shifts (choose your own adventure)
- Instant two-way conversion
- Works with numbers too

Perfect for:
- Teaching basic cryptography concepts
- Creating escape room puzzles
- Sending messages only your nerd friends will get

Did you know? Caesar used a shift of 3 - which is why it's called the Caesar cipher. Ancient Rome's version of "password123".`
  },

  guidGenerator: {
    title: "UUID Architect",
    seo: "Free Online GUID/UUID Generator | Instant Results",
    body: `Need a unique ID that won't repeat until the heat death of the universe? Our generator has you covered.

**Why our UUIDs rock:**
- RFC 4122 compliant (because standards matter)
- Simple No-Ad UI
- Copy with one click (no fiddling with selections)
- Batch generation for when you need lots of uniqueness

Critical uses:
- Database records that won't collide
- Distributed systems that need to play nice
- That moment when you realize your IDs aren't actually unique

Fun fact: There are 2^128 possible UUIDs - that's 340 undecillion. You're statistically safe.`
  },

  hashGenerator: {
    title: "Hash Alchemist",
    seo: "Online Hash Generator | SHA-1, SHA-256, SHA-512",
    body: `Turn any input into cryptographic gibberish with our hashing cauldron. One-way transformation guaranteed.

**Our hash menu includes:**
- Fast hashes (SHA-1) for non-security uses
- Secure hashes (SHA-256, SHA-512) for passwords
- Accurate conversions
- Rainbow table-resistant output

When to hash:
- Verifying file integrity (is that ISO corrupted?)
- Password storage (properly salted, of course)
- Creating unique identifiers from similar inputs

Warning: Hashes are like tattoos - permanent but not secret. Use proper encryption for sensitive data.`
  },

  htmlEntities: {
    title: "HTML Sanitizer",
    seo: "HTML Entities Encoder/Decoder | Free Online Tool",
    body: `Keep your angle brackets from turning into unwanted DOM elements. Our tool makes HTML safe again.

**Why this beats manual escaping:**
- Handles all 2,224 named character references
- Supports decimal and hex numeric entities
- Preserves emojis and Unicode characters

Essential for:
- Preventing XSS attacks in user-generated content
- Displaying code snippets on your blog
- When you need to show <div> without creating one

Pro tip: Always encode untrusted input. Your future self will thank you.`
  },

  morseCode: {
    title: "Morse Code Whisperer",
    seo: "Morse Code Translator | Free Online Tool",
    body: `Dot-dash your way to communication glory with our Morse code translator. More fun than semaphore, less work than smoke signals.

**Features that spark joy:**
- Real-time translation as you type
- Audio playback (headphones recommended)

Perfect for:
- Pretending you're a WWII spy (we won't tell)
- Actual emergency communication practice
- Adding retro flair to your maker project

Did you know? SOS isn't an acronym - it was chosen because ··· --- ··· is unmistakable.`
  },

  passwordGenerator: {
    title: "Password Architect",
    seo: "Secure Password Generator | Free Online Tool",
    body: `Tired of using your pet's name + "123"? Our password generator creates fortress-level security in seconds.

**What makes our generator special:**
- Customizable length (8-64 characters)
- Choose character sets (symbols, numbers, etc.)
- Strength meter that doesn't lie to you

Critical uses:
- Securing your cryptocurrency wallet
- That work account you really can't afford to lose
- When your significant other demands shared passwords

Remember: "password123" isn't a password - it's an invitation. Be smarter.`
  },

  ulidGenerator: {
    title: "ULID Forge",
    seo: "ULID Generator Online | Sortable Unique IDs",
    body: `Get the benefits of UUIDs with built-in sorting. ULIDs are like UUIDs that actually understand time.

**Why ULIDs are awesome:**
- Chronologically sortable (finally!)
- 128-bit compatibility with UUID
- Base32 encoded (URL-safe and readable)
- 80-bit randomness - collisions unlikely

Ideal for:
- Database indexes that need ordering
- Distributed systems where time matters
- When you're tired of UUIDv4's randomness

Tech trivia: ULIDs encode time with millisecond precision in the first 48 bits.`
  },

  urlEncoder: {
    title: "URL Safehouse",
    seo: "URL Encoder/Decoder | Free Online Tool",
    body: `Make messy URLs behave with our encoding toolkit. Special characters need love too.

**What we handle gracefully:**
- Full URL encoding
- Proper %-encoding for all Unicode

When encoding saves the day:
- Preparing API request parameters
- Fixing broken links with spaces
- That email with 20 unencoded ampersands

Did you know? Spaces can be encoded as %20 we handle both.`
  },

  csvJson: {
    title: "CSV ↔ JSON Negotiator",
    seo: "CSV to JSON Converter Online | Free Tool",
    body: `Bridge the gap between spreadsheet data and modern apps. Our converter speaks both CSV and JSON fluently.

**Conversion features:**
- Automatic header detection
- Support nested JSON using ' _ ' separator
- Handles messy CSV like a champ
- Handle File conversion

Perfect for:
- Migrating legacy data to modern systems
- Preparing dataset for D3.js visualizations
- That analytics report that only exports as CSV

Pro tip: We automatically escape quotes and special characters - no more broken parsers!`
  },

  jsonToTs: {
    title: "TypeScript Type Sculptor",
    seo: "JSON to TypeScript Interface Converter | Free Online",
    body: `Turn messy JSON into beautiful TypeScript interfaces with one click. Your IDE autocomplete will thank you.

**Why developers love this:**
- Generates precise types with no manual work
- Handles nested objects and arrays
- Provide custom interface name
- Copy-ready output formatted for your IDE

Essential for:
- API response typing
- Config file interfaces
- That moment when you're tired of \`any\` types

Fun fact: Proper typing can catch up to 15% of bugs before runtime.`
  },

  jsonToPython: {
    title: "Python Data Modeler",
    seo: "JSON to Python Dataclass Converter | Free Tool",
    body: `Generate Python dataclasses from JSON faster than you can say "type hints". PEP 584 compliant and ready to use.

**Features Pythonistas love:**
- Clean @dataclass output
- Optional type checking imports
- Provide custom class name
- Supports Python 3.7+

When to use:
- Working with JSON APIs in Python
- Creating structured config files
- That Flask/Django project needing type safety

Remember: Explicit is better than implicit - even when it's auto-generated!`
  },

  jsonToPydantic: {
    title: "Pydantic Wizard",
    seo: "JSON to Pydantic Model Converter | Free Online",
    body: `Transform JSON into fully-validated Pydantic models. Get data validation without the boilerplate.

**Why this is magic:**
- Generates complete BaseModel classes
- Adds proper field types and validators
- Provide custom class name
- Ready for FastAPI and modern Python

Perfect for:
- API request/response models
- Configuration with validation
- Anywhere you'd normally use dicts and regret it

Pro tip: Pydantic models can save hours of debugging by catching bad data early.`
  },

  baseNumber: {
    title: "Base Number Sorcerer",
    seo: "Base Number Converter | Base 2 - Base 36",
    body: `Convert between number bases like a math wizard. No calculator button mashing required.

**Supported bases:**
- Binary (because 10 types of people exist)
- Hex (for when you feel 0xFFFFFF fancy)
- Octal (retro computing vibes)
- Base36 (for short URLs and more)

When base matters:
- Debugging bitwise operations
- Reading memory dumps
- Creating short unique IDs
- That cryptography class you're taking

Did you know? Base64 isn't actually a number base - it's an encoding scheme.`
  },

  textBase: {
    title: "Text Transformer",
    seo: "Text to Binary/Hex Converter | Free Online Tool",
    body: `See your text in binary, hex, and more. Perfect for when ASCII just isn't nerdy enough.

**Transformation options:**
- Binary with proper spacing
- Hex without 0x prefixes
- Decimal / Octal

Fun uses:
- Creating geeky art projects
- Understanding character encoding
- Sending secret messages only machines understand

Tech trivia: The word "text" in hex is 0x74657874. Now you know.`
  },

  unixUtc: {
    title: "Time Travel Agent",
    seo: "UNIX Timestamp Converter | Human-Readable Dates",
    body: `Convert between seconds-since-1970 and actual human dates. Because timestamps shouldn't be cryptic.

**Features time travelers need:**
- Millisecond precision
- UTC timezone
- Future date conversion

Essential for:
- Debugging log files
- API expiration timestamps
- That moment when you need to know what 1618033988 means

Fun fact: The UNIX epoch (Jan 1 1970) is called "the birthday of modern computing".`
  },

  timezone: {
    title: "Timezone Diplomat",
    seo: "Timezone Converter Online | Free Meeting Planner",
    body: `Schedule meetings across timezones without the headache. We handle the math so you don't have to.

**Why our converter rocks:**
- 500+ cities and timezones
- Side-by-side comparison
- Future date calculations

Perfect for:
- Remote teams spread across the globe
- Client calls with international partners
- That webinar where you can't afford mistakes

Pro tip: Always specify timezone in meeting invites. "3 PM" means nothing without context.`
  },

  loremIpsum: {
    title: "Lorem Ipsum Artisan",
    seo: "Lorem Ipsum Generator | Free Fake Text Tool",
    body: `Generate placeholder text that looks legit but says nothing. Perfect for when your design needs words, but content comes later.

**Why designers love this:**
- Multiple paragraph lengths
- Custom word counts
- Classic Lorem
- No awkward "hello world" repeats

When filler text saves the day:
- Website mockups
- Font testing
- CMS template setup
- That presentation needing "something here"

Did you know? Lorem Ipsum comes from a 2000-year-old Latin text by Cicero. The original placeholder content.`
  },

  textCompare: {
    title: "Text Diff Detective",
    seo: "Text Compare Tool Online | Free Diff Checker",
    body: `Spot differences between two texts like a pro. We highlight changes so you don't have to squint.

**Comparison superpowers:**
- Side-by-side diff views
- Super quick comparison
- line-level change highlighting
- No text size limits

Critical uses:
- Version control conflict resolution
- Legal document review
- Finding that one line that broke everything

Pro tip: Great for comparing API responses before/after changes.`
  },

  jsonValidator: {
    title: "JSON Syntax Sheriff",
    seo: "JSON Validator and Formatter | Free Online Tool",
    body: `Validate and beautify JSON in one click. Because nobody likes debugging unformatted minified data.

**Why this beats your IDE:**
- Detailed error location reporting
- Validate and Format with a single click
- Copy or Download formatted JSON
- Direct editing with live validation

Essential for:
- API response debugging
- Config file cleanup
- That moment when you realize your JSON has trailing commas

Fun fact: JSON doesn't support comments, but we can still make it readable!`
  },

  textCase: {
    title: "Text Case Alchemist",
    seo: "Text Case Converter Online | Free Tool",
    body: `Transform text cases faster than you can say "camelCase". Perfect for code, headers, and more.

**Supported transformations:**
- camelCase, PascalCase, snake_case, kebab-case
- CONSTANT_CASE and more
- Sentence and Path case
- Mocking case (because sometimes you just need tHiS)

When case matters:
- Coding style consistency
- Database column naming
- API parameter formatting
- That moment when you pasted ALL CAPS

Did you know? Case styles exist because readability matters in different contexts.`
  },

  regexTester: {
    title: "Regex Debugger",
    seo: "Regex Tester Online | Free Pattern Validator",
    body: `Test regular expressions in real-time without the trial-and-error headache. Your pattern-matching sidekick.

**Why regex pros use this:**
- Quick and ease of use
- Clear example place holders
- Subgroup extraction
- Cheatsheet for quick reference

Perfect for:
- Validating complex input patterns
- Data extraction from text
- Learning regex without frustration

Pro tip: Great for crafting validation patterns for forms and APIs.`
  },

  markdownPreviewer: {
    title: "Markdown Maestro",
    seo: "Markdown Previewer Online | Free Tool",
    body: `See your Markdown rendered beautifully as you type. No more guessing how it will look.

**Preview features:**
- GitHub Flavored Markdown support
- Live HTML syntax preview
- Export to HTML option

Essential for:
- Blog post drafting
- README.md creation
- Documentation writing
- That moment when **bold** doesn't look bold

Fun fact: Markdown was created in 2004 as a simpler alternative to HTML.`
  },

  duplicateLineRemover: {
    title: "Duplicate Line Bouncer",
    seo: "Duplicate Line Remover Online | Free Tool",
    body: `Clean up messy text by removing duplicate lines in seconds. Your data deserves better.

**Cleaning options:**
- Case-sensitive comparison
- Keep first occurrence
- Removes empty lines 
- No BS basic cleaning

When deduplication helps:
- Cleaning CSV data
- Processing log files
- Removing repeated imports
- That giant list that needs simplifying

Pro tip: Great for preparing data for database import.`
  },

  lineBreakWhitespaceRemover: {
    title: "Whitespace Ninja",
    seo: "Whitespace Remover Online | Free Tool",
    body: `Slash through unnecessary spaces and line breaks like a text-cleaning samurai.

**What we trim:**
- Leading/trailing spaces
- Extra middle spaces
- Line breaks and tabs

Essential for:
- Cleaning user inputs
- Preparing text for APIs
- Making minified JS readable
- That CSV file with inconsistent formatting

Did you know? Invisible whitespace characters can break scripts and comparisons.`
  },

  stringCounter: {
    title: "String Analyst",
    seo: "Character Counter Online | Free Text Analysis Tool",
    body: `Get detailed stats on your text in real-time. More than just word count - understand your content.

**What we count:**
- Characters (with/without spaces)
- Words and Unique words
- Lines and Sentence

Perfect for:
- SEO content optimization
- Academic writing checks
- Social media post planning
- That 280-character tweet limit

Fun fact: The average English word length is 4.7 characters. Now you know.`
  },

  jwtDecoder: {
    title: "JWT Decoder",
    seo: "JWT Decoder Online | Free Token Inspector",
    body: `Decode JSON Web Tokens to see what's inside. No more guessing about claims and expiration.

**Decoding features:**
- Header and payload visualization
- Expiration timestamp conversion
- Signature verification status
- Pretty-printed JSON output

Critical for:
- Debugging authentication issues
- API development testing
- Understanding OAuth flows
- That moment when your token "should work"

Pro tip: Never put sensitive data in unencrypted JWTs - they're just base64 encoded.`
  },

  slug: {
    title: "Slug Creator",
    seo: "URL Slug Generator Online | Free Tool",
    body: `Turn any text into perfect URL slugs. SEO-friendly and human-readable in one click.

**Slugification options:**
- Custom separator choice (-, _, etc.)
- Preserve case or force lowercase
- Quick Presets

Essential for:
- Blog post URLs
- Product page links
- API endpoint design
- That CMS that doesn't auto-generate slugs

Did you know? The term "slug" comes from newspaper publishing - a short label for articles.`
  },

  stringReverser: {
    title: "String Time Machine",
    seo: "Text Reverser Online | Free Tool",
    body: `Flip your text backward with one click. Because sometimes you need to see things differently.

**Reversal options:**
- Full string reverse

**Rotator options:**
- Rotate by (-100 to 100)

Fun uses:
- Creating secret messages
- Testing palindrome algorithms
- Debugging RTL language issues
- That creative writing exercise

Pro tip: Great for checking symmetrical designs and layouts.`
  },

  palindromeChecker: {
    title: "Palindrome Detective",
    seo: "Palindrome Checker Online | Free Tool",
    body: `Discover if your text reads the same backward. Racecar approved!

**Checking features:**
- Case insensitivity
- Punctuation ignoring

Perfect for:
- Language learning
- Algorithm practice
- Creating word puzzles
- Impressing your friends

Fun fact: The longest English palindrome is "tattarrattat" - James Joyce's knock sound in Ulysses.`
  },

  romanNumeral: {
    title: "Roman Numerals Tutor",
    seo: "Roman Numeral Converter Online | Free Tool",
    body: `Convert between Roman and Arabic numerals like a Latin scholar. SPQR would be proud.

**Conversion features:**
- Validates proper numeral forms
- Handles subtractive notation (IV vs IIII)
- Large number support (up to 3,999)
- Historical variant awareness

When Roman numerals matter:
- Movie copyright years
- Book preface numbering
- Clock face design
- That tattoo you're planning

Did you know? There's no zero in Roman numerals - they used "nulla" instead.`
  },

  natoPhonetic: {
    title: "NATO Phonetic Translator",
    seo: "NATO Phonetic Alphabet Converter | Free Tool",
    body: `Spell words clearly using the international phonetic alphabet. Alpha, Bravo, Charlie - no more misunderstandings.

**Features include:**
- Full phonetic translation
- Military variant

Essential for:
- Call center communications
- Aviation and marine use
- Clear phone spellings
- That password you need to read over the phone

Fun fact: The NATO alphabet has changed over time - "Sugar" was once used for "S".`
  },

  pigLatin: {
    title: "Pig Latin Linguist",
    seo: "Pig Latin Translator Online | Free Tool",
    body: `Convert English to Pig Latin instantly. Igpay Atinlay isway away ealfay!

**Translation options:**
- Classic Pig Latin rules
- Preserves punctuation

Perfect for:
- Language learning games
- Creating secret messages
- Childhood nostalgia
- That prank on your friends

Did you know? Pig Latin isn't actually related to Latin - it's just a playful English code.`
  },

  numeronym: {
    title: "Numeronym Generator",
    seo: "Numeronym Creator Online | Free Tool",
    body: `Turn long words into sleek abbreviations like i18n (internationalization). Less typing, same meaning.

**Generation options:**
- Standard middle-number style
- Custom abbreviation points
- Multiple word handling

Tech uses:
- Common dev terms (a11y, l10n)
- API endpoint shorthand
- Project code names
- That long variable name you're tired of typing

Pro tip: Great for creating memorable project names with hidden meanings.`
  },

  urlParser: {
    title: "URL Dissector",
    seo: "URL Parser Online | Free Tool",
    body: `Break down URLs into components with surgical precision. No more guessing about query strings.

**Parsing features:**
- Full component breakdown
- Query parameter extraction
- Authentication details
- Fragment identifier handling

Critical for:
- Web development debugging
- API documentation
- SEO analysis
- That moment when you need one specific parameter

Fun fact: The first URL was created in 1991 by Tim Berners-Lee for the World Wide Web project.`
  },

  regexCheatsheet: {
    title: "Regex Cheat Sheet",
    seo: "Regular Expression Cheat Sheet | Free Reference",
    body: `Master regular expressions with our interactive cheat sheet. All the patterns you need in one place.

**Reference includes:**
- Character classes
- Quantifiers and anchors
- Grouping constructs
- Lookahead/lookbehind

Essential for:
- Pattern matching mastery
- Data validation
- Text processing
- That complex search-replace

Did you know? Regular expressions originated in 1956 with mathematician Stephen Kleene's work.`
  },

  qrCodeGenerator: {
    title: "QR Code Artisan",
    seo: "Free QR Code Generator | Customizable & No Login",
    body: `Turn any link, text, or contact info into a scannable QR code in seconds. No design degree required.

**Why our generator stands out:**
- Custom colors and styling options
- Error correction for damaged codes
- Support multiple Types (Website URL, Add a Contact, Plain Text etc.,)
- No watermarks or hidden fees

Use cases:
- Business cards that actually get scanned
- Restaurant menus in the post-pandemic world
- That art project that needs a digital twist

Fun fact: The three squares in QR codes are called "position detection patterns" - they help scanners orient the code.`
  },

  barcodeGenerator: {
    title: "Barcode Forge",
    seo: "Barcode Generator Online | Free Tool",
    body: `Create professional barcodes in all major formats. No expensive software needed.

**Supported formats:**
- UPC (retail products)
- EAN (international items)
- Code 128 (shipping/logistics)
- ITF (supply chain)

Perfect for:
- Small business inventory
- Library system setup
- Maker projects needing IDs
- That prototype that needs labeling

Pro tip: Always verify your barcode scans with a reader before mass printing.`
  },

  barcodeReader: {
    title: "Barcode Decoder",
    seo: "Barcode Reader Online | Free Tool",
    body: `Decode barcodes from images or camera input. Discover what's hidden in those black lines.

**Reading features:**
- Multiple format support
- Text output options
- Validation checks

Essential for:
- Inventory management
- Price comparison
- Asset tracking
- That mystery barcode you found

Did you know? The first barcode scanned was a pack of Wrigley's gum in 1974.`
  },

  colorPicker: {
    title: "Color Scientist",
    seo: "Color Picker Online | Free Tool",
    body: `Find, tweak, and convert colors with precision. Your perfect palette is one click away.

**Color tools include:**
- HEX, RGB, HSL converters
- Color picker
- Live color preview

Perfect for:
- Web design projects
- Brand color selection
- Accessibility testing
- That gradient that needs perfect stops

Fun fact: The human eye can distinguish about 10 million different colors.`
  },

  faviconGenerator: {
    title: "Favicon Sculptor",
    seo: "Favicon Generator Online | Free Tool",
    body: `Create perfect favicons for all devices. Because your website deserves more than a default icon.

**Generation features:**
- Transparent PNG support
- ICO format conversion

Essential for:
- Professional website polish
- Brand recognition in tabs
- Progressive Web Apps
- That project that needs that extra touch

Pro tip: Always include 32x32, 64x64, and 180x180 sizes for full device support.`
  },

  imageCompressor: {
    title: "Image Optimizer",
    seo: "Image Compressor Online | Free Tool",
    body: `Shrink image file sizes without visible quality loss. Faster load times, happier visitors.

**Compression options:**
- Quality slider control
- Before/after comparison

Critical for:
- Website performance
- Email attachments
- Mobile app assets
- That gallery that loads too slowly

Did you know? Proper image compression can improve page load times by 50% or more.`
  },

  gradientGenerator: {
    title: "Gradient Designer",
    seo: "CSS Gradient Generator | Free Online Tool",
    body: `Create stunning gradients with our visual editor. No more guessing hex codes.

**Design features:**
- Linear/radial options
- Multiple color stops
- Angle control
- CSS code export

Perfect for:
- Modern UI backgrounds
- Branding elements
- Data visualization
- That design that needs more dimension

Pro tip: Use subtle gradients (like white-to-very-light-gray) for professional depth.`
  },

  boxShadowGenerator: {
    title: "Shadow Architect",
    seo: "CSS Box Shadow Generator | Free Online Tool",
    body: `Design perfect shadows for your UI elements. Depth and dimension made easy.

**Customization options:**
- X/Y offset control
- Blur and spread
- Inset shadows
- Quick Presets

Essential for:
- Material Design implementations
- Card and button styling
- Floating element effects
- That design that needs to "pop"

Fun fact: Proper shadow use can increase perceived usability by up to 20%.`
  },

  leetspeak: {
    title: "Leet Translator",
    seo: "Leetspeak Converter Online | Free Tool",
    body: `Turn normal text into 1337 5P34K. Perfect for gaming handles and secret messages.

**Translation options:**
- Random character substitutions
- Preserve readability

Fun uses:
- Creating hacker-style usernames
- Password inspiration
- Retro gaming vibes
- That prank on your tech friends

Did you know? Leetspeak originated in the 1980s as a way to bypass text filters on BBS systems.`
  },

  wordFrequencyCounter: {
    title: "Word Analyst",
    seo: "Word Frequency Counter Online | Free Tool",
    body: `Analyze your text to find the most used words. SEO and content insights at a glance.

**Analysis features:**
- Case-insensitive 
- Exportable results

Perfect for:
- SEO content optimization
- Writing style analysis
- Language learning
- That novel you're editing

Pro tip: Overused words often indicate repetitive writing - great for editing.`
  },

  bitByte: {
    title: "Bit ↔ Byte Converter",
    seo: "Bits Conversion Online | Free Tool",
    body: `A Bit ↔ Byte Converter is like a Rosetta Stone for digital storage — translating between bits, bytes, kilobytes, megabytes, and beyond with pixel-perfect accuracy.
  Whether you're estimating file sizes, decoding bandwidth limits, or arguing about whether 1 MB is 1000 KB or 1024, this tool sets the record straight.
  Instantly convert between bits and bytes in all their metric and binary glory — from b to TB, it's all covered.
  Perfect for developers, sysadmins, network nerds, and anyone who’s ever yelled at a download speed meter.`
  },   

  temperature: {
    title: "Temperature Converter",
    seo: "Temperature Conversion Online | Free Tool",
    body: `A Temperature Converter is like a digital weather wizard — effortlessly translating between Celsius, Fahrenheit, and Kelvin so you never have to say “what’s 451°F in real units?” again.
  Whether you're cooking, coding, or casually wondering if -40 is really the same in both scales (it is!), this tool brings the heat and the chill.
  Instantly switch between temperature units with precision — no mental math, no boiling confusion.
  Perfect for students, devs, and anyone who’s ever Googled “convert 100 C to F” mid-conversation.`
  },

  area: {
    title: "Area Converter",
    seo: "Area Conversion Online | Free Tool",
    body: `An Area Converter is like a land surveyor with superpowers — instantly flipping between square meters, acres, hectares, square miles, and more without breaking a ruler.
  Whether you're designing a room, plotting a farm, or trying to figure out what 0.25 hectares actually means, this tool clears it up fast.
  Convert any area unit quickly and confidently — from square inches to football fields.
  Perfect for architects, real estate buffs, students, and anyone who’s ever thought, “Wait… how big is an acre again?”`
  },

  length: {
    title: "Length Converter",
    seo: "Length Conversion Online | Free Tool",
    body: `A Length Converter is like a tape measure that speaks every language — translating kilometers to miles, inches to centimeters, and light-years to... well, more light-years.
  Whether you're building furniture, coding units in CSS, or just curious how long a marathon really is in meters, this tool does the math for you.
  Instantly convert between any length units with full accuracy — because size *does* matter (especially in code).
  Perfect for engineers, designers, travelers, and anyone who’s tired of Googling “how many inches in a foot” for the 10th time.`
  },

  weight: {
    title: "Weight Converter",
    seo: "Weight Conversion Online | Free Tool",
    body: `A Weight Converter is like a digital dumbbell for your brain — effortlessly flipping between kilograms, pounds, grams, and tons with zero sweat involved.
  Whether you're calculating cargo, measuring ingredients, or just curious how much your dog weighs in stone, this tool lifts the confusion.
  Convert weight units instantly and accurately — from micrograms to megatons.
  Perfect for cooks, lifters, logistics pros, and anyone who’s ever yelled “what’s 5 lbs in kg?!” while meal-prepping.`
  },

  volume: {
    title: "Volume Converter",
    seo: "Volume Conversion Online | Free Tool",
    body: `A Volume Converter is like a digital measuring cup for everything — effortlessly translating between liters, gallons, cups, milliliters, and more.
  Whether you're scaling recipes, tracking fuel, or just trying to figure out how much is “a pint” in real units, this tool makes volume conversion a breeze.
  Convert between any volume unit quickly and accurately — from kitchen to chemistry lab.
  Perfect for cooks, scientists, students, and anyone who's ever asked, "How many cups is that again?"`
  },

  energy: {
    title: "Energy Converter",
    seo: "Energt Conversion Online | Free Tool",
    body: `An Energy Converter is like a power adapter for units — switching between joules, calories, kilowatt-hours, BTUs, and more without blowing a fuse.
  Whether you're tracking food energy, calculating physics problems, or just trying to understand what a kilojoule even means, this tool brings clarity.
  Convert any energy unit instantly and precisely.
  Perfect for scientists, fitness enthusiasts, students, and anyone who’s ever thought, "How many calories is that in real power?"`
  },

  speed: {
    title: "Speed Converter",
    seo: "Speed Conversion Online | Free Tool",
    body: `A Speed Converter is like cruise control for numbers — smoothly converting between km/h, mph, m/s, knots, and more in just a click.
  Whether you're clocking race times, tracking data transfer, or just wondering how fast a cheetah really is, this tool moves fast.
  Convert speed units instantly with pinpoint accuracy.
  Perfect for athletes, engineers, physics nerds, and anyone who’s ever needed to turn “miles per hour” into “meters per second” without a calculator.`
  },

  power: {
    title: "Power Converter",
    seo: "Power Conversion Online | Free Tool",
    body: `A Power Converter is like a wattage wizard — flipping between watts, horsepower, kilowatts, BTUs and more without burning out.
  Whether you're sizing up appliances, configuring circuits, or just trying to figure out how strong one horsepower really is, this tool brings the juice.
  Convert any power unit quickly and accurately — from mechanical to electrical and everything in between.
  Perfect for engineers, electricians, physics students, and anyone who’s ever said, “Wait… how many watts is that?”`
  },

  pressure: {
    title: "Pressure Converter",
    seo: "Pressure Conversion Online | Free Tool",
    body: `A Pressure Converter is like a stress reliever for unit confusion — smoothly translating between PSI, bar, Pascal, atm, and more.
  Whether you're inflating tires, calibrating instruments, or just trying to make sense of barometric data, this tool keeps it from getting too intense.
  Convert pressure values across metric and imperial systems with ease.
  Perfect for engineers, mechanics, weather geeks, and anyone who’s ever asked, “Is that too much pressure… or not enough?”`
  },

  angle: {
    title: "Angle Converter",
    seo: "Angle Conversion Online | Free Tool",
    body: `An Angle Converter is like a math protractor in digital form — converting between degrees, radians, gradians, and more with pinpoint precision.
  Whether you're working on geometry, animations, or just trying to understand how π fits into a circle, this tool keeps your angles in check.
  Flip between angle units instantly — no trig needed.
  Perfect for developers, students, game designers, and anyone who’s ever wondered, “How many radians is 90 degrees again?”`
  },

  frequency: {
    title: "Frequency Converter",
    seo: "Frequency Conversion Online | Free Tool",
    body: `A Frequency Converter is like a DJ for data — smoothly spinning between Hertz, kilohertz, megahertz, and gigahertz without missing a beat.
  Whether you're tuning signals, analyzing waves, or debugging system clocks, this tool keeps things on the right frequency.
  Convert frequency values instantly across scales — from audio to RF and beyond.
  Perfect for engineers, tech enthusiasts, musicians, and anyone who’s ever asked, “How many Hz is that exactly?”`
  },

  fuelEconomy: {
    title: "Fuel Economy Converter",
    seo: "Fuel Economy Conversion Online | Free Tool",
    body: `A Fuel Economy Converter is like your car’s translator — flipping between MPG, L/100km, km/L and other units so you know exactly how thirsty your ride is.
  Whether you're buying a new car, tracking fuel usage, or comparing international efficiency ratings, this tool delivers fast, accurate results.
  Switch between fuel economy units without manual math or mental gymnastics.
  Perfect for drivers, travelers, mechanics, and anyone who’s ever asked, “Is 7 L/100km good?” (Spoiler: yes, kind of.)`
  },

  timeUnit: {
    title: "Time Unit Converter",
    seo: "Time Unit Conversion Online | Free Tool",
    body: `A Time Unit Converter is like a digital timekeeper with a calculator — converting milliseconds to days, minutes to hours, or weeks to seconds without breaking a sweat.
  Whether you're debugging performance, building countdowns, or just figuring out how long “900000 ms” really is, this tool has your back.
  Convert between any time units instantly and precisely — from nanoseconds to centuries, no time frame is too weird.
  Perfect for developers, data analysts, and anyone who’s ever Googled, “How many seconds in a month?”`
  },

};

export default seoDescriptions;