export interface SEODescriptionContent {
  title: string;
  body: string;
}

const seoDescriptions: Record<string, SEODescriptionContent> = {
  yamlJson: {
    title: "YAML ↔ JSON Converter",
    body: `A YAML ↔ JSON Converter is like a peace treaty between two rival clans of structured data — one adores indentation, the other worships curly braces.
Whether you're untangling cloud configs, fixing API payloads, or just trying to stop YAML from yelling about weird tags like !secret, this tool has your back.
Instantly swap between YAML and JSON without losing your mind (or your metadata).
It's perfect for developers, DevOps warriors, or anyone who's ever whispered to themselves, "Please... just work." — Good news: it does.`
  },

  jwtEncoder: {
    title: "JWT Encoder & Decoder",
    body: `A JWT Encoder & Decoder is your secret agent for debugging tokens, decoding headers, and peeking into payloads — all without leaking your secrets to the world.
Whether you're building auth flows or verifying token claims, this tool saves time and sanity.
Decode. Debug. Done.`
  },

  xmlJson: {
    title: "XML ↔ JSON Converter",
    body: `An XML ↔ JSON Converter is like a translator between two ancient tribes of data — one loves angle brackets, the other’s obsessed with curly braces.
Whether you’re wrangling legacy SOAP APIs or just trying to make your front-end and back-end stop arguing, this tool makes it painless.
Convert structured data from XML to JSON or back again in one click, without breaking a sweat or a schema.
It’s perfect for developers, integration engineers, or anyone who’s ever stared at nested tags and thought, “There’s got to be a better way.” Spoiler: there is, and it’s this.`
  },

  baseEncoder: {
    title: "Base Encoder/Decoder",
    body: `A Base Encoder/Decoder is like Google Translate — but for nerdy number systems. It converts your text into formats like Base64, Base32, or even Base58,
so you can sneak data through systems that don’t like raw binary or special characters. Need to encode a secret message? Decode a weird-looking string?
Or just make yourself look like a backend wizard? This tool has you covered. It's fast, reliable, and great for developers, security peeps, or
anyone who wants to sound cooler by saying “I just Base64-encoded that.” Bonus: it’s the legal kind of encoding that won’t get you arrested.`
  },

  cipherEncoder: {
    title: "Cipher Encoder/Decoder",
    body: `A Cipher Encoder/Decoder is your gateway to old-school encryption — the kind used by Roman emperors and nerdy puzzle-makers alike.
With Caesar and ROT13 ciphers, you can shift letters around like a magician with a secret alphabet deck. Want to send “hello” as “uryyb”?
Or confuse your friends just enough to feel mysterious without needing actual math? This tool's got you. It’s perfect for simple encoding,
brain teasers, or feeling like a cryptography boss without diving into hardcore AES or RSA. Julius Caesar would be proud — and slightly jealous of your UI.`
  },

  guidGenerator: {
    title: "GUID Generator",
    body: `A GUID (Globally Unique Identifier) is a 128-bit value that’s practically guaranteed to be unique across space, time, and coffee-fueled coding sprints.
It’s the digital equivalent of your fingerprint, except it’s used to tag things like database records, software components, and files you swear you didn’t duplicate.
If UUIDs and GUIDs were in a rock band, GUID would be the mysterious lead guitarist — always there, never repeating, and impossible to confuse with someone else.
They’re long, messy-looking strings like f81d4fae-7dec-11d0-a765-00a0c91e6bf6, but that chaos is what makes them powerful.
So next time you need something truly one-of-a-kind in your app or system, a GUID is your dependable (and dramatic) little label.`
  },

  hashGenerator: {
    title: "Hash Generator",
    body: `A Hash Generator is like a digital blender — toss in any text, and it churns out a fixed-length, irreversible string of gibberish that’s unique to your input.
Perfect for securing passwords, verifying file integrity, or just pretending you’re a cryptography wizard. Whether you're working with MD5, SHA-256,
or one of those other fancy hash functions, this tool makes sure your data has a one-way ticket to Obfuscation City. Just remember: once it’s hashed,
there’s no going back — kind of like texting your crush at 2AM. Great for devs, security pros, and anyone who wants to feel like a hacker without actually breaking anything.`
  },

  htmlEntities: {
    title: "HTML Entities Encoder/Decoder",
    body: `An HTML Entities Encoder/Decoder is like a grammar school for your code — teaching it to speak safely in a browser without accidentally summoning chaos.
Ever tried to show <div> in HTML and instead created... an actual div? Yeah, this tool fixes that.
It converts special characters (like <, >, &, and friends)
into safe, readable entities — and can turn them back when you're ready to let them run free. Perfect for web developers, bloggers, email template warriors,
or anyone tired of their angle brackets causing drama. Bonus: It’s the only time yelling “ampersand!” actually helps.`
  },

  morseCode: {
    title: "Morse Code Parser",
    body: `A Morse Code Parser is like a time machine for your text — turning modern messages into dot-dash symphonies that would've made 19th-century telegraph
operators weep with joy. Whether you're decoding secret spy messages, learning how to talk like a submarine captain, or just want your "LOL"
to go beep-beep-beeeeeep, this tool has your back. It converts regular text to Morse code and back again, making it perfect for puzzle nerds,
escape rooms, or impressing your friends with old-school tech magic. Warning: may cause sudden urges to blink SOS at parties.`
  },

  passwordGenerator: {
    title: "Password Generator",
    body: `A Password Generator is your personal cyber bodyguard — but instead of sunglasses and a suit, it hands you secure, random, hacker-proof strings
that look like keyboard rage but protect your accounts like Fort Knox. Whether you're tired of using "password123" (no judgment... okay, a little)
or just want to avoid getting pwned, this tool creates strong, customizable passwords in seconds. You choose the length, symbols, numbers, uppercase,
and voilà — a password that even your evil twin can’t guess. It's fast, secure, and saves you from the eternal regret of reusing your ex’s birthdate as your login.`
  },

  ulidGenerator: {
    title: "ULID Generator",
    body: `A ULID (Universally Unique Lexicographically Sortable Identifier) is like the cooler, more organized cousin of a UUID.
It’s time-based, so it shows up to parties in order, and it looks like it was created by someone with their life together—
not someone who just smashed their keyboard. Developers love ULIDs because they’re unique, sortable, and don’t look like ancient magic spells.
In short: it’s a clean, sleek way to identify stuff without chaos. Perfect for databases, logs, and impressing your tech friends.`
  },

  urlEncoder: {
    title: "URL Encoder/Decoder",
    body: `A URL Encoder/Decoder is like a travel agent for your text — making sure it gets through the internet without getting mugged by special characters.
Ever seen %20 instead of a space or gotten yelled at by your browser because of a rogue # or &? That’s where this tool steps in.
It converts your normal strings into safe, web-friendly formats, and can decode them right back when it’s time to chill. Whether you're building query strings,
debugging URLs, or just tired of copy-pasting into Google, this tool has your back. It’s clean, fast, and won’t judge you for trying to encode emojis.`
  },
  csvJson: {
    title: "CSV ↔ JSON Converter",
    body: `A CSV ↔ JSON Converter is like a backstage pass between two worlds — one’s a strict spreadsheet wizard, the other’s a chill API hipster.
  Whether you're prepping data for databases, feeding APIs, or just trying to make sense of a million rows without losing your mind, this tool saves the day.
  Instantly flip your tabular .csv files into neat JSON objects (or vice versa) without needing a computer science degree or sacrificing your sanity.
  Perfect for developers, data scientists, Excel escape artists, or anyone who's ever muttered, "There has to be an easier way to do this." Spoiler: there is, and it's right here.`
  },
  jsonToTs: {
    title: "JSON to TypeScript Interface Converter",
    body: `A JSON to TypeScript Interface Converter is like a magic wand for developers — wave it over your messy JSON and voilà: clean, typed, ready-to-code interfaces.
  Whether you're setting up frontends, building APIs, or just tired of guessing what properties your objects have, this tool instantly upgrades your workflow.
  Convert JSON objects into strongly-typed TypeScript interfaces (and sometimes back) without lifting a finger or missing a key.
  Perfect for TypeScript fans, backend whisperers, and anyone who's ever thought, "There’s no way I’m writing this interface by hand." Good news: you don't have to.`
  },
  jsonToPython: {
    title: "JSON to Python Dataclass Converter",
    body: `A JSON to Python Dataclass Converter is like a personal assistant for your code — it turns messy, wild JSON blobs into clean, organized Python classes with zero drama.
  Whether you're building APIs, parsing configs, or just tired of writing init methods by hand, this tool instantly generates beautiful @dataclass models that are ready to roll.
  Perfect for Pythonistas, backend builders, and anyone who's whispered, "There has to be a lazier smarter way to do this." Spoiler: there is — and it even adds type hints for extra style points.`
  },
  jsonToPydantic: {
    title: "JSON to Pydantic Model Converter",
    body: `A JSON to Pydantic Model Converter is like giving your messy JSON a law degree — suddenly, it’s strict, structured, and knows exactly what types go where.
  Instantly turn wild JSON data into fully-typed, validation-ready Pydantic models without lifting a finger (or missing a field).
  Perfect for Python devs building FastAPI apps, data validation wizards, or anyone who’s ever shouted, "Why isn’t this JSON behaving?!"
  With this tool, you get clean, predictable Pydantic classes — faster than you can say "BaseModel."`
  },  
  baseNumber: {
    title: "Base Number Converter",
    body: `A Base Number Converter is like a universal remote for numbers — flip effortlessly between binary, decimal, octal, and hexadecimal without needing a math degree.
  Whether you're debugging code, solving puzzles, or just showing off your number wizardry, this tool has your back.
  Instantly convert numbers across different bases and impress your friends (or at least confuse them a little).
  Perfect for developers, students, engineers, and anyone who thinks counting beyond 10 shouldn’t require a whiteboard.`
  },
  textBase: {
    title: "Text ↔ Base Converter",
    body: `A Text ↔ Base Converter is like a universal translator for humans and machines — it flips your readable text into Base64, Base32, or Base58, and then back like it never left.
  Whether you're encoding data for URLs, APIs, or secret messages (we won’t judge), this tool does the job instantly and painlessly.
  No more decoding headaches or guessing games — just clean, reversible conversions between text and base formats.
  Perfect for developers, tinkerers, and anyone who’s ever asked, “What even is this gibberish?” Spoiler: it’s Base64. And now you can read it.`
  },  
};

export default seoDescriptions;