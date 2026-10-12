import { useState } from 'react';
import { Check, Copy, Download, Eraser, RefreshCw } from 'lucide-react';
import { Button, type ButtonProps } from './Button';
import { useFlash } from './useFlash';
import { downloadBlob } from '../utils/download';

interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  text: string;
  /** Label while idle. Defaults to "Copy". */
  label?: string;
  /** Icon only, for tight rows. */
  compact?: boolean;
}

export function CopyButton({ text, label = 'Copy', compact, variant = 'ghost', size = 'sm', ...rest }: CopyButtonProps) {
  const [copied, flash] = useFlash();
  const [failed, setFailed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setFailed(false);
      flash();
    } catch {
      setFailed(true);
    }
  };

  const Icon = copied ? Check : Copy;
  const title = failed ? 'Copy failed' : copied ? 'Copied' : label;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={copy}
      disabled={!text}
      aria-label={compact ? title : undefined}
      title={compact ? title : undefined}
      icon={<Icon className={copied ? 'h-3.5 w-3.5 text-success' : 'h-3.5 w-3.5'} aria-hidden="true" />}
      {...rest}
    >
      {!compact && <span aria-live="polite">{title}</span>}
    </Button>
  );
}

interface DownloadButtonProps extends Omit<ButtonProps, 'onClick' | 'children' | 'content'> {
  content: string | Blob;
  fileName: string;
  mime?: string;
  label?: string;
  compact?: boolean;
}

export function DownloadButton({
  content,
  fileName,
  mime = 'text/plain',
  label = 'Download',
  compact,
  variant = 'ghost',
  size = 'sm',
  ...rest
}: DownloadButtonProps) {
  const empty = typeof content === 'string' ? !content : content.size === 0;

  const download = () => downloadBlob(content, fileName, mime);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={download}
      disabled={empty}
      aria-label={compact ? label : undefined}
      title={compact ? `${label} ${fileName}` : fileName}
      icon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
      {...rest}
    >
      {!compact && label}
    </Button>
  );
}

interface ClearButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  onClick: () => void;
  label?: string;
}

export function ClearButton({ onClick, label = 'Clear', variant = 'ghost', size = 'sm', ...rest }: ClearButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      icon={<Eraser className="h-3.5 w-3.5" aria-hidden="true" />}
      {...rest}
    >
      {label}
    </Button>
  );
}

interface RegenerateButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  onClick: () => void;
  label?: string;
}

/** For generators: the primary action that produces a fresh value. */
export function GenerateButton({ onClick, label = 'Generate', variant = 'primary', ...rest }: RegenerateButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
      {...rest}
    >
      {label}
    </Button>
  );
}
