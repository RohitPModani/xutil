import { useEffect, useMemo, useRef, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import useDebounce from '../../hooks/useDebounce';
import { Callout, DownloadButton, EmptyState, Field, FileDrop, formatSize, Input, Panel, PreviewBox, RangeInput, Select, Stat, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { fileBaseName } from '../../utils/text';

type Format = 'image/jpeg' | 'image/png' | 'image/webp';
const FORMATS: { value: Format; label: string; ext: string }[] = [
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];
const MAX_SIDE = 8192;

interface Result {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

const pct = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 });

const formatFor = (file: File): Format => (FORMATS.some((f) => f.value === file.type) ? (file.type as Format) : 'image/jpeg');

/** Decodes and scales once; the result is cached per file and side so quality changes only re-encode. */
async function scaleToCanvas(file: File, side: number) {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('That file could not be read as an image.');
  }
  const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

function encode(canvas: HTMLCanvasElement, format: Format, quality: number) {
  let out = canvas;
  if (format === 'image/jpeg') {
    // JPEG has no alpha: transparent areas become white, not black.
    out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser.');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
  }
  return new Promise<Blob>((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the image.'))), format, quality));
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState('');
  const [format, setFormat] = useState<Format>('image/jpeg');
  const [quality, setQuality] = useState('0.8');
  const [maxSide, setMaxSide] = useState('1920');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scaled = useRef<{ file: File; side: number; canvas: HTMLCanvasElement } | null>(null);

  // One preview URL per file, revoked when it changes.
  useEffect(() => {
    if (!file) {
      setOriginal('');
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginal(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => () => URL.revokeObjectURL(result?.url ?? ''), [result]);

  const q = Math.min(1, Math.max(0.1, Number(quality) || 0.8));
  const side = Math.min(MAX_SIDE, Math.max(16, Number(maxSide) || 1920));
  const wanted = useMemo(() => ({ file, q, side, format }), [file, q, side, format]);
  const opts = useDebounce(wanted, 200);

  const choose = (f: File | null) => {
    setFile(f);
    setResult(null);
    setError('');
    if (f) setFormat(formatFor(f));
  };

  useEffect(() => {
    if (!opts.file) return;
    const { file, q, side, format } = opts;
    let live = true;
    setBusy(true);
    (async () => {
      if (scaled.current?.file !== file || scaled.current.side !== side) {
        scaled.current = { file, side, canvas: await scaleToCanvas(file, side) };
      }
      const { canvas } = scaled.current;
      const blob = await encode(canvas, format, q);
      if (!live) return;
      setResult({ blob, url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height });
      setError('');
    })()
      .catch((e: unknown) => {
        if (!live) return;
        setResult(null);
        setError(getErrorMessage(e, 'Could not compress the image.'));
      })
      .finally(() => live && setBusy(false));
    return () => {
      live = false;
    };
  }, [opts]);

  const saved = file && result ? 1 - result.blob.size / file.size : 0;
  const ext = FORMATS.find((f) => f.value === format)?.ext ?? 'jpg';
  const outName = `${file ? fileBaseName(file.name) : 'image'}-compressed.${ext}`;
  const lossy = format !== 'image/png';

  return (
    <ToolPage id="image_compressor">
      <Panel title="Compress">
        <TwoPane>
          <div className="space-y-3">
            <FileDrop accept="image/*" label="Choose an image" maxSizeMB={10} file={file} onFile={choose} onClear={() => choose(null)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Output format" htmlFor="ic-format" hint={format === 'image/jpeg' ? 'No transparency; transparent areas become white.' : 'Keeps transparency.'}>
                <Select id="ic-format" value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                  {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Longest side (px)" htmlFor="ic-side" hint={`Larger images are scaled down to fit, up to ${MAX_SIDE.toLocaleString()}.`}>
                <Input id="ic-side" type="number" min={16} max={MAX_SIDE} step={1} inputMode="numeric" value={maxSide} onChange={(e) => setMaxSide(e.target.value)} onBlur={() => setMaxSide(String(side))} />
              </Field>
              <Field className="sm:col-span-2" label={`Quality · ${Math.round(q * 100)}%`} htmlFor="ic-quality" hint={lossy ? 'Lower is smaller.' : 'PNG is lossless, so quality has no effect.'}>
                <RangeInput id="ic-quality" label="Quality" min={0.1} max={1} step={0.05} value={q} onChange={(v) => setQuality(String(v))} />
              </Field>
            </div>
            <PreviewBox>
              {original ? (
                <img src={original} alt={`Original image ${file?.name ?? ''}`} className="max-h-full max-w-full object-contain" />
              ) : (
                <EmptyState>The original appears here</EmptyState>
              )}
            </PreviewBox>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Original" value={file ? formatSize(file.size) : '—'} />
              <Stat label="Compressed" value={result ? formatSize(result.blob.size) : '—'} />
              <Stat label="Saved" value={result ? (saved < 0 ? 'None' : pct.format(saved)) : '—'} />
            </div>
            <PreviewBox>
              {result ? (
                <img src={result.url} alt={`Compressed image, ${result.width} by ${result.height} pixels`} width={result.width} height={result.height} className="h-auto max-h-full w-auto max-w-full object-contain" />
              ) : (
                <EmptyState>{busy ? 'Compressing…' : 'The compressed image appears here'}</EmptyState>
              )}
            </PreviewBox>
            <DownloadButton content={result?.blob ?? ''} fileName={outName} mime={format} variant="primary" size="md" loading={busy} label={result ? `Download · ${result.width}×${result.height}` : 'Download'} />
          </div>
        </TwoPane>
        {result && saved < 0 && (
          <Callout tone="info" className="mt-4">
            The result is {formatSize(result.blob.size - (file?.size ?? 0))} larger than the original. The original is already well compressed; keep it, or try a lower quality or a smaller longest side.
          </Callout>
        )}
        {error && (
          <Callout tone="error" className="mt-4">
            {error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
