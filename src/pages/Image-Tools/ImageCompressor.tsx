import { useEffect, useState, useCallback } from "react";
import BackToHome from "../../components/BackToHome";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import ErrorBox from "../../components/ErrorBox";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import seoDescriptions from "../../data/seoDescriptions";
import { updateToolUsage } from "../../utils/toolUsage";
import { Upload } from "lucide-react";
import LoadingButton from "../../components/LoadingButton";

interface CompressionResult {
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
}

function ImageCompressor() {
  const seo = seoDescriptions.imageCompressor;

  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressionResult, setCompressionResult] =
    useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(0.8); // Default compression quality (0.1 to 1.0)

  useEffect(() => {
    updateToolUsage("image_compressor");
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      setCompressionResult(null);
      setImagePreview(null);

      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
          setError("Please upload a valid image file (PNG, JPEG, etc.)");
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError("Image file size must be less than 10MB");
          return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const compressImage = useCallback(async () => {
    if (!imagePreview) {
      setError("Please upload an image first");
      return;
    }

    setIsCompressing(true);
    setError(null);
    setCompressionResult(null);

    try {
      const img = new Image();
      img.src = imagePreview;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not supported");
      }

      // Maintain aspect ratio, set max dimension to 1920px
      const maxDimension = 1920;
      let { width, height } = img;
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Compress as JPEG
      const compressedUrl = canvas.toDataURL("image/jpeg", quality);

      // Calculate file sizes
      const originalSize = (await fetch(imagePreview).then((res) => res.blob()))
        .size;
      const compressedSize = (
        await fetch(compressedUrl).then((res) => res.blob())
      ).size;

      setCompressionResult({
        compressedUrl,
        originalSize,
        compressedSize,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compress image");
      console.error("Image compression error:", err);
    } finally {
      setIsCompressing(false);
    }
  }, [imagePreview, quality]);

  const handleQualityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuality(parseFloat(e.target.value));
    },
    []
  );

  const handleClear = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setCompressionResult(null);
    setError(null);
    setQuality(0.8);
  }, []);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            <h3 className="text-lg font-semibold">Image Compressor</h3>
            <ClearButton
              onClick={handleClear}
              disabled={!imagePreview && !compressionResult}
              aria-label="Clear inputs"
            />
          </div>
          <hr className="line-break" />
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="form-label">Upload Image:</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
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

            <div className="flex flex-col space-y-2">
              <label className="form-label">
                Compression Quality: {(quality * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={quality}
                onChange={handleQualityChange}
                className="w-full"
              />
            </div>

            <div className="flex justify-center">
              <LoadingButton
                onClick={compressImage}
                disabled={isCompressing || !imagePreview}
                isLoading={isCompressing}
              >
                Compress Image
              </LoadingButton>
            </div>

            <div className="flex flex-col items-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Uploaded image for compression"
                  className="mb-4 border rounded p-2 bg-zinc-100 dark:bg-zinc-800 w-full max-h-64 object-contain"
                />
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                  Original image will appear here
                </div>
              )}
            </div>

            {compressionResult && (
              <div className="result-box">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Compression Result:</h4>
                </div>
                <div className="inner-result space-y-2">
                  <div className="w-full flex flex-col space-y-2">
                    <img
                      src={compressionResult.compressedUrl}
                      alt="Compressed image"
                      className="border rounded p-2 bg-zinc-100 dark:bg-zinc-800 w-full max-h-64 object-contain"
                    />
                    <div className="flex flex-col space-y-1">
                      <span>
                        Original Size:{" "}
                        {formatFileSize(compressionResult.originalSize)}
                      </span>
                      <span>
                        Compressed Size:{" "}
                        {formatFileSize(compressionResult.compressedSize)}
                      </span>
                      <span>
                        Reduction:{" "}
                        {(
                          (1 -
                            compressionResult.compressedSize /
                              compressionResult.originalSize) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        downloadFile(
                          compressionResult.compressedUrl,
                          "compressed-image.jpg"
                        )
                      }
                      className="button-primary text-center"
                    >
                      Download Compressed Image
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

export default ImageCompressor;
