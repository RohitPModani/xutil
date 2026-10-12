import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { isModK } from '../utils/platform';
import { Sidebar, SidebarContent } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { RequestToolDialog } from './RequestToolDialog';

/** Mirrors a tool page's shape while its chunk loads, so nothing jumps. */
function RouteSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-6 w-56 rounded bg-surface" />
        <div className="h-4 w-80 max-w-full rounded bg-surface" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-md border border-line bg-panel" />
        <div className="h-48 rounded-md border border-line bg-panel" />
      </div>
    </div>
  );
}

function Drawer({ open, onClose, onRequest }: { open: boolean; onClose: () => void; onRequest: () => void }) {
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
      className="drawer m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r border-line bg-surface p-0 text-ink"
    >
      {open && <SidebarContent onClose={onClose} onRequest={onRequest} />}
    </dialog>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isModK(e)) return;
      e.preventDefault();
      setPaletteOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const openRequest = () => {
    setDrawerOpen(false);
    setRequestOpen(true);
  };

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-line focus:bg-panel focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <Sidebar onRequest={openRequest} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onRequest={openRequest} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setDrawerOpen(true)} onSearch={() => setPaletteOpen(true)} />

        <main id="main" className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div key={pathname} className="page-enter mx-auto w-full max-w-6xl">
            <Suspense fallback={<RouteSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-3 text-xs text-muted sm:px-6 lg:px-8">
          <span>Everything runs in your browser. Nothing you paste is sent anywhere.</span>
          <span className="ml-auto flex items-center gap-4">
            <button type="button" onClick={openRequest} className="hover:text-ink">
              Request a tool
            </button>
            <a href="https://buymeacoffee.com/rohitmodani" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Buy me a coffee
            </a>
          </span>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <RequestToolDialog open={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}
