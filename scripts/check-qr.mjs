import ts from 'typescript';
import { readFileSync } from 'node:fs';
const src = readFileSync('src/pages/Image-Tools/QRCodeGenerator.tsx', 'utf8');
const start = src.indexOf('type Kind =');
const end = src.indexOf('const EMPTY');
const js = ts.transpileModule(src.slice(start, end) + '\nexport { payloadFor };', { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { payloadFor } = await import('data:text/javascript,' + encodeURIComponent(js));
const cases = [
  ['url', { text: 'example.com/a?b=c' }, 'https://example.com/a?b=c'],
  ['url', { text: 'HTTP://example.com' }, 'HTTP://example.com'],
  ['url', { text: 'mailto:a@b.c' }, 'mailto:a@b.c'],
  ['sms', { phone: '+1 555', smsBody: 'Hi there' }, 'sms:+1 555?body=Hi%20there'],
  ['sms', { phone: '+1 555' }, 'sms:+1 555'],
  ['wifi', { wifiSsid: 'My;Net:"x"', wifiPassword: 'p,w\\d', wifiEncryption: 'WPA' }, 'WIFI:T:WPA;S:My\\;Net\\:\\"x\\";P:p\\,w\\\\d;;'],
  ['wifi', { wifiSsid: 'Open', wifiPassword: 'ignored', wifiEncryption: 'nopass', wifiHidden: '1' }, 'WIFI:T:nopass;S:Open;H:true;;'],
  ['whatsapp', { phone: '+44 (20) 7946-0000', whatsappMessage: 'a b' }, 'https://wa.me/442079460000?text=a%20b'],
  ['whatsapp', { phone: '+' }, ''],
  ['event', { eventTitle: 'Lunch; now', eventStart: 'garbage', eventEnd: '', eventDescription: 'line 1\nline 2, done' }, 'BEGIN:VEVENT\nSUMMARY:Lunch\\; now\nDESCRIPTION:line 1\\nline 2\\, done\nEND:VEVENT'],
  ['event', { eventTitle: 'T', eventStart: '2026-01-02T03:04', eventEnd: '' }, (s) => /^BEGIN:VEVENT\nSUMMARY:T\nDTSTART:\d{8}T\d{6}Z\nEND:VEVENT$/.test(s)],
  ['contact', { firstName: 'Ann', lastName: 'Lee, Jr', phone: '+1;2' }, 'BEGIN:VCARD\nVERSION:3.0\nN:Lee\\, Jr;Ann\nFN:Ann Lee\\, Jr\nTEL:+1\\;2\nEND:VCARD'],
  ['contact', { lastName: 'Solo' }, 'BEGIN:VCARD\nVERSION:3.0\nN:Solo;\nFN:Solo\nEND:VCARD'],
];
let bad = 0;
for (const [kind, f, want] of cases) {
  const got = payloadFor(kind, f);
  const ok = typeof want === 'function' ? want(got) : got === want;
  if (!ok) {
    bad++;
    console.log('FAIL', kind, JSON.stringify(f), '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want));
  }
}
console.log(bad ? `${bad} failures` : `all ${cases.length} cases pass`);
