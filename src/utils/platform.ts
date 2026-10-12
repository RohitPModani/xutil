const platform =
  (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
  navigator.userAgent;

export const isMac = /mac/i.test(platform);

/** The modifier shown in shortcut hints: ⌘ on a Mac, Ctrl elsewhere. */
export const modKey = isMac ? '⌘' : 'Ctrl';

export const isModK = (e: KeyboardEvent) =>
  (isMac ? e.metaKey : e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k';
