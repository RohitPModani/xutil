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
import { Paintbrush, Trash2 } from 'lucide-react';

interface ColorStop {
  color: string;
  position: number; // 0 to 100
}

interface Gradient {
  type: 'linear' | 'radial';
  direction: string; // e.g., 'to right', 'center'
  colorStops: ColorStop[];
}

function GradientGenerator() {
  const seo = seoDescriptions.gradientGenerator;

  const [gradient, setGradient] = useState<Gradient>({
    type: 'linear',
    direction: 'to right',
    colorStops: [
      { color: '#FF0000', position: 0 },
      { color: '#0000FF', position: 100 },
    ],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage('gradient_generator');
  }, []);

  const validateHex = (hex: string): boolean => {
    return /^#?([0-9A-Fa-f]{6})$/.test(hex);
  };

  const generateCss = useCallback(() => {
    const { type, direction, colorStops } = gradient;
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');

    if (type === 'linear') {
      return `linear-gradient(${direction}, ${stopsString})`;
    } else {
      return `radial-gradient(circle at ${direction}, ${stopsString})`;
    }
  }, [gradient]);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'linear' | 'radial';
    const direction = type === 'linear' ? 'to right' : 'center';
    setGradient((prev) => ({ ...prev, type, direction }));
    setError(null);
  }, []);

  const handleDirectionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setGradient((prev) => ({ ...prev, direction: e.target.value }));
    setError(null);
  }, []);

  const handleColorChange = useCallback((index: number, value: string) => {
    let cleanValue = value.toUpperCase().replace(/[^0-9A-F#]/g, '');
    if (cleanValue.length > 0 && cleanValue[0] !== '#') {
      cleanValue = '#' + cleanValue;
    }
    if (cleanValue.length > 7) {
      cleanValue = cleanValue.slice(0, 7);
    }

    setGradient((prev) => {
      const newColorStops = [...prev.colorStops];
      newColorStops[index] = { ...newColorStops[index], color: cleanValue };
      return { ...prev, colorStops: newColorStops };
    });

    const cleanHex = cleanValue.replace('#', '');
    if (cleanHex.length === 6 && !validateHex(cleanHex)) {
      setError('Invalid HEX color code (use 6 digits, 0-9 or A-F)');
    } else if (cleanHex.length > 0 && cleanHex.length < 6) {
      setError('HEX code must be 6 digits');
    } else {
      setError(null);
    }
  }, []);

  const handleColorPickerChange = useCallback((index: number, value: string) => {
    setGradient((prev) => {
      const newColorStops = [...prev.colorStops];
      newColorStops[index] = { ...newColorStops[index], color: value.toUpperCase() };
      return { ...prev, colorStops: newColorStops };
    });
    setError(null);
  }, []);

  const handlePositionChange = useCallback((index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setGradient((prev) => {
        const newColorStops = [...prev.colorStops];
        newColorStops[index] = { ...newColorStops[index], position: value === '' ? 0 : numValue };
        return { ...prev, colorStops: newColorStops };
      });
      setError(null);
    } else {
      setError('Position must be between 0 and 100');
    }
  }, []);

  const addColorStop = useCallback(() => {
    if (gradient.colorStops.length >= 10) {
      setError('Maximum 10 color stops allowed');
      return;
    }
    const lastPosition = gradient.colorStops[gradient.colorStops.length - 1].position;
    const newPosition = Math.min(100, lastPosition + 10);
    setGradient((prev) => ({
      ...prev,
      colorStops: [...prev.colorStops, { color: '#FFFFFF', position: newPosition }],
    }));
    setError(null);
  }, [gradient.colorStops]);

  const removeColorStop = useCallback((index: number) => {
    if (gradient.colorStops.length <= 2) {
      setError('Gradient must have at least 2 color stops');
      return;
    }
    setGradient((prev) => ({
      ...prev,
      colorStops: prev.colorStops.filter((_, i) => i !== index),
    }));
    setError(null);
  }, [gradient.colorStops.length]);

  const handleClear = useCallback(() => {
    setGradient({
      type: 'linear',
      direction: 'to right',
      colorStops: [
        { color: '#FF0000', position: 0 },
        { color: '#0000FF', position: 100 },
      ],
    });
    setError(null);
  }, []);

  const renderColorStopBar = () => {
    return (
      <div className="relative w-full h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full">
        {gradient.colorStops.map((stop, index) => (
          <div
            key={index}
            className="absolute w-4 h-6 rounded border-2 border-white shadow-sm"
            style={{
              left: `${stop.position}%`,
              transform: 'translateX(-50%)',
              backgroundColor: stop.color,
              zIndex: 10,
            }}
            aria-label={`Color stop at ${stop.position}%`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-5">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">{seo.title}</h2>
        <SEODescription title={seo.title}>{seo.body}</SEODescription>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Gradient Generator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={gradient.colorStops.length === 2 && gradient.colorStops[0].color === '#FF0000' && gradient.colorStops[1].color === '#0000FF'}
              aria-label="Reset gradient"
            />
          </div>

          <div className="flex flex-col space-y-4 p-3">
            <div className="space-y-3">
              <div>
                <label className="form-label mb-1">
                  Gradient Type
                </label>
                <select
                  value={gradient.type}
                  onChange={handleTypeChange}
                  className="w-full p-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 transition text-sm"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              <div>
                <label className="form-label mb-1">
                  {gradient.type === 'linear' ? 'Direction' : 'Position'}
                </label>
                <select
                  value={gradient.direction}
                  onChange={handleDirectionChange}
                  className="w-full p-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 transition text-sm"
                >
                  {gradient.type === 'linear' ? (
                    <>
                      <option value="to right">To Right</option>
                      <option value="to left">To Left</option>
                      <option value="to bottom">To Bottom</option>
                      <option value="to top">To Top</option>
                      <option value="45deg">45°</option>
                      <option value="135deg">135°</option>
                    </>
                  ) : (
                    <>
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Color Stops
                </label>
                <button
                  onClick={addColorStop}
                  className="flex items-center px-3 py-1.5 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 dark:bg-zinc-500 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  disabled={gradient.colorStops.length >= 10}
                >
                  <Paintbrush className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
              {renderColorStopBar()}
              {gradient.colorStops.map((stop, index) => (
                
                <div key={index} className="flex flex-col justify-between md:flex-row md:space-x-4 md:space-y-0 space-y-2 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => handleColorPickerChange(index, e.target.value)}
                      className="w-10 h-10 border-2 border-zinc-300 dark:border-zinc-600 rounded cursor-pointer z-10"
                      style={{ display: 'block', appearance: 'auto' }}
                      aria-label={`Color picker for stop ${index + 1}`}
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      placeholder="#FF0000"
                      className="flex-1 p-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 transition text-sm"
                      maxLength={7}
                      aria-label={`HEX color for stop ${index + 1}`}
                    />
                  </div>
                  <div className="flex justify-between items-center space-x-2">
                    <input
                      type="number"
                      value={stop.position}
                      onChange={(e) => handlePositionChange(index, e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="flex-1 md:w-30 p-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 transition text-sm"
                      aria-label={`Position for stop ${index + 1}`}
                    />
                    <button
                      onClick={() => removeColorStop(index)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      disabled={gradient.colorStops.length <= 2}
                      aria-label={`Remove color stop ${index + 1}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <div
                className="w-full h-24 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg shadow-inner"
                style={{ background: generateCss() }}
                aria-label="Gradient preview"
              />
            </div>

            <div className="result-box">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Gradient CSS</h4>
                <CopyButton text={`background: ${generateCss()};`} />
              </div>
              <div className="inner-result scrollbar overflow-x-auto">
                <pre className="font-mono">
                  background: {generateCss()};
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

export default GradientGenerator;