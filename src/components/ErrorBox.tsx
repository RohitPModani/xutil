interface ErrorBoxProps {
    message: string | null;
    id?: string | null;
  }
  
  function ErrorBox({ message, id }: ErrorBoxProps) {
    if (!message) return null;
    return (
      <div className="mt-4 p-2 sm:p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded" id={id || undefined}>
        Error: {message}
      </div>
    );
  }
  
  export default ErrorBox;  