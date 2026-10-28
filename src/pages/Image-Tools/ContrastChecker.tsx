import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, Field, Input, Panel, TwoPane } from '../../ui';
import { cn } from '../../ui/cn';
import { hexToRgb, parseColor, rgbToHsl } from '../../utils/color';

type Rgb = { r: number; g: number; b: number };

/** WCAG 2.1 relative luminance: sRGB channels linearised, then weighted. */
function relativeLuminance({ r, g, b }: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** (L1 + 0.05) / (L2 + 0.05) with the lighter colour on top; 1 to 21. */
function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function wcagVerdicts(ratio: number) {
  return [
    { label: 'AA normal text', min: 4.5, pass: ratio >= 4.5 },
    { label: 'AA large text', min: 3, pass: ratio >= 3 },
    { label: 'AAA normal text', min: 7, pass: ratio >= 7 },
    { label: 'AAA large text', min: 4.5, pass: ratio >= 4.5 },
    { label: 'UI components and graphics', min: 3, pass: ratio >= 3 },
  ];
}

/** Same hue and saturation, lightness stepped away from the background until AA normal text passes. */
function suggestTextColor(text: Rgb, bg: Rgb): string | null {
  const { h, s, l } = rgbToHsl(text.r, text.g, text.b);
  const darker = relativeLuminance(bg) > 0.18;
  for (let step = 1; step <= 100; step++) {
    const nl = darker ? l - step : l + step;
    if (nl < 0 || nl > 100) return null;
    const hex = parseColor(`hsl(${h}, ${s}%, ${nl}%)`);
    if (hex && contrastRatio(hexToRgb(hex), bg) >= 4.5) return hex;
  }
  return null;
}

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const hex = parseColor(value);
  return (
    <Field label={label} htmlFor={id} error={value.trim() && !hex ? 'Enter a colour like #1A2B3C, rgb(37, 99, 235) or hsl(221, 83%, 53%).' : undefined}>
      <div className="flex gap-2">
        <input type="color" aria-label={`${label} swatch`} value={hex ?? '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="#1A1A1A" className="flex-1" />
      </div>
    </Field>
  );
}

export default function ContrastChecker() {
  const [text, setText] = useState('#1A1A1A');
  const [bg, setBg] = useState('#FFFFFF');
  const textHex = parseColor(text);
  const bgHex = parseColor(bg);

  const { ratio, verdicts, suggestion } = useMemo(() => {
    if (!textHex || !bgHex) return { ratio: 0, verdicts: [], suggestion: null };
    const t = hexToRgb(textHex);
    const b = hexToRgb(bgHex);
    const ratio = contrastRatio(t, b);
    return { ratio, verdicts: wcagVerdicts(ratio), suggestion: ratio < 4.5 ? suggestTextColor(t, b) : null };
  }, [textHex, bgHex]);

  const swap = () => {
    setText(bg);
    setBg(text);
  };

  return (
    <ToolPage id="contrast_checker">
      <Panel
        title="Check"
        actions={
          <Button size="sm" variant="ghost" onClick={swap} icon={<ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />}>
            Swap
          </Button>
        }
      >
        <TwoPane>
          <div className="space-y-3">
            <ColorField id="cc-text" label="Text colour" value={text} onChange={setText} />
            <ColorField id="cc-bg" label="Background colour" value={bg} onChange={setBg} />
            <div className="space-y-2 rounded-md border border-line p-4" style={textHex && bgHex ? { color: textHex, backgroundColor: bgHex } : undefined} aria-hidden="true">
              <p className="text-base">Normal text: the quick brown fox jumps over the lazy dog.</p>
              <p className="text-2xl font-bold">Large text at 24px</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-line bg-surface px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted">Contrast ratio</div>
              <div className="mt-1 font-mono text-4xl tabular-nums text-ink" aria-live="polite">
                {ratio ? `${ratio.toFixed(2)}:1` : '—'}
              </div>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {verdicts.map((v) => (
                  <tr key={v.label}>
                    <td className="py-1.5 pr-3 text-ink">{v.label}</td>
                    <td className="py-1.5 pr-3 font-mono text-xs tabular-nums text-muted">≥ {v.min}:1</td>
                    <td className={cn('py-1.5 text-right font-medium', v.pass ? 'text-success' : 'text-danger')}>{v.pass ? 'Pass' : 'Fail'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {suggestion && bgHex && (
              <Callout tone="info">
                <span className="mr-1.5 inline-block h-3 w-3 translate-y-px rounded-sm border border-line align-middle" style={{ backgroundColor: suggestion }} />
                <span className="font-mono">{suggestion}</span> is the nearest shade of this text colour that passes AA for normal text
                ({contrastRatio(hexToRgb(suggestion), hexToRgb(bgHex)).toFixed(2)}:1).{' '}
                <button type="button" className="font-medium text-link underline" onClick={() => setText(suggestion)}>
                  Use it
                </button>
              </Callout>
            )}
          </div>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
