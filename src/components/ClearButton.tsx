import { Eraser, XCircle } from 'lucide-react';
import { useState } from 'react';
import { showSuccess } from '../utils/toast';

interface ClearButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

function ClearButton({ onClick, className = '', disabled = false }: ClearButtonProps) {
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    if (disabled || cleared) return;
    onClick();
    showSuccess('Cleared all values!');
    setCleared(true);
    setTimeout(() => setCleared(false), 1000);
  };

  return (
    <button
      onClick={handleClear}
      disabled={disabled || cleared}
      className={`p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white focus:outline-none disabled:cursor-default disabled:opacity-50 ${className}`}
      aria-label="Clear all values"
      title='Clear contents'
    >
      {cleared ? (
        <XCircle className="sm:w-6 sm:h-6 w-5 h-5 text-gray-500 dark:text-gray-400" />
      ) : (
        <Eraser className="sm:w-6 sm:h-6 w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-100" />
      )}
    </button>
  );
}

export default ClearButton;