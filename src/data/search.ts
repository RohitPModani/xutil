import Fuse from 'fuse.js';
import { tools, type Tool } from './tools';

const fuse = new Fuse(
  tools.map((t) => ({
    tool: t,
    name: t.name,
    // "base64" finds the Base64 tool even though the name is spelt with a
    // space; the signature and keywords carry the aliases.
    aliases: `${t.in ?? ''} ${t.out} ${t.keywords ?? ''} ${t.id.replace(/_/g, ' ')}`,
  })),
  {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'aliases', weight: 1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
  }
);

/** Ranked matches for a query; the whole registry when the query is blank. */
export function searchTools(query: string): Tool[] {
  const q = query.trim();
  if (!q) return tools;
  return fuse.search(q).map((r) => r.item.tool);
}
