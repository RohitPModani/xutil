import type { SEODescriptionContent } from './types';

export const referenceSeo: Record<string, SEODescriptionContent> = {
  asciiTable: {
    title: 'ASCII Table',
    seo: 'ASCII Table: Decimal, Hex, Octal, Binary, HTML | XUtil',
    body: `An ASCII table of all 128 characters with decimal, hex, octal and binary codes, HTML entities and escape sequences, plus the Latin-1 extended set 128–255.

## How to use

1. Type in the filter box: a character (\`A\`), a decimal code (\`65\`), a hex code (\`41\`), or a name such as "tab" or "space". The table narrows as you type.
2. Switch between All, Control and Printable to hide the rows you do not need.
3. Tick "Extended (128–255)" to append the Latin-1 supplement.
4. Each row has a Copy button for the character itself (or the code, for control characters).

## What is covered

| Column | Contents |
| --- | --- |
| Dec, Hex, Oct, Bin | The code in base 10, 16 (two digits), 8 (three digits) and 2 (eight bits) |
| Char | The printable character, or the abbreviation of a control character (NUL, SOH, ESC, SP, DEL) |
| Name | The full name: "Start of Heading", "Latin capital letter A", "Low line (underscore)" |
| HTML | The named entity where one exists (\`&amp;\`, \`&lt;\`, \`&gt;\`, \`&quot;\`, \`&#39;\`), otherwise the numeric \`&#NN;\` form |
| Escape | The C and JavaScript escape where one exists: \`\\0\`, \`\\t\`, \`\\n\`, \`\\r\`, \`\\\\\`, \`\\'\`, \`\\"\`, \`\\x1B\` |

- Codes 0–31 and 127 are control characters; 32–126 are printable. Space (32) is counted as printable here.
- The extended rows follow ISO-8859-1 (Latin-1), which is also the first 256 code points of Unicode. Codes 128–159 are C1 control characters there. Windows-1252, the encoding most Windows text used, puts printable characters in that range instead: 128 is €, 147 and 148 are the curly quotes. If a file shows strange characters for those codes, it was written in Windows-1252 and read as Latin-1 or UTF-8.
- In UTF-8 the ASCII range is encoded unchanged as single bytes, so this table is also the first 128 entries of UTF-8.

## Example

\`\`\`
Filter: A
→ 65  41  101  01000001  A  Latin capital letter A  &#65;

Filter: tab
→  9  09  011  00001001  HT  Horizontal Tab   \\t
→ 11  0B  013  00001011  VT  Vertical Tab     \\v
\`\`\`

## Privacy

The table is part of the page. Filtering runs in the browser; no request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is the ASCII code for space?',
        a: 'Space is ASCII 32 in decimal, 0x20 in hex, 040 in octal and 00100000 in binary. In HTML it can be written as &#32;, and a non-breaking space is &nbsp; (160).',
      },
      {
        q: 'What is the ASCII value of A and a?',
        a: 'Capital A is 65 (0x41) and lowercase a is 97 (0x61). Upper and lower case letters differ by exactly 32, which is a single bit (0x20), so case can be flipped by toggling that bit.',
      },
      {
        q: 'What is the difference between ASCII and extended ASCII?',
        a: 'ASCII defines 128 characters, codes 0 to 127, in seven bits. "Extended ASCII" is any eight-bit encoding that keeps those 128 and adds 128 more; ISO-8859-1 (Latin-1) and Windows-1252 are the most common, and they disagree about codes 128 to 159.',
      },
      {
        q: 'What are ASCII control characters?',
        a: 'Codes 0 to 31 and 127. They were designed to control teleprinters: tab (9), line feed (10), carriage return (13), escape (27) and bell (7) are still used; most of the rest, such as Start of Heading or Record Separator, are rare outside legacy data formats.',
      },
    ],
  },

  httpStatusCodes: {
    title: 'HTTP Status Codes',
    seo: 'HTTP Status Codes: Complete List with Meanings | XUtil',
    body: `A list of HTTP status codes from 100 to 599 with the reason phrase, what each code means, when to use it and the RFC that defines it, grouped by class.

## How to use

1. Type a code or a word in the filter: \`404\`, \`redirect\`, \`rate limit\`, \`WebDAV\`. Typing \`4\` shows the whole 4xx class.
2. Read the class heading for the general meaning, then the row for the specific code.
3. Copy copies the status line, for example \`404 Not Found\`, ready for a response or a bug report.

## What is covered

| Class | Meaning |
| --- | --- |
| 1xx Informational | Interim responses: 100 Continue, 101 Switching Protocols, 103 Early Hints |
| 2xx Success | 200 OK, 201 Created, 202 Accepted, 204 No Content, 206 Partial Content and the WebDAV codes |
| 3xx Redirection | 301 and 308 permanent, 302 and 307 temporary, 303 See Other, 304 Not Modified |
| 4xx Client error | 400 through 451: authentication, permissions, not found, validation, rate limiting |
| 5xx Server error | 500 through 511: crashes, bad gateways, timeouts, unsupported versions |

- Every code in the IANA HTTP Status Code Registry is listed, with the section of RFC 9110 (the 2022 HTTP semantics standard) or the RFC that defines it.
- Codes marked **unofficial** are not in the registry but turn up in real logs: 418 from the teapot RFC, nginx 444 and 499, and Cloudflare 520–527.
- **cacheable** marks the codes a cache may store by default without explicit freshness headers (RFC 9110 §15.1): 200, 203, 204, 206, 300, 301, 308, 404, 405, 410, 414 and 501.
- **deprecated** marks codes that still exist in the registry but should not be sent: 102, 305, 306.

## Example

\`\`\`
Filter: 30
→ 300 Multiple Choices
→ 301 Moved Permanently   cacheable
→ 302 Found
→ 303 See Other
→ 304 Not Modified
→ 307 Temporary Redirect
→ 308 Permanent Redirect  cacheable
\`\`\`

## Privacy

The list is part of the page. Filtering runs in the browser; no request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between 401 and 403?',
        a: '401 Unauthorized means the request has no valid credentials: log in or send a token and try again. 403 Forbidden means the server knows who you are and still refuses; re-authenticating will not help. 401 responses must include a WWW-Authenticate header.',
      },
      {
        q: 'What does HTTP 418 mean?',
        a: '418 "I\'m a teapot" comes from RFC 2324, an April Fools specification for the Hyper Text Coffee Pot Control Protocol. It is not a real HTTP status, and RFC 9110 reserves it as unused, but many frameworks implement it and some sites return it to bots.',
      },
      {
        q: 'What is the difference between 301 and 302?',
        a: '301 Moved Permanently tells clients and search engines the resource has moved for good, so the new URL should be used and cached from now on. 302 Found is temporary: keep using the old URL. Both may turn a POST into a GET; use 308 and 307 when the method must be preserved.',
      },
      {
        q: 'What is the difference between 502 and 504?',
        a: 'Both come from a proxy or load balancer in front of the real server. 502 Bad Gateway means the upstream answered with something invalid or refused the connection, usually a crash. 504 Gateway Timeout means the upstream accepted the request but did not respond before the proxy gave up.',
      },
    ],
  },

  mimeTypes: {
    title: 'MIME Types',
    seo: 'MIME Types List by File Extension (Content-Type) | XUtil',
    body: `A MIME types list of 130-plus file extensions and their Content-Type values, grouped as text, image, audio, video, fonts, archives, documents and code.

## How to use

1. Type an extension (\`.csv\`), part of a type (\`image/\`) or a word from the description (\`font\`). A leading dot is ignored.
2. Copy copies the MIME type, ready for a Content-Type header, an \`accept\` attribute or a server config.
3. Rows with a grey note have more than one type in circulation; the note says which is current.

## What is covered

| Group | Examples |
| --- | --- |
| Text | txt, html, css, csv, md, ics, vcf, vtt |
| Image | png, jpg, gif, webp, avif, svg, ico, heic |
| Audio | mp3, wav, ogg, flac, aac, m4a |
| Video | mp4, webm, mov, mkv, ts, m3u8 |
| Fonts | woff, woff2, ttf, otf, eot |
| Archives | zip, gz, tar, 7z, rar, jar, apk, deb |
| Documents | pdf, doc, docx, xls, xlsx, ppt, pptx, odt, epub |
| Code and data | json, js, wasm, xml, yaml, sql, gltf, kml |
| Other | bin, exe, pem, crt, p12, torrent |

- The type is the IANA-registered one where it exists. Older forms are given in the note: \`.js\` is \`text/javascript\` (RFC 9239) and \`application/javascript\` is obsolete; \`.xml\` is \`application/xml\` with \`text/xml\` as an alias; \`.yaml\` is \`application/yaml\` since RFC 9512.
- Types starting with \`x-\` were never registered but are what servers and browsers actually send (\`application/x-tar\`, \`video/x-matroska\`).
- When nothing fits, \`application/octet-stream\` tells the browser to download the file rather than display it.

## Example

\`\`\`
Filter: .csv
→ .csv  text/csv  Comma-separated values

Filter: font/
→ .woff   font/woff
→ .woff2  font/woff2
→ .ttf    font/ttf
→ .otf    font/otf
→ .ttc    font/collection
\`\`\`

## Privacy

The list is part of the page. Filtering runs in the browser; no request is made and nothing is stored.`,
    faq: [
      {
        q: 'What is the MIME type for a .csv file?',
        a: 'text/csv, defined in RFC 4180. Add a charset when it matters: text/csv; charset=utf-8. Browsers sometimes report application/vnd.ms-excel for a .csv chosen in a file picker on Windows with Excel installed, so server-side checks should accept both.',
      },
      {
        q: 'What is the MIME type for JavaScript?',
        a: 'text/javascript. RFC 9239 (2022) made it the single standard type and marked application/javascript, application/x-javascript and the other variants obsolete. ES modules must be served with a JavaScript type or the browser refuses to run them.',
      },
      {
        q: 'What is the difference between application/xml and text/xml?',
        a: 'Both are valid for XML and RFC 7303 treats text/xml as an alias of application/xml. application/xml is preferred because the text/ tree once implied a default charset of US-ASCII; with application/xml the document\'s own encoding declaration wins.',
      },
      {
        q: 'What is application/octet-stream?',
        a: 'The generic type for arbitrary binary data, used when the sender does not know or does not want to state the real type. Browsers will not render it inline and offer a download instead. Serving images or scripts with it breaks them.',
      },
    ],
  },

  portNumbers: {
    title: 'Port Numbers',
    seo: 'Port Numbers: Well-Known TCP and UDP Ports List | XUtil',
    body: `A port numbers list of well-known and registered TCP and UDP ports developers meet: web, mail, DNS, SSH, databases, brokers, dev servers, Kubernetes and VPNs.

## How to use

1. Type a port number (\`5432\`), a service name (\`postgres\`) or a word from the description (\`metrics\`).
2. Use the range switch to show only system ports (0–1023), registered ports (1024–49151) or dynamic ports (49152–65535).
3. Copy copies the port number.

## What is covered

| Group | Examples |
| --- | --- |
| Core internet and system | 20/21 FTP, 22 SSH, 25 SMTP, 53 DNS, 67/68 DHCP, 80 HTTP, 123 NTP, 143 IMAP, 389 LDAP, 443 HTTPS, 445 SMB, 587 submission, 993 IMAPS |
| Databases | 1433 SQL Server, 1521 Oracle, 3306 MySQL, 5432 PostgreSQL, 6379 Redis, 7687 Neo4j, 9042 Cassandra, 9200 Elasticsearch, 27017 MongoDB |
| Message brokers | 1883 MQTT, 2181 ZooKeeper, 4222 NATS, 5672 AMQP, 9092 Kafka |
| Development servers | 3000, 4200, 5000, 5173, 8000, 8080, 8443, 8888 |
| Containers and observability | 2375/2376 Docker, 2379 etcd, 6443 Kubernetes API, 10250 kubelet, 8200 Vault, 8500 Consul, 9090 Prometheus, 3100 Loki |
| Remote access and VPN | 1194 OpenVPN, 3389 RDP, 5900 VNC, 500/4500 IPsec, 51820 WireGuard |

- The protocol column says whether the service runs over TCP, UDP or both. HTTPS is listed as both because HTTP/3 uses QUIC over UDP 443.
- IANA splits the range: system (well-known) ports 0–1023 need root to bind on Unix, registered ports 1024–49151 are assigned to services on request, and dynamic or private ports 49152–65535 are for ephemeral client connections and are never assigned.
- Development defaults such as 3000, 5173 and 8000 are conventions, not assignments. Several tools share a port and the description names the common ones.

## Example

\`\`\`
Filter: mail
→  25  TCP  SMTP             Mail transfer between servers
→ 465  TCP  SMTPS            Mail submission over implicit TLS
→ 587  TCP  SMTP submission  Mail submission from clients, with STARTTLS
\`\`\`

## Privacy

The list is part of the page. Filtering runs in the browser; no request is made and nothing is stored.`,
    faq: [
      {
        q: 'What port does HTTPS use?',
        a: 'TCP port 443. HTTP/3 also uses 443 but over UDP, because QUIC runs on UDP. Plain HTTP uses TCP 80, and 8443 is the usual alternative when a server cannot bind 443.',
      },
      {
        q: 'What is the difference between well-known and registered ports?',
        a: 'Well-known (system) ports are 0 to 1023 and on Unix only root can listen on them; they hold the core protocols such as SSH, DNS and HTTP. Registered ports, 1024 to 49151, are assigned by IANA to applications on request, such as 3306 for MySQL. Ports above 49151 are dynamic and never assigned.',
      },
      {
        q: 'What port does SMTP use?',
        a: 'Port 25 for server-to-server mail transfer, 587 for clients submitting mail with STARTTLS, and 465 for submission over implicit TLS. Mail clients should use 587 or 465; many ISPs and cloud providers block outbound 25.',
      },
      {
        q: 'Which ports do Kubernetes components use?',
        a: 'The API server listens on 6443, etcd on 2379 for clients and 2380 for peers, the kubelet on 10250 on every node, kube-scheduler on 10259 and kube-controller-manager on 10257. NodePort services use 30000 to 32767 by default.',
      },
    ],
  },
};
