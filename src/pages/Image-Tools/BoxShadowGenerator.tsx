import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, Checkbox, ClearButton, ColorInput, Field, Output, Panel, RangeInput, TwoPane, cn } from '../../ui';
import { isHex } from '../../utils/color';

interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const DEFAULT: Shadow = { x: 5, y: 5, blur: 10, spread: 0, color: '#000000', inset: false };

const PRESETS: { name: string; shadow: Shadow }[] = [
  { name: 'Soft', shadow: { x: 3, y: 3, blur: 15, spread: 0, color: '#00000040', inset: false } },
  { name: 'Hard', shadow: { x: 5, y: 5, blur: 0, spread: 0, color: '#000000', inset: false } },
  { name: 'Deep', shadow: { x: 10, y: 10, blur: 20, spread: 5, color: '#00000080', inset: false } },
  { name: 'Inset glow', shadow: { x: 0, y: 0, blur: 10, spread: 2, color: '#FF000080', inset: true } },
  { name: 'Subtle inset', shadow: { x: -2, y: -2, blur: 5, spread: -1, color: '#00000040', inset: true } },
];

const toValue = (s: Shadow) => `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;

export default function BoxShadowGenerator() {
  const [s, setS] = useState<Shadow>(DEFAULT);
  const set = <K extends keyof Shadow>(k: K, v: Shadow[K]) => setS((p) => ({ ...p, [k]: v }));

  const valid = isHex(s.color, true);
  const css = valid ? `box-shadow: ${toValue(s)};` : '';

  const slider = (k: 'x' | 'y' | 'blur' | 'spread', label: string, min: number, max: number) => (
    <Field label={`${label} · ${s[k]}px`} htmlFor={`bs-${k}`}>
      <RangeInput id={`bs-${k}`} label={label} min={min} max={max} value={s[k]} onChange={(v) => set(k, v)} />
    </Field>
  );

  return (
    <ToolPage id="box_shadow_generator">
      <Panel title="Tune" actions={<ClearButton label="Reset" onClick={() => setS(DEFAULT)} />}>
        <TwoPane>
          <div className="space-y-3">
            {slider('x', 'Horizontal offset', -50, 50)}
            {slider('y', 'Vertical offset', -50, 50)}
            {slider('blur', 'Blur', 0, 100)}
            {slider('spread', 'Spread', -50, 50)}
            <Field label="Colour" htmlFor="bs-color" hint="Six digits, or eight to include alpha (#00000040).">
              <ColorInput id="bs-color" label="Colour" value={s.color} onChange={(v) => set('color', v)} alpha autoFocus />
            </Field>
            <Checkbox label="Inset" checked={s.inset} onChange={(e) => set('inset', e.target.checked)} />
            <Field label="Presets">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setS(p.shadow)}
                    className={cn('rounded-md border border-line bg-panel px-3 py-1.5 text-xs text-muted transition-colors duration-150 hover:border-control hover:text-ink', toValue(p.shadow) === toValue(s) && 'text-ink')}
                    style={{ boxShadow: toValue(p.shadow) }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="space-y-3">
            <div className="flex h-64 items-center justify-center rounded-md border border-line bg-surface">
              <div className="h-28 w-28 rounded-md bg-panel" style={css ? { boxShadow: toValue(s) } : undefined} role="img" aria-label="Box shadow preview" />
            </div>
            <Output label="CSS" value={css} rows={2} placeholder="Fix the colour to see the rule" fileName="box-shadow.css" mime="text/css" />
          </div>
        </TwoPane>
        {!valid && (
          <Callout tone="error" className="mt-4">
            The colour needs six or eight hex digits, like #1A2B3C or #1A2B3C80.
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
