import { useEffect, useState, useCallback } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import ErrorBox from '../../components/ErrorBox';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { updateToolUsage } from '../../utils/toolUsage';

interface BoxShadow {
  xOffset: number; // -50 to 50
  yOffset: number; // -50 to 50
  blurRadius: number; // 0 to 100
  spreadRadius: number; // -50 to 50
  color: string; // HEX color
  type: 'outset' | 'inset';
}

const PRESETS: { name: string; style: BoxShadow }[] = [
  { name: 'Soft Shadow', style: { xOffset: 3, yOffset: 3, blurRadius: 15, spreadRadius: 0, color: '#00000040', type: 'outset' } },
  { name: 'Hard Shadow', style: { xOffset: 5, yOffset: 5, blurRadius: 0, spreadRadius: 0, color: '#000000', type: 'outset' } },
  { name: 'Inset Glow', style: { xOffset: 0, yOffset: 0, blurRadius: 10, spreadRadius: 2, color: '#FF000080', type: 'inset' } },
  { name: 'Deep Shadow', style: { xOffset: 10, yOffset: 10, blurRadius: 20, spreadRadius: 5, color: '#00000080', type: 'outset' } },
  { name: 'Subtle Inset', style: { xOffset: -2, yOffset: -2, blurRadius: 5, spreadRadius: -1, color: '#00000040', type: 'inset' } },
];

