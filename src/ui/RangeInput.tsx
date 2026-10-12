import { useEffect, useState } from 'react';
import { Input } from './Form';
import { cn } from './cn';

export interface RangeInputProps {
  /** id for the number field (pair it with a Field's htmlFor). */
  id?: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/** A slider for the thumb and a number field for exact values, both bound to one number. */
export function RangeInput({ id, label, min, max, step = 1, value, onChange, className }: RangeInputProps) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const n = Number(text);
  const invalid = text === '' || !Number.isFinite(n) || n < min || n > max;
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 flex-1"
      />
      <Input
        id={id}
        aria-label={id ? undefined : label}
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode={step < 1 ? 'decimal' : 'numeric'}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== '' && Number.isFinite(n) && n >= min && n <= max) onChange(n);
        }}
        onBlur={() => setText(String(value))}
        aria-invalid={invalid || undefined}
        className="w-24"
      />
    </div>
  );
}
