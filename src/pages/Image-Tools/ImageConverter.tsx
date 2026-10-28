import { useEffect, useMemo, useRef, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import useDebounce from '../../hooks/useDebounce';
import { Callout, Checkbox, ColorInput, DownloadButton, EmptyState, Field, FileDrop, formatSize, Input, Panel, PreviewBox, RangeInput, Segmented, Select, Stat, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { isHex } from '../../utils/color';
import { fileBaseName } from '../../utils/text';

type Format = 'image/png' | 'image/jpeg' | 'image/webp';
const FORMATS: { value: Format; label: string; ext: string }[] = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
];
const MAX_SIDE = 8192;

type Preset = 'custom' | 'original' | '50' | '25' | 'w1920' | 'w1280' | 'w800' | 's512' | 's256';
const PRESETS: { value: Preset; label: string }[] = [
  { value: 'custom', label: 'Custom' },
  { value: 'original', label: 'Original size' },
  { value: '50', label: '50%' },
  { value: '25', label: '25%' },
  { value: 'w1920', label: '1920 wide' },
  { value: 'w1280', label: '1280 wide' },
  { value: 'w800', label: '800 wide' },
  { value: 's512', label: 'Fit in 512' },
  { value: 's256', label: 'Fit in 256' },
];

function presetSize(p: Preset, w: number, h: number): [number, number] | null {
  const byWidth = (tw: number): [number, number] => [tw, Math.max(1, Math.round((tw * h) / w))];
  const fit = (side: number) => {
    const s = side / Math.max(w, h);
    return [Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))] as [number, number];
  };
  if (p === 'original') return [w, h];
  if (p === '50' || p === '25') return fit(Math.max(w, h) * (Number(p) / 100));
  if (p.startsWith('w')) return byWidth(Number(p.slice(1)));
  if (p.startsWith('s')) return fit(Number(p.slice(1)));
  return null;
}

const clamp = (v: string, fallback: number) => Math.min(MAX_SIDE, Math.max(1, Math.round(Number(v) || fallback)));

