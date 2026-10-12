/** `#RRGGBB`, or `#RRGGBBAA` when `alpha` is allowed. */
export const isHex = (s: string, alpha = false) =>
  (alpha ? /^#([0-9a-f]{6}|[0-9a-f]{8})$/i : /^#[0-9a-f]{6}$/i).test(s);

/** Keeps only hex characters, forces a leading `#`, uppercases, trims to length. */
export const cleanHex = (v: string, max = 7) => {
  let s = v.toUpperCase().replace(/[^0-9A-F#]/g, '');
  if (s && s[0] !== '#') s = `#${s}`;
  return s.slice(0, max);
};
