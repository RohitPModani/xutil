import { Copy, ClipboardCopy, ListCheck, CircleCheckBig } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';

interface CopyButtonProps {
  text: string;
  copyType?: string;
  className?: string;
  onCopied?: () => void;
}

function CopyButton({ text, copyType = '', className = '', onCopied }: CopyButtonProps) {
  const { copy, copied, copiedAll } = useClipboard();

  const handleCopy = async () => {
    const options = copyType === 'CopyAll' ? { all: true } : undefined;
    await copy(text, options);
    if (onCopied) onCopied();
  };

  const isEmpty = !text.trim(); 
  const isCopied = copyType === 'CopyAll' ? copiedAll : copied;
  const isDisabled = isEmpty || isCopied;

  return (
    <button
      onClick={handleCopy}
      disabled={isDisabled}
      className={`p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white focus:outline-none disabled:cursor-default disabled:opacity-50 ${className}`}
      aria-label="Copy"
      title='Copy'
    >
      {copyType === 'CopyAll' ? (
        copiedAll ? (
          <ListCheck className="sm:w-7 sm:h-7 w-6 h-6 text-zinc-500 dark:text-zinc-400" />
        ) : (
          <ClipboardCopy className="sm:w-7 sm:h-7 w-6 h-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors duration-100" />
        )
      ) : copied ? (
        <CircleCheckBig className="sm:w-5 sm:h-5 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      ) : (
        <Copy className="sm:w-5 sm:h-5 w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors duration-100" />
      )}
    </button>
  );
}

export default CopyButton;