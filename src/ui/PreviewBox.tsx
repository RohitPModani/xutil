import type { CSSProperties, ReactNode } from 'react';
import { cn } from './cn';

export interface PreviewBoxProps {
  /** Height utility; defaults to `h-56`. */
  height?: string;
  className?: string;
  style?: CSSProperties;
  role?: string;
  'aria-label'?: string;
  children?: ReactNode;
}

/** The framed, centred area an image tool renders its result into. */
export function PreviewBox({ height = 'h-56', className, children, ...rest }: PreviewBoxProps) {
  return (
    <div
      className={cn('flex w-full items-center justify-center overflow-hidden rounded-md border border-line bg-surface p-2', height, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
