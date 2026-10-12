import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, KeyValueList, Output, Panel, TextArea, TwoPane } from '../../ui';
import type { JsonObject, JsonValue } from '../../types/json';
import { getErrorMessage } from '../../utils/errors';

interface Decoded {
  header: JsonObject;
  payload: JsonObject;
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

function parseObject(part: string, name: string): JsonObject {
  let value: JsonValue;
  try {
    value = JSON.parse(base64UrlDecode(part));
  } catch {
    throw new Error(`The ${name} is not valid base64url-encoded JSON.`);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`The ${name} must be a JSON object.`);
  return value;
}

function decode(token: string): Decoded {
  const parts = token.trim().replace(/^Bearer\s+/i, '').split('.');
  if (parts.length !== 3) throw new Error('A JWT has three dot-separated parts: header.payload.signature.');
  return { header: parseObject(parts[0], 'header'), payload: parseObject(parts[1], 'payload'), signature: parts[2] };
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

// A numeric date claim as a Date, or null when it is absent or out of range.
function claimDate(v: JsonValue | undefined): Date | null {
  if (typeof v !== 'number') return null;
  const d = new Date(v * 1000);
  return Number.isFinite(d.getTime()) ? d : null;
}

const show = (v: JsonValue) => (typeof v === 'string' ? v : JSON.stringify(v));

const formatTime = (v: JsonValue) => {
  const d = claimDate(v);
  return d ? `${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long' }).format(d)} · ${show(v)}` : show(v);
};

const shortDate = (d: Date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);

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
  const now = Date.now();
  const exp = claimDate(data?.payload.exp);
  const nbf = claimDate(data?.payload.nbf);
  const expired = exp !== null && exp.getTime() < now;
  const notYet = nbf !== null && nbf.getTime() > now;
  const unsigned = data?.header.alg === 'none';

  const claims = data
    ? Object.entries(data.payload)
        .filter(([k]) => k in CLAIM_LABELS)
        .map(([k, v]) => ({
          label: CLAIM_LABELS[k],
          value: ['exp', 'nbf', 'iat'].includes(k) ? formatTime(v) : show(v),
          copy: show(v),
        }))
    : [];

  return (
    <ToolPage id="jwt">
      <Panel title="Decode" actions={<ClearButton onClick={() => setToken('')} disabled={!token} />}>
        <TwoPane>
          <Field label="Token" htmlFor="jwt-input" hint="Decoded locally. The signature is shown but not verified." error={result?.error}>
            <TextArea
              id="jwt-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.dBjftJeZ4CVP"
              rows={8}
              autoFocus
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

        {data && (
          <div className="mt-4 space-y-3">
            {unsigned && <Callout tone="error">Unsigned token: the header says alg "none", so nothing vouches for these claims.</Callout>}
            {expired ? (
              <Callout tone="error">This token expired {shortDate(exp)}.</Callout>
            ) : notYet ? (
              <Callout tone="info">This token is not valid until {shortDate(nbf)}.</Callout>
            ) : exp ? (
              <Callout tone="success">This token is valid until {shortDate(exp)}.</Callout>
            ) : null}
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
