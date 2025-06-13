import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

interface UtilityItem {
  name: string;
  path?: string;
}

interface UtilityCardProps {
  title: string;
  icon: React.ElementType;
  items: (string | UtilityItem)[];
}

function UtilityCard({ title, icon: Icon, items }: UtilityCardProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<string | number>("auto");

  useEffect(() => {
    if (window.innerWidth >= 640) {
      // Always open on desktop
      setIsOpen(true);
      setContentHeight("auto");
      return;
    }

    if (isOpen) {
      const scrollHeight = contentRef.current?.scrollHeight ?? 0;
      setContentHeight(scrollHeight);
      const timeout = setTimeout(() => setContentHeight("auto"), 300);
      return () => clearTimeout(timeout);
    } else {
      const scrollHeight = contentRef.current?.scrollHeight ?? 0;
      setContentHeight(scrollHeight);
      requestAnimationFrame(() => setContentHeight(0));
    }
  }, [isOpen]);

  const handleImplementedClick = (path: string, toolName: string) => {
    sessionStorage.setItem("lastClickedTool", toolName);
    navigate(path);
  };

  return (
    <div className="card shadow-md rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white hover:border-zinc-400 dark:hover:border-zinc-500 group">
      {/* Header */}
      <div
        onClick={() => {
          if (window.innerWidth < 640) setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        role="button"
        className="flex items-center justify-between sm:cursor-default cursor-pointer sm:mb-4"
        style={{
          marginBottom:
            window.innerWidth < 640 ? (isOpen ? "1rem" : "0px") : undefined,
          transition: "margin-bottom 300ms ease",
        }}
      >
        <h3 className="text-md sm:text-xl font-semibold flex items-center text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-200">
          <Icon className="w-5 h-5 mr-2 text-zinc-600 dark:text-zinc-400" />
          {title}
        </h3>
        <ChevronUp
          className={`sm:hidden w-5 h-5 text-zinc-500 dark:text-zinc-300 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Collapsible content */}
      <div
        ref={contentRef}
        style={{
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.3s ease",
          maxHeight: isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className="transition-all duration-300 sm:max-h-none sm:opacity-100 sm:overflow-visible"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 m-1">
          {items.map((item, index) => {
            const toolName = typeof item === "string" ? item : item.name;
            const path = typeof item === "string" ? undefined : item.path;
            const elementId = toolName.replace(/\s+/g, "-").toLowerCase();

            return (
              <div
                key={index}
                id={elementId}
                className="bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all duration-200 text-zinc-800 dark:text-white sm:p-3 p-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-600/50 hover:scale-[1.02] hover:shadow-sm"
                onClick={() => path && handleImplementedClick(path, toolName)}
              >
                {toolName}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UtilityCard;
