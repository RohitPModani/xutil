/** `#RRGGBB`, or `#RRGGBBAA` when `alpha` is allowed. */
export const isHex = (s: string, alpha = false) =>
  (alpha ? /^#([0-9a-f]{6}|[0-9a-f]{8})$/i : /^#[0-9a-f]{6}$/i).test(s);

/** Keeps only hex digits, forces exactly one leading `#`, uppercases, trims to length. */
export const cleanHex = (v: string, max = 7) => {
  const digits = v.toUpperCase().replace(/[^0-9A-F]/g, '');
  return digits ? `#${digits}`.slice(0, max) : '';
};

/** `#F00` → `#FF0000`, `#F00A` → `#FF0000AA`; anything else is returned as is. */
export const expandHex = (v: string) => {
  const m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{4})$/i);
  return m ? `#${[...m[1]].map((c) => c + c).join('')}`.toUpperCase() : v;
};

export const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
  a: hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1,
});

export const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: Math.round((max === 0 ? 0 : d / max) * 100), v: Math.round(max * 100) };
}

export function rgbToCmyk(r: number, g: number, b: number) {
  const k = 1 - Math.max(r, g, b) / 255;
  const f = (c: number) => (k === 1 ? 0 : Math.round(((1 - c / 255 - k) / (1 - k)) * 100));
  return { c: f(r), m: f(g), y: f(b), k: Math.round(k * 100) };
}

/**
 * Parses `#RGB`, `#RRGGBB`, `#RRGGBBAA`, `rgb(…)`, `rgba(…)`, `hsl(…)` or
 * `hsla(…)` into `#RRGGBB` (alpha dropped). Returns null when unreadable.
 */
export function parseColor(input: string): string | null {
  const s = input.trim();
  const hex = expandHex(s.startsWith('#') ? s : `#${s}`);
  if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return hex.slice(0, 7).toUpperCase();
  const rgb = s.match(/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/i);
  if (rgb) return rgbToHex(+rgb[1], +rgb[2], +rgb[3]);
  const hsl = s.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)%\s*[, ]\s*(\d+(?:\.\d+)?)%/i);
  if (hsl) {
    const h = ((+hsl[1] % 360) + 360) % 360;
    const sat = +hsl[2] / 100;
    const l = +hsl[3] / 100;
    const c = (1 - Math.abs(2 * l - 1)) * sat;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
  }
  return null;
}
