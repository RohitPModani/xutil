import { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  content: string | Blob;
  fileName: string;
  fileType: string; // Full MIME type
  disabled?: boolean;
  className?: string;
}

function DownloadButton({
  content,
  fileName,
  fileType,
  disabled = false,
  className = '',
}: DownloadButtonProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [userFileName, setUserFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled =
    disabled ||
    (typeof content === 'string' && content.trim() === '') ||
    (content instanceof Blob && content.size === 0);

  const getExtension = (fullName: string) => {
    const parts = fullName.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  };

  const getFileNameWithoutExtension = (fullName: string) => {
    const ext = getExtension(fullName);
    return ext ? fullName.slice(0, -ext.length) : fullName;
  };

  const handleActualDownload = (finalNameWithoutExtension: string) => {
    const originalExtension = getExtension(fileName) || '.txt';
    const finalFileName = `${finalNameWithoutExtension}${originalExtension}`;
    const blob = content instanceof Blob ? content : new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadClick = () => {
    setUserFileName(getFileNameWithoutExtension(fileName));
    setIsPromptOpen(true);
  };

  const handlePromptConfirm = () => {
    if (userFileName.trim()) {
      handleActualDownload(userFileName.trim());
    } else {
      handleActualDownload(getFileNameWithoutExtension(fileName));
    }
    setIsPromptOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePromptConfirm();
    }
  };

  useEffect(() => {
    if (isPromptOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isPromptOpen]);

  return (
    <>
      <button
        onClick={handleDownloadClick}
        className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none disabled:cursor-default disabled:opacity-50 ${className}`}
        title="Download converted file"
        aria-label="Download converted file"
        disabled={isDisabled}
      >
        <Download className="sm:w-6 sm:h-6 w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors duration-100" />
      </button>

      {isPromptOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Save As</h2>
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={userFileName}
                onChange={(e) => setUserFileName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field flex-1 mr-2"
                placeholder="File name"
              />
              <span className="text-gray-600 dark:text-gray-300">{getExtension(fileName)}</span>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsPromptOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePromptConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DownloadButton;
