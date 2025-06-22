import { AlertCircle } from "lucide-react";

interface ErrorBoxProps {
  message: string | null;
  id?: string | null;
}

function ErrorBox({ message, id }: ErrorBoxProps) {
  if (!message) return null;
  return (
    <div
      className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg shadow-sm animate-slideIn"
      id={id || undefined}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm sm:text-base">Error</p>
          <p className="text-sm sm:text-base mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default ErrorBox;
