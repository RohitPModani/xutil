// src/components/FrequentlyUsedTools.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMostUsedTools, resetToolUsage } from "../utils/toolUsage";
import { RefreshCcw } from "lucide-react";
import { toolsMeta } from "../data/tools";

function FrequentlyUsedTools() {
  const [mostUsed, setMostUsed] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch most used tools on component mount
  useEffect(() => {
    setMostUsed(getMostUsedTools());
  }, []);

  // Handle navigation on tool click
  const handleToolClick = (path: string) => {
    navigate(path);
  };

  // Reset frequently used tools
  const handleReset = () => {
    resetToolUsage();
    setMostUsed(getMostUsedTools());
  };

  return (
    <div className="card shadow-md rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white group">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md sm:text-xl font-semibold flex items-center text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-200">
          Frequently Used Tools
        </h2>
        {mostUsed.length > 0 && (
          <button
            onClick={handleReset}
            className="transition-all duration-200 flex items-center gap-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            <RefreshCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Always Open Content */}
      {mostUsed.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {mostUsed.map((toolKey, index) => {
            const tool = toolsMeta[toolKey];
            const toolName = tool ? tool.name : toolKey.replace(/-/g, " ");

            return (
              <div
                key={index}
                onClick={() => handleToolClick(tool.path)}
                className="bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all duration-200 text-zinc-800 dark:text-white sm:p-3 p-2 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-600/50 hover:scale-[1.02] hover:shadow-sm"
              >
                {toolName}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">
          No tools used recently.
        </p>
      )}
    </div>
  );
}

export default FrequentlyUsedTools;
