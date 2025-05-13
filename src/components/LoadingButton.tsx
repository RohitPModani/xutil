import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
  className? : string
}

function LoadingButton({ isLoading, children, className, ...rest }: LoadingButtonProps) {
  return (
    <button
      {...rest}
      disabled={isLoading || rest.disabled}
      className={`button-primary disabled:opacity-50 ${className}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

export default LoadingButton;