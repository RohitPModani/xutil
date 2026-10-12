import { useId, useRef, useState, type DragEvent } from 'react';
import { FileUp, X } from 'lucide-react';
import { Button, IconButton } from './Button';
import { Callout } from './Panel';
import { cn } from './cn';
import { formatSize } from './format';
import { matchesAccept } from './accept';

export interface FileDropProps {
  accept: string;
  onFile: (file: File) => void;
  onClear?: () => void;
  /** Controlled value. Pass `null` to clear the chip from outside. */
  file?: File | null;
  label?: string;
  /** Files above this size are rejected before they can lock up the tab. */
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

const describeAccept = (accept: string) =>
  accept
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => (r.endsWith('/*') ? `${r.slice(0, -2)} files` : r))
    .join(', ');

/**
 * Click or drop. Shows the chosen file's name and size, and a way to clear it.
 * Dropped files are checked against `accept` the same way picked ones are.
 */
export function FileDrop({ accept, onFile, onClear, file: controlled, label = 'Choose a file', maxSizeMB = 5, disabled, className }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState<File | null>(null);
  const file = controlled === undefined ? internal : controlled;
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const id = useId();

  const take = (f: File | undefined) => {
    if (!f) return;
    if (!matchesAccept(f, accept)) {
      setError(`That is a ${f.type || 'file of unknown type'}. Choose ${describeAccept(accept)}.`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`That file is ${formatSize(f.size)}. The limit is ${maxSizeMB} MB.`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError('');
    setInternal(f);
    onFile(f);
  };

  const clear = () => {
    setInternal(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 1) setError(`Only the first of ${files.length} files is used.`);
    take(files?.[0]);
  };

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex min-h-12 flex-wrap items-center gap-3 rounded-md border border-dashed px-3 py-2 transition-colors duration-150',
          over ? 'border-primary bg-surface' : 'border-control/70',
          disabled && 'opacity-60'
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          aria-label={label}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            take(e.target.files?.[0]);
            // Reset so picking the same file again still fires onChange.
            e.target.value = '';
          }}
        />
        {file ? (
          <>
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink" title={file.name}>
              {file.name}
              <span className="ml-2 text-muted">{formatSize(file.size)}</span>
            </span>
            <IconButton label="Remove file" size="sm" onClick={clear} disabled={disabled}>
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </>
        ) : (
          <>
            <Button
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              icon={<FileUp className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              {label}
            </Button>
            <span className="text-xs text-muted">
              or drop it here · {accept ? `${accept.replace(/\./g, '').replace(/,/g, ', ')} · ` : ''}up to {maxSizeMB} MB
            </span>
          </>
        )}
      </div>
      {error && (
        <Callout tone="error" className="mt-2">
          {error}
        </Callout>
      )}
    </div>
  );
}
