/** Regex matching off the main thread; the page kills this worker on timeout. */

export interface RegexRequest {
  pattern: string;
  flags: string;
  text: string;
  replacement: string;
}

export interface RegexGroup {
  /** Group number, or the name for named groups. */
  name: string;
  value: string | undefined;
  start: number;
  end: number;
}

export interface RegexMatch {
  start: number;
  end: number;
  text: string;
  groups: RegexGroup[];
}

export interface RegexResponse {
  matches: RegexMatch[];
  /** Total match count; `matches` holds at most MAX_MATCHES of them. */
  total: number;
  replaced: string;
  error: string;
}

export const MAX_MATCHES = 5000;

type Indexed = RegExpMatchArray & { indices?: Array<[number, number] | undefined> & { groups?: Record<string, [number, number] | undefined> } };

function describe(m: Indexed): RegexMatch {
  const start = m.index ?? 0;
  const names = new Map<string, string>();
  if (m.groups && m.indices?.groups) {
    for (const [name, span] of Object.entries(m.indices.groups)) {
      // Find which numbered group this name belongs to by span identity.
      const i = m.indices.findIndex((s, i) => i > 0 && s === span);
      if (i > 0) names.set(String(i), name);
    }
  }
  const groups: RegexGroup[] = [];
  for (let i = 1; i < m.length; i++) {
    const span = m.indices?.[i];
    groups.push({ name: names.get(String(i)) ?? String(i), value: m[i], start: span?.[0] ?? -1, end: span?.[1] ?? -1 });
  }
  return { start, end: start + m[0].length, text: m[0], groups };
}

self.onmessage = (e: MessageEvent<RegexRequest>) => {
  const { pattern, flags, text, replacement } = e.data;
  const res: RegexResponse = { matches: [], total: 0, replaced: '', error: '' };
  try {
    const re = new RegExp(pattern, flags.includes('d') ? flags : flags + 'd');
    if (flags.includes('g')) {
      for (const m of text.matchAll(re)) {
        if (m[0] === '') continue;
        res.total++;
        if (res.matches.length < MAX_MATCHES) res.matches.push(describe(m as Indexed));
      }
    } else {
      const m = text.match(re);
      if (m && m[0] !== '') {
        res.total = 1;
        res.matches.push(describe(m as Indexed));
      }
    }
    res.replaced = text.replace(new RegExp(pattern, flags), replacement);
  } catch (err) {
    res.error = err instanceof Error ? err.message : String(err);
  }
  self.postMessage(res);
};
