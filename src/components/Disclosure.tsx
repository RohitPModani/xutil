import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface DisclosureProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Collapsible long-form prose. Shared by the tool-page explainers and the
 * site blurb on the index, which had drifted into two near-identical
 * implementations with different chevron directions.
 */
export default function Disclosure({
  title,
  children,
  defaultOpen = false,
  className = "",
}: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const [maxHeight, setMaxHeight] = useState<string | number>(
    defaultOpen ? "auto" : 0
  );

  useEffect(() => {
    const scrollHeight = contentRef.current?.scrollHeight ?? 0;
    if (isOpen) {
      setMaxHeight(scrollHeight);
      // Settle on auto so the panel can reflow if the content changes.
      const timeout = setTimeout(() => setMaxHeight("auto"), 300);
      return () => clearTimeout(timeout);
    }
    setMaxHeight(scrollHeight);
    const frame = requestAnimationFrame(() => setMaxHeight(0));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return (
    <section className={`card ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
      >
        <h2 className="section-title">{title}</h2>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-faint transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={contentId}
        ref={contentRef}
        style={{ overflow: "hidden", transition: "max-height 0.3s ease", maxHeight }}
      >
        <div className="px-4 sm:px-5 pb-5 prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-result">
          <ReactMarkdown>{children as string}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
