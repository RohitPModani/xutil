import { useLayoutEffect, useRef } from "react";

interface AutoTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  className?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

/**
 * A textarea that grows with its content.
 *
 * While the field is empty the height is left to `rows`. Measuring an empty
 * textarea reports the height of its *placeholder* laid out one character per
 * line - on the JWT page that came to 1080px - so an empty field opened as a
 * wall of blank space. Once there is a value the placeholder is gone and
 * scrollHeight measures what it claims to.
 */
const AutoTextarea = ({
  value,
  className = "",
  ref,
  rows = 3,
  ...props
}: AutoTextareaProps) => {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef = (ref || innerRef) as React.RefObject<HTMLTextAreaElement>;

  useLayoutEffect(() => {
    const ta = textAreaRef.current;
    if (!ta) return;
    if (!value) {
      ta.style.height = "";
      return;
    }
    ta.style.height = "0px";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [value, textAreaRef]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      rows={rows}
      className={`resize-none overflow-y-auto max-h-[30rem] scrollbar-thin scrollbar-thumb-line scrollbar-track-transparent ${className}`}
      {...props}
    />
  );
};

export default AutoTextarea;
