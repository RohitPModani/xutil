import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { cn } from './cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Native <dialog>: focus trapping, Escape and the backdrop come free from the
 * browser, which is the whole reason to use it over a div with a z-index.
 */
export function Dialog({ open, onClose, title, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        'w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-panel p-0 text-ink shadow-xl',
        className
      )}
    >
      {open && (
        <div className="p-5">
          {title && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{title}</h2>
              <IconButton label="Close" size="sm" onClick={onClose}>
                <X className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </div>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}
