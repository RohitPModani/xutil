import { ReactNode, useRef, useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AboutUsSectionProps {
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  title?: string;
}

export default function AboutUsSection({
  children,
  defaultOpen = false,
  className = "",
  title = "What's all the hype about XUtil?",
}: AboutUsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);

  // Handle height transitions smoothly
  useEffect(() => {
    if (!contentRef.current) return;

    setAnimating(true);
    const element = contentRef.current;

    if (isOpen) {
      element.style.maxHeight = "0";
      element.style.maxHeight = `${element.scrollHeight}px`;
    } else {
      element.style.maxHeight = `${element.scrollHeight}px`;
      requestAnimationFrame(() => {
        element.style.maxHeight = "0";
      });
    }

    const cleanup = () => {
      if (isOpen && element) {
        element.style.maxHeight = "none";
      }
      setAnimating(false);
    };

    const transitionEnd = () => cleanup();
    element.addEventListener("transitionend", transitionEnd);

    // Fallback cleanup
    const timer = setTimeout(cleanup, 300);

    return () => {
      element.removeEventListener("transitionend", transitionEnd);
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Handle keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <section
      className={`mb-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white shadow-lg rounded-lg sm:p-6 p-4 ${className}`}
      aria-labelledby="about-section-header"
    >
      <div
        id="about-section-header"
        tabIndex={0}
        onClick={() => !animating && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        role="button"
        aria-expanded={isOpen}
        aria-controls="about-section-content"
        className="flex justify-between items-center cursor-pointer select-none"
        style={{
          transition: "margin-bottom 300ms ease",
          marginBottom: isOpen ? "1rem" : "0px",
        }}
      >
        <h3 className="text-md sm:text-lg font-semibold m-0">{title}</h3>
        <ChevronUp
          className={`w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 dark:text-zinc-400 transition-transform duration-300 ${
            isOpen ? "" : "rotate-180"
          }`}
          aria-hidden="true"
        />
      </div>

      <div
        id="about-section-content"
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="prose prose-md dark:prose-invert max-w-none input-field pt-2">
          <ReactMarkdown>{children as string}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
