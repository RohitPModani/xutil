import { Input } from './Form';
import { cleanHex, expandHex, isHex } from '../utils/color';
import { cn } from './cn';

export interface ColorInputProps {
  /** id for the hex text field (pair it with a Field's htmlFor). */
  id?: string;
  /** Accessible name; the swatch gets "<label> swatch", the field "<label> hex". */
  label: string;
  value: string;
  onChange: (hex: string) => void;
  /** Accept `#RRGGBBAA` as well. */
  alpha?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  /** Set by `Field` so the hex field is linked to its hint or error. */
  'aria-describedby'?: string;
}

/**
 * Native colour swatch plus an editable hex field, kept in sync. The field
 * is marked invalid until the text is a complete hex colour.
 */
export function ColorInput({ id, label, value, onChange, alpha, placeholder, autoFocus, className, ...aria }: ColorInputProps) {
  const valid = isHex(value, alpha);
  const max = alpha ? 9 : 7;
  return (
    <div className={cn('flex gap-2', className)}>
      <input
        type="color"
        aria-label={`${label} swatch`}
        value={valid ? value.slice(0, 7) : '#000000'}
        onChange={(e) => {
          const rgb = e.target.value.toUpperCase();
          // Keep any alpha the user typed when the swatch changes the colour.
          onChange(alpha && value.length === 9 ? rgb + value.slice(7) : rgb);
        }}
      />
      <Input
        id={id}
        aria-label={id ? undefined : `${label} hex`}
        value={value}
        onChange={(e) => onChange(cleanHex(e.target.value, max))}
        onBlur={() => {
          const expanded = expandHex(value);
          if (expanded !== value) onChange(expanded);
        }}
        placeholder={placeholder}
        maxLength={max}
        autoFocus={autoFocus}
        aria-invalid={!valid || undefined}
        aria-describedby={aria['aria-describedby']}
        className="flex-1"
      />
    </div>
  );
}
