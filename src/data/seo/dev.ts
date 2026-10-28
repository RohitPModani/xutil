import type { SEODescriptionContent } from './types';

export const devSeo: Record<string, SEODescriptionContent> = {
  cidrCalculator: {
    title: 'CIDR / Subnet Calculator',
    seo: 'CIDR Calculator: IPv4 Subnet, Mask and Host Range | XUtil',
    body: `A CIDR calculator turns an IPv4 block such as 192.168.1.37/24 into its network and broadcast address, host range, subnet and wildcard masks and host count.

## How to use

1. Type an address with a prefix length, for example \`10.0.0.0/8\` or \`192.168.1.37/24\`. The result updates as you type.
2. A bare address without a slash is read as a single host, /32.
3. Copy any row from the result, or the whole table with the Copy button on the panel.

## What it does

- Works out the network address by masking the host bits to zero and the broadcast address by setting them to one.
- Lists the first and last usable host. For a /31 both addresses are usable (RFC 3021, point-to-point links) and a /32 is one host; for everything else the network and broadcast addresses are excluded, so a /24 has 254 usable hosts.
- Shows the subnet mask in dotted decimal and in binary, the wildcard mask (the inverse, used in Cisco access lists), and the total number of addresses in the block.
- Tells you whether the address is private (RFC 1918: 10/8, 172.16/12, 192.168/16), loopback, link-local, carrier-grade NAT, multicast or public.
- IPv4 only. IPv6 prefixes are not supported.

## Example

\`\`\`
192.168.1.37/24
Network      192.168.1.0        Broadcast   192.168.1.255
First host   192.168.1.1        Last host   192.168.1.254
Usable       254                Total       256
Mask         255.255.255.0      Wildcard    0.0.0.255
\`\`\`

## Privacy

The calculation runs in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does /24 mean in an IP address?',
        a: 'The number after the slash is how many leading bits of the address identify the network. /24 means the first 24 bits (three octets) are the network and the last 8 are hosts, which is a subnet mask of 255.255.255.0 and 256 addresses.',
      },
      {
        q: 'How many hosts are in a /24?',
        a: '256 addresses, of which 254 are usable. The first (the network address) and the last (the broadcast address) are reserved. In general a /n block has 2^(32-n) addresses and two fewer usable hosts.',
      },
      {
        q: 'What is the difference between a subnet mask and a wildcard mask?',
        a: 'They are bitwise inverses. The subnet mask has ones for the network bits (255.255.255.0 for a /24); the wildcard mask has ones for the host bits (0.0.0.255) and is what Cisco access lists and OSPF configuration expect.',
      },
      {
        q: 'Which IP ranges are private?',
        a: 'RFC 1918 reserves 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0 to 172.31.255.255) and 192.168.0.0/16 for private networks. They are not routed on the public internet, so the same addresses can be reused behind every NAT.',
      },
    ],
  },
  chmodCalculator: {
    title: 'Chmod Calculator',
    seo: 'Chmod Calculator: 755, 644 and rwx Permissions | XUtil',
    body: `A chmod calculator that converts between permission checkboxes, octal numbers such as 755 or 644 and symbolic notation such as rwxr-xr-x, with the command.

## How to use

1. Tick read, write and execute for the owner, group and others, or type an octal number (\`644\`, \`4755\`) or symbolic string (\`rw-r--r--\`) directly. The other two views update at once.
2. Tick Setuid, Setgid or Sticky when a program or directory needs them. They appear as a leading fourth digit and as \`s\` or \`t\` in the execute position.
3. Copy the \`chmod\` command and read the one-line description to check it says what you meant.

## What it does

- Each permission class is one octal digit: read is 4, write is 2 and execute is 1, added together. \`rwx\` is 7, \`r-x\` is 5, \`r--\` is 4.
- The optional leading digit holds the special bits: setuid 4, setgid 2, sticky 1, so \`4755\` is setuid plus 755.
- In symbolic form a lowercase \`s\` or \`t\` means the special bit and execute are both set; uppercase \`S\` or \`T\` means the special bit is set without execute, which is almost always a mistake.
- Pasting a line from \`ls -l\` works: a leading file-type character such as \`d\` or \`-\` is ignored.
- Invalid text shows an error and leaves the checkboxes where they were.

## Example

\`\`\`
Octal      755
Symbolic   rwxr-xr-x
Command    chmod 755 file
Meaning    Owner can read, write and execute; group and others can read and execute.
\`\`\`

## Privacy

Everything is calculated in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What does chmod 755 mean?',
        a: 'The owner can read, write and execute (7); the group and everyone else can read and execute but not write (5 and 5). It is the usual mode for directories and for scripts and programs that others should be able to run.',
      },
      {
        q: 'What is the difference between chmod 644 and 755?',
        a: '644 has no execute bits: the owner can read and write, others can only read. 755 adds execute for everyone. Use 644 for ordinary files such as HTML, images and config, and 755 for directories and executables, since a directory needs execute to be entered.',
      },
      {
        q: 'What does chmod 777 do and is it safe?',
        a: 'It lets every user on the system read, write and execute the file. That is rarely needed and is a security hole on a shared or internet-facing machine; a web server, for example, should never own writable 777 files. Fix the owner or group instead.',
      },
      {
        q: 'What is the sticky bit (chmod 1777)?',
        a: 'On a directory the sticky bit (octal 1000, shown as t) means files inside can only be deleted or renamed by their owner, the directory owner or root, even though everyone can create files there. /tmp is the classic example and is normally 1777.',
      },
    ],
  },
  epochClock: {
    title: 'Epoch Clock',
    seo: 'Current Unix Timestamp: Live Epoch Time in Seconds | XUtil',
    body: `The current Unix timestamp, updated every second, in seconds and milliseconds, with the same instant as ISO 8601, local time and RFC 2822, plus code snippets.

## How to use

1. The large number is the current Unix time in seconds; press Copy to take it.
2. The table under it shows the same instant in milliseconds, as an ISO 8601 UTC string, in your browser's time zone and in RFC 2822 form, each with its own copy button.
3. The code panel shows how to get the current epoch in JavaScript, Python, Go, Java, C#, PHP, Ruby, Rust, bash, PostgreSQL and MySQL.
4. To convert a specific timestamp or date rather than now, use the link to the Unix to UTC converter.

## What it does

- Reads the clock with \`Date.now()\` once a second, so the display is as accurate as your computer's clock.
- The Unix time is the number of seconds since 1970-01-01T00:00:00Z, not counting leap seconds. It is the same everywhere in the world; only the local time row depends on your zone.
- Milliseconds are what JavaScript, Java and most logging systems use; seconds are what most APIs, JWTs and Unix tools use. Divide by 1,000 to go from one to the other.

## Example

\`\`\`
Seconds        1761643200
Milliseconds   1761643200000
ISO 8601       2025-10-28T09:20:00.000Z
RFC 2822       Tue, 28 Oct 2025 09:20:00 +0000
\`\`\`

## Privacy

The time comes from your own computer's clock. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is the Unix epoch?',
        a: 'Midnight UTC on 1 January 1970, the instant from which Unix time counts. A Unix timestamp is the number of seconds (or milliseconds) elapsed since then, ignoring leap seconds, so the same number names the same moment in every time zone.',
      },
      {
        q: 'Is a Unix timestamp in seconds or milliseconds?',
        a: 'Traditionally seconds, which is what C, PHP, Python\'s time.time() and most REST APIs use. JavaScript\'s Date.now() and Java\'s System.currentTimeMillis() return milliseconds, so a 13-digit number is milliseconds and a 10-digit number is seconds.',
      },
      {
        q: 'What is the year 2038 problem?',
        a: 'Systems that store Unix time in a signed 32-bit integer overflow at 2,147,483,647 seconds, which is 03:14:07 UTC on 19 January 2038, and wrap to 1901. Modern operating systems and languages use 64-bit time values, so only old embedded systems and file formats are affected.',
      },
    ],
  },
  base64Image: {
    title: 'Base64 Image Encoder',
    seo: 'Base64 Image Encoder: Image to Data URL and Back | XUtil',
    body: `A Base64 image encoder that turns a PNG, JPEG, GIF, WebP or SVG into a data URL for HTML or CSS, and decodes a data URL or Base64 back into an image file.

## How to use

1. In **Encode**, choose or drop an image up to 5 MB. You get the full data URL, the raw Base64, an \`<img>\` tag and a CSS \`background-image\` rule, each with Copy, plus a preview and the size before and after.
2. In **Decode**, paste a data URL (\`data:image/png;base64,…\`) or bare Base64. The image type is detected, the preview appears, and Download saves the file with the right extension.

## What it does

- Encoding uses the browser's own \`FileReader\`, so the output is exactly what \`readAsDataURL\` produces.
- Base64 stores 3 bytes in 4 characters, so the text is about 33% larger than the file; the Larger by figure shows the real number for your image.
- Decoding ignores whitespace and line breaks, then checks the first bytes of the result to tell PNG, JPEG, GIF, WebP, BMP, ICO, AVIF and SVG apart, falling back to the type named in the data URL. Anything else is reported as not an image.
- Percent-encoded (non-Base64) data URLs, as some SVG tooling emits, are not decoded.

## Example

\`\`\`
pixel.png (68 bytes)
→ data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
→ <img src="data:image/png;base64,iVBOR…" alt="">
\`\`\`

## Privacy

The file is read and encoded in the browser. No request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is a Base64 image?',
        a: 'An image file whose bytes are written out as Base64 text, usually inside a data URL such as data:image/png;base64,iVBOR…. Browsers render it like any other image source, but the data lives inside the HTML or CSS instead of a separate file.',
      },
      {
        q: 'Should I use Base64 images in CSS?',
        a: 'Only for very small images, roughly under a few kilobytes, such as icons or a tiny placeholder. The text is about a third larger than the file, cannot be cached separately from the stylesheet, and must be decoded on every load, so for anything bigger a normal image file is faster.',
      },
      {
        q: 'How do I convert an image to Base64 in JavaScript?',
        a: 'In the browser, create a FileReader and call readAsDataURL(file); the onload result is the data URL. In Node, read the file into a Buffer and call buffer.toString("base64"), then prefix it with data:<mime type>;base64,.',
      },
      {
        q: 'Why is a Base64 image larger than the original?',
        a: 'Base64 uses 64 printable characters, so each character carries 6 bits and every 3 bytes become 4 characters. That is a fixed 33% overhead before padding, and gzip on the wire recovers only part of it.',
      },
    ],
  },
};
