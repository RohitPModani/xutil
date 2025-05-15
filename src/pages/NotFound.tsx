import { GitHub } from "react-feather";
import BackToHome from "../components/BackToHome";

function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-2 py-4 sm:py-8 sm:px-4">
      <div className="text-center mb-4 sm:mb-8">
        <BackToHome />
      </div>
      <div className="max-w-md mx-auto p-8 text-center bg-white dark:bg-zinc-800 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-white">404 - Page Not Found</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Here's what you can do:
          </p>
          <ul className="space-y-2 text-zinc-600 dark:text-zinc-300 text-left max-w-xs mx-auto">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Check the URL for typos</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Go back to the homepage</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Request this page if you believe it should exist</span>
            </li>
          </ul>
        </div>

        <a
          href="https://github.com/RohitPModani/xutil/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 sm:mt-8 inline-flex items-center justify-center button-primary"
        >
          <GitHub className="w-5 h-5 mr-2" />
          Request on GitHub
        </a>
      </div>
    </div>
  );
}

export default NotFound;