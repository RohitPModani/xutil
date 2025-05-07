export const updateToolUsage = (toolKey: string) => {
    const usage = JSON.parse(localStorage.getItem("toolUsage") || "{}");
    usage[`/${toolKey}`] = (usage[`/${toolKey}`] || 0) + 1;
    localStorage.setItem("toolUsage", JSON.stringify(usage));
  };
  
  export const getMostUsedTools = () => {
    const usage = JSON.parse(localStorage.getItem("toolUsage") || "{}");
    return Object.entries(usage)
      .sort(([, a], [, b]) => Number(b) - Number(a)) // Sort by usage count (descending)
      .slice(0, 5) // Get top 5
      .map(([key]) => key); // Extract tool names
  };
  
  export const resetToolUsage = () => {
    localStorage.removeItem("toolUsage");
  };
  