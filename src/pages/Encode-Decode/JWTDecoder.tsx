import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, KeyValueList, Output, Panel, TextArea, TwoPane } from '../../ui';
import type { JsonValue } from '../../types/json';
import { getErrorMessage } from '../../utils/errors';

interface Decoded {
  header: Record<string, JsonValue>;
  payload: Record<string, JsonValue>;
  signature: string;
}

function base64UrlDecode(str: string): string {
  let out = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (out.length % 4) {
    case 0:
      break;
    case 2:
      out += '==';
      break;
    case 3:
      out += '=';
      break;
    default:
      throw new Error('Illegal base64url string');
  }
  const bin = atob(out);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return bin;
  }
}

function decode(token: string): Decoded {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('A JWT has three dot-separated parts: header.payload.signature.');
  let header: Record<string, JsonValue>;
  let payload: Record<string, JsonValue>;
  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    throw new Error('The header or payload is not valid base64url-encoded JSON.');
  }
  return { header, payload, signature: parts[2] };
}

const CLAIM_LABELS: Record<string, string> = {
  iss: 'Issuer (iss)',
  sub: 'Subject (sub)',
  aud: 'Audience (aud)',
  exp: 'Expires (exp)',
  nbf: 'Not before (nbf)',
  iat: 'Issued at (iat)',
  jti: 'Token id (jti)',
};

const formatTime = (v: JsonValue) =>
  typeof v === 'number'
    ? `${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long' }).format(new Date(v * 1000))} · ${v}`
    : String(v);

export default function JWTDecoder() {
  const [token, setToken] = useState('');

  const result = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { data: decode(token), error: '' };
    } catch (e) {
      return { data: null, error: getErrorMessage(e, 'Could not decode this token.') };
    }
  }, [token]);

  const data = result?.data ?? null;
  const exp = typeof data?.payload.exp === 'number' ? data.payload.exp : null;
  const expired = exp !== null && exp * 1000 < Date.now();

  const claims = data
    ? Object.entries(data.payload)
        .filter(([k]) => k in CLAIM_LABELS)
        .map(([k, v]) => ({
          label: CLAIM_LABELS[k],
          value: ['exp', 'nbf', 'iat'].includes(k) ? formatTime(v) : String(v),
          copy: String(v),
        }))
    : [];

  return (
    <ToolPage id="jwt">
      <Panel title="Decode" actions={<ClearButton onClick={() => setToken('')} disabled={!token} />}>
        <TwoPane>
          <Field label="Token" htmlFor="jwt-input" hint="Decoded locally. The signature is shown but not verified.">
            <TextArea
              id="jwt-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.dBjftJeZ4CVP"
              rows={8}
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
              aria-describedby={result?.error ? 'jwt-error' : undefined}
            />
          </Field>
          <div className="space-y-4">
            <Output
              label="Header"
              value={data ? JSON.stringify(data.header, null, 2) : ''}
              placeholder="Algorithm and token type"
              rows={4}
            />
            <Output
              label="Payload"
              value={data ? JSON.stringify(data.payload, null, 2) : ''}
              placeholder="Claims"
              rows={8}
              fileName="payload.json"
              mime="application/json"
            />
          </div>
        </TwoPane>

        {result?.error && (
          <Callout tone="error" id="jwt-error" className="mt-4">
            {result.error}
          </Callout>
        )}

        {data && (
          <div className="mt-4 space-y-3">
            {exp !== null && (
              <Callout tone={expired ? 'error' : 'success'}>
                {expired ? 'This token expired ' : 'This token is valid until '}
                {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(exp * 1000))}.
              </Callout>
            )}
            {claims.length > 0 && (
              <Output label="Registered claims" copyText={claims.map((c) => `${c.label}: ${c.value}`).join('\n')}>
                <KeyValueList items={claims} />
              </Output>
            )}
            <Output label="Signature" value={data.signature} rows={2} />
          </div>
        )}
      </Panel>
    </ToolPage>
  );
}
