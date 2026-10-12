import { useMemo, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Download } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, Checkbox, ClearButton, ColorInput, EmptyState, Field, Input, Panel, PreviewBox, Select, Toolbar, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { downloadBlob } from '../../utils/download';
import { isHex } from '../../utils/color';

const FORMATS = [
  { value: 'CODE128', label: 'Code 128', hint: 'Any ASCII text' },
  { value: 'CODE128A', label: 'Code 128 A', hint: 'Uppercase letters, digits and control characters' },
  { value: 'CODE128B', label: 'Code 128 B', hint: 'Any printable ASCII text' },
  { value: 'CODE128C', label: 'Code 128 C', hint: 'An even number of digits' },
  { value: 'EAN13', label: 'EAN-13', hint: '12 digits; the check digit is added for you' },
  { value: 'EAN8', label: 'EAN-8', hint: '7 digits; the check digit is added for you' },
  { value: 'UPC', label: 'UPC-A', hint: '11 digits; the check digit is added for you' },
  { value: 'CODE39', label: 'Code 39', hint: 'Uppercase letters, digits and - . $ / + % space' },
  { value: 'ITF14', label: 'ITF-14', hint: '13 digits; the check digit is added for you' },
  { value: 'MSI', label: 'MSI', hint: 'Digits only' },
  { value: 'pharmacode', label: 'Pharmacode', hint: 'A number from 3 to 131070' },
  { value: 'codabar', label: 'Codabar', hint: 'Digits and - $ : / . +, optionally wrapped in A to D' },
];

const DEFAULTS = { text: '', format: 'CODE128', width: '2', height: '100', fontSize: '20', margin: '10', lineColor: '#000000', background: '#ffffff', displayValue: true };

export default function BarCodeGenerator() {
  const [o, setO] = useState(DEFAULTS);
  const set = <K extends keyof typeof DEFAULTS>(k: K, v: (typeof DEFAULTS)[K]) => setO((p) => ({ ...p, [k]: v }));

  const jsOptions = useMemo(
    () => ({
      format: o.format,
      width: Number(o.width) || 2,
      height: Number(o.height) || 100,
      fontSize: Number(o.fontSize) || 20,
      margin: Number(o.margin) || 0,
      lineColor: isHex(o.lineColor) ? o.lineColor : '#000000',
      background: isHex(o.background) ? o.background : '#ffffff',
      displayValue: o.displayValue,
      font: 'monospace',
    }),
    [o]
  );

  // Live SVG. JsBarcode throws on input that is not valid for the format.
  const result = useMemo(() => {
    if (!o.text) return { svg: '', error: '' };
    try {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(el, o.text, jsOptions);
      return { svg: el.outerHTML, error: '' };
    } catch (e) {
      return { svg: '', error: getErrorMessage(e, 'Could not render this barcode.') };
    }
  }, [o.text, jsOptions]);

  const downloadPng = () => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, o.text, jsOptions);
    canvas.toBlob((b) => b && downloadBlob(b, `barcode-${o.format}.png`), 'image/png');
  };

  const format = FORMATS.find((f) => f.value === o.format);

  const colour = (k: 'lineColor' | 'background', label: string) => (
    <Field label={label} htmlFor={`bc-${k}`}>
      <ColorInput id={`bc-${k}`} label={label} value={o[k]} onChange={(v) => set(k, v)} />
    </Field>
  );
  const num = (k: 'width' | 'height' | 'fontSize' | 'margin', label: string, min: number, max: number, step = 1) => (
    <Field label={label} htmlFor={`bc-${k}`}>
      <Input id={`bc-${k}`} type="number" min={min} max={max} step={step} inputMode="decimal" value={o[k]} onChange={(e) => set(k, e.target.value)} />
    </Field>
  );

  return (
    <ToolPage id="barcode_generator">
      <Panel title="Generate" actions={<ClearButton onClick={() => setO(DEFAULTS)} disabled={o === DEFAULTS} />}>
        <TwoPane>
          <div className="space-y-3">
            <Field label="Format" htmlFor="bc-format">
              <Select id="bc-format" value={o.format} onChange={(e) => set('format', e.target.value)}>
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Value" htmlFor="bc-text" hint={format?.hint}>
              <Input id="bc-text" value={o.text} onChange={(e) => set('text', e.target.value)} placeholder="Example 1234" autoFocus aria-invalid={Boolean(result.error) || undefined} />
            </Field>
            <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
              {num('width', 'Bar width', 1, 10, 0.5)}
              {num('height', 'Height', 10, 500)}
              {num('fontSize', 'Text size', 8, 72)}
              {num('margin', 'Margin', 0, 50)}
              {colour('lineColor', 'Bars')}
              {colour('background', 'Background')}
            </div>
            <Checkbox label="Show the value under the bars" checked={o.displayValue} onChange={(e) => set('displayValue', e.target.checked)} />
          </div>

          <div>
            <PreviewBox height="min-h-48">
              {result.svg ? (
                <img src={`data:image/svg+xml;utf8,${encodeURIComponent(result.svg)}`} alt={`${format?.label ?? o.format} barcode for ${o.text}`} className="h-auto max-w-full" />
              ) : (
                <EmptyState>The barcode appears here as you type</EmptyState>
              )}
            </PreviewBox>
            <Toolbar className="mt-3">
              <Button variant="primary" disabled={!result.svg} icon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={() => downloadBlob(result.svg, `barcode-${o.format}.svg`, 'image/svg+xml')}>
                Download SVG
              </Button>
              <Button disabled={!result.svg} icon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={downloadPng}>
                Download PNG
              </Button>
            </Toolbar>
          </div>
        </TwoPane>

        {result.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
