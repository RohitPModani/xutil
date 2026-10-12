import { useRouteError } from 'react-router-dom';
import { Button, Callout } from '../ui';

export default function ErrorBoundary() {
  const error: unknown = useRouteError();
  // Kept in the console for debugging; the raw message can leak internals and
  // rarely means anything to the person reading it.
  console.error('Route error:', error);

  return (
    <div className="mx-auto max-w-lg py-12">
      <h1 className="text-xl font-semibold tracking-tight text-ink">Something went wrong</h1>
      <Callout tone="error" className="mt-4">
        This tool hit an unexpected error. Reloading usually fixes it. If it keeps happening, please report it on GitHub.
      </Callout>
      <div className="mt-4 flex gap-2">
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <a href="https://github.com/RohitPModani/xutil/issues/new" target="_blank" rel="noopener noreferrer">
          <Button>Report on GitHub</Button>
        </a>
      </div>
    </div>
  );
}
