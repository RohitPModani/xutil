import { useEffect, useState, useCallback } from 'react';
import BackToHome from '../../components/BackToHome';
import SectionCard from '../../components/SectionCard';
import ClearButton from '../../components/ClearButton';
import ErrorBox from '../../components/ErrorBox';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { updateToolUsage } from '../../utils/toolUsage';
import { Upload } from 'lucide-react';
import LoadingButton from '../../components/LoadingButton';

interface FaviconResult {
  icoUrl: string;
  pngUrl: string;
}

function FaviconGenerator() {
  const seo = seoDescriptions.faviconGenerator;

  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [faviconResult, setFaviconResult] = useState<FaviconResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    updateToolUsage('favicon');
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFaviconResult(null);
    setImagePreview(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPEG, etc.)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const generateFavicon = useCallback(async () => {
    if (!imagePreview) {
      setError('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setFaviconResult(null);

    try {
      const img = new Image();
      img.src = imagePreview;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not supported');
      }

      ctx.drawImage(img, 0, 0, 16, 16);

      // Generate PNG
      const pngUrl = canvas.toDataURL('image/png');

      // Generate ICO (simplified, using PNG data URL as a placeholder)
      // Note: True ICO generation typically requires server-side processing
      const icoUrl = canvas.toDataURL('image/png'); // Placeholder for ICO

      setFaviconResult({ icoUrl, pngUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate favicon');
      console.error('Favicon generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [imagePreview]);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setFaviconResult(null);
    setError(null);
  }, []);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Favicon Generator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!imagePreview && !faviconResult}
              aria-label="Clear inputs"
            />
          </div>

          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="form-label">
                Upload Image:
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="flex justify-center">
              <LoadingButton
                onClick={generateFavicon}
                disabled={isGenerating || !imagePreview}
                isLoading={isGenerating}
              >
                Generate Favicon
              </LoadingButton>
            </div>

            <div className="flex flex-col items-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Uploaded image for favicon generation"
                  className="mb-4 border rounded p-2 bg-zinc-100 dark:bg-zinc-800 w-full max-h-64 object-contain"
                />
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                  Image will appear here
                </div>
              )}
            </div>

            {faviconResult && (
              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Favicon Files:</h4>
                </div>
                <div className="inner-result space-y-2">
                  <div className="w-full flex flex-col space-y-2">
                    <button
                      onClick={() => downloadFile(faviconResult.icoUrl, 'favicon.ico')}
                      className="button-primary text-center"
                    >
                      Download ICO (16x16)
                    </button>
                    <button
                      onClick={() => downloadFile(faviconResult.pngUrl, 'favicon.png')}
                      className="button-primary text-center"
                    >
                      Download PNG (16x16)
                    </button>
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

export default FaviconGenerator;