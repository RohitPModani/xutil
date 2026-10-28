// Checks for the pure helpers in the developer tools: CIDR maths and chmod conversions.
import ts from 'typescript';
import { readFileSync } from 'node:fs';

/** Pure helpers from a page: the code between `from` and `export default`, transpiled and imported. */
async function load(file, from, names) {
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf(from);
  const end = src.indexOf('export default function');
  const js = ts.transpileModule(src.slice(start, end) + `\nexport { ${names.join(', ')} };`, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import('data:text/javascript,' + encodeURIComponent(js));
}

let bad = 0;
let total = 0;
const eq = (name, got, want) => {
  total++;
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    bad++;
    console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want));
  }
};
const throws = (name, fn) => {
  total++;
  try {
    fn();
    bad++;
    console.log('FAIL', name, 'did not throw');
  } catch {
    // expected
  }
};

// CIDR
const { parseCidr } = await load('src/pages/Converters/CidrCalculator.tsx', 'const toInt', ['parseCidr']);
let c = parseCidr('10.0.0.0/8');
eq('/8 network', c.network, '10.0.0.0');
eq('/8 broadcast', c.broadcast, '10.255.255.255');
eq('/8 hosts', [c.firstHost, c.lastHost, c.usable, c.total], ['10.0.0.1', '10.255.255.254', 16777214, 16777216]);
eq('/8 mask', [c.mask, c.wildcard], ['255.0.0.0', '0.255.255.255']);
eq('/8 private', c.scope, 'Private (RFC 1918)');
c = parseCidr('192.168.1.37/24');
eq('/24 network', [c.network, c.broadcast], ['192.168.1.0', '192.168.1.255']);
eq('/24 hosts', [c.firstHost, c.lastHost, c.usable, c.total], ['192.168.1.1', '192.168.1.254', 254, 256]);
eq('/24 mask binary', c.maskBinary, '11111111.11111111.11111111.00000000');
eq('/24 keeps the typed ip', c.ip, '192.168.1.37');
c = parseCidr('10.1.2.3/31');
eq('/31 both usable (RFC 3021)', [c.firstHost, c.lastHost, c.usable, c.total], ['10.1.2.2', '10.1.2.3', 2, 2]);
c = parseCidr('8.8.8.8/32');
eq('/32 one host', [c.network, c.broadcast, c.firstHost, c.lastHost, c.usable, c.total], ['8.8.8.8', '8.8.8.8', '8.8.8.8', '8.8.8.8', 1, 1]);
eq('/32 public', c.scope, 'Public');
eq('bare address is /32', parseCidr('1.2.3.4').prefix, 32);
c = parseCidr('0.0.0.0/0');
eq('/0 covers everything', [c.network, c.broadcast, c.total, c.mask, c.wildcard], ['0.0.0.0', '255.255.255.255', 4294967296, '0.0.0.0', '255.255.255.255']);
eq('high bit does not go negative', parseCidr('255.255.255.255/30').network, '255.255.255.252');
eq('172.16/12 upper edge is private', parseCidr('172.31.255.255/16').scope, 'Private (RFC 1918)');
eq('172.32 is public', parseCidr('172.32.0.1/16').scope, 'Public');
eq('loopback', parseCidr('127.0.0.1').scope, 'Loopback (127.0.0.0/8)');
eq('link-local', parseCidr('169.254.10.10/16').scope, 'Link-local (RFC 3927)');
throws('octet above 255', () => parseCidr('256.1.1.1/24'));
throws('three octets', () => parseCidr('10.0.0/8'));
throws('prefix above 32', () => parseCidr('10.0.0.0/33'));
throws('empty prefix', () => parseCidr('10.0.0.0/'));
throws('ipv6', () => parseCidr('2001:db8::/32'));
throws('garbage', () => parseCidr('hello'));

// chmod
const { octalToMode, symbolicToMode, modeToOctal, modeToSymbolic, describeMode } = await load(
  'src/pages/Converters/ChmodCalculator.tsx',
  'const SETUID',
  ['octalToMode', 'symbolicToMode', 'modeToOctal', 'modeToSymbolic', 'describeMode']
);
eq('755 → symbolic', modeToSymbolic(octalToMode('755')), 'rwxr-xr-x');
eq('rwxr-xr-x → octal', modeToOctal(symbolicToMode('rwxr-xr-x')), '755');
eq('4755 setuid s', modeToSymbolic(octalToMode('4755')), 'rwsr-xr-x');
eq('rwsr-xr-x → 4755', modeToOctal(symbolicToMode('rwsr-xr-x')), '4755');
eq('4655 setuid without execute is S', modeToSymbolic(octalToMode('4655')), 'rwSr-xr-x');
eq('2755 setgid', modeToSymbolic(octalToMode('2755')), 'rwxr-sr-x');
eq('1777 sticky t', modeToSymbolic(octalToMode('1777')), 'rwxrwxrwt');
eq('rwxrwxrwt → 1777', modeToOctal(symbolicToMode('rwxrwxrwt')), '1777');
eq('1776 sticky without execute is T', modeToSymbolic(octalToMode('1776')), 'rwxrwxrwT');
eq('0644 → rw-r--r--', modeToSymbolic(octalToMode('0644')), 'rw-r--r--');
eq('0644 round trip drops the zero', modeToOctal(octalToMode('0644')), '644');
eq('000', modeToSymbolic(octalToMode('000')), '---------');
eq('ls -l prefix tolerated', modeToOctal(symbolicToMode('drwxr-xr-x')), '755');
eq('describe 755', describeMode(octalToMode('755')), 'Owner can read, write and execute; group and others can read and execute.');
eq('describe 644', describeMode(octalToMode('644')), 'Owner can read and write; group and others can read.');
eq('describe 600', describeMode(octalToMode('600')), 'Owner can read and write; group and others have no access.');
eq('describe 4755', describeMode(octalToMode('4755')), 'Owner can read, write and execute; group and others can read and execute. The setuid bit is set.');
eq('describe 1777', describeMode(octalToMode('1777')), 'Owner, group and others can read, write and execute. The sticky bit is set.');
throws('octal digit 8', () => octalToMode('758'));
throws('octal too short', () => octalToMode('75'));
throws('octal too long', () => octalToMode('07555'));
throws('symbolic wrong length', () => symbolicToMode('rwxr-x'));
throws('symbolic bad letter', () => symbolicToMode('rwxr-xr-q'));
throws('symbolic letter in wrong slot', () => symbolicToMode('rwxr-xrw-'.replace('r', 'x')));
throws('t only valid for others', () => symbolicToMode('rwtr-xr-x'));

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
