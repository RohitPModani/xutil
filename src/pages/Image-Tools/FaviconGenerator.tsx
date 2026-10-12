import { useEffect, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, DownloadButton, EmptyState, FileDrop, Panel, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

const SIZES = [16, 32, 48, 180, 192];
const ICO_SIZES = [16, 32, 48];

interface Icon {
  size: number;
  blob: Blob;
  url: string;
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the image.'))), 'image/png'));

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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setIcons([]);
      setIco(null);
      setError('');
      return;
    }
    let live = true;
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const made = await Promise.all(
          SIZES.map(async (size) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas is not supported in this browser.');
            ctx.drawImage(img, 0, 0, size, size);
            const blob = await toBlob(canvas);
            return { size, blob, url: URL.createObjectURL(blob) };
          })
        );
        const frames = await Promise.all(made.filter((m) => ICO_SIZES.includes(m.size)).map(async (m) => ({ size: m.size, png: await m.blob.arrayBuffer() })));
        if (!live) return;
        setIcons(made);
        setIco(buildIco(frames));
        setError('');
      } catch (e) {
        if (live) setError(getErrorMessage(e, 'Could not generate the icons.'));
      }
    };
    img.onerror = () => live && setError('That file could not be read as an image.');
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
          <FileDrop accept="image/*" label="Choose an image" onFile={setFile} onClear={() => setFile(null)} />
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
                    <span className="flex-1 font-mono text-[13px] text-ink">
                      {i.size}×{i.size}
                      <span className="ml-2 text-muted">{i.size === 180 ? 'apple-touch-icon' : i.size === 192 ? 'android-chrome' : 'favicon'}</span>
                    </span>
                    <DownloadButton content={i.blob} fileName={`favicon-${i.size}x${i.size}.png`} compact />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>{file ? 'Generating…' : 'Icons at every size appear here'}</EmptyState>
            )}
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
