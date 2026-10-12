import { useEffect, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import useDebounce from '../../hooks/useDebounce';
import { Callout, DownloadButton, EmptyState, Field, FileDrop, formatSize, Input, Panel, PreviewBox, RangeInput, Stat, TwoPane } from '../../ui';
import { fileBaseName } from '../../utils/text';

interface Result {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

const pct = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 });

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState('0.8');
  const [maxSide, setMaxSide] = useState('1920');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const original = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  useEffect(() => () => URL.revokeObjectURL(original), [original]);
  useEffect(() => () => URL.revokeObjectURL(result?.url ?? ''), [result]);

  const q = Math.min(1, Math.max(0.1, Number(quality) || 0.8));
  const side = Math.max(16, Number(maxSide) || 1920);
  const wanted = useMemo(() => ({ file, q, side }), [file, q, side]);
  const opts = useDebounce(wanted, 200);

  // Recompress whenever the file or the settings change; the previous result
  // stays on screen until the new one is ready.
  useEffect(() => {
    if (!opts.file) {
      setResult(null);
      setError('');
      return;
    }
    let live = true;
    setBusy(true);
    const src = URL.createObjectURL(opts.file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, opts.side / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas is not supported in this browser.');
        setBusy(false);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!live) return;
          if (!blob) setError('Could not encode the image.');
          else {
            setResult({ blob, url: URL.createObjectURL(blob), width, height });
            setError('');
          }
          setBusy(false);
        },
        'image/jpeg',
        opts.q
      );
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
  }, [opts]);

  const saved = file && result ? 1 - result.blob.size / file.size : 0;
  const outName = file ? `${fileBaseName(file.name)}-compressed.jpg` : 'compressed.jpg';

  return (
    <ToolPage id="image_compressor">
      <Panel title="Compress">
        <TwoPane>
          <div className="space-y-3">
            <FileDrop accept="image/*" label="Choose an image" maxSizeMB={10} onFile={setFile} onClear={() => setFile(null)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Quality · ${Math.round(q * 100)}%`} htmlFor="ic-quality" hint="JPEG output. Lower is smaller.">
                <RangeInput id="ic-quality" label="Quality" min={0.1} max={1} step={0.05} value={q} onChange={(v) => setQuality(String(v))} />
              </Field>
              <Field label="Longest side (px)" htmlFor="ic-side" hint="Larger images are scaled down to fit.">
                <Input id="ic-side" type="number" min={16} step={1} inputMode="numeric" value={maxSide} onChange={(e) => setMaxSide(e.target.value)} onBlur={() => setMaxSide(String(side))} />
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
              <Stat label="Saved" value={result ? pct.format(saved) : '—'} />
            </div>
            <PreviewBox>
              {result ? (
                <img src={result.url} alt={`Compressed image, ${result.width} by ${result.height} pixels`} width={result.width} height={result.height} className="h-auto max-h-full w-auto max-w-full object-contain" />
              ) : (
                <EmptyState>{busy ? 'Compressing…' : 'The compressed image appears here'}</EmptyState>
              )}
            </PreviewBox>
            <DownloadButton content={result?.blob ?? ''} fileName={outName} mime="image/jpeg" variant="primary" size="md" loading={busy} label={result ? `Download · ${result.width}×${result.height}` : 'Download'} />
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
