import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Checkbox, ClearButton, ColorInput, Field, IconButton, Output, Panel, RangeInput, Segmented, TwoPane, cn } from '../../ui';
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
const MAX_LAYERS = 5;

const PRESETS: { name: string; shadow: Shadow }[] = [
  { name: 'Soft', shadow: { x: 3, y: 3, blur: 15, spread: 0, color: '#00000040', inset: false } },
  { name: 'Hard', shadow: { x: 5, y: 5, blur: 0, spread: 0, color: '#000000', inset: false } },
  { name: 'Deep', shadow: { x: 10, y: 10, blur: 20, spread: 5, color: '#00000080', inset: false } },
  { name: 'Inset glow', shadow: { x: 0, y: 0, blur: 10, spread: 2, color: '#FF000080', inset: true } },
  { name: 'Subtle inset', shadow: { x: -2, y: -2, blur: 5, spread: -1, color: '#00000040', inset: true } },
];

const toValue = (s: Shadow) => `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
const toList = (layers: Shadow[]) => layers.map(toValue).join(', ');

export default function BoxShadowGenerator() {
  const [layers, setLayers] = useState<Shadow[]>([DEFAULT]);
  const [current, setCurrent] = useState(0);
  const s = layers[current] ?? layers[0];
  const set = <K extends keyof Shadow>(k: K, v: Shadow[K]) => setLayers((ls) => ls.map((l, i) => (i === current ? { ...l, [k]: v } : l)));

  const valid = layers.every((l) => isHex(l.color, true));
  const value = toList(layers);
  const css = valid ? `box-shadow: ${value};` : '';
  const isDefault = layers.length === 1 && toValue(layers[0]) === toValue(DEFAULT);

  const reset = () => {
    setLayers([DEFAULT]);
    setCurrent(0);
  };
  const addLayer = () => {
    setLayers((ls) => [...ls, DEFAULT]);
    setCurrent(layers.length);
  };
  const removeLayer = () => {
    setLayers((ls) => ls.filter((_, i) => i !== current));
    setCurrent((c) => Math.max(0, c - 1));
  };

  const slider = (k: 'x' | 'y' | 'blur' | 'spread', label: string, min: number, max: number) => (
    <Field label={`${label} · ${s[k]}px`} htmlFor={`bs-${k}`}>
      <RangeInput id={`bs-${k}`} label={label} min={min} max={max} value={s[k]} onChange={(v) => set(k, v)} />
    </Field>
  );

  return (
    <ToolPage id="box_shadow_generator">
      <Panel title="Tune" actions={<ClearButton label="Reset" onClick={reset} disabled={isDefault} />}>
        <TwoPane>
          <div className="space-y-3">
            <Field
              label="Layers"
              actions={
                <>
                  <Button size="sm" onClick={addLayer} disabled={layers.length >= MAX_LAYERS} icon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}>
                    Add layer
                  </Button>
                  <IconButton label={`Remove layer ${current + 1}`} size="sm" onClick={removeLayer} disabled={layers.length <= 1}>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </>
              }
            >
              <Segmented
                size="sm"
                label="Layer to edit"
                value={String(current)}
                onChange={(v) => setCurrent(Number(v))}
                options={layers.map((_, i) => ({ value: String(i), label: `Layer ${i + 1}` }))}
              />
            </Field>
            {slider('x', 'Horizontal offset', -50, 50)}
            {slider('y', 'Vertical offset', -50, 50)}
            {slider('blur', 'Blur', 0, 100)}
            {slider('spread', 'Spread', -50, 50)}
            <Field
              label="Colour"
              htmlFor="bs-color"
              hint="Six digits, or eight to include alpha (#00000040)."
              error={isHex(s.color, true) ? undefined : 'Use six hex digits, or eight to include alpha, like #1A2B3C or #1A2B3C80.'}
            >
              <ColorInput id="bs-color" label="Colour" value={s.color} onChange={(v) => set('color', v)} alpha />
            </Field>
            <Checkbox label="Inset" checked={s.inset} onChange={(e) => set('inset', e.target.checked)} />
            <Field label="Presets" hint="A preset replaces every layer.">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const active = layers.length === 1 && toValue(p.shadow) === toValue(layers[0]);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setLayers([p.shadow]);
                        setCurrent(0);
                      }}
                      className={cn(
                        'rounded-md border bg-panel px-3 py-1.5 text-xs transition-colors duration-150 hover:border-control hover:text-ink',
                        active ? 'border-primary text-ink' : 'border-line text-muted'
                      )}
                      style={{ boxShadow: toValue(p.shadow) }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <div className="space-y-3">
            <div className="flex h-64 items-center justify-center rounded-md border border-line bg-surface">
              <div className="h-28 w-28 rounded-md bg-panel" style={css ? { boxShadow: value } : undefined} role="img" aria-label="Box shadow preview" />
            </div>
            <Output label="CSS" value={css} rows={2} placeholder="Fix the colour to see the rule" fileName="box-shadow.css" mime="text/css" />
          </div>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
