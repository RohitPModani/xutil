// Bcrypt and AES pages: hash/verify with bcryptjs, AES-GCM round trip,
// wrong passphrase, tampering, and the payload format.
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';

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
const throws = async (name, fn) => {
  total++;
  try {
    await fn();
    bad++;
    console.log('FAIL', name, '\n  did not throw');
  } catch {
    /* expected */
  }
};

// Bcrypt
const { parseBcrypt, utf8Length } = await load('src/pages/Encode-Decode/BcryptGenerator.tsx', 'const BCRYPT_RE', ['parseBcrypt', 'utf8Length']);
const hash = await bcrypt.hash('secret', 4);
eq('hash shape', /^\$2[aby]\$04\$/.test(hash), true);
eq('hash length', hash.length, 60);
eq('verify right', await bcrypt.compare('secret', hash), true);
eq('verify wrong', await bcrypt.compare('wrong', hash), false);
const parts = parseBcrypt(hash);
eq('parse version', parts.version, '$2b');
eq('parse cost', parts.cost, 4);
eq('parse salt length', parts.salt.length, 22);
eq('parse digest length', parts.digest.length, 31);
eq('parse rebuilds hash', `${parts.version}$04$${parts.salt}${parts.digest}`, hash);
eq('parse rejects malformed', parseBcrypt('$2b$10$short'), null);
eq('utf8 length counts bytes', utf8Length('é'), 2);

// AES
const { encryptText, decryptText, PREFIX } = await load('src/pages/Encode-Decode/AesEncryptDecrypt.tsx', 'const PREFIX', ['encryptText', 'decryptText', 'PREFIX']);
const plain = 'meet at noon — café ☕';
const payload = await encryptText('pass phrase', plain);
eq('payload prefix', payload.startsWith(PREFIX), true);
const raw = Buffer.from(payload.slice(PREFIX.length), 'base64');
eq('payload length = 16 + 12 + plaintext + 16', raw.length, 28 + Buffer.byteLength(plain) + 16);
eq('round trip', await decryptText('pass phrase', payload), plain);
eq('round trip with whitespace', await decryptText('pass phrase', `  ${payload}\n`), plain);
eq('random salt and iv', (await encryptText('pass phrase', plain)) === payload, false);
await throws('wrong passphrase', () => decryptText('pass phrasE', payload));
const tampered = Buffer.from(raw);
tampered[40] ^= 1;
await throws('tampered ciphertext', () => decryptText('pass phrase', PREFIX + tampered.toString('base64')));
await throws('missing prefix', () => decryptText('pass phrase', raw.toString('base64')));
await throws('bad base64', () => decryptText('pass phrase', PREFIX + '***'));
await throws('too short', () => decryptText('pass phrase', PREFIX + Buffer.alloc(30).toString('base64')));

console.log(bad ? `${bad} of ${total} checks failed` : `all ${total} checks pass`);
process.exit(bad ? 1 : 0);
