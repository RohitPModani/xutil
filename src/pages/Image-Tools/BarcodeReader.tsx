import { useEffect, useState, useCallback, useRef } from 'react';
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
import { Upload, Camera } from 'lucide-react';
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
  const seo = seoDescriptions.barcodeReader || {
    title: 'Barcode Reader',
    body: 'Scan and decode barcodes from images with this online barcode reader tool.'
  };
  
  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    updateToolUsage('barcode_reader');
    
    return () => {
      stopCamera();
    };
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

      if (!imagePreview && !useCamera) {
        throw new Error('Please upload an image first');
      }

      if (useCamera) {
        // Camera scanning is handled by the continuous decode
        return;
      }

      // For file upload
      const result = await codeReader.current.decodeFromImageUrl(imagePreview!);
      handleScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan barcode');
      console.error('Barcode scanning error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [imagePreview, useCamera]);

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

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setUseCamera(true);
      setBarcodeResult(null);
      setIsCameraActive(true);

      if (!videoRef.current) return;

      const video = videoRef.current;
      
      // Start decoding from camera
      codeReader.current.decodeFromVideoDevice(null, video, (result, err) => {
        if (result) {
          handleScanResult(result);
        }
        if (err && !err.message.includes('No barcode detected')) {
          setError(err.message);
          console.error('Barcode scanning error:', err);
        }
      });
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
      console.error('Camera error:', err);
      setUseCamera(false);
      setIsCameraActive(false);
    }
  }, [handleScanResult]);

  const stopCamera = useCallback(() => {
    codeReader.current.reset();
    setUseCamera(false);
    setIsCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setBarcodeResult(null);
    setError(null);
    if (useCamera) {
      stopCamera();
    }
  }, [useCamera, stopCamera]);

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={seo.title}>{seo.body}</SEODescription>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Barcode Reader</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!imagePreview && !barcodeResult && !useCamera}
              aria-label="Clear inputs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="form-label">
                    Upload Image:
                  </label>
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${useCamera ? 'bg-zinc-200 dark:bg-zinc-700 opacity-50' : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'} transition-colors`}>
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
                      disabled={useCamera}
                    />
                  </label>
                </div>

                <div className="text-center text-zinc-500 dark:text-zinc-400">
                  or
                </div>

                <div className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${useCamera ? 'bg-zinc-200 dark:bg-zinc-700 opacity-50' : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'} transition-colors`}>
                  {!useCamera ? (
                    <button
                      onClick={startCamera}
                      className="button-primary"
                      disabled={isScanning}
                    >
                      <div className='flex flex-row item-center'>
                        <Camera className="w-5 h-5 mr-2" />
                        Use Camera
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="button-primary"
                    >
                      <div className='flex flex-row item-center'>
                        <Camera className="w-5 h-5 mr-2" />
                        Use Camera
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {!useCamera && (
                <div className="flex justify-center item-center">
                  <LoadingButton 
                    onClick={scanBarcode} 
                    disabled={isScanning || !imagePreview}
                    isLoading={isScanning}
                  >
                    Scan Barcode
                  </LoadingButton>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center">
              {useCamera ? (
                <div className="w-full">
                  <video 
                    ref={videoRef}
                    className="mb-4 border rounded p-2 bg-zinc-100 dark:bg-zinc-800 w-full max-h-64 object-contain"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 text-center">
                    {isCameraActive ? 'Point your camera at a barcode' : 'Camera is starting...'}
                  </div>
                </div>
              ) : imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Uploaded for barcode scanning" 
                    className="mb-4 border rounded p-2 bg-zinc-100 dark:bg-zinc-800 max-w-full max-h-64 object-contain"
                  />
                </>
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                  {useCamera ? 'Camera preview will appear here' : 'Image will appear here'}
                </div>
              )}

              {barcodeResult && (
                <div className="mt-4 result-box">
                  <div className='flex justify-between items-center'>
                    <h4 className="font-semibold mb-2">Barcode Details:</h4>
                    <CopyButton text={barcodeResult.rawValue} />
                  </div>
                  <div className="inner-result space-y-2">
                    <div className='w-full mono-output flex flex-col'>
                      <span>Format: {BARCODE_FORMATS.find(f => f.value === barcodeResult.format)?.label || barcodeResult.format}</span>
                      <span>Value: {barcodeResult.rawValue}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
      </div>
    </>
  );
}

export default BarcodeReader;