import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Field, Input, KeyValueList, Output, Panel, TwoPane } from '../../ui';
import { hexToRgb, parseColor, rgbToCmyk, rgbToHsl, rgbToHsv } from '../../utils/color';

export default function ColorPicker() {
  const [text, setText] = useState('#2563EB');
  const hex = useMemo(() => parseColor(text), [text]);

  const items = useMemo(() => {
    if (!hex) return [];
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    return [
      { label: 'HEX', value: hex },
      { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
      { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      { label: 'HSV', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
      { label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    ];
  }, [hex]);

  return (
    <ToolPage id="color_picker">
      <Panel title="Pick">
        <TwoPane>
          <div className="space-y-3">
            <Field
              label="Colour"
              htmlFor="cp-text"
              hint="Pick with the swatch, or type a hex, rgb() or hsl() value."
              error={text.trim() && !hex ? 'Enter a colour like #1A2B3C, rgb(37, 99, 235) or hsl(221, 83%, 53%).' : undefined}
            >
              <div className="flex gap-2">
                <input type="color" aria-label="Colour swatch" value={hex ?? '#000000'} onChange={(e) => setText(e.target.value.toUpperCase())} />
                <Input id="cp-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="#2563EB" autoFocus className="flex-1" />
              </div>
            </Field>
            <div className="h-40 w-full rounded-md border border-line bg-surface" style={hex ? { backgroundColor: hex } : undefined} role="img" aria-label={hex ? `Swatch of ${hex}` : 'No colour selected'} />
          </div>
          <Output label="Formats" copyText={items.map((i) => i.value).join('\n')} placeholder="Enter a valid colour to see its formats">
            {items.length ? <KeyValueList items={items} /> : undefined}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
