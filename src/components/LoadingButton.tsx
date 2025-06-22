import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

function LoadingButton({
  isLoading,
  children,
  className = "",
  loadingText = "Loading...",
  ...rest
}: LoadingButtonProps) {
  return (
    <button
      {...rest}
      disabled={isLoading || rest.disabled}
      className={`button-primary disabled:opacity-50 ${className}`}
      aria-live="polite"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

export default LoadingButton;
