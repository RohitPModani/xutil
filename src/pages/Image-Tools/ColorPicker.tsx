import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ColorInput, Field, KeyValueList, Output, Panel, TwoPane } from '../../ui';
import { isHex } from '../../utils/color';

const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPicker() {
  const [hex, setHex] = useState('#2563EB');

  const valid = isHex(hex);
  const items = useMemo(() => {
    if (!isHex(hex)) return [];
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    return [
      { label: 'HEX', value: hex.toUpperCase() },
      { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
      { label: 'HSL', value: `hsl(${h}, ${s}%, ${l}%)` },
    ];
  }, [hex]);

  return (
    <ToolPage id="color_picker">
      <Panel title="Pick">
        <TwoPane>
          <div className="space-y-3">
            <Field label="Colour" htmlFor="cp-hex" hint="Pick with the swatch or type a six-digit hex code.">
              <ColorInput id="cp-hex" label="Colour" value={hex} onChange={setHex} placeholder="#2563EB" autoFocus />
            </Field>
            <div className="h-40 w-full rounded-md border border-line bg-surface" style={valid ? { backgroundColor: hex } : undefined} role="img" aria-label={valid ? `Swatch of ${hex}` : 'No colour selected'} />
          </div>
          <Output label="Formats" copyText={items.map((i) => i.value).join('\n')} placeholder="Enter a valid colour to see its formats">
            {items.length ? <KeyValueList items={items} /> : undefined}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
