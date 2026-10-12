/**
 * Which tools this person opens most, kept in localStorage. Storage access is
 * defensive: private mode, quota and manual edits must never break a route.
 */
const KEY = 'toolUsage';

const read = (): Record<string, number> => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, n]) => typeof n === 'number' && Number.isFinite(n)
      )
    ) as Record<string, number>;
  } catch {
    return {};
  }
};

export const recordToolUse = (id: string) => {
  const usage = read();
  usage[id] = (usage[id] || 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(usage));
  } catch {
    // Non-essential.
  }
};

/** Tool ids, most used first. Empty until something has been opened. */
export const mostUsedTools = (limit = 6): string[] =>
  Object.entries(read())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);

export const clearToolUsage = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
};
