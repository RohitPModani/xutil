import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
}

function LoadingButton({ isLoading, children, ...rest }: LoadingButtonProps) {
  return (
    <button
      {...rest}
      disabled={isLoading || rest.disabled}
      className="button-primary disabled:opacity-50"
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

export default LoadingButton;