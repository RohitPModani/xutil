import { useRouteError } from 'react-router-dom';

function ErrorBoundary() {
  const error: any = useRouteError();

  return (
    <div className="max-w-4xl mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
        Something went wrong
      </h1>
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        An unexpected error occurred. Please try again or contact support.
      </p>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Error: {error?.message || 'Unknown error'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
  );
}

export default ErrorBoundary;