// Sanity checks for the reference data: ASCII, HTTP status codes, MIME types, ports.
import ts from 'typescript';
import { readFileSync } from 'node:fs';

const load = async (file) => {
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  return import('data:text/javascript,' + encodeURIComponent(js));
};

let problems = 0;
const check = (ok, msg) => { if (!ok) { problems++; console.log(`FAIL ${msg}`); } };

const { ASCII_TABLE, LATIN1_TABLE } = await load('src/data/asciiTable.ts');
check(ASCII_TABLE.length === 128, `ascii: ${ASCII_TABLE.length} rows, expected 128`);
check(ASCII_TABLE.every((r, i) => r.code === i), 'ascii: codes not 0–127 in order');
for (const [code, char] of [[32, 'SP'], [48, '0'], [65, 'A'], [97, 'a'], [127, 'DEL'], [0, 'NUL'], [27, 'ESC']])
  check(ASCII_TABLE[code].char === char, `ascii: ${code} is ${JSON.stringify(ASCII_TABLE[code].char)}, expected ${char}`);
check(ASCII_TABLE.every((r) => r.hex.length === 2 && r.bin.length === 8 && parseInt(r.hex, 16) === r.code && parseInt(r.oct, 8) === r.code && parseInt(r.bin, 2) === r.code), 'ascii: hex/oct/bin mismatch');
check(ASCII_TABLE.every((r) => r.name), 'ascii: missing name');
check(ASCII_TABLE[38].entity === '&amp;' && ASCII_TABLE[60].entity === '&lt;' && ASCII_TABLE[10].escape === '\\n', 'ascii: entity/escape spot check');
check(LATIN1_TABLE.length === 128 && LATIN1_TABLE[0].code === 128 && LATIN1_TABLE[127].code === 255, 'latin1: range');

const { HTTP_STATUS_CLASSES } = await load('src/data/httpStatusCodes.ts');
const codes = HTTP_STATUS_CLASSES.flatMap((c) => c.codes.map((s) => s.code));
check(new Set(codes).size === codes.length, 'http: duplicate codes');
check(codes.every((c) => c >= 100 && c <= 599), 'http: code outside 100–599');
for (const c of [200, 201, 204, 301, 302, 304, 307, 308, 400, 401, 403, 404, 405, 409, 410, 418, 422, 429, 500, 502, 503, 504])
  check(codes.includes(c), `http: missing ${c}`);
for (const cls of HTTP_STATUS_CLASSES)
  check(cls.codes.every((s) => String(s.code)[0] === cls.range[0] && s.phrase && s.meaning && s.note && s.rfc), `http: bad row in ${cls.range}`);

const { MIME_GROUPS } = await load('src/data/mimeTypes.ts');
const mimes = MIME_GROUPS.flatMap((g) => g.rows);
check(new Set(mimes.map((r) => r.ext)).size === mimes.length, 'mime: duplicate extensions');
check(mimes.every((r) => /^[a-z0-9]+$/.test(r.ext)), 'mime: extension must be lowercase, no dot');
check(mimes.every((r) => /^(text|image|audio|video|font|application|model|message)\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i.test(r.type)), 'mime: type not type/subtype');
for (const ext of ['json', 'js', 'csv', 'png', 'pdf', 'woff2', 'wasm', 'xml']) check(mimes.some((r) => r.ext === ext), `mime: missing .${ext}`);

const { PORT_GROUPS, portRange } = await load('src/data/portNumbers.ts');
const ports = PORT_GROUPS.flatMap((g) => g.rows);
const pairs = ports.map((r) => `${r.port}/${r.protocol}`);
check(new Set(pairs).size === pairs.length, 'ports: duplicate (port, protocol)');
check(ports.every((r) => Number.isInteger(r.port) && r.port >= 0 && r.port <= 65535 && ['TCP', 'UDP', 'TCP/UDP'].includes(r.protocol) && r.service && r.description), 'ports: bad row');
for (const p of [22, 25, 53, 80, 443, 3306, 5432, 6379, 27017]) check(ports.some((r) => r.port === p), `ports: missing ${p}`);
check(portRange(80) === 'system' && portRange(1024) === 'registered' && portRange(49151) === 'registered' && portRange(49152) === 'dynamic', 'ports: range boundaries');

console.log(problems ? `${problems} problem(s)` : `reference OK: ${ASCII_TABLE.length} ascii, ${codes.length} http, ${mimes.length} mime, ${ports.length} ports`);
process.exit(problems ? 1 : 0);
