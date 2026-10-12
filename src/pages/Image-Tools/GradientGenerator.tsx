import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, ClearButton, ColorInput, Field, IconButton, Input, Output, Panel, Segmented, Select, TwoPane } from '../../ui';
import { isHex } from '../../utils/color';

type Kind = 'linear' | 'radial';
interface Stop {
  color: string;
  position: number;
}

const DIRECTIONS: Record<Kind, { value: string; label: string }[]> = {
  linear: [
    { value: 'to right', label: 'To right' },
    { value: 'to left', label: 'To left' },
    { value: 'to bottom', label: 'To bottom' },
    { value: 'to top', label: 'To top' },
    { value: 'to bottom right', label: 'To bottom right' },
    { value: '45deg', label: '45°' },
    { value: '135deg', label: '135°' },
  ],
  radial: [
    { value: 'center', label: 'Centre' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ],
};

const DEFAULT_STOPS: Stop[] = [
  { color: '#FF0000', position: 0 },
  { color: '#0000FF', position: 100 },
];

export default function GradientGenerator() {
  const [kind, setKind] = useState<Kind>('linear');
  const [direction, setDirection] = useState('to right');
  const [stops, setStops] = useState<Stop[]>(DEFAULT_STOPS);

  const switchKind = (k: Kind) => {
    setKind(k);
    setDirection(k === 'linear' ? 'to right' : 'center');
  };
  const update = (i: number, patch: Partial<Stop>) => setStops((s) => s.map((st, j) => (j === i ? { ...st, ...patch } : st)));
  const add = () =>
    setStops((s) => [...s, { color: '#FFFFFF', position: Math.min(100, s[s.length - 1].position + 10) }]);
  const remove = (i: number) => setStops((s) => s.filter((_, j) => j !== i));
  const reset = () => {
    setKind('linear');
    setDirection('to right');
    setStops(DEFAULT_STOPS);
  };

  const bad = stops.findIndex((s) => !isHex(s.color));
  const stopList = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ');
  const gradient = kind === 'linear' ? `linear-gradient(${direction}, ${stopList})` : `radial-gradient(circle at ${direction}, ${stopList})`;
  const css = bad === -1 ? `background: ${gradient};` : '';

  return (
    <ToolPage id="gradient_generator">
      <Panel
        title="Build"
        actions={
          <>
            <Segmented
              size="sm"
              label="Gradient type"
              value={kind}
              onChange={switchKind}
              options={[
                { value: 'linear', label: 'Linear' },
                { value: 'radial', label: 'Radial' },
              ]}
            />
            <ClearButton label="Reset" onClick={reset} />
          </>
        }
      >
        <TwoPane>
          <div className="space-y-3">
            <Field label={kind === 'linear' ? 'Direction' : 'Centre'} htmlFor="gg-direction">
              <Select id="gg-direction" value={direction} onChange={(e) => setDirection(e.target.value)} autoFocus>
                {DIRECTIONS[kind].map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Colour stops"
              hint="Two to ten stops. Position is a percentage along the gradient."
              actions={
                <Button size="sm" onClick={add} disabled={stops.length >= 10} icon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}>
                  Add stop
                </Button>
              }
            >
              <ul className="space-y-2">
                {stops.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <ColorInput label={`Stop ${i + 1}`} value={s.color} onChange={(v) => update(i, { color: v })} className="flex-1" />
                    <Input
                      aria-label={`Stop ${i + 1} position (%)`}
                      className="w-20"
                      type="number"
                      min={0}
                      max={100}
                      inputMode="numeric"
                      value={s.position}
                      onChange={(e) => update(i, { position: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                    />
                    <IconButton label={`Remove stop ${i + 1}`} size="sm" onClick={() => remove(i)} disabled={stops.length <= 2}>
                      <X className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </Field>
          </div>

          <div className="space-y-3">
            <div className="h-56 w-full rounded-md border border-line bg-surface" style={css ? { background: gradient } : undefined} role="img" aria-label="Gradient preview" />
            <Output label="CSS" value={css} rows={3} placeholder="Fix the colour stops to see the rule" fileName="gradient.css" mime="text/css" />
          </div>
        </TwoPane>
        {bad !== -1 && (
          <Callout tone="error" className="mt-4">
            Stop {bad + 1} needs a six-digit hex colour like #1A2B3C.
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
