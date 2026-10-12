import { diffChars, diffLines, diffWords, diffWordsWithSpace } from 'diff';

/** Diff off the main thread; the page kills this worker on timeout. */

export type Granularity = 'lines' | 'words' | 'chars';

export interface DiffRequest {
  a: string;
  b: string;
  mode: Granularity;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

export type Kind = 'added' | 'removed' | 'same';

export interface DiffPart {
  text: string;
  /** Inside a changed line: the words that differ. In inline mode: the segment's kind. */
  changed: boolean;
}

export interface DiffRow {
  kind: Kind;
  text: string;
  /** 1-based line numbers on each side; absent on the side the line is not on. */
  oldNo?: number;
  newNo?: number;
  /** Word-level breakdown, present when this line was paired with its counterpart. */
  parts?: DiffPart[];
  /** Which change (hunk) this row belongs to, 1-based; absent on unchanged rows. */
  hunk?: number;
}

export interface InlinePart {
  kind: Kind;
  text: string;
}

export interface DiffResponse {
  mode: Granularity;
  /** Line mode. */
  rows: DiffRow[];
  /** Word and character modes: the whole text as one sequence of segments. */
  inline: InlinePart[];
  added: number;
  removed: number;
  same: number;
  hunks: number;
}

/** Lines longer than this are not word-diffed; the line diff alone is enough. */
const MAX_WORD_DIFF_LINE = 2000;

/** Highlights the words that differ between one removed line and the added line that replaced it. */
function pair(removed: DiffRow, added: DiffRow, ignoreCase: boolean) {
  if (removed.text.length > MAX_WORD_DIFF_LINE || added.text.length > MAX_WORD_DIFF_LINE) return;
  const words = diffWordsWithSpace(removed.text, added.text, { ignoreCase });
  removed.parts = words.filter((w) => !w.added).map((w) => ({ text: w.value, changed: Boolean(w.removed) }));
  added.parts = words.filter((w) => !w.removed).map((w) => ({ text: w.value, changed: Boolean(w.added) }));
}

function lineDiff(a: string, b: string, ignoreWhitespace: boolean, ignoreCase: boolean): DiffResponse {
  const rows: DiffRow[] = [];
  let added = 0;
  let removed = 0;
  let same = 0;
  let oldNo = 0;
  let newNo = 0;
  let hunks = 0;
  let inHunk = false;
  let lastRemoved: DiffRow[] = [];

  for (const part of diffLines(a, b, { ignoreWhitespace, ignoreCase })) {
    const kind: Kind = part.added ? 'added' : part.removed ? 'removed' : 'same';
    const lines = part.value.replace(/\n$/, '').split('\n');
    if (kind === 'same') {
      inHunk = false;
      same += lines.length;
      for (const text of lines) rows.push({ kind, text, oldNo: ++oldNo, newNo: ++newNo });
      lastRemoved = [];
      continue;
    }
    if (!inHunk) {
      hunks += 1;
      inHunk = true;
    }
    const block: DiffRow[] = lines.map((text) => (kind === 'added' ? { kind, text, newNo: ++newNo, hunk: hunks } : { kind, text, oldNo: ++oldNo, hunk: hunks }));
    if (kind === 'added') {
      added += block.length;
      // A removed block directly followed by an added one is a change: diff the lines pairwise.
      for (let i = 0; i < Math.min(lastRemoved.length, block.length); i++) pair(lastRemoved[i], block[i], ignoreCase);
      lastRemoved = [];
    } else {
      removed += block.length;
      lastRemoved = block;
    }
    rows.push(...block);
  }
  return { mode: 'lines', rows, inline: [], added, removed, same, hunks };
}

function inlineDiff(a: string, b: string, mode: 'words' | 'chars', ignoreWhitespace: boolean, ignoreCase: boolean): DiffResponse {
  const parts = mode === 'words' ? (ignoreWhitespace ? diffWords(a, b, { ignoreCase }) : diffWordsWithSpace(a, b, { ignoreCase })) : diffChars(a, b, { ignoreCase });
  const inline: InlinePart[] = [];
  let added = 0;
  let removed = 0;
  let same = 0;
  let hunks = 0;
  let inHunk = false;
  const count = (text: string) => (mode === 'words' ? (text.match(/\S+/g) ?? []).length : text.length);
  for (const p of parts) {
    const kind: Kind = p.added ? 'added' : p.removed ? 'removed' : 'same';
    if (kind === 'same') {
      inHunk = false;
      same += count(p.value);
    } else {
      if (!inHunk) {
        hunks += 1;
        inHunk = true;
      }
      if (kind === 'added') added += count(p.value);
      else removed += count(p.value);
    }
    inline.push({ kind, text: p.value });
  }
  return { mode, rows: [], inline, added, removed, same, hunks };
}

self.onmessage = (e: MessageEvent<DiffRequest>) => {
  const { a, b, mode, ignoreWhitespace, ignoreCase } = e.data;
  const result = mode === 'lines' ? lineDiff(a, b, ignoreWhitespace, ignoreCase) : inlineDiff(a, b, mode, ignoreWhitespace, ignoreCase);
  self.postMessage(result satisfies DiffResponse);
};
