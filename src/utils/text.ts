/** Good enough to pick a default direction; the parser still decides. */
export const looksLikeJson = (s: string) => /^\s*[[{]/.test(s);

/** `report.final.json` → `report.final` */
export const fileBaseName = (name: string) => name.replace(/\.[^/.]+$/, '');
