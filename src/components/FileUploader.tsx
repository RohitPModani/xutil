// src/components/FileUploader.tsx
import { useRef, useState, useEffect } from 'react';
import { File, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  onClear?: () => void;
  accept: string;
  label: string;
  disabled?: boolean;
  resetSignal?: number;
}

const FileUploader = ({
  onFileSelected,
  onClear,
  accept,
  label,
  disabled = false,
  resetSignal,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  const handleClear = () => {
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
    if (onClear) onClear();
  };

  useEffect(() => {
    // Triggered when resetSignal changes from parent
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  }, [resetSignal]);

  return (
    <div className="flex items-center gap-3 flex-wrap mt-4">
      {/* Button-style label */}
      <label
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full border border-zinc-300 dark:border-zinc-600 
        bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white text-sm sm:text-base font-medium 
        shadow-sm hover:shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700 
        cursor-pointer transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <File className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{label}</span>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {fileName && (
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-full text-sm sm:text-base text-zinc-800 dark:text-white max-w-xs">
          <span className="truncate">{fileName}</span>
          <button
            onClick={handleClear}
            className="hover:text-zinc-800 dark:hover:text-white transition"
            type="button"
            aria-label="Clear file"
          >
            <X className="sm:w-4 sm:h-4 w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;