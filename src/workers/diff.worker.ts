import { diffLines, diffWordsWithSpace } from 'diff';

/** Line diff off the main thread; the page kills this worker on timeout. */

export interface DiffRequest {
  a: string;
  b: string;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

export interface DiffPart {
  text: string;
  /** True for the words that differ inside a changed line. */
  changed: boolean;
}

export interface DiffRow {
  kind: 'added' | 'removed' | 'same';
  text: string;
  /** Word-level breakdown, present when this line was paired with its counterpart. */
  parts?: DiffPart[];
}

export interface DiffResponse {
  rows: DiffRow[];
  added: number;
  removed: number;
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

self.onmessage = (e: MessageEvent<DiffRequest>) => {
  const { a, b, ignoreWhitespace, ignoreCase } = e.data;
  const rows: DiffRow[] = [];
  let added = 0;
  let removed = 0;
  let lastRemoved: DiffRow[] = [];
  for (const part of diffLines(a, b, { ignoreWhitespace, ignoreCase })) {
    const kind: DiffRow['kind'] = part.added ? 'added' : part.removed ? 'removed' : 'same';
    const block = part.value.replace(/\n$/, '').split('\n').map((text) => ({ kind, text }));
    if (kind === 'added') {
      added += block.length;
      // A removed block directly followed by an added one is a change: diff the lines pairwise.
      for (let i = 0; i < Math.min(lastRemoved.length, block.length); i++) pair(lastRemoved[i], block[i], ignoreCase);
    }
    if (kind === 'removed') removed += block.length;
    lastRemoved = kind === 'removed' ? block : [];
    rows.push(...block);
  }
  self.postMessage({ rows, added, removed } satisfies DiffResponse);
};
