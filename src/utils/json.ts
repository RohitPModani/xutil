/**
 * Integers with 16+ digits exceed 2^53 and are silently rounded by
 * JSON.parse. Looks for them in JSON source text, outside strings.
 */
export function hasUnsafeIntegers(source: string): boolean {
  const noStrings = source.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  return /(?<![\w.])-?\d{16,}(?![\w.])/.test(noStrings);
}

export const UNSAFE_INTEGER_NOTE =
  'This JSON contains integers above 2^53; JavaScript rounds them, so the output may differ from the input in those digits.';

/**
 * Turns a JSON.parse error into a short message with a line number when the
 * engine reports a position. Browser messages differ: V8 appends
 * "(line L column C)" or "at position P", Firefox says "at line L column C",
 * and V8 also quotes the whole input, which must not be shown back.
 */
export function describeJsonError(err: unknown, source: string): string {
  const raw = err instanceof Error ? err.message : String(err);
  const message = raw.replace(/,?\s*"(?:[^"\\]|\\.)*"\s*is not valid JSON/s, '').replace(/\s+/g, ' ').trim();

  const lineCol = message.match(/\(?line (\d+) column (\d+)\)?$/) ?? message.match(/at line (\d+) column (\d+)/);
  if (lineCol) return `Line ${lineCol[1]}, column ${lineCol[2]}: ${message.replace(/\s*(?:\(line.*\)|at line.*)$/, '')}`;

  const pos = message.match(/at position (\d+)/);
  if (pos) {
    const index = Number(pos[1]);
    const line = source.slice(0, index).split('\n').length;
    return `Line ${line}: ${message.replace(/\s*at position \d+.*$/, '')}`;
  }
  return message || 'Could not parse this JSON.';
}
