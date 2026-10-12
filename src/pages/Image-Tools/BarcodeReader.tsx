import { useEffect, useRef, useState } from 'react';
import { BarcodeFormat, BrowserMultiFormatReader } from '@zxing/browser';
import ToolPage from '../../components/ToolPage';
import { Callout, EmptyState, FileDrop, KeyValueList, Output, Panel, PreviewBox, TwoPane } from '../../ui';

interface Decoded {
  format: string;
  value: string;
}

export default function BarcodeReader() {
  const reader = useRef<BrowserMultiFormatReader | null>(null);
  const [image, setImage] = useState<{ url: string; name: string } | null>(null);
  const [state, setState] = useState<{ result: Decoded | null; error: string; busy: boolean }>({ result: null, error: '', busy: false });

  useEffect(() => {
    if (!image) return;
    return () => URL.revokeObjectURL(image.url);
  }, [image]);

  // Decode as soon as an image is chosen; the result replaces the previous one.
  useEffect(() => {
    if (!image) {
      setState({ result: null, error: '', busy: false });
      return;
    }
    let live = true;
    setState((s) => ({ ...s, busy: true, error: '' }));
    reader.current ??= new BrowserMultiFormatReader();
    reader.current
      .decodeFromImageUrl(image.url)
      .then((r) => live && setState({ result: { format: BarcodeFormat[r.getBarcodeFormat()].replace(/_/g, ' '), value: r.getText() }, error: '', busy: false }))
      .catch(() => live && setState({ result: null, error: 'No barcode or QR code was found in this image. Try a sharper, larger or better-lit picture.', busy: false }));
    return () => {
      live = false;
    };
  }, [image]);

  return (
    <ToolPage id="barcode_reader">
      <Panel title="Read">
        <TwoPane>
          <div>
            <FileDrop
              accept="image/*"
              label="Choose an image"
              maxSizeMB={10}
              onFile={(file) => setImage({ url: URL.createObjectURL(file), name: file.name })}
              onClear={() => setImage(null)}
            />
            <PreviewBox height="h-64" className="mt-3">
              {image ? (
                <img src={image.url} alt={`Uploaded image ${image.name}`} className="max-h-full max-w-full object-contain" />
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