function BoxShadowGenerator() {
  const seo = seoDescriptions.boxShadowGenerator || {
    title: 'CSS Box Shadow Generator',
    body: 'Create and customize CSS box shadows with this online box shadow generator tool.'
  };

  const [boxShadow, setBoxShadow] = useState<BoxShadow>({
    xOffset: 5,
    yOffset: 5,
    blurRadius: 10,
    spreadRadius: 0,
    color: '#000000',
    type: 'outset',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage('box_shadow_generator');
  }, []);

  const validateHex = (hex: string): boolean => {
    return /^#?([0-9A-Fa-f]{6})$/.test(hex);
  };

  const generateCssValue = useCallback(() => {
    const { xOffset, yOffset, blurRadius, spreadRadius, color, type } = boxShadow;
    const inset = type === 'inset' ? 'inset ' : '';
    return `${inset}${xOffset}px ${yOffset}px ${blurRadius}px ${spreadRadius}px ${color}`;
  }, [boxShadow]);

  const generateCss = useCallback(() => {
    return `box-shadow: ${generateCssValue()};`;
  }, [generateCssValue]);

  const handleXOffsetChange = useCallback((value: string) => {
    const numValue = parseInt(value, 10);
    if (value === '' || (numValue >= -50 && numValue <= 50)) {
      setBoxShadow((prev) => ({ ...prev, xOffset: value === '' ? 0 : numValue }));
      setError(null);
    } else {
      setError('Horizontal offset must be between -50 and 50');
    }
  }, []);

  const handleYOffsetChange = useCallback((value: string) => {
    const numValue = parseInt(value, 10);
    if (value === '' || (numValue >= -50 && numValue <= 50)) {
      setBoxShadow((prev) => ({ ...prev, yOffset: value === '' ? 0 : numValue }));
      setError(null);
    } else {
      setError('Vertical offset must be between -50 and 50');
    }
  }, []);

  const handleBlurRadiusChange = useCallback((value: string) => {
    const numValue = parseInt(value, 10);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setBoxShadow((prev) => ({ ...prev, blurRadius: value === '' ? 0 : numValue }));
      setError(null);
    } else {
      setError('Blur radius must be between 0 and 100');
    }
  }, []);

  const handleSpreadRadiusChange = useCallback((value: string) => {
    const numValue = parseInt(value, 10);
    if (value === '' || (numValue >= -50 && numValue <= 50)) {
      setBoxShadow((prev) => ({ ...prev, spreadRadius: value === '' ? 0 : numValue }));
      setError(null);
    } else {
      setError('Spread radius must be between -50 and 50');
    }
  }, []);

  const handleColorChange = useCallback((value: string) => {
    let cleanValue = value.toUpperCase().replace(/[^0-9A-F#]/g, '');
    if (cleanValue.length > 0 && cleanValue[0] !== '#') {
      cleanValue = '#' + cleanValue;
    }
    if (cleanValue.length > 7) {
      cleanValue = cleanValue.slice(0, 7);
    }

    setBoxShadow((prev) => ({ ...prev, color: cleanValue }));

    const cleanHex = cleanValue.replace('#', '');
    if (cleanHex.length === 6 && !validateHex(cleanHex)) {
      setError('Invalid HEX color code (use 6 digits, 0-9 or A-F)');
    } else if (cleanHex.length > 0 && cleanHex.length < 6) {
      setError('HEX code must be 6 digits');
    } else {
      setError(null);
    }
  }, []);

  const handleColorPickerChange = useCallback((value: string) => {
    setBoxShadow((prev) => ({ ...prev, color: value.toUpperCase() }));
    setError(null);
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'outset' | 'inset';
    setBoxShadow((prev) => ({ ...prev, type }));
    setError(null);
  }, []);

  const handlePresetSelect = useCallback((preset: BoxShadow) => {
    setBoxShadow(preset);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setBoxShadow({
      xOffset: 5,
      yOffset: 5,
      blurRadius: 10,
      spreadRadius: 0,
      color: '#000000',
      type: 'outset',
    });
    setError(null);
  }, []);

  const generatePresetCss = (preset: BoxShadow) => {
    const { xOffset, yOffset, blurRadius, spreadRadius, color, type } = preset;
    const inset = type === 'inset' ? 'inset ' : '';
    return `${inset}${xOffset}px ${yOffset}px ${blurRadius}px ${spreadRadius}px ${color}`;
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-3xl mx-auto px-2 py-4 section">
        <div className="flex items-center justify-between mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{seo.title}</h2>
        <SEODescription title={seo.title}>{seo.body}</SEODescription>

        <SectionCard className="mb-4 section">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Box Shadow Generator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={
                boxShadow.xOffset === 5 &&
                boxShadow.yOffset === 5 &&
                boxShadow.blurRadius === 10 &&
                boxShadow.spreadRadius === 0 &&
                boxShadow.color === '#000000' &&
                boxShadow.type === 'outset'
              }
              aria-label="Reset box shadow"
            />
          </div>

          <div className="flex flex-col space-y-3 p-2">
            <div className="space-y-2">
              <label className="form-label">
                Presets
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(preset.style)}
                    className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                    aria-label={`Select ${preset.name} preset`}
                  >
                    <div
                      className="w-12 h-12 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-600"
                      style={{ boxShadow: generatePresetCss(preset.style) }}
                    />
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="form-label mb-1">
                  Shadow Type
                </label>
                <select
                  value={boxShadow.type}
                  onChange={handleTypeChange}
                  className="input-field"
                >
                  <option value="outset">Outset</option>
                  <option value="inset">Inset</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:space-x-2 md:space-y-0 space-y-2 gap-2">
                <div className="flex-1">
                  <label className="form-label mb-1">
                    Horizontal Offset (px)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={boxShadow.xOffset}
                    onChange={(e) => handleXOffsetChange(e.target.value)}
                    className="w-full"
                    aria-label="Horizontal offset"
                  />
                  <input
                    type="number"
                    value={boxShadow.xOffset}
                    onChange={(e) => handleXOffsetChange(e.target.value)}
                    min="-50"
                    max="50"
                    className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
                    aria-label="Horizontal offset value"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Vertical Offset (px)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={boxShadow.yOffset}
                    onChange={(e) => handleYOffsetChange(e.target.value)}
                    className="w-full"
                    aria-label="Vertical offset"
                  />
                  <input
                    type="number"
                    value={boxShadow.yOffset}
                    onChange={(e) => handleYOffsetChange(e.target.value)}
                    min="-50"
                    max="50"
                    className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
                    aria-label="Vertical offset value"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:space-x-2 md:space-y-0 space-y-2 gap-2">
                <div className="flex-1">
                  <label className="form-label mb-1">
                    Blur Radius (px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={boxShadow.blurRadius}
                    onChange={(e) => handleBlurRadiusChange(e.target.value)}
                    className="w-full"
                    aria-label="Blur radius"
                  />
                  <input
                    type="number"
                    value={boxShadow.blurRadius}
                    onChange={(e) => handleBlurRadiusChange(e.target.value)}
                    min="0"
                    max="100"
                    className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
                    aria-label="Blur radius value"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Spread Radius (px)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={boxShadow.spreadRadius}
                    onChange={(e) => handleSpreadRadiusChange(e.target.value)}
                    className="w-full"
                    aria-label="Spread radius"
                  />
                  <input
                    type="number"
                    value={boxShadow.spreadRadius}
                    onChange={(e) => handleSpreadRadiusChange(e.target.value)}
                    min="-50"
                    max="50"
                    className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
                    aria-label="Spread radius value"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Shadow Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={boxShadow.color}
                      onChange={(e) => handleColorPickerChange(e.target.value)}
                      className="w-10 h-10 border-2 border-zinc-300 dark:border-zinc-600 rounded cursor-pointer z-10"
                      style={{ display: 'block', appearance: 'auto', overflow: 'visible' }}
                      aria-label="Shadow color picker"
                    />
                    <input
                      type="text"
                      value={boxShadow.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#000000"
                      className="flex-1 p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition text-sm"
                      maxLength={7}
                      aria-label="Shadow color HEX value"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="w-full h-20 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-600"
                style={{ boxShadow: generateCssValue() }}
                aria-label="Box shadow preview"
              />
            </div>

            <div className="result-box">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Box Shadow CSS</h4>
                <CopyButton text={generateCss()} />
              </div>
              <div className="inner-result scrollbar overflow-x-auto">
                <pre>
                  {generateCss()}
                </pre>
              </div>
            </div>

            <ErrorBox message={error} aria-live="polite" />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default BoxShadowGenerator;