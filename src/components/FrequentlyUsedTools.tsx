import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMostUsedTools, resetToolUsage } from "../utils/toolUsage";
import { toolsMeta } from "../data/tools";

/**
 * A single quiet line of shortcuts. It sits above the index rather than in a
 * card, because it is a shortcut to the list below, not a section of its own.
 */
function FrequentlyUsedTools() {
  const [mostUsed, setMostUsed] = useState<string[]>([]);

  useEffect(() => {
    setMostUsed(getMostUsedTools());
  }, []);

  const tools = mostUsed
    .map((key) => toolsMeta[key])
    .filter((tool): tool is { name: string; path: string } => Boolean(tool));

  if (tools.length === 0) return null;

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 pb-6 mb-2">
      <span className="label">Recent</span>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="font-mono text-[0.8125rem] text-dim hover:text-result transition-colors no-underline"
          >
            {tool.name}
          </Link>
        ))}
      </div>
      <button
        onClick={() => {
          resetToolUsage();
          setMostUsed(getMostUsedTools());
        }}
        className="font-mono text-[0.6875rem] text-faint hover:text-ink transition-colors"
      >
        Clear
      </button>
    </div>
  );
}

export default FrequentlyUsedTools;
