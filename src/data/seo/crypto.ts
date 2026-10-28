import type { SEODescriptionContent } from './types';

export const cryptoSeo: Record<string, SEODescriptionContent> = {
  bcryptGenerator: {
    title: 'Bcrypt Generator',
    seo: 'Bcrypt Generator: Hash and Verify Passwords Online | XUtil',
    body: `A bcrypt generator that hashes a password at the cost factor you choose, explains each part of the hash, and verifies a password against a hash in your browser.

## How to use

1. In **Hash** mode, type a password. The hash appears about 400 ms after you stop typing; press **New salt** to hash the same password again with a fresh salt.
2. Move the **Cost factor** slider (4 to 16, default 10). Each step doubles the work, and the time each hash took is shown under it.
3. Switch to **Verify**, paste a bcrypt hash and type the candidate password. The result reads Match or No match; a hash that is not 60 characters in the bcrypt alphabet is flagged as malformed.
4. Every hash and each of its parts has its own Copy button.

## What it does

bcrypt is a password hashing function built on the Blowfish cipher. Unlike SHA-256 it is deliberately slow, and the slowness is tunable: a cost of \`n\` means 2^n rounds of key setup, so cost 10 is 1,024 rounds and about 100 ms, cost 12 about 400 ms.

Every hash contains its own random 16-byte salt, so the same password hashes differently each time, and verification works by re-running bcrypt with the salt read from the stored hash. A hash is 60 characters:

| Part | Example | Meaning |
| --- | --- | --- |
| Version | \`$2b$\` | \`$2a$\`, \`$2b$\` and \`$2y$\` are interchangeable modern variants |
| Cost | \`10$\` | log2 of the number of rounds |
| Salt | 22 characters | 128 bits in bcrypt's own Base64 alphabet (\`./A-Za-z0-9\`) |
| Hash | 31 characters | 184 bits of output |

- Hashes are produced with the \`bcryptjs\` library and start with \`$2b$\`; they verify with any bcrypt implementation (Python \`bcrypt\`, Spring Security, PHP \`password_verify\`, Go \`x/crypto/bcrypt\`).
- bcrypt reads at most 72 bytes of the password as UTF-8. The tool shows the byte count and warns when input is longer, because bytes after the 72nd do not change the hash.
- There is no decrypt. The only way back from a hash is to guess passwords and verify each one.

## Example

\`\`\`
password  secret
cost      10
→ $2b$10$2/DqnYq1M6b4kJdqb6Fv2e59fm0sRXGz270NMHoIDUKkKNJY5iraW
   $2b$  version
   10$   cost (2^10 = 1,024 rounds)
   2/DqnYq1M6b4kJdqb6Fv2e  salt
   59fm0sRXGz270NMHoIDUKkKNJY5iraW  hash
\`\`\`

## Privacy

Hashing and verification run in JavaScript on this page. The password and the hash never leave the page, no request is made, and nothing is stored.`,
    faq: [
      {
        q: 'What is the difference between bcrypt and SHA-256?',
        a: 'SHA-256 is a fast general-purpose hash: a GPU can try billions of candidates per second, which makes it a poor choice for passwords. bcrypt is deliberately slow, tunable through its cost factor, and salts every hash on its own, so guessing a password from a bcrypt hash is thousands of times more expensive.',
      },
      {
        q: 'What cost factor should I use for bcrypt?',
        a: 'Pick the highest cost your login path can afford, usually 10 to 12 in 2025, which is roughly 100 to 400 ms per hash on a server CPU. Each step doubles the time. Store the cost in the hash, as bcrypt does, so you can raise it later and rehash users when they next log in.',
      },
      {
        q: 'Can bcrypt be decrypted?',
        a: 'No. bcrypt is a one-way function with no key, so there is nothing to decrypt. The only way to find the password is to guess candidates and run bcrypt on each, which is exactly what the cost factor makes slow.',
      },
      {
        q: 'Why is my bcrypt hash different every time?',
        a: 'Because each hash includes a fresh random salt, stored in characters 8 to 29 of the result. Verification reads that salt back and recomputes, so two different hashes of the same password both verify correctly.',
      },
    ],
  },
  aesEncrypt: {
    title: 'AES Encrypt / Decrypt',
    seo: 'AES Encryption Online: Encrypt and Decrypt Text | XUtil',
    body: `An AES encryption tool that encrypts text with a passphrase using AES-256-GCM and a PBKDF2-derived key, and decrypts it again, entirely in your browser.

## How to use

1. Choose **Encrypt**, type a passphrase and the text to protect. The ciphertext appears about 300 ms after you stop typing, as a single line starting with \`xutil-aes1:\`.
2. Copy or download it. Each run uses a fresh salt and IV, so encrypting the same text twice gives two different ciphertexts that both decrypt.
3. Choose **Decrypt**, paste the ciphertext and enter the same passphrase. A wrong passphrase or any altered byte is reported as a failed authentication check rather than producing garbage.

## What it does

- **Key derivation:** PBKDF2 with SHA-256, a random 16-byte salt and 310,000 iterations turns the passphrase into a 256-bit key. The iterations make each guess at the passphrase cost 100 ms or more.
- **Cipher:** AES-256-GCM with a random 12-byte IV. GCM is authenticated encryption: a 16-byte tag detects tampering, so decryption either returns the exact original text or fails.
- **Format:** \`xutil-aes1:\` followed by Base64 of \`salt(16) || iv(12) || ciphertext || tag(16)\`. The prefix names the scheme so the format can change without breaking old payloads.
- **Portability:** any library that offers PBKDF2 and AES-GCM can decrypt this payload once it splits the bytes as above; the scheme is printed under the output. It is **not** compatible with \`openssl enc\`, which uses its own key derivation and a \`Salted__\` header.
- A passphrase is only as strong as its guessability. PBKDF2 slows an attacker down; it does not make a short passphrase safe.

## Example

\`\`\`
passphrase  correct horse battery staple
plaintext   meet at noon
→ xutil-aes1:cERqvGsx3cZDqEN1PVwhUcL4JzOZa6JKScQGHtWjVuojj6el2O5Ivmmkw6053dKmKuGFdTW2u1o=
  (your output differs: salt and IV are random each time)
\`\`\`

## Privacy

Encryption and decryption use the browser's WebCrypto API (\`crypto.subtle\`) on this page. The passphrase, plaintext and ciphertext never leave the page, no request is made, and nothing is stored.`,
    faq: [
      {
        q: 'Is AES-256 secure?',
        a: 'Yes. AES-256 has no practical attack and is approved for the highest classification levels. In practice the weak point is never the cipher but the passphrase, the key derivation, or a misused IV, which is why this tool uses PBKDF2 with a high iteration count, a random salt and a fresh IV every time.',
      },
      {
        q: 'What is the difference between AES-GCM and AES-CBC?',
        a: 'CBC only encrypts; it does not detect tampering, and padding makes it vulnerable to padding-oracle attacks when used without a separate MAC. GCM encrypts and authenticates in one pass with a 16-byte tag, so a modified ciphertext or wrong key is rejected instead of decrypting to garbage. New designs should use GCM.',
      },
      {
        q: 'Can I decrypt without the passphrase?',
        a: 'No. The key is derived from the passphrase and is never stored, and AES-256 cannot be brute-forced. The only route is to guess the passphrase, and PBKDF2 at 310,000 iterations makes each guess cost around a tenth of a second.',
      },
      {
        q: 'Why can OpenSSL not decrypt this output?',
        a: 'The command openssl enc writes a Salted__ header and derives its key with its own EVP_BytesToKey or PBKDF2 settings, in a layout that differs from this tool. The bytes here are salt, IV, ciphertext and GCM tag in that order after a text prefix; decrypt them with any AES-GCM library following that layout, not with openssl enc.',
      },
    ],
  },
};
