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

export const updateToolUsage = (toolKey: string) => {
  const usage = JSON.parse(localStorage.getItem("toolUsage") || "{}");
  usage[`/${toolKey}`] = (usage[`/${toolKey}`] || 0) + 1;
  localStorage.setItem("toolUsage", JSON.stringify(usage));
};

export const getMostUsedTools = (): string[] => {
  // Get stored tool usage
  const usage = JSON.parse(localStorage.getItem("toolUsage") || "{}");
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
  localStorage.removeItem("toolUsage");
};