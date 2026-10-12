import type { Tool } from '../data/tools';
import { cn } from '../ui/cn';

/** `jwt → header · payload`. Hidden from screen readers; `describeTool` says it in words. */
export function Signature({ tool, className }: { tool: Tool; className?: string }) {
  return (
    <span className={cn('font-mono text-xs text-muted', className)} aria-hidden="true">
      {tool.in && <span>{tool.in}</span>}
      <span className={tool.in ? 'px-1.5' : 'pr-1.5'}>{tool.dir === 'both' ? '⇄' : '→'}</span>
      <span>{tool.out}</span>
    </span>
  );
}
