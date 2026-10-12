import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Github, Menu, Search } from 'lucide-react';
import { categoryById, toolById } from '../data/tools';
import { modKey } from '../utils/platform';
import { IconButton } from '../ui';
import { Logo } from './Sidebar';
import ThemeToggle from './ThemeToggle';

interface TopbarProps {
  onMenu: () => void;
  onSearch: () => void;
}

function Breadcrumb() {
  const { pathname } = useLocation();
  const tool = toolById.get(pathname.slice(1));
  if (!tool) return null;
  const category = categoryById.get(tool.category);
  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-xs sm:flex">
      <Link to="/" className="shrink-0 text-muted hover:text-ink">
        All tools
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0 text-muted" aria-hidden="true" />
      <span className="shrink-0 text-muted">{category?.title}</span>
      <ChevronRight className="h-3 w-3 shrink-0 text-muted" aria-hidden="true" />
      <span className="truncate font-medium text-ink" aria-current="page">
        {tool.name}
      </span>
    </nav>
  );
}

export function Topbar({ onMenu, onSearch }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-canvas/95 px-3 backdrop-blur sm:px-4 lg:px-6">
      <IconButton label="Open menu" className="lg:hidden" onClick={onMenu}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </IconButton>
      <Logo className="lg:hidden" />
      <div className="hidden h-5 w-px bg-line lg:hidden sm:block" aria-hidden="true" />
      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onSearch}
          className="hidden h-8 items-center gap-2 rounded-md border border-line bg-surface pl-2.5 pr-1.5 text-xs text-muted transition-colors duration-150 hover:border-control hover:text-ink sm:inline-flex"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Search tools
          <kbd aria-hidden="true">{modKey} K</kbd>
        </button>
        <IconButton label="Search tools" className="sm:hidden" onClick={onSearch}>
          <Search className="h-[18px] w-[18px]" aria-hidden="true" />
        </IconButton>
        <ThemeToggle />
        <a
          href="https://github.com/RohitPModani/xutil"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source on GitHub"
          title="Source on GitHub"
          className="hidden h-9 w-9 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-surface hover:text-ink sm:inline-flex lg:hidden"
        >
          <Github className="h-[18px] w-[18px]" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