/** createImageBitmap rejects SVG blobs in most browsers; an <img> decodes them. */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return await createImageBitmap(img);
    } catch {
      throw new Error('That file could not be read as an image.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function render(bitmap: ImageBitmap, width: number, height: number, format: Format, quality: number, background: string) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  if (format === 'image/jpeg') {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error(`This browser cannot encode ${format.slice(6).toUpperCase()}.`))), format, quality));
}

interface Source {
  file: File;
  bitmap: ImageBitmap;
}
interface Result {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [format, setFormat] = useState<Format>('image/png');
  const [quality, setQuality] = useState(0.9);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lock, setLock] = useState(true);
  const [preset, setPreset] = useState<Preset>('original');
  const [background, setBackground] = useState('#FFFFFF');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [webpOk] = useState(() => typeof document !== 'undefined' && document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'));
  const seq = useRef(0);

  // Decode once per file; the bitmap is reused for every re-encode.
  useEffect(() => {
    if (!file) {
      setSource(null);
      return;
    }
    const mine = ++seq.current;
    setBusy(true);
    decode(file)
      .then((bitmap) => {
        if (mine !== seq.current) return bitmap.close();
        setSource({ file, bitmap });
        setWidth(String(bitmap.width));
        setHeight(String(bitmap.height));
        setPreset('original');
        setError('');
      })
      .catch((e: unknown) => {
        if (mine !== seq.current) return;
        setSource(null);
        setError(getErrorMessage(e, 'Could not read the image.'));
        setBusy(false);
      });
  }, [file]);
  useEffect(() => () => source?.bitmap.close(), [source]);
  useEffect(() => () => URL.revokeObjectURL(result?.url ?? ''), [result]);

  const nw = source?.bitmap.width ?? 0;
  const nh = source?.bitmap.height ?? 0;
  const w = clamp(width, nw || 1);
  const h = clamp(height, nh || 1);
  const bg = isHex(background) ? background : '#FFFFFF';
  const wanted = useMemo(() => ({ source, format, quality, w, h, bg }), [source, format, quality, w, h, bg]);
  const opts = useDebounce(wanted, 200);

  useEffect(() => {
    if (!opts.source) return;
    const { source, format, quality, w, h, bg } = opts;
    let live = true;
    setBusy(true);
    render(source.bitmap, w, h, format, quality, bg)
      .then((blob) => {
        if (!live) return;
        setResult({ blob, url: URL.createObjectURL(blob), width: w, height: h });
        setError('');
      })
      .catch((e: unknown) => {
        if (!live) return;
        setResult(null);
        setError(getErrorMessage(e, 'Could not convert the image.'));
      })
      .finally(() => live && setBusy(false));
    return () => {
      live = false;
    };
  }, [opts]);

  const choose = (f: File | null) => {
    setFile(f);
    setResult(null);
    setError('');
  };
  const applyPreset = (p: Preset) => {
    setPreset(p);
    const size = presetSize(p, nw, nh);
    if (size) {
      setWidth(String(Math.min(MAX_SIDE, size[0])));
      setHeight(String(Math.min(MAX_SIDE, size[1])));
    }
  };
  const editWidth = (v: string) => {
    setWidth(v);
    setPreset('custom');
    if (lock && nw && Number(v) > 0) setHeight(String(Math.max(1, Math.round((Number(v) * nh) / nw))));
  };
  const editHeight = (v: string) => {
    setHeight(v);
    setPreset('custom');
    if (lock && nh && Number(v) > 0) setWidth(String(Math.max(1, Math.round((Number(v) * nw) / nh))));
  };

  const fmt = FORMATS.find((f) => f.value === format) ?? FORMATS[0];
  const lossy = format !== 'image/png';
  const outName = `${file ? fileBaseName(file.name) : 'image'}.${fmt.ext}`;
  const sourceLabel = file ? (file.type.replace('image/', '').replace('svg+xml', 'svg') || 'image').toUpperCase() : '';

  return (
    <ToolPage id="image_converter">
      <Panel title="Convert">
        <TwoPane>
          <div className="space-y-3">
            <FileDrop accept="image/*" label="Choose an image" hint="PNG, JPEG, WebP, GIF, BMP, AVIF or SVG" maxSizeMB={25} file={file} onFile={choose} onClear={() => choose(null)} />
            <Field label="Output format" hint={format === 'image/jpeg' ? 'No transparency; transparent areas take the background colour.' : 'Keeps transparency.'}>
              <Segmented label="Output format" value={format} onChange={setFormat} options={FORMATS.map((f) => ({ value: f.value, label: f.label }))} />
            </Field>
            {lossy && (
              <Field label={`Quality · ${Math.round(quality * 100)}%`} htmlFor="iv-quality" hint="Lower is smaller.">
                <RangeInput id="iv-quality" label="Quality" min={0.1} max={1} step={0.05} value={quality} onChange={setQuality} />
              </Field>
            )}
            {format === 'image/jpeg' && (
              <Field label="Background" htmlFor="iv-bg" hint="Fills transparent areas.">
                <ColorInput id="iv-bg" label="Background" value={background} onChange={setBackground} />
              </Field>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Resize" htmlFor="iv-preset">
                <Select id="iv-preset" value={preset} onChange={(e) => applyPreset(e.target.value as Preset)} disabled={!source}>
                  {PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Width (px)" htmlFor="iv-w">
                <Input id="iv-w" type="number" min={1} max={MAX_SIDE} step={1} inputMode="numeric" value={width} onChange={(e) => editWidth(e.target.value)} onBlur={() => setWidth(String(w))} disabled={!source} />
              </Field>
              <Field label="Height (px)" htmlFor="iv-h">
                <Input id="iv-h" type="number" min={1} max={MAX_SIDE} step={1} inputMode="numeric" value={height} onChange={(e) => editHeight(e.target.value)} onBlur={() => setHeight(String(h))} disabled={!source} />
              </Field>
            </div>
            <Checkbox label="Lock aspect ratio" checked={lock} onChange={(e) => setLock(e.target.checked)} />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Source" value={source ? `${nw}×${nh} ${sourceLabel}` : '—'} />
              <Stat label="Source size" value={file ? formatSize(file.size) : '—'} />
              <Stat label="Result" value={result ? `${result.width}×${result.height} ${fmt.label}` : '—'} />
              <Stat label="Result size" value={result ? formatSize(result.blob.size) : '—'} />
            </div>
            <PreviewBox style={{ backgroundImage: 'repeating-conic-gradient(rgb(var(--line) / 0.5) 0 25%, transparent 0 50%)', backgroundSize: '16px 16px' }}>
              {result ? (
                <img src={result.url} alt={`Converted image, ${result.width} by ${result.height} pixels`} width={result.width} height={result.height} className="h-auto max-h-full w-auto max-w-full object-contain" />
              ) : (
                <EmptyState>{busy ? 'Converting…' : 'The converted image appears here'}</EmptyState>
              )}
            </PreviewBox>
            <DownloadButton content={result?.blob ?? ''} fileName={outName} mime={format} variant="primary" size="md" loading={busy} label={result ? `Download ${outName}` : 'Download'} />
          </div>
        </TwoPane>
        {format === 'image/webp' && !webpOk && (
          <Callout tone="error" className="mt-4">
            This browser cannot encode WebP. Choose PNG or JPEG, or use a Chromium-based browser or Firefox.
          </Callout>
        )}
        {file?.type === 'image/gif' && (
          <Callout tone="info" className="mt-4">
            Only the first frame of a GIF is converted; animation is not kept.
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
