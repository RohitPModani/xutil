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
import { Upload } from 'lucide-react';
import LoadingButton from '../../components/LoadingButton';
import { BrowserMultiFormatReader, Result, BarcodeFormat } from '@zxing/library';

const BARCODE_FORMATS = [
  { value: 'CODE128', label: 'CODE128' },
  { value: 'CODE128A', label: 'CODE128 A' },
  { value: 'CODE128B', label: 'CODE128 B' },
  { value: 'CODE128C', label: 'CODE128 C' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC', label: 'UPC' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'ITF14', label: 'ITF-14' },
  { value: 'codabar', label: 'Codabar' },
];

type BarcodeResult = {
  format: string;
  rawValue: string;
  timestamp: number;
};

function BarcodeReader() {
  const seo = seoDescriptions.barcodeReader;
  
  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const codeReader = useState(new BrowserMultiFormatReader())[0];

  useEffect(() => {
    updateToolUsage('barcode_reader');
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setBarcodeResult(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const scanBarcode = useCallback(async () => {
    try {
      setIsScanning(true);
      setError(null);
      setBarcodeResult(null);

      if (!imagePreview) {
        throw new Error('Please upload an image first');
      }

      const result = await codeReader.decodeFromImageUrl(imagePreview);
      handleScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan barcode');
      console.error('Barcode scanning error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [imagePreview, codeReader]);

  const handleScanResult = useCallback((result: Result | null) => {
    if (!result) {
      setError('No barcode detected');
      return;
    }

    const formatMap: { [key: number]: string } = {
      [BarcodeFormat.CODE_128]: 'CODE128',
      [BarcodeFormat.EAN_13]: 'EAN13',
      [BarcodeFormat.EAN_8]: 'EAN8',
      [BarcodeFormat.UPC_A]: 'UPC',
      [BarcodeFormat.CODE_39]: 'CODE39',
      [BarcodeFormat.ITF]: 'ITF14',
      [BarcodeFormat.CODABAR]: 'codabar',
    };

    const format = formatMap[result.getBarcodeFormat()] || result.getBarcodeFormat().toString();
    
    setBarcodeResult({
      format,
      rawValue: result.getText(),
      timestamp: Date.now()
    });
  }, []);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setBarcodeResult(null);
    setError(null);
  }, []);

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
            <h3 className="text-lg font-semibold">Barcode Reader</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!imagePreview && !barcodeResult}
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
                onClick={scanBarcode} 
                disabled={isScanning || !imagePreview}
                isLoading={isScanning}
              >
                Scan Barcode
              </LoadingButton>
            </div>

            <div className="flex flex-col items-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Uploaded for barcode scanning" 
                  className="mb-4 border rounded p-2 bg-zinc-100 dark:bg-zinc-800 w-full max-h-64 object-contain"
                />
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                  Image will appear here
                </div>
              )}
            </div>

            {barcodeResult && (
              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Barcode Details:</h4>
                  <CopyButton text={barcodeResult.rawValue} />
                </div>
                <div className="inner-result space-y-2">
                  <div className="w-full mono-output flex flex-col">
                    <span>Format: {BARCODE_FORMATS.find(f => f.value === barcodeResult.format)?.label || barcodeResult.format}</span>
                    <span>Value: {barcodeResult.rawValue}</span>
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

export default BarcodeReader;