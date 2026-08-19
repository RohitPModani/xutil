import { AlertCircle } from "lucide-react";

interface ErrorBoxProps {
  message: string | null;
  id?: string | null;
}

/**
 * Says what went wrong, in the interface's voice. No apology, no mood - the
 * message itself carries the fix.
 */
function ErrorBox({ message, id }: ErrorBoxProps) {
  if (!message) return null;
  return (
    <div
      className="mt-4 p-3 rounded-md border border-l-2 bg-raised border-line"
      style={{ borderLeftColor: "rgb(var(--alert))" }}
      id={id || undefined}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle
          className="w-4 h-4 shrink-0 mt-0.5 text-alert"
          aria-hidden="true"
        />
        <p className="text-sm text-ink">{message}</p>
      </div>
    </div>
  );
}

export default ErrorBox;
