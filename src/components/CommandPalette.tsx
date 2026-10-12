import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categoryById, toolById, toolPath, tools, type Tool } from '../data/tools';
import { searchTools } from '../data/search';
import { mostUsedTools } from '../utils/toolUsage';
import { Signature } from './Signature';
import { cn } from '../ui/cn';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

/**
 * ⌘K from anywhere. Recent tools first when the query is empty, ranked
 * matches otherwise; arrows move, Enter opens, Escape closes.
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      setQuery('');
      setActive(0);
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  const sections = useMemo<{ title: string; items: Tool[] }[]>(() => {
    if (query.trim()) return [{ title: 'Results', items: searchTools(query) }];
    const recent = mostUsedTools()
      .map((id) => toolById.get(id))
      .filter((t): t is Tool => Boolean(t));
    const rest = tools.filter((t) => !recent.includes(t));
    return [
      ...(recent.length ? [{ title: 'Recent', items: recent }] : []),
      { title: 'All tools', items: rest },
    ];
  }, [query]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (tool: Tool) => {
    navigate(toolPath(tool));
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === 'Enter' && flat[active]) {
      e.preventDefault();
      go(flat[active]);
    }
  };

  let index = -1;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="mt-[12vh] w-[calc(100%-2rem)] max-w-lg rounded-lg border border-line bg-panel p-0 text-ink shadow-xl"
    >
      {open && (
        <div onKeyDown={onKeyDown}>
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tools.length} tools`}
              aria-label="Search tools"
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-list"
              aria-activedescendant={flat[active] ? `palette-${flat[active].id}` : undefined}
              autoComplete="off"
              className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
            />
          </div>

          <ul id="palette-list" ref={listRef} role="listbox" className="thin-scroll max-h-[55vh] overflow-y-auto p-1">
            {flat.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No tool matches “{query}”.</li>}
            {sections.map((s) =>
              s.items.length ? (
                <li key={s.title} role="presentation">
                  <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{s.title}</p>
                  <ul role="group" aria-label={s.title}>
                    {s.items.map((tool) => {
                      index += 1;
                      const i = index;
                      const selected = i === active;
                      return (
                        <li
                          key={tool.id}
                          id={`palette-${tool.id}`}
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => go(tool)}
                          className={cn(
                            'flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5',
                            selected ? 'bg-surface text-ink' : 'text-ink'
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm">{tool.name}</span>
                            <Signature tool={tool} className="block truncate text-[11px]" />
                          </span>
                          <span className="shrink-0 text-[11px] text-muted">{categoryById.get(tool.category)?.title}</span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ) : null
            )}
          </ul>

          <p className="border-t border-line px-3 py-1.5 text-[11px] text-muted" aria-hidden="true">
            <kbd>↑</kbd> <kbd>↓</kbd> move · <kbd>↵</kbd> open · <kbd>esc</kbd> close
          </p>
        </div>
      )}
    </dialog>
  );
}
