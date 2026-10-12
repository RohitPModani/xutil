/**
 * Builds a convert function for units that are all simple multiples of one
 * base unit: `table[unit]` is how many base units one `unit` is.
 */
export const linearConvert =
  (table: Record<string, number>) =>
  (value: number, unit: string): Record<string, number> => {
    const factor = table[unit];
    if (factor === undefined) throw new Error(`Unknown unit: ${unit}`);
    const base = value * factor;
    if (!Number.isFinite(base)) throw new Error('The value is too large to convert.');
    return Object.fromEntries(Object.entries(table).map(([k, f]) => [k, base / f]));
  };
