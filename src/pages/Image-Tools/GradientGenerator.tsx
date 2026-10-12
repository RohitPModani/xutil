import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { Button, ClearButton, ColorInput, Field, IconButton, Input, Output, Panel, Segmented, Select, TwoPane } from '../../ui';
import { isHex } from '../../utils/color';

type Kind = 'linear' | 'radial';
interface Stop {
  color: string;
  /** Raw text while typing; clamped to 0 to 100 on blur and when building the CSS. */
  position: string;
}

const ANGLE = 'angle';
const DIRECTIONS: Record<Kind, { value: string; label: string }[]> = {
  linear: [
    { value: 'to right', label: 'To right' },
    { value: 'to left', label: 'To left' },
    { value: 'to bottom', label: 'To bottom' },
    { value: 'to top', label: 'To top' },
    { value: 'to bottom right', label: 'To bottom right' },
    { value: ANGLE, label: 'Custom angle' },
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
  { color: '#FF0000', position: '0' },
  { color: '#0000FF', position: '100' },
];

const pos = (s: Stop) => Math.min(100, Math.max(0, Number(s.position) || 0));

export default function GradientGenerator() {
  const [kind, setKind] = useState<Kind>('linear');
  const [direction, setDirection] = useState('to right');
  const [angle, setAngle] = useState('90');
  const [stops, setStops] = useState<Stop[]>(DEFAULT_STOPS);

  const switchKind = (k: Kind) => {
    setKind(k);
    setDirection(k === 'linear' ? 'to right' : 'center');
  };
  const update = (i: number, patch: Partial<Stop>) => setStops((s) => s.map((st, j) => (j === i ? { ...st, ...patch } : st)));
  // A new stop goes into the middle of the widest gap, so it never lands on an existing one.
  const add = () =>
    setStops((s) => {
      const sorted = s.map((st, i) => ({ i, p: pos(st) })).sort((a, b) => a.p - b.p);
      let k = 0;
      for (let j = 1; j < sorted.length - 1; j++) if (sorted[j + 1].p - sorted[j].p > sorted[k + 1].p - sorted[k].p) k = j;
      const next = [...s];
      next.splice(sorted[k].i + 1, 0, { color: '#FFFFFF', position: String(Math.round((sorted[k].p + sorted[k + 1].p) / 2)) });
      return next;
    });
  const remove = (i: number) => setStops((s) => s.filter((_, j) => j !== i));
  const reset = () => {
    setKind('linear');
    setDirection('to right');
    setAngle('90');
    setStops(DEFAULT_STOPS);
  };

  const bad = stops.findIndex((s) => !isHex(s.color, true));
  const stopList = [...stops]
    .sort((a, b) => pos(a) - pos(b))
    .map((s) => `${s.color} ${pos(s)}%`)
    .join(', ');
  const dir = direction === ANGLE ? `${Number(angle) || 0}deg` : direction;
  const gradient = kind === 'linear' ? `linear-gradient(${dir}, ${stopList})` : `radial-gradient(circle at ${dir}, ${stopList})`;
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
            <div className="grid grid-cols-2 gap-3">
              <Field label={kind === 'linear' ? 'Direction' : 'Centre'} htmlFor="gg-direction" className={direction === ANGLE ? undefined : 'col-span-2'}>
                <Select id="gg-direction" value={direction} onChange={(e) => setDirection(e.target.value)} autoFocus>
                  {DIRECTIONS[kind].map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </Field>
              {direction === ANGLE && (
                <Field label="Angle (deg)" htmlFor="gg-angle" hint="0 points up; 90 points right.">
                  <Input id="gg-angle" type="number" step={1} inputMode="numeric" value={angle} onChange={(e) => setAngle(e.target.value)} onBlur={() => setAngle(String(Number(angle) || 0))} />
                </Field>
              )}
            </div>
            <Field
              label="Colour stops"
              hint="Two to ten stops. Position is a percentage along the gradient; eight hex digits add alpha."
              error={bad === -1 ? undefined : `Stop ${bad + 1} needs a hex colour like #1A2B3C or #1A2B3C80.`}
              actions={
                <Button size="sm" onClick={add} disabled={stops.length >= 10} icon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}>
                  Add stop
                </Button>
              }
            >
              <ul className="space-y-2">
                {stops.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <ColorInput label={`Stop ${i + 1}`} value={s.color} onChange={(v) => update(i, { color: v })} alpha className="flex-1" />
                    <Input
                      aria-label={`Stop ${i + 1} position (%)`}
                      className="w-20"
                      type="number"
                      min={0}
                      max={100}
                      inputMode="numeric"
                      value={s.position}
                      onChange={(e) => update(i, { position: e.target.value })}
                      onBlur={() => update(i, { position: String(pos(s)) })}
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
      </Panel>
    </ToolPage>
  );
}
