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
  className = "",
}: DownloadButtonProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [userFileName, setUserFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled =
    disabled ||
    (typeof content === "string" && content.trim() === "") ||
    (content instanceof Blob && content.size === 0);

  const getExtension = (fullName: string) => {
    const parts = fullName.split(".");
    return parts.length > 1 ? `.${parts.pop()}` : "";
  };

  const getFileNameWithoutExtension = (fullName: string) => {
    const ext = getExtension(fullName);
    return ext ? fullName.slice(0, -ext.length) : fullName;
  };

  const handleActualDownload = (finalNameWithoutExtension: string) => {
    const originalExtension = getExtension(fileName) || ".txt";
    const finalFileName = `${finalNameWithoutExtension}${originalExtension}`;
    const blob =
      content instanceof Blob
        ? content
        : new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
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
    if (e.key === "Enter") {
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
        className={`text-dim hover:text-dim dark:hover:text-faint focus:outline-none disabled:cursor-default disabled:opacity-50 ${className}`}
        title="Download converted file"
        aria-label="Download converted file"
        disabled={isDisabled}
      >
        <Download className="sm:w-6 sm:h-6 w-5 h-5 text-faint hover:text-ink transition-colors duration-100" />
      </button>

      {isPromptOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4 text-ink">
              Save As
            </h2>
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
              <span className="text-dim">
                {getExtension(fileName)}
              </span>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsPromptOpen(false)}
                className="button-quiet"
              >
                Cancel
              </button>
              <button
                onClick={handlePromptConfirm}
                className="button-primary"
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
