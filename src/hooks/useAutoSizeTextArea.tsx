import { useLayoutEffect, useRef } from 'react';

interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

const AutoTextarea = ({ value, className = '', ...props }: AutoTextareaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const ta = textAreaRef.current;
    if (ta) {
      ta.style.height = 'auto'; // Reset height
      ta.style.height = `${ta.scrollHeight}px`; // Grow dynamically
    }
  }, [value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      {...props}
      className={`resize-none overflow-y-auto max-h-[30rem] ${className}`} // 🚀 Increased
      style={{ whiteSpace: 'pre', overflowX: 'auto' }} // 🔥
    />
  );
};

export default AutoTextarea;
