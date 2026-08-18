import { Link } from "react-router-dom";
import { useId, useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface UtilityItem {
  name: string;
  path?: string;
}

interface UtilityCardProps {
  title: string;
  icon: React.ElementType;
  items: (string | UtilityItem)[];
  color?: string;
}

// Accent colours are handed to CSS as custom properties so hover and focus
// styling stays in the stylesheet - tracking hover in React state re-rendered
// on every mouseover and left the style stuck after a tap on touch devices.
const accentVars = (color: string) =>
  ({
    "--accent": color,
    "--accent-border": `${color}88`,
    "--accent-bg": `${color}14`,
  }) as React.CSSProperties;

function ToolPill({
  name,
  path,
  color = "#71717a",
  onClick,
}: {
  name: string;
  path?: string;
  color?: string;
  onClick: (name: string) => void;
}) {
  const elementId = name.replace(/\s+/g, "-").toLowerCase();

  // Rendered as a real link so it is keyboard reachable, announced as a link,
  // and followable by crawlers.
  if (!path) {
    return (
      <span id={elementId} className="tool-pill text-zinc-400 dark:text-zinc-500">
        {name}
      </span>
    );
  }

  return (
    <Link
      id={elementId}
      to={path}
      style={accentVars(color)}
      className="tool-pill"
      onClick={() => onClick(name)}
    >
      {name}
    </Link>
  );
}

function UtilityCard({ title, icon: Icon, items, color = "#71717a" }: UtilityCardProps) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<string | number>("auto");

  useEffect(() => {
    if (window.innerWidth >= 640) {
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

  // Navigation itself is handled by the Link; this only records which tool was
  // opened so Home can scroll back to it on mobile.
  const handleImplementedClick = (toolName: string) => {
    try {
      sessionStorage.setItem("lastClickedTool", toolName);
    } catch {
      // Non-essential, and storage can be unavailable in private mode.
    }
  };

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div
      className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-300 group"
      style={{ borderTop: `3px solid ${color}` }}
    >
      {/* Header */}
      <div
        onClick={() => {
          if (window.innerWidth < 640) toggle();
        }}
        className="px-4 pt-4 pb-3 flex items-center justify-between sm:cursor-default cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg shrink-0"
            style={{ backgroundColor: `${color}1a` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <h3
            className="font-display font-bold text-zinc-900 dark:text-white text-sm sm:text-base leading-tight"
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700/80 text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
            {items.length}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            aria-expanded={isOpen}
            aria-controls={contentId}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${title}`}
            className="sm:hidden rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
          >
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-zinc-100 dark:bg-zinc-700/40" />

      {/* Collapsible content */}
      <div
        id={contentId}
        ref={contentRef}
        style={{
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.3s ease",
          maxHeight: isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className="sm:max-h-none sm:opacity-100 sm:overflow-visible"
      >
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {items.map((item, index) => {
            const toolName = typeof item === "string" ? item : item.name;
            const path = typeof item === "string" ? undefined : item.path;

            return (
              <ToolPill
                key={index}
                name={toolName}
                path={path}
                color={color}
                onClick={handleImplementedClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UtilityCard;
