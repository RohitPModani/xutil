import { useRouteError } from "react-router-dom";

function ErrorBoundary() {
  const error: unknown = useRouteError();

  // Kept in the console for debugging; the raw message is not shown to users,
  // since it can leak internal detail and rarely means anything to them.
  console.error("Route error:", error);

  return (
    <div className="max-w-4xl mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
        Something went wrong
      </h1>
      <p className="mt-4 text-dim">
        An unexpected error occurred. Please try again or contact support.
      </p>
      <p className="mt-2 text-dim">
        If this keeps happening, please report it on GitHub.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="button-primary mt-6"
      >
        Reload Page
      </button>
    </div>
  );
}

export default ErrorBoundary;
