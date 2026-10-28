import { useEffect, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, DownloadButton, EmptyState, Field, FileDrop, formatSize, Output, Panel, PreviewBox, Segmented, Stat, TextArea, TwoPane } from '../../ui';
import { fileBaseName } from '../../utils/text';

type Mode = 'encode' | 'decode';
const MAX_MB = 5;
// 5 MB of bytes is ~6.7 M Base64 characters; a little headroom for the data: prefix and whitespace.
const MAX_CHARS = 7_000_000;

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
};

/** The image type from the first bytes; undefined when they match nothing known. */
function sniff(b: Uint8Array): string | undefined {
  const at = (i: number, s: string) => [...s].every((c, j) => b[i + j] === c.charCodeAt(0));
  if (b[0] === 0x89 && at(1, 'PNG')) return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (at(0, 'GIF8')) return 'image/gif';
  if (at(0, 'RIFF') && at(8, 'WEBP')) return 'image/webp';
  if (at(0, 'BM')) return 'image/bmp';
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return 'image/x-icon';
  if (at(4, 'ftypavif')) return 'image/avif';
  const head = new TextDecoder().decode(b.subarray(0, 512)).trimStart();
  if (head.startsWith('<') && /<svg[\s>]/i.test(head)) return 'image/svg+xml';
  return undefined;
}

function decodeImage(text: string): { blob: Blob; mime: string; dataUrl: string; size: number } {
  let raw = text.trim();
  let declared: string | undefined;
  if (raw.startsWith('data:')) {
    const m = /^data:([^;,]*)((?:;[^,]*)*),([\s\S]*)$/.exec(raw);
    if (!m) throw new Error('That data URL has no comma separating the header from the data.');
    if (!/;base64/i.test(m[2])) throw new Error('Only Base64 data URLs are supported; this one is percent-encoded text.');
    declared = m[1] || undefined;
    raw = m[3];
  }
  const b64 = raw.replace(/\s+/g, '');
  if (!b64) throw new Error('Paste a data URL or Base64 text.');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64) || b64.length % 4 === 1) throw new Error('That is not valid Base64: only A to Z, a to z, 0 to 9, + and / are allowed, with up to two = at the end.');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const mime = sniff(bytes) ?? (declared?.startsWith('image/') ? declared : undefined);
  if (!mime) throw new Error('The data decodes, but not to a known image format (PNG, JPEG, GIF, WebP, SVG, BMP, ICO or AVIF).');
  return { blob: new Blob([bytes], { type: mime }), mime, dataUrl: `data:${mime};base64,${b64}`, size: bytes.length };
}

const pct = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

export default function Base64Image() {
  const [mode, setMode] = useState<Mode>('encode');
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState('');
  const [readError, setReadError] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (!file) {
      setDataUrl('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDataUrl(String(reader.result));
    reader.onerror = () => setReadError('That file could not be read.');
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const baseName = file ? fileBaseName(file.name) : 'image';

  const decoded = useMemo(() => {
    if (!text.trim()) return null;
    try {
      return { ...decodeImage(text), error: '' };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Could not decode that.', blob: null, mime: '', dataUrl: '', size: 0 };
    }
  }, [text]);

  return (
    <ToolPage id="base64_image">
      <Panel
        title={mode === 'encode' ? 'Image to Base64' : 'Base64 to image'}
        actions={
          <Segmented
            label="Direction"
            size="sm"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'encode', label: 'Encode' },
              { value: 'decode', label: 'Decode' },
            ]}
          />
        }
      >
        {mode === 'encode' ? (
          <TwoPane>
            <div className="space-y-3">
              <FileDrop
                accept="image/*,.svg"
                label="Choose an image"
                maxSizeMB={MAX_MB}
                file={file}
                onFile={(f) => {
                  setReadError('');
                  setFile(f);
                }}
                onClear={() => setFile(null)}
              />
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Image" value={file ? formatSize(file.size) : '—'} />
                <Stat label="Base64" value={base64 ? formatSize(base64.length) : '—'} />
                <Stat label="Larger by" value={file && base64 ? pct.format(base64.length / file.size - 1) : '—'} />
              </div>
              <PreviewBox>
                {dataUrl ? <img src={dataUrl} alt={`Preview of ${file?.name ?? 'the image'}`} className="max-h-full max-w-full object-contain" /> : <EmptyState>The image appears here</EmptyState>}
              </PreviewBox>
              {readError && <Callout tone="error">{readError}</Callout>}
            </div>
            <div className="space-y-3">
              <Output label="Data URL" value={dataUrl} rows={4} fileName={`${baseName}.dataurl.txt`} placeholder="data:image/png;base64,…" />
              <Output label="Base64 only" value={base64} rows={3} fileName={`${baseName}.base64.txt`} />
              <Output label="HTML" value={dataUrl ? `<img src="${dataUrl}" alt="">` : ''} rows={2} placeholder='<img src="data:…" alt="">' />
              <Output label="CSS" value={dataUrl ? `background-image: url("${dataUrl}");` : ''} rows={2} placeholder='background-image: url("data:…");' />
            </div>
          </TwoPane>
        ) : (
          <TwoPane>
            <Field label="Data URL or Base64" htmlFor="b64img-input" hint={`Up to ${MAX_MB} MB of image data. Whitespace and line breaks are ignored.`} error={decoded?.error || undefined}>
              <TextArea id="b64img-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="data:image/png;base64,iVBORw0KGgo…" rows={8} maxLength={MAX_CHARS} />
            </Field>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Type" value={decoded?.mime || '—'} />
                <Stat label="Size" value={decoded?.blob ? formatSize(decoded.size) : '—'} />
              </div>
              <PreviewBox>
                {decoded?.dataUrl ? <img src={decoded.dataUrl} alt="Decoded image" className="max-h-full max-w-full object-contain" /> : <EmptyState>The decoded image appears here</EmptyState>}
              </PreviewBox>
              <DownloadButton content={decoded?.blob ?? ''} fileName={`image.${EXT[decoded?.mime ?? ''] ?? 'bin'}`} mime={decoded?.mime || undefined} variant="primary" size="md" />
            </div>
          </TwoPane>
        )}
      </Panel>
    </ToolPage>
  );
}
