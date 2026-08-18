export interface Tool {
  key: string;
  usage: number;
}

// Default list of 5 tools with initial usage counts
const DEFAULT_TOOLS: Tool[] = [
  { key: "/guid", usage: 0 },
  { key: "/password", usage: 0 },
  { key: "/timezone", usage: 0 },
  { key: "/text_compare", usage: 0 },
  { key: "/qr_code", usage: 0 },
];

// Storage access is deliberately defensive: this runs on every tool page, and
// corrupt or unavailable localStorage (private mode, quota, a bad manual edit)
// must never take down the route.
const readUsage = (): Record<string, number> => {
  try {
    const parsed = JSON.parse(localStorage.getItem("toolUsage") || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    // Drop anything non-numeric so a bad entry cannot poison the sort.
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, count]) => typeof count === "number" && Number.isFinite(count)
      )
    ) as Record<string, number>;
  } catch {
    return {};
  }
};

const writeUsage = (usage: Record<string, number>) => {
  try {
    localStorage.setItem("toolUsage", JSON.stringify(usage));
  } catch {
    // Storage full or blocked - usage tracking is non-essential, so ignore.
  }
};

export const updateToolUsage = (toolKey: string) => {
  const usage = readUsage();
  usage[`/${toolKey}`] = (usage[`/${toolKey}`] || 0) + 1;
  writeUsage(usage);
};

export const getMostUsedTools = (): string[] => {
  // Get stored tool usage
  const usage = readUsage();
  // Create a map of tools, starting with default tools
  const toolMap: { [key: string]: number } = {};
  DEFAULT_TOOLS.forEach((tool) => {
    toolMap[tool.key] = tool.usage; // Initialize with default usage (0)
  });

  // Merge with stored usage (user-tracked tools)
  Object.entries(usage).forEach(([key, count]) => {
    toolMap[key] = Number(count); // Override or add user-tracked tool usage
  });

  // Sort tools by usage (descending) and get top 5 tool keys
  return Object.entries(toolMap)
    .sort(([, a], [, b]) => b - a) // Sort by usage count
    .slice(0, 5) // Limit to top 5
    .map(([key]) => key); // Extract tool names
};

export const resetToolUsage = () => {
  try {
    localStorage.removeItem("toolUsage");
  } catch {
    // Nothing to do if storage is unavailable.
  }
};
