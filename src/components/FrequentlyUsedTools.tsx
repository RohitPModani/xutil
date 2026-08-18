import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMostUsedTools, resetToolUsage } from "../utils/toolUsage";
import { Clock, RotateCcw } from "lucide-react";
import { toolsMeta } from "../data/tools";

const ACCENT = "#F59E0B";

const ACCENT_VARS = {
  "--accent": ACCENT,
  "--accent-border": `${ACCENT}88`,
  "--accent-bg": `${ACCENT}14`,
} as React.CSSProperties;

function FreqTool({ toolKey }: { toolKey: string }) {
  const tool = toolsMeta[toolKey];

  // A stored key can outlive the tool it points at, so skip anything we can no
  // longer resolve rather than rendering a dead target.
  if (!tool) return null;

  return (
    <Link
      to={tool.path}
      style={ACCENT_VARS}
      className="tool-pill whitespace-nowrap !py-1.5 !px-3"
    >
      {tool.name}
    </Link>
  );
}

function FrequentlyUsedTools() {
  const [mostUsed, setMostUsed] = useState<string[]>([]);

  useEffect(() => {
    setMostUsed(getMostUsedTools());
  }, []);

  const handleReset = () => {
    resetToolUsage();
    setMostUsed(getMostUsedTools());
  };

  return (
    <div
      className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/40 shadow-sm"
      style={{ borderTop: `3px solid ${ACCENT}` }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${ACCENT}1a` }}
          >
            <Clock className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <h2
            className="font-display font-bold text-zinc-900 dark:text-white text-sm sm:text-base"
          >
            Recently Used
          </h2>
        </div>
        {mostUsed.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 transition-all duration-200"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-zinc-100 dark:bg-zinc-700/40" />

      {/* Tools */}
      <div className="p-3">
        {mostUsed.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {mostUsed.map((toolKey) => (
              <FreqTool key={toolKey} toolKey={toolKey} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono px-1 py-1">
            Open any tool to see it here.
          </p>
        )}
      </div>
    </div>
  );
}

export default FrequentlyUsedTools;
