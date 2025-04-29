import { ReactNode, useRef, useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface SEODescriptionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function SEODescription({
  title,
  children,
  defaultOpen = false,
  className = ''
}: SEODescriptionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [contentHeight, setContentHeight] = useState<string | number>(defaultOpen ? 'auto' : 0);
  const [headerMargin, setHeaderMargin] = useState(defaultOpen ? '1rem' : '0px');

  useEffect(() => {
    if (isOpen) {
      const scrollHeight = contentRef.current?.scrollHeight ?? 0;
      setContentHeight(scrollHeight);
      const timeout = setTimeout(() => setContentHeight('auto'), 300);
      setHeaderMargin('1rem');
      return () => clearTimeout(timeout);
    } else {
      const scrollHeight = contentRef.current?.scrollHeight ?? 0;
      setContentHeight(scrollHeight);
      requestAnimationFrame(() => setContentHeight(0));
      setHeaderMargin('0px');
    }
  }, [isOpen]);

  return (
    <div className={`mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-lg rounded-lg sm:p-6 p-4 ${className}`}>
      <div
        ref={headerRef}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: headerMargin,
          transition: 'margin-bottom 300ms ease',
          cursor: 'pointer',
        }}
        aria-expanded={isOpen}
      >
        <h3 className="sm:text-lg text-md font-semibold">What is {title}?</h3>
        <ChevronUp
          className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      <div
        ref={contentRef}
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
          maxHeight: contentHeight,
          opacity: isOpen ? 1 : 0
        }}
      >
        <div className="input-field">{children}</div>
      </div>
    </div>
  );
}