import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { sectionInfo } from '../data/sectionInfo'; 

// Props for InfoDialog
interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

// InfoDialog component for displaying section information
const InfoDialog: React.FC<InfoDialogProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-labelledby="dialog-title"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg p-4 max-w-md w-full mx-4 shadow-lg relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title and Close Button Row */}
        <div className="flex items-center justify-between mb-2">
          <h3 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white focus:outline-none transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <hr className='line-break'/>
  
        {/* Dialog Content */}
        <p className="text-sm text-zinc-800 dark:text-zinc-200">{content}</p>
      </div>
    </div>
  );
};

// Props for InfoSection
interface InfoSectionProps {
  sectionKey: string;
}

// InfoSection component to manage dialog state and render info button
const InfoSection: React.FC<InfoSectionProps> = ({ sectionKey }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');

  // Handle info icon click
  const handleInfoClick = () => {
    if (sectionInfo[sectionKey]) {
      setDialogTitle(sectionInfo[sectionKey].title);
      setDialogContent(sectionInfo[sectionKey].content);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInfoClick}
        aria-label={`Information about ${sectionInfo[sectionKey]?.title || 'section'}`}
        title={`Learn more about ${sectionInfo[sectionKey]?.title || 'section'}`}
      >
        <Info className="w-5 h-5" />
      </button>
      <InfoDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={dialogTitle}
        content={dialogContent}
      />
    </>
  );
};

export default InfoSection;