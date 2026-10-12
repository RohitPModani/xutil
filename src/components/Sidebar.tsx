import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Cog, Github, Search, X } from 'lucide-react';
import { categories, describeTool, toolPath, toolsInCategory, tools, type Tool } from '../data/tools';
import { searchTools } from '../data/search';
import { IconButton } from '../ui';
import { cn } from '../ui/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink', className)}>
      <Cog className="h-5 w-5 text-primary" aria-hidden="true" />
      XUtil
    </Link>
  );
}

interface SidebarContentProps {
  /** Present when rendered inside the mobile drawer. */
  onClose?: () => void;
  onRequest: () => void;
}

/**
 * The tool list that is always on screen at desktop width and a drawer on a
 * phone. Typing filters it in place; Enter opens the first match.
 */
export function SidebarContent({ onClose, onRequest }: SidebarContentProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (query.trim() ? searchTools(query) : null), [query]);

  // Keep the current tool visible when arriving from the index or the palette.
  useEffect(() => {
    if (results) return;
    const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [pathname, results]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && results?.[0]) {
      e.preventDefault();
      navigate(toolPath(results[0]));
      setQuery('');
      onClose?.();
    } else if (e.key === 'Escape' && query) {
      e.preventDefault();
      setQuery('');
    }
  };

  const row = (tool: Tool) => (
    <NavLink
      key={tool.id}
      to={toolPath(tool)}
      onClick={() => {
        setQuery('');
        onClose?.();
      }}
      aria-label={describeTool(tool)}
      className={({ isActive }) =>
        cn(
          'flex h-8 items-center gap-2 border-l-2 pl-4 pr-2 text-sm transition-colors duration-150 ease-out',
          isActive
            ? 'border-primary bg-canvas font-semibold text-ink'
            : 'border-transparent text-ink hover:bg-canvas'
        )
      }
    >
      <span className="truncate">{tool.name}</span>
    </NavLink>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
        <Logo />
        {onClose && (
          <IconButton label="Close menu" size="sm" className="ml-auto" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        )}
      </div>

      <div className="relative p-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Filter ${tools.length} tools`}
          aria-label="Filter tools"
          className="control h-9 pl-7 text-sm"
        />
      </div>

      <nav ref={navRef} aria-label="Tools" className="thin-scroll flex-1 overflow-y-auto pb-3">
        {results ? (
          results.length ? (
            <div role="list" aria-live="polite">
              {results.map(row)}
            </div>
          ) : (
            <p className="px-4 py-6 text-sm text-muted">No tool matches “{query}”.</p>
          )
        ) : (
          categories.map((c, i) => (
            <div key={c.id} className={cn(i > 0 && 'mt-3 border-t border-line pt-2')}>
              <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{c.title}</p>
              {toolsInCategory(c.id).map(row)}
            </div>
          ))
        )}
      </nav>

      <div className="flex items-center gap-1 border-t border-line p-2">
        <button
          type="button"
          onClick={onRequest}
          className="h-8 flex-1 rounded-md px-2 text-left text-sm font-medium text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink"
        >
          Request a tool
        </button>
        <a
          href="https://github.com/RohitPModani/xutil"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source on GitHub"
          title="Source on GitHub"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarContentProps) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-surface lg:block">
      <SidebarContent {...props} />
    </aside>
  );
}
