import { useLayoutEffect, useRef } from 'react';

interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  className?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

const AutoTextarea = ({ value, className = '', ref, ...props }: AutoTextareaProps) => {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = ref || innerRef;

  useLayoutEffect(() => {
    const ta = (textAreaRef as React.RefObject<HTMLTextAreaElement>).current;
    if (ta) {
      ta.style.height = 'auto'; // Reset height
      ta.style.height = `${ta.scrollHeight}px`; // Grow dynamically
    }
  }, [value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      className={`resize-none scrollbox max-h-[30rem] ${className}`}
      style={{ whiteSpace: 'pre-wrap' }}
      {...props}
    />
  );
};

export default AutoTextarea;