import type { ReactNode } from 'react';
import { Toolbar } from './Panel';

export interface ValueBlockProps {
  /** The generated value. Shows an ellipsis while empty. */
  value: string;
  /** Copy / New buttons, shown beside the value. */
  actions?: ReactNode;
}

/** A generator's headline value: large, mono, select-all, announced on change. */
export function ValueBlock({ value, actions }: ValueBlockProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <code className="flex-1 select-all break-all rounded-md border border-line bg-surface px-3 py-2.5 font-mono text-base text-ink" aria-live="polite">
        {value || '…'}
      </code>
      {actions && <Toolbar>{actions}</Toolbar>}
    </div>
  );
}
