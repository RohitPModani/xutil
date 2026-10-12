import { Link } from 'react-router-dom';
import { PageSEO } from '../components/PageSEO';
import { Button } from '../ui';

export default function NotFound() {
  return (
    <>
      <PageSEO title="Page not found | XUtil" description="That page does not exist. Browse the full list of developer tools." />
      <div className="py-16 text-center">
        <p className="font-mono text-xs text-muted">404</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">That page does not exist.</h1>
        <p className="mt-2 text-sm text-muted">The tool may have moved, or the address has a typo in it.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="primary">Browse all tools</Button>
        </Link>
      </div>
    </>
  );
}
