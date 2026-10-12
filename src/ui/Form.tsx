import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

/* ---- Field: label + control + hint/error ------------------------------- */

export interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Small controls on the label row's right side (Copy, Clear, counts). */
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, actions, className, children }: FieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="mb-1.5 flex min-h-7 items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
          {label}
        </label>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ---- Input ------------------------------------------------------------- */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { mono = true, className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn('control h-9', mono ? 'font-mono text-[13px]' : 'text-sm', className)}
      {...rest}
    />
  );
});

/* ---- Select ------------------------------------------------------------ */

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn('control h-9 text-sm', className)} {...rest}>
        {children}
      </select>
    );
  }
);

/* ---- TextArea ---------------------------------------------------------- */

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  /** Grow with content (capped). Default on. */
  autoSize?: boolean;
  mono?: boolean;
  /** Show "n chars · n lines" under the field. */
  stats?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { value, autoSize = true, mono = true, stats, rows = 6, className, ...rest },
  ref
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const setRefs = (el: HTMLTextAreaElement | null) => {
    innerRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  // While empty the height follows `rows`; an empty textarea measures its
  // placeholder laid out one character per line, which is nonsense.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || !autoSize) return;
    if (!value) {
      el.style.height = '';
      return;
    }
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value, autoSize]);

  const lines = value ? value.split('\n').length : 0;

  return (
    <>
      <textarea
        ref={setRefs}
        value={value}
        rows={rows}
        spellCheck={false}
        className={cn(
          'control thin-scroll resize-y py-2 leading-relaxed',
          autoSize && 'max-h-[32rem] resize-none',
          mono ? 'font-mono text-[13px]' : 'text-sm',
          className
        )}
        {...rest}
      />
      {stats && (
        <p className="mt-1 text-right font-mono text-[11px] tabular-nums text-muted" aria-live="off">
          {value.length.toLocaleString()} chars · {lines.toLocaleString()} lines
        </p>
      )}
    </>
  );
});

/* ---- Checkbox ---------------------------------------------------------- */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

export function Checkbox({ label, className, id, ...rest }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-ink', className)}>
      <input id={inputId} type="checkbox" className="h-4 w-4 rounded border-control" {...rest} />
      {label}
    </label>
  );
}

/* ---- Segmented control ------------------------------------------------- */

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** A radio group drawn as connected buttons. Arrow keys move the selection. */
export function Segmented<T extends string>({ options, value, onChange, label, size = 'md', className }: SegmentedProps<T>) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(options[(i + 1) % options.length].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(options[(i - 1 + options.length) % options.length].value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('thin-scroll inline-flex max-w-full overflow-x-auto rounded-md border border-line bg-surface p-0.5', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded px-3 font-medium transition-colors duration-150 ease-out',
              size === 'sm' ? 'h-6 text-xs' : 'h-8 text-sm',
              active ? 'bg-panel text-ink shadow-sm' : 'text-muted hover:text-ink'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
