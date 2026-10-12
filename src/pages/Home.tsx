import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { categories, describeTool, toolById, toolPath, toolsInCategory, tools, type Tool } from '../data/tools';
import { searchTools } from '../data/search';
import { clearToolUsage, mostUsedTools } from '../utils/toolUsage';
import { modKey } from '../utils/platform';
import { PageSEO } from '../components/PageSEO';
import { Signature } from '../components/Signature';
import { IconButton } from '../ui';

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to={toolPath(tool)}
      aria-label={describeTool(tool)}
      className="flex min-w-0 flex-col gap-1 rounded-md border border-line bg-panel px-4 py-3 transition-colors duration-150 ease-out hover:border-control"
    >
      <span className="text-[15px] font-semibold leading-snug text-ink">{tool.name}</span>
      <Signature tool={tool} className="text-xs" />
      <span className="text-sm leading-snug text-muted">{tool.blurb}</span>
    </Link>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentIds(mostUsedTools());
    // Focus the search where there is a keyboard; on a phone this would pop
    // the keyboard over the list.
    if (window.matchMedia('(hover: hover)').matches) inputRef.current?.focus();
  }, []);

  const results = useMemo(() => (query.trim() ? searchTools(query) : null), [query]);
  const recent = recentIds.map((id) => toolById.get(id)).filter((t): t is Tool => Boolean(t));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && results?.[0]) {
      e.preventDefault();
      navigate(toolPath(results[0]));
    } else if (e.key === 'Escape' && query) {
      e.preventDefault();
      setQuery('');
    }
  };

  return (
    <>
      <PageSEO
        title="XUtil | Developer Tools"
        description="Free developer tools that run in your browser: JWT decoder, JSON formatter, converters, generators. No ads, no tracking, no signup."
      />

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {tools.length} developer tools, all in your browser
        </h1>
        <p className="mt-2 text-muted">
          Nothing you paste leaves this tab. Pick a tool below, or press <kbd>{modKey} K</kbd> from any page.
        </p>
        <div className="relative mt-4 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search by name or format, like base64 or cron"
            aria-label="Search tools"
            className="control h-11 pl-9 pr-9 text-[15px]"
          />
          {query && (
            <IconButton label="Clear search" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2" onClick={() => setQuery('')}>
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </header>

      {results ? (
        <section aria-live="polite">
          <p className="mb-3 text-sm text-muted">
            <span className="font-semibold text-ink">{results.length}</span> {results.length === 1 ? 'match' : 'matches'}
            {results.length > 0 && <span className="ml-2">· ↵ opens the first</span>}
          </p>
          {results.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-line px-4 py-10 text-center">
              <p className="text-ink">No tool matches “{query}”.</p>
              <p className="mt-1 text-sm text-muted">Try the format you have or want, like <span className="font-mono">yaml</span> or <span className="font-mono">hex</span>.</p>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-10">
          {recent.length > 0 && (
            <section aria-labelledby="recent-heading">
              <div className="mb-3 flex items-baseline gap-3">
                <h2 id="recent-heading" className="text-base font-semibold text-ink">
                  Recent
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    clearToolUsage();
                    setRecentIds([]);
                  }}
                  className="text-sm text-muted hover:text-ink"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((t) => (
                  <Link
                    key={t.id}
                    to={toolPath(t)}
                    className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm text-ink transition-colors duration-150 hover:border-control"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {categories.map((c) => {
            const items = toolsInCategory(c.id);
            return (
              <section key={c.id} aria-labelledby={`cat-${c.id}`}>
                <div className="mb-3 flex items-baseline gap-2">
                  <h2 id={`cat-${c.id}`} className="text-base font-semibold text-ink">
                    {c.title}
                  </h2>
                  <span className="font-mono text-xs text-muted">{items.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((t) => (
                    <ToolCard key={t.id} tool={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
