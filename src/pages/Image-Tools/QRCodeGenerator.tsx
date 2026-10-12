import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import useDebounce from '../../hooks/useDebounce';
import { Button, Callout, Checkbox, ClearButton, ColorInput, EmptyState, Field, Input, Output, Panel, PreviewBox, Select, TextArea, Toolbar, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { downloadBlob, downloadUrl } from '../../utils/download';
import { isHex } from '../../utils/color';

type Kind = 'url' | 'text' | 'contact' | 'email' | 'sms' | 'wifi' | 'phone' | 'whatsapp' | 'event';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'url', label: 'Website URL' },
  { value: 'text', label: 'Plain text' },
  { value: 'contact', label: 'Contact (vCard)' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'phone', label: 'Phone number' },
  { value: 'whatsapp', label: 'WhatsApp message' },
  { value: 'event', label: 'Calendar event' },
];

type Level = 'L' | 'M' | 'Q' | 'H';
type Fields = Record<string, string>;

// Local time formatted for <input type="datetime-local">.
const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
/** UTC timestamp for iCalendar, or null when the input is not a date. */
const toIcs = (local: string) => {
  const t = new Date(local).getTime();
  return Number.isNaN(t) ? null : `${new Date(t).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
};
/** RFC 5545 / RFC 6350 text value: backslash, semicolon, comma and newlines are escaped. */
const escText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
/** Wi-Fi record value: backslash, semicolon, comma, colon and double quote are escaped. */
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
const digits = (s: string) => s.replace(/\D/g, '');
const hasScheme = (s: string) => /^[a-z][a-z0-9+.-]*:/i.test(s);

const defaultFields = (): Fields => ({
  wifiEncryption: 'WPA',
  eventStart: toLocalInput(new Date()),
  eventEnd: toLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
});

/** The string the QR code encodes. Empty when the required fields are blank. */
function payloadFor(kind: Kind, f: Fields): string {
  const g = (k: string) => (f[k] ?? '').trim();
  switch (kind) {
    case 'url':
      return g('text') && !hasScheme(g('text')) ? `https://${g('text')}` : g('text');
    case 'text':
      return g('text');
    case 'contact': {
      if (!g('firstName') && !g('lastName') && !g('phone') && !g('email')) return '';
      let s = 'BEGIN:VCARD\nVERSION:3.0\n';
      if (g('firstName') || g('lastName')) {
        s += `N:${escText(g('lastName'))};${escText(g('firstName'))}\nFN:${escText(`${g('firstName')} ${g('lastName')}`.trim())}\n`;
      }
      if (g('phone')) s += `TEL:${escText(g('phone'))}\n`;
      if (g('email')) s += `EMAIL:${escText(g('email'))}\n`;
      return `${s}END:VCARD`;
    }
    case 'email': {
      if (!g('email')) return '';
      const params = [];
      if (g('emailSubject')) params.push(`subject=${encodeURIComponent(g('emailSubject'))}`);
      if (g('emailBody')) params.push(`body=${encodeURIComponent(g('emailBody'))}`);
      return `mailto:${g('email')}${params.length ? `?${params.join('&')}` : ''}`;
    }
    case 'sms':
      if (!g('phone')) return '';
      return `sms:${g('phone')}${g('smsBody') ? `?body=${encodeURIComponent(g('smsBody'))}` : ''}`;
    case 'wifi': {
      if (!g('wifiSsid')) return '';
      const enc = f.wifiEncryption || 'WPA';
      let s = `WIFI:T:${enc};S:${escWifi(g('wifiSsid'))};`;
      if (enc !== 'nopass' && f.wifiPassword) s += `P:${escWifi(f.wifiPassword)};`;
      if (f.wifiHidden === '1') s += 'H:true;';
      return `${s};`;
    }
    case 'phone':
      return g('phone') ? `tel:${g('phone')}` : '';
    case 'whatsapp': {
      const n = digits(g('phone'));
      if (!n) return '';
      return `https://wa.me/${n}${g('whatsappMessage') ? `?text=${encodeURIComponent(g('whatsappMessage'))}` : ''}`;
    }
    case 'event': {
      if (!g('eventTitle')) return '';
      let s = `BEGIN:VEVENT\nSUMMARY:${escText(g('eventTitle'))}\n`;
      const start = toIcs(f.eventStart ?? '');
      const end = toIcs(f.eventEnd ?? '');
      if (start) s += `DTSTART:${start}\n`;
      if (end) s += `DTEND:${end}\n`;
      if (g('eventLocation')) s += `LOCATION:${escText(g('eventLocation'))}\n`;
      if (g('eventDescription')) s += `DESCRIPTION:${escText(g('eventDescription'))}\n`;
      return `${s}END:VEVENT`;
    }
  }
}

