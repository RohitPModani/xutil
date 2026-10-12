import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from './cn';
import { CopyButton, DownloadButton } from './Actions';

/* ---- Panel: one job per box -------------------------------------------- */

export interface PanelProps {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function Panel({ title, actions, className, bodyClassName, children }: PanelProps) {
  return (
    <section className={cn('rounded-md border border-line bg-panel', className)}>
      {(title || actions) && (
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line px-4 py-2">
          {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
          {actions && <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1">{actions}</div>}
        </header>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}

/** Input on the left, output on the right at tablet width and up. */
export function TwoPane({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid gap-4 md:grid-cols-2', className)}>{children}</div>;
}

export function Toolbar({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

/* ---- Output: a read-only result with Copy / Download built in ---------- */

export interface OutputProps {
  label: ReactNode;
  /** The text to show and copy. Omit when passing custom `children`. */
  value?: string;
  /** Text to copy when `children` render something other than plain text. */
  copyText?: string;
  placeholder?: string;
  fileName?: string;
  mime?: string;
  /** Extra controls on the label row. */
  actions?: ReactNode;
  rows?: number;
  mono?: boolean;
  wrap?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
}

export function Output({
  label,
  value,
  copyText,
  placeholder = 'Result appears here',
  fileName,
  mime,
  actions,
  rows = 6,
  mono = true,
  wrap = true,
  id,
  className,
  children,
}: OutputProps) {
  const text = copyText ?? value ?? '';
  const empty = !text && !children;

  return (
    <div className={cn('min-w-0', className)}>
      <div className="mb-1.5 flex min-h-7 items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-muted">
          {label}
        </label>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <CopyButton text={text} />
          {fileName && <DownloadButton content={text} fileName={fileName} mime={mime} compact />}
        </div>
      </div>
      {children ? (
        <div className="rounded-md border border-line bg-surface">{children}</div>
      ) : (
        <textarea
          id={id}
          readOnly
          value={value ?? ''}
          rows={rows}
          placeholder={placeholder}
          aria-live="polite"
          spellCheck={false}
          className={cn(
            'thin-scroll block w-full resize-y rounded-md border border-line bg-surface px-3 py-2 leading-relaxed text-ink',
            'placeholder:text-muted/70 focus:outline-2 focus:outline-primary focus:-outline-offset-1',
            mono ? 'font-mono text-[13px]' : 'text-sm',
            !wrap && 'whitespace-pre overflow-x-auto',
            empty && 'text-muted'
          )}
        />
      )}
    </div>
  );
}

/* ---- KeyValueList: many small results, each one copyable --------------- */

export interface KeyValueItem {
  label: ReactNode;
  value: string;
  /** Override what the copy button copies (defaults to `value`). */
  copy?: string;
  mono?: boolean;
}

export function KeyValueList({ items, className }: { items: KeyValueItem[]; className?: string }) {
  return (
    <dl className={cn('divide-y divide-line', className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-1.5">
          <dt className="w-32 shrink-0 truncate text-xs text-muted sm:w-40">{item.label}</dt>
          <dd className={cn('min-w-0 flex-1 break-all text-[13px] text-ink', item.mono !== false && 'font-mono')}>
            {item.value || <span className="text-muted">—</span>}
          </dd>
          <CopyButton text={item.copy ?? item.value} compact />
        </div>
      ))}
    </dl>
  );
}

/* ---- Callout: error / success / info ----------------------------------- */

const tones = {
  error: { icon: AlertCircle, edge: 'border-l-danger', iconColor: 'text-danger', role: 'alert' as const },
  success: { icon: CheckCircle2, edge: 'border-l-success', iconColor: 'text-success', role: 'status' as const },
  info: { icon: Info, edge: 'border-l-link', iconColor: 'text-link', role: 'status' as const },
};

export interface CalloutProps {
  tone?: keyof typeof tones;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Callout({ tone = 'info', id, className, children }: CalloutProps) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <div
      id={id}
      role={t.role}
      className={cn('flex items-start gap-2.5 rounded-md border border-line border-l-2 bg-surface px-3 py-2.5 text-sm text-ink', t.edge, className)}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', t.iconColor)} aria-hidden="true" />
      <div className="min-w-0 flex-1 break-words">{children}</div>
    </div>
  );
}

/* ---- Stat: a number with a label --------------------------------------- */

export function Stat({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-md border border-line bg-surface px-3 py-2', className)}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-lg tabular-nums text-ink">{value}</div>
    </div>
  );
}

/** Thin empty-state line for a panel that has nothing to show yet. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-3 py-6 text-center text-sm text-muted">{children}</p>;
}
