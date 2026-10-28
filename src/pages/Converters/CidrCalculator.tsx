import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, EmptyState, Field, Input, KeyValueList, Output, Panel, TwoPane } from '../../ui';

/* ---- Maths (pure; exercised by scripts/check-dev.mjs) ------------------ */

const toInt = (ip: string): number => {
  const parts = ip.split('.');
  if (parts.length !== 4) throw new Error('An IPv4 address has four numbers separated by dots, for example 192.168.1.37.');
  return parts.reduce((acc, p) => {
    if (!/^\d{1,3}$/.test(p) || Number(p) > 255) throw new Error(`"${p}" is not a number from 0 to 255.`);
    return ((acc << 8) | Number(p)) >>> 0;
  }, 0);
};

const toDotted = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
const toBinary = (n: number) => (n >>> 0).toString(2).padStart(32, '0').replace(/(.{8})(?=.)/g, '$1.');
const inRange = (ip: number, cidr: string) => {
  const [base, bits] = cidr.split('/');
  const mask = bits === '0' ? 0 : (~0 << (32 - Number(bits))) >>> 0;
  return ((ip & mask) >>> 0) === ((toInt(base) & mask) >>> 0);
};

function classify(ip: number): string {
  if (inRange(ip, '127.0.0.0/8')) return 'Loopback (127.0.0.0/8)';
  if (inRange(ip, '169.254.0.0/16')) return 'Link-local (RFC 3927)';
  if (inRange(ip, '10.0.0.0/8') || inRange(ip, '172.16.0.0/12') || inRange(ip, '192.168.0.0/16')) return 'Private (RFC 1918)';
  if (inRange(ip, '100.64.0.0/10')) return 'Shared address space (RFC 6598)';
  if (inRange(ip, '224.0.0.0/4')) return 'Multicast';
  if (inRange(ip, '0.0.0.0/8')) return 'This network (0.0.0.0/8)';
  return 'Public';
}

interface CidrInfo {
  ip: string;
  prefix: number;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usable: number;
  total: number;
  mask: string;
  wildcard: string;
  maskBinary: string;
  scope: string;
}

/** "192.168.1.37/24" → every derived field. A bare address is treated as /32. Throws with a message fit for the Field error. */
function parseCidr(input: string): CidrInfo {
  const text = input.trim();
  if (text.includes(':')) throw new Error('Only IPv4 is supported.');
  const [ipText, prefixText, extra] = text.split('/');
  if (extra !== undefined) throw new Error('Use one slash: address/prefix.');
  const ip = toInt(ipText);
  const prefix = prefixText === undefined ? 32 : Number(prefixText);
  if (!/^\d{1,2}$/.test(prefixText ?? '32') || prefix > 32) throw new Error('The prefix length is a number from 0 to 32.');
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - prefix);
  // RFC 3021: a /31 is a point-to-point link with both addresses usable; a /32 is one host.
  const pointToPoint = prefix >= 31;
  return {
    ip: toDotted(ip),
    prefix,
    network: toDotted(network),
    broadcast: toDotted(broadcast),
    firstHost: toDotted(pointToPoint ? network : network + 1),
    lastHost: toDotted(pointToPoint ? broadcast : broadcast - 1),
    usable: pointToPoint ? total : total - 2,
    total,
    mask: toDotted(mask),
    wildcard: toDotted(~mask >>> 0),
    maskBinary: toBinary(mask),
    scope: classify(ip),
  };
}

/* ---- Page -------------------------------------------------------------- */

const num = (n: number) => n.toLocaleString();

export default function CidrCalculator() {
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { info: parseCidr(input), error: '' };
    } catch (e) {
      return { info: null, error: (e as Error).message };
    }
  }, [input]);

  const info = result?.info ?? null;
  const rows = info
    ? [
        { label: 'CIDR', value: `${info.network}/${info.prefix}` },
        { label: 'Network address', value: info.network },
        { label: 'Broadcast address', value: info.broadcast },
        { label: 'First usable host', value: info.firstHost },
        { label: 'Last usable host', value: info.lastHost },
        { label: 'Usable hosts', value: num(info.usable) },
        { label: 'Total addresses', value: num(info.total) },
        { label: 'Subnet mask', value: info.mask },
        { label: 'Wildcard mask', value: info.wildcard },
        { label: 'Mask in binary', value: info.maskBinary },
        { label: 'Address type', value: info.scope, mono: false },
      ]
    : [];

  return (
    <ToolPage id="cidr">
      <Panel title="Subnet" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <Field
            label="IPv4 address / prefix"
            htmlFor="cidr-input"
            hint="A bare address is read as /32. IPv6 is not supported."
            error={result?.error || undefined}
          >
            <Input
              id="cidr-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="192.168.1.37/24"
              maxLength={18}
              autoComplete="off"
              autoFocus
            />
          </Field>
          <Output label="Result" copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}>
            {rows.length > 0 ? <KeyValueList items={rows} /> : <EmptyState>Enter an address with a prefix length</EmptyState>}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
