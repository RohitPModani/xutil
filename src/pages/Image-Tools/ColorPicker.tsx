import { useEffect, useState, useCallback } from "react";
import BackToHome from "../../components/BackToHome";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import ErrorBox from "../../components/ErrorBox";
import CopyButton from "../../components/CopyButton";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import seoDescriptions from "../../data/seoDescriptions";
import { updateToolUsage } from "../../utils/toolUsage";
import { Paintbrush } from "lucide-react";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

function ColorPicker() {
  const seo = seoDescriptions.colorPicker;

  const [color, setColor] = useState<Color | null>(null);
  const [hexInput, setHexInput] = useState("");
  const [rgbInput, setRgbInput] = useState({ r: "", g: "", b: "" });
  const [hslInput, setHslInput] = useState({ h: "", s: "", l: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage("color_picker");
  }, []);

  // Validation functions
  const validateHex = (hex: string): boolean => {
    return /^#?([0-9A-Fa-f]{6})$/.test(hex);
  };

  const validateRgbComponent = (value: string): boolean => {
    if (value === "") return true;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  };

  const validateHslComponent = (
    value: string,
    type: "h" | "s" | "l"
  ): boolean => {
    if (value === "") return true;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (type === "h") return num >= 0 && num <= 360;
    return num >= 0 && num <= 100;
  };

  // Conversion functions
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const cleanHex = hex.replace("#", "");
    return {
      r: parseInt(cleanHex.slice(0, 2), 16),
      g: parseInt(cleanHex.slice(2, 4), 16),
      b: parseInt(cleanHex.slice(4, 6), 16),
    };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.toUpperCase().replace(/[^0-9A-F#]/g, "");
      if (value.length > 0 && value[0] !== "#") {
        value = "#" + value;
      }
      if (value.length > 7) {
        value = value.slice(0, 7);
      }
      setHexInput(value);
      setError(null);

      const cleanValue = value.replace("#", "");
      if (cleanValue.length === 6) {
        if (validateHex(cleanValue)) {
          const rgb = hexToRgb(cleanValue);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          setColor({ hex: `#${cleanValue}`, rgb, hsl });
          setRgbInput({
            r: rgb.r.toString(),
            g: rgb.g.toString(),
            b: rgb.b.toString(),
          });
          setHslInput({
            h: hsl.h.toString(),
            s: hsl.s.toString(),
            l: hsl.l.toString(),
          });
        } else {
          setError("Invalid HEX color code (use 6 digits, 0-9 or A-F)");
        }
      } else if (cleanValue.length > 0 && cleanValue.length < 6) {
        setError("HEX code must be 6 digits");
      }
    },
    []
  );

  const handleRgbChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, component: "r" | "g" | "b") => {
      let value = e.target.value.replace(/[^0-9]/g, "");
      if (value.length > 3) {
        value = value.slice(0, 3);
      }
      const numValue = parseInt(value, 10);
      if (value && (numValue > 255 || isNaN(numValue))) {
        value = "255";
      }

      const newRgbInput = { ...rgbInput, [component]: value };
      setRgbInput(newRgbInput);
      setError(null);

      const { r, g, b } = newRgbInput;
      if (
        !validateRgbComponent(r) ||
        !validateRgbComponent(g) ||
        !validateRgbComponent(b)
      ) {
        if (
          (r && parseInt(r, 10) > 255) ||
          (g && parseInt(g, 10) > 255) ||
          (b && parseInt(b, 10) > 255)
        ) {
          setError("RGB values must be between 0 and 255");
        } else if (
          (r && isNaN(parseInt(r, 10))) ||
          (g && isNaN(parseInt(g, 10))) ||
          (b && isNaN(parseInt(b, 10)))
        ) {
          setError("RGB values must be valid numbers");
        }
        return;
      }

      if (r && g && b) {
        const rNum = parseInt(r, 10);
        const gNum = parseInt(g, 10);
        const bNum = parseInt(b, 10);
        if (
          validateRgbComponent(r) &&
          validateRgbComponent(g) &&
          validateRgbComponent(b)
        ) {
          const hex = rgbToHex(rNum, gNum, bNum);
          const hsl = rgbToHsl(rNum, gNum, bNum);
          setColor({ hex, rgb: { r: rNum, g: gNum, b: bNum }, hsl });
          setHexInput(hex);
          setHslInput({
            h: hsl.h.toString(),
            s: hsl.s.toString(),
            l: hsl.l.toString(),
          });
        }
      }
    },
    [rgbInput]
  );

  const handleHslChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, component: "h" | "s" | "l") => {
      let value = e.target.value.replace(/[^0-9]/g, "");
      const max = component === "h" ? 360 : 100;
      if (value.length > 3) {
        value = value.slice(0, 3);
      }
      const numValue = parseInt(value, 10);
      if (value && (numValue > max || isNaN(numValue))) {
        value = max.toString();
      }

      const newHslInput = { ...hslInput, [component]: value };
      setHslInput(newHslInput);
      setError(null);

      const { h, s, l } = newHslInput;
      if (
        !validateHslComponent(h, "h") ||
        !validateHslComponent(s, "s") ||
        !validateHslComponent(l, "l")
      ) {
        if (
          (h && parseInt(h, 10) > 360) ||
          (s && parseInt(s, 10) > 100) ||
          (l && parseInt(l, 10) > 100)
        ) {
          setError(`Invalid HSL values (H: 0-360, S/L: 0-100)`);
        } else if (
          (h && isNaN(parseInt(h, 10))) ||
          (s && isNaN(parseInt(s, 10))) ||
          (l && isNaN(parseInt(l, 10)))
        ) {
          setError("HSL values must be valid numbers");
        }
        return;
      }

      if (h && s && l) {
        const hNum = parseInt(h, 10);
        const sNum = parseInt(s, 10);
        const lNum = parseInt(l, 10);
        if (
          validateHslComponent(h, "h") &&
          validateHslComponent(s, "s") &&
          validateHslComponent(l, "l")
        ) {
          const rgb = hslToRgb(hNum, sNum, lNum);
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          setColor({ hex, rgb, hsl: { h: hNum, s: sNum, l: lNum } });
          setHexInput(hex);
          setRgbInput({
            r: rgb.r.toString(),
            g: rgb.g.toString(),
            b: rgb.b.toString(),
          });
        }
      }
    },
    [hslInput]
  );

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value.toUpperCase();
      setHexInput(hex);
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setRgbInput({
        r: rgb.r.toString(),
        g: rgb.g.toString(),
        b: rgb.b.toString(),
      });
      setHslInput({
        h: hsl.h.toString(),
        s: hsl.s.toString(),
        l: hsl.l.toString(),
      });
      setColor({ hex, rgb, hsl });
      setError(null);
    },
    []
  );

  const handleClear = useCallback(() => {
    setColor(null);
    setHexInput("");
    setRgbInput({ r: "", g: "", b: "" });
    setHslInput({ h: "", s: "", l: "" });
    setError(null);
  }, []);

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-6">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Color Picker</h3>
            <ClearButton
              onClick={handleClear}
              disabled={
                !color &&
                !hexInput &&
                !rgbInput.r &&
                !rgbInput.g &&
                !rgbInput.b &&
                !hslInput.h &&
                !hslInput.s &&
                !hslInput.l
              }
              aria-label="Clear inputs"
            />
          </div>
          <hr className="line-break" />
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="form-label">Pick Color:</label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={color?.hex || "#000000"}
                  onChange={handleColorPickerChange}
                  className="w-16 h-10 border-2 border-zinc-300 dark:border-zinc-600 rounded"
                />
                <Paintbrush className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="form-label">HEX Color:</label>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#FF0000"
                className="w-full p-2 border rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                maxLength={7}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="form-label">RGB Color:</label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  value={rgbInput.r}
                  onChange={(e) => handleRgbChange(e, "r")}
                  placeholder="255"
                  min="0"
                  max="255"
                  className="w-1/3 p-2 border rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="number"
                  value={rgbInput.g}
                  onChange={(e) => handleRgbChange(e, "g")}
                  placeholder="255"
                  min="0"
                  max="255"
                  className="w-1/3 p-2 border rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="number"
                  value={rgbInput.b}
                  onChange={(e) => handleRgbChange(e, "b")}
                  placeholder="255"
                  min="0"
                  max="255"
                  className="w-1/3 p-2 border rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="form-label">HSL Color:</label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  value={hslInput.h}
                  onChange={(e) => handleHslChange(e, "h")}
                  placeholder="360"
                  min="0"
                  max="360"
                  className="w-1/3 p-2 border rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="number"
                  value={hslInput.s}
                  onChange={(e) => handleHslChange(e, "s")}
                  placeholder="100"
                  min="0"
                  max="100"
                  className="w-1/3 p-2 border rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="number"
                  value={hslInput.l}
                  onChange={(e) => handleHslChange(e, "l")}
                  placeholder="100"
                  min="0"
                  max="100"
                  className="w-1/3 p-2 border rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              {color ? (
                <div
                  className="w-full h-64 border rounded p-2 bg-zinc-100 dark:bg-zinc-800"
                  style={{ backgroundColor: color.hex }}
                />
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                  Color preview will appear here
                </div>
              )}
            </div>

            {color && (
              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Color Details:</h4>
                  <CopyButton text={color.hex} />
                </div>
                <div className="inner-result space-y-2">
                  <div className="w-full mono-output flex flex-col">
                    <span>HEX: {color.hex}</span>
                    <span>
                      RGB: ({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                    </span>
                    <span>
                      HSL: ({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            <ErrorBox message={error} aria-live="polite" />
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default ColorPicker;
