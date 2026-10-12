import { useEffect, useRef, useState } from 'react';
import { BarcodeFormat, BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import ToolPage from '../../components/ToolPage';
import { Callout, EmptyState, FileDrop, KeyValueList, Output, Panel, PreviewBox, TwoPane } from '../../ui';

interface Decoded {
  format: string;
  value: string;
}

// Enough for any phone photo of a code; keeps decoding quick and under Safari's canvas limit.
const MAX_SIDE = 1600;
const NOT_FOUND = 'No barcode or QR code was found in this image. Try a sharper, larger or better-lit picture.';

export default function BarcodeReader() {
  const reader = useRef<BrowserMultiFormatReader | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [state, setState] = useState<{ result: Decoded | null; error: string; busy: boolean }>({ result: null, error: '', busy: false });

  // Decode as soon as an image is chosen; the previous result is cleared first.
  useEffect(() => {
    if (!file) {
      setUrl('');
      setState({ result: null, error: '', busy: false });
      return;
    }
    let live = true;
    const src = URL.createObjectURL(file);
    setUrl(src);
    setState({ result: null, error: '', busy: true });
    const img = new Image();
    img.onload = () => {
      if (!live) return;
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setState({ result: null, error: 'Canvas is not supported in this browser.', busy: false });
        return;
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      reader.current ??= new BrowserMultiFormatReader(new Map([[DecodeHintType.TRY_HARDER, true]]));
      try {
        const r = reader.current.decodeFromCanvas(canvas);
        setState({ result: { format: BarcodeFormat[r.getBarcodeFormat()].replace(/_/g, ' '), value: r.getText() }, error: '', busy: false });
      } catch {
        setState({ result: null, error: NOT_FOUND, busy: false });
      }
    };
    img.onerror = () => live && setState({ result: null, error: 'That file could not be read as an image.', busy: false });
    img.src = src;
    return () => {
      live = false;
      URL.revokeObjectURL(src);
    };
  }, [file]);

  return (
    <ToolPage id="barcode_reader">
      <Panel title="Read">
        <TwoPane>
          <div>
            <FileDrop accept="image/*" label="Choose an image" maxSizeMB={10} file={file} onFile={setFile} onClear={() => setFile(null)} />
            <PreviewBox height="h-64" className="mt-3">
              {url ? (
                <img src={url} alt={`Uploaded image ${file?.name ?? ''}`} className="max-h-full max-w-full object-contain" />
              ) : (
                <EmptyState>Drop a photo or screenshot of a barcode or QR code</EmptyState>
              )}
            </PreviewBox>
          </div>
          <Output label={state.busy ? 'Reading…' : 'Decoded value'} value={state.result?.value ?? ''} rows={6} placeholder="The decoded value appears here">
            {state.result ? (
              <KeyValueList
                items={[
                  { label: 'Format', value: state.result.format, mono: false },
                  { label: 'Value', value: state.result.value },
                ]}
              />
            ) : undefined}
          </Output>
        </TwoPane>
        {state.error && (
          <Callout tone="error" className="mt-4">
            {state.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
