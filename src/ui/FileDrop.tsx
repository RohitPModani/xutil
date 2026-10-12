import { useId, useRef, useState, type DragEvent } from 'react';
import { FileUp, X } from 'lucide-react';
import { Button, IconButton } from './Button';
import { Callout } from './Panel';
import { cn } from './cn';
import { formatSize } from './format';

export interface FileDropProps {
  accept: string;
  onFile: (file: File) => void;
  onClear?: () => void;
  label?: string;
  /** Files above this size are rejected before they can lock up the tab. */
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Click or drop. Shows the chosen file's name and size, and a way to clear it.
 */
export function FileDrop({ accept, onFile, onClear, label = 'Choose a file', maxSizeMB = 5, disabled, className }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const id = useId();

  const take = (f: File | undefined) => {
    if (!f) return;
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`That file is ${formatSize(f.size)}. The limit is ${maxSizeMB} MB.`);
      return;
    }
    setError('');
    setFile(f);
    onFile(f);
  };

  const clear = () => {
    setFile(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    take(e.dataTransfer.files?.[0]);
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
          className="sr-only"
          disabled={disabled}
          onChange={(e) => take(e.target.files?.[0])}
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
              or drop it here · {accept.replace(/\./g, '').replace(/,/g, ', ')} · up to {maxSizeMB} MB
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

