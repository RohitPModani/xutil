import { useEffect, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, DownloadButton, EmptyState, FileDrop, Output, Panel, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

const SIZES = [16, 32, 48, 180, 192];
const ICO_SIZES = [16, 32, 48];
const NAMES: Record<number, string> = { 180: 'apple-touch-icon.png', 192: 'android-chrome-192x192.png' };
const fileNameFor = (size: number) => NAMES[size] ?? `favicon-${size}x${size}.png`;

const HTML_SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

interface Icon {
  size: number;
  blob: Blob;
  url: string;
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the image.'))), 'image/png'));

const context = (size: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  ctx.imageSmoothingQuality = 'high';
  return { canvas, ctx };
};

/**
 * Centre-crops the image to a square and scales it to `size`, halving in
 * steps so small icons are not aliased by one big jump.
 */
function squareIcon(img: HTMLImageElement, size: number) {
  let src: CanvasImageSource = img;
  let span = Math.min(img.naturalWidth, img.naturalHeight);
  let sx = (img.naturalWidth - span) / 2;
  let sy = (img.naturalHeight - span) / 2;
  while (span / 2 > size) {
    const next = Math.ceil(span / 2);
    const { canvas, ctx } = context(next);
    ctx.drawImage(src, sx, sy, span, span, 0, 0, next, next);
    src = canvas;
    span = next;
    sx = sy = 0;
  }
  const { canvas, ctx } = context(size);
  ctx.drawImage(src, sx, sy, span, span, 0, 0, size, size);
  return canvas;
}

/** ICO container holding PNG-encoded frames (supported by every current browser). */
function buildIco(frames: { size: number; png: ArrayBuffer }[]): Blob {
  const header = new DataView(new ArrayBuffer(6 + 16 * frames.length));
  header.setUint16(2, 1, true);
  header.setUint16(4, frames.length, true);
  let offset = header.byteLength;
  frames.forEach((f, i) => {
    const at = 6 + 16 * i;
    header.setUint8(at, f.size === 256 ? 0 : f.size);
    header.setUint8(at + 1, f.size === 256 ? 0 : f.size);
    header.setUint16(at + 4, 1, true);
    header.setUint16(at + 6, 32, true);
    header.setUint32(at + 8, f.png.byteLength, true);
    header.setUint32(at + 12, offset, true);
    offset += f.png.byteLength;
  });
  return new Blob([header.buffer, ...frames.map((f) => f.png)], { type: 'image/x-icon' });
}

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [ico, setIco] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIcons([]);
    setIco(null);
    setError('');
    if (!file) return;
    let live = true;
    setBusy(true);
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const blobs = await Promise.all(SIZES.map(async (size) => ({ size, blob: await toBlob(squareIcon(img, size)) })));
        const frames = await Promise.all(blobs.filter((m) => ICO_SIZES.includes(m.size)).map(async (m) => ({ size: m.size, png: await m.blob.arrayBuffer() })));
        if (!live) return;
        // URLs are only created once we know this run is still wanted.
        setIcons(blobs.map((b) => ({ ...b, url: URL.createObjectURL(b.blob) })));
        setIco(buildIco(frames));
      } catch (e) {
        if (live) setError(getErrorMessage(e, 'Could not generate the icons.'));
      } finally {
        if (live) setBusy(false);
      }
    };
    img.onerror = () => {
      if (!live) return;
      setError('That file could not be read as an image.');
      setBusy(false);
    };
    img.src = src;
    return () => {
      live = false;
      URL.revokeObjectURL(src);
    };
  }, [file]);

  useEffect(() => () => icons.forEach((i) => URL.revokeObjectURL(i.url)), [icons]);

  return (
    <ToolPage id="favicon">
      <Panel title="Generate">
        <TwoPane>
          <FileDrop accept="image/*" label="Choose an image" file={file} onFile={setFile} onClear={() => setFile(null)} />
          <div className="space-y-3">
            <div className="rounded-md border border-line bg-surface">
              {icons.length ? (
                <ul className="divide-y divide-line">
                  <li className="flex items-center gap-3 px-3 py-2">
                    <span className="w-12 shrink-0 text-xs text-muted">ICO</span>
                    <span className="flex-1 text-[13px] text-ink">favicon.ico · 16, 32 and 48 px</span>
                    {ico && <DownloadButton content={ico} fileName="favicon.ico" compact />}
                  </li>
                  {icons.map((i) => (
                    <li key={i.size} className="flex items-center gap-3 px-3 py-2">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                        <img src={i.url} alt={`${i.size} by ${i.size} pixel icon`} width={Math.min(i.size, 48)} height={Math.min(i.size, 48)} />
                      </span>
                      <span className="min-w-0 flex-1 font-mono text-[13px] text-ink">
                        {i.size}×{i.size}
                        <span className="ml-2 text-muted">{fileNameFor(i.size)}</span>
                      </span>
                      <DownloadButton content={i.blob} fileName={fileNameFor(i.size)} compact />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>{busy ? 'Generating…' : 'Icons at every size appear here'}</EmptyState>
              )}
            </div>
            {icons.length > 0 && <Output label="HTML" value={HTML_SNIPPET} rows={5} wrap={false} fileName="favicon-links.html" mime="text/html" />}
          </div>
        </TwoPane>
        {error && (
          <Callout tone="error" className="mt-4">
            {error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