const EMPTY = { png: '', svg: '', error: '' };
const HEX_ERROR = 'Use a six-digit hex colour like #1A2B3C.';

export default function QRCodeGenerator() {
  const [kind, setKind] = useState<Kind>('url');
  const [f, setF] = useState<Fields>(defaultFields);
  const [size, setSize] = useState('300');
  const [level, setLevel] = useState<Level>('M');
  const [dark, setDark] = useState('#000000');
  const [light, setLight] = useState('#ffffff');
  const [result, setResult] = useState(EMPTY);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const payload = useMemo(() => payloadFor(kind, f), [kind, f]);
  const px = Math.min(1000, Math.max(100, Number(size) || 300));
  const wanted = useMemo(() => ({ payload, px, level, dark, light }), [payload, px, level, dark, light]);
  const opts = useDebounce(wanted, 150);

  useEffect(() => {
    if (!opts.payload || !isHex(opts.dark) || !isHex(opts.light)) {
      setResult(EMPTY);
      return;
    }
    let live = true;
    const color = { dark: opts.dark, light: opts.light };
    Promise.all([
      QRCode.toDataURL(opts.payload, { width: opts.px, color, errorCorrectionLevel: opts.level, type: 'image/png', margin: 1 }),
      QRCode.toString(opts.payload, { type: 'svg', width: opts.px, color, errorCorrectionLevel: opts.level, margin: 1 }),
    ])
      .then(([png, svg]) => live && setResult({ png, svg, error: '' }))
      .catch((e: unknown) => live && setResult({ ...EMPTY, error: getErrorMessage(e, 'Could not generate this QR code.') }));
    return () => {
      live = false;
    };
  }, [opts]);

  const clear = () => {
    setF(defaultFields());
    setSize('300');
    setLevel('M');
    setDark('#000000');
    setLight('#ffffff');
    setResult(EMPTY);
  };

  const text = (key: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label} htmlFor={`qr-${key}`} key={key}>
      <Input id={`qr-${key}`} mono={false} value={f[key] ?? ''} onChange={set(key)} {...props} />
    </Field>
  );
  const area = (key: string, label: string) => (
    <Field label={label} htmlFor={`qr-${key}`} key={key}>
      <TextArea id={`qr-${key}`} mono={false} rows={3} value={f[key] ?? ''} onChange={set(key)} />
    </Field>
  );

  const fields: Record<Kind, React.ReactNode> = {
    url: text('text', 'URL', { type: 'url', placeholder: 'https://example.com' }),
    text: (
      <Field label="Text" htmlFor="qr-text">
        <TextArea id="qr-text" mono={false} rows={4} value={f.text ?? ''} onChange={set('text')} />
      </Field>
    ),
    contact: (
      <>
        <div className="grid grid-cols-2 gap-3">
          {text('firstName', 'First name')}
          {text('lastName', 'Last name')}
        </div>
        {text('phone', 'Phone', { type: 'tel', inputMode: 'tel' })}
        {text('email', 'Email', { type: 'email', inputMode: 'email' })}
      </>
    ),
    email: (
      <>
        {text('email', 'To', { type: 'email', inputMode: 'email' })}
        {text('emailSubject', 'Subject')}
        {area('emailBody', 'Body')}
      </>
    ),
    sms: (
      <>
        {text('phone', 'Phone number', { type: 'tel', inputMode: 'tel' })}
        {area('smsBody', 'Message')}
      </>
    ),
    wifi: (
      <>
        {text('wifiSsid', 'Network name (SSID)')}
        {f.wifiEncryption !== 'nopass' && text('wifiPassword', 'Password', { type: 'password', autoComplete: 'off' })}
        <Field label="Security" htmlFor="qr-wifiEncryption">
          <Select id="qr-wifiEncryption" value={f.wifiEncryption ?? 'WPA'} onChange={set('wifiEncryption')}>
            <option value="WPA">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None (open)</option>
          </Select>
        </Field>
        <Checkbox label="Hidden network" checked={f.wifiHidden === '1'} onChange={(e) => setF((p) => ({ ...p, wifiHidden: e.target.checked ? '1' : '0' }))} />
      </>
    ),
    phone: text('phone', 'Phone number', { type: 'tel', inputMode: 'tel' }),
    whatsapp: (
      <>
        {text('phone', 'Phone number', { type: 'tel', inputMode: 'tel', placeholder: '+44 20 7946 0000' })}
        {area('whatsappMessage', 'Message')}
      </>
    ),
    event: (
      <>
        {text('eventTitle', 'Title')}
        <div className="grid grid-cols-2 gap-3">
          {text('eventStart', 'Starts', { type: 'datetime-local' })}
          {text('eventEnd', 'Ends', { type: 'datetime-local' })}
        </div>
        {text('eventLocation', 'Location')}
        {area('eventDescription', 'Description')}
      </>
    ),
  };

  const colour = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <Field label={label} htmlFor={id} error={isHex(value) ? undefined : HEX_ERROR}>
      <ColorInput id={id} label={label} value={value} onChange={onChange} />
    </Field>
  );

  return (
    <ToolPage id="qr_code">
      <Panel
        title="Generate"
        actions={
          <>
            <Select aria-label="QR code type" className="w-auto" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </Select>
            <ClearButton onClick={clear} />
          </>
        }
      >
        <TwoPane>
          <div className="space-y-3">
            {fields[kind]}
            <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
              <Field label="Size (px)" htmlFor="qr-size" hint="100 to 1000">
                <Input id="qr-size" type="number" min={100} max={1000} inputMode="numeric" value={size} onChange={(e) => setSize(e.target.value)} onBlur={() => setSize(String(px))} />
              </Field>
              <Field label="Error correction" htmlFor="qr-level">
                <Select id="qr-level" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </Select>
              </Field>
              {colour('qr-dark', 'Foreground', dark, setDark)}
              {colour('qr-light', 'Background', light, setLight)}
            </div>
          </div>

          <div>
            <PreviewBox height="aspect-square">
              {result.png ? (
                <img src={result.png} alt="QR code preview" width={px} height={px} className="h-auto max-h-full w-full max-w-[320px] rounded" />
              ) : (
                <EmptyState>The QR code appears here as you type</EmptyState>
              )}
            </PreviewBox>
            <Toolbar className="mt-3">
              <Button variant="primary" disabled={!result.png} icon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={() => downloadUrl(result.png, `qr-code-${kind}.png`)}>
                Download PNG
              </Button>
              <Button disabled={!result.svg} icon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={() => downloadBlob(result.svg, `qr-code-${kind}.svg`, 'image/svg+xml')}>
                Download SVG
              </Button>
            </Toolbar>
          </div>
        </TwoPane>

        {result.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}

        <Output label="Encoded payload" value={payload} rows={3} placeholder="What the code will contain" className="mt-4" />
      </Panel>
    </ToolPage>
  );
}
