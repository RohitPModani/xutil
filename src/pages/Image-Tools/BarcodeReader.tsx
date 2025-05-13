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
import { Upload, Camera } from 'lucide-react';
import LoadingButton from '../../components/LoadingButton';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';

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
  { value: 'MSI', label: 'MSI' },
  { value: 'pharmacode', label: 'Pharmacode' },
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
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    updateToolUsage('barcode_reader');
  }, []);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream?.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

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

      let detectedBarcodes: BarcodeResult[] = [];

      // Map BARCODE_FORMATS to BarcodeDetector supported formats
      const detectorFormats = BARCODE_FORMATS
        .map(format => {
          switch (format.value) {
            case 'CODE128':
            case 'CODE128A':
            case 'CODE128B':
            case 'CODE128C':
              return 'code_128';
            case 'EAN13':
              return 'ean_13';
            case 'EAN8':
              return 'ean_8';
            case 'UPC':
              return 'upc_a';
            case 'CODE39':
              return 'code_39';
            case 'ITF14':
              return 'itf';
            case 'codabar':
              return 'codabar';
            default:
              return null;
          }
        })
        .filter((f): f is Exclude<typeof f, null> => f !== null);

      if ('BarcodeDetector' in window && detectorFormats.length > 0) {
        const BarcodeDetector = (window as any).BarcodeDetector;
        const barcodeDetector = new BarcodeDetector({
          formats: [...new Set(detectorFormats)] // Remove duplicates
        });

        if (useCamera && cameraStream) {
          const videoTrack = cameraStream.getVideoTracks()[0];
          const imageCapture = new (window as any).ImageCapture(videoTrack);
          const bitmap = await imageCapture.grabFrame();
          const results = await barcodeDetector.detect(bitmap);
          detectedBarcodes = results.map((result: any) => ({
            format: BARCODE_FORMATS.find(f => {
              switch (result.format) {
                case 'code_128':
                  return ['CODE128', 'CODE128A', 'CODE128B', 'CODE128C'].includes(f.value);
                case 'ean_13':
                  return f.value === 'EAN13';
                case 'ean_8':
                  return f.value === 'EAN8';
                case 'upc_a':
                  return f.value === 'UPC';
                case 'code_39':
                  return f.value === 'CODE39';
                case 'itf':
                  return f.value === 'ITF14';
                case 'codabar':
                  return f.value === 'codabar';
                default:
                  return false;
              }
            })?.value || result.format,
            rawValue: result.rawValue,
            timestamp: Date.now()
          }));
        } else if (imagePreview) {
          const img = new Image();
          img.src = imagePreview;
          await img.decode();
          const results = await barcodeDetector.detect(img);
          detectedBarcodes = results.map((result: any) => ({
            format: BARCODE_FORMATS.find(f => {
              switch (result.format) {
                case 'code_128':
                  return ['CODE128', 'CODE128A', 'CODE128B', 'CODE128C'].includes(f.value);
                case 'ean_13':
                  return f.value === 'EAN13';
                case 'ean_8':
                  return f.value === 'EAN8';
                case 'upc_a':
                  return f.value === 'UPC';
                case 'code_39':
                  return f.value === 'CODE39';
                case 'itf':
                  return f.value === 'ITF14';
                case 'codabar':
                  return f.value === 'codabar';
                default:
                  return false;
              }
            })?.value || result.format,
            rawValue: result.rawValue,
            timestamp: Date.now()
          }));
        }
      }

      // Fallback to ZXing-js for all formats or if BarcodeDetector found nothing
      if (detectedBarcodes.length === 0) {
        const codeReader = new BrowserMultiFormatReader();
        if (imagePreview) {
          const img = new Image();
          img.src = imagePreview;
          await img.decode();

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const result = await codeReader.decodeFromImageElement(img);
            const zxingFormat = result.getBarcodeFormat();
            const formatMap: { [key: number]: string } = {
              [BarcodeFormat.CODE_128]: 'CODE128', // Note: ZXing doesn't distinguish A/B/C
              [BarcodeFormat.EAN_13]: 'EAN13',
              [BarcodeFormat.EAN_8]: 'EAN8',
              [BarcodeFormat.UPC_A]: 'UPC',
              [BarcodeFormat.CODE_39]: 'CODE39',
              [BarcodeFormat.ITF]: 'ITF14',
              [BarcodeFormat.CODABAR]: 'codabar',
            };
            const format = formatMap[zxingFormat] || zxingFormat.toString();
            if (BARCODE_FORMATS.some(f => f.value === format)) {
              detectedBarcodes = [
                {
                  format,
                  rawValue: result.getText(),
                  timestamp: Date.now()
                }
              ];
            }
          }
        }
      }

      if (detectedBarcodes.length === 0) {
        throw new Error('No barcode detected in the image');
      }

      const firstBarcode = detectedBarcodes[0];
      setBarcodeResult({
        format: firstBarcode.format,
        rawValue: firstBarcode.rawValue,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan barcode');
      console.error('Barcode scanning error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [imagePreview, useCamera, cameraStream]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setUseCamera(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setCameraStream(stream);
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setImagePreview(canvas.toDataURL('image/png'));
        }
      };
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
      console.error('Camera error:', err);
      setUseCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream?.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setUseCamera(false);
    setImagePreview(null);
  }, [cameraStream]);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setBarcodeResult(null);
    setError(null);
    if (useCamera) {
      stopCamera();
      setUseCamera(false);
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
              disabled={!imagePreview && !barcodeResult}
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
                      disabled={useCamera}
                    />
                  </label>
                </div>

                <div className="text-center text-zinc-500 dark:text-zinc-400">
                  or
                </div>

                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                  {!useCamera ? (
                    <button onClick={startCamera} className="button-primary" >
                        <div className="flex flex-row items-center justify-center">
                            <Camera className="w-5 h-5 mr-2" />
                            Use Camera
                        </div>
                    </button>
                  ) : (
                    <button onClick={stopCamera} className="button-primary" >
                        <div className="flex flex-row items-center justify-center">
                            <Camera className="w-5 h-5 mr-2" />
                            Stop Camera
                        </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-center item-center">
                <LoadingButton 
                  onClick={scanBarcode} 
                  disabled={isScanning || (!imagePreview && !useCamera)}
                  isLoading={isScanning}
                >
                  {useCamera ? 'Scan from Camera' : 'Scan Barcode'}
                </LoadingButton>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
                {imagePreview ? (
                    <>
                    <img 
                        src={imagePreview} 
                        alt="Uploaded for barcode scanning" 
                        className="mb-4 border rounded p-2 bg-zinc-100 dark:bg-zinc-800 max-w-full max-h-64 object-contain"
                    />
                    {useCamera && (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                        Point your camera at a barcode to scan
                        </div>
                    )}
                    </>
                ) : (
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                    {useCamera ? 'Camera preview will appear here' : 'Image will appear here'}
                    </div>
                )}
                {barcodeResult && (
                    <div className="mt-4 result-box">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold mb-2">Barcode Details:</h4>
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
            </div>
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
      </div>
    </>
  );
}

export default BarcodeReader;