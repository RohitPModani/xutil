import { useState, useRef, useEffect } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import DownloadButton from '../../components/DownloadButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import FileUploader from '../../components/FileUploader';
import { useFileReset } from '../../hooks/useFileReset';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { updateToolUsage } from '../../utils/toolUsage';
import * as yaml from 'js-yaml';

interface ConversionResult {
  result: string;
  type: 'yaml' | 'json';
}

enum ConversionType {
  JSON = 'json',
  YAML = 'yaml',
}

function YAMLJSONConverter() {
  const seo = seoDescriptions.yamlJson;
  const [inputText, setInputText] = useState('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState<ConversionType | null>(null);
  const [fileBaseName, setFileBaseName] = useState('');
  const [fileInputText, setFileInputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const textResultRef = useRef<HTMLDivElement | null>(null);
  const fileResultRef = useRef<HTMLDivElement | null>(null);
  const inputTextRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const fileReset = useFileReset();

  useEffect(() => {
    updateToolUsage('yaml_json');
  }, []);

  const scrollToResult = (ref: React.RefObject<HTMLDivElement | null>) => {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };

  const convertText = async (type: ConversionType) => {
    if (!inputText.trim()) {
      setError('Conversion failed: Input text cannot be empty');
      setConversionResult(null);
      return;
    }

    setError('');
    setIsConverting(true);

    try {
      let result: string;
      if (type === ConversionType.YAML) {
        // JSON to YAML
        const jsonObj = JSON.parse(inputText);
        result = yaml.dump(jsonObj, { lineWidth: -1 }); // -1 for no line folding
        setConversionResult({ result, type: 'yaml' });
      } else {
        // YAML to JSON
        const yamlObj = yaml.load(inputText);
        result = JSON.stringify(yamlObj, null, 2);
        setConversionResult({ result, type: 'json' });
      }
      scrollToResult(textResultRef);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(`Conversion failed: ${err.message || 'Invalid format'}`);
      setConversionResult(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileConversion = async (file: File, type: ConversionType) => {
    if (!file) {
      setError('File upload failed: No file selected');
      setFileResult('');
      setFileType(null);
      return;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setFileBaseName(baseName);
    setIsConverting(true);

    try {
      const fileText = await file.text();
      setFileInputText(fileText);
      let result: string;

      if (type === ConversionType.YAML) {
        // JSON file to YAML
        const jsonObj = JSON.parse(fileText);
        result = yaml.dump(jsonObj, { lineWidth: -1 });
        setFileType(ConversionType.YAML);
      } else {
        // YAML file to JSON
        const yamlObj = yaml.load(fileText);
        result = JSON.stringify(yamlObj, null, 2);
        setFileType(ConversionType.JSON);
      }

      setFileResult(result);
      setError('');
      scrollToResult(fileResultRef);
    } catch (err: any) {
      console.error('File conversion error:', err);
      setError(`File conversion failed: ${err.message || 'Invalid format'}`);
      setFileResult('');
      setFileType(null);
    } finally {
      setIsConverting(false);
    }
  };

  const clearTextConversion = () => {
    setInputText('');
    setConversionResult(null);
    setError('');
  };

  const clearFileConversion = () => {
    setFileResult('');
    setFileInputText('');
    setFileType(null);
    setError('');
    fileReset.triggerReset();
  };

  const handleInputTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (inputTextRef.current) {
      inputTextRef.current.focus();
    }
  };

  return (
    <>
      <PageSEO title={seo.title} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex flex-row items-center justify-start justify-between gap-3 mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={'a ' + seo.title}>{seo.body}</SEODescription>

        {/* Text Conversion Section */}
        <SectionCard>
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Text Conversion</h3>
              <ClearButton 
                onClick={clearTextConversion} 
                disabled={!inputText && !conversionResult && !error} 
              />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4" ref={textResultRef}>
              <h3 className="text-lg font-semibold">Text Conversion</h3>
              <ClearButton 
                onClick={clearTextConversion} 
                disabled={!inputText && !conversionResult && !error} 
              />
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label" htmlFor="input-text">
                Input Text:
              </label>
              <AutoTextarea
                id="input-text"
                value={inputText}
                onChange={handleInputTextChange}
                className="input-field w-full"
                placeholder="Enter YAML or JSON text to convert"
                ref={inputTextRef}
                aria-describedby={error ? "yaml-json-text-error" : undefined}
                aria-label="YAML or JSON input text"
              />
              <div className="flex flex-wrap gap-2">
                <LoadingButton 
                  onClick={() => convertText(ConversionType.YAML)} 
                  isLoading={isConverting}
                  disabled={!inputText.trim()}
                >
                  JSON to YAML
                </LoadingButton>
                <LoadingButton 
                  onClick={() => convertText(ConversionType.JSON)} 
                  isLoading={isConverting}
                  disabled={!inputText.trim()}
                >
                  YAML to JSON
                </LoadingButton>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Result:</label>
                <div className="flex items-center gap-2">
                  <CopyButton 
                    text={conversionResult?.result || ''} 
                  />
                  <DownloadButton
                    content={conversionResult?.result || ''}
                    fileName={`converted_result.${conversionResult?.type || 'txt'}`}
                    fileType={conversionResult?.type || 'txt'}
                    disabled={!conversionResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={conversionResult?.result || ''}
                readOnly
                disabled={!conversionResult}
                placeholder="Converted result will appear here..."
                className={`input-field w-full ${
                  !conversionResult ? 'text-zinc-400 dark:text-zinc-500' : ''
                }`}
                aria-label="Converted YAML or JSON result"
              />
              {conversionResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: {conversionResult.type === 'json' ? 'YAML to JSON' : 'JSON to YAML'}
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="yaml-json-text-error" />}
        </SectionCard>

        {/* File Conversion Section */}
        <SectionCard className="mt-6">
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">File Conversion</h3>
              <ClearButton 
                onClick={clearFileConversion} 
                disabled={!fileInputText && !fileResult && !error} 
              />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4" ref={fileResultRef}>
              <h3 className="text-lg font-semibold">File Conversion</h3>
              <ClearButton 
                onClick={clearFileConversion} 
                disabled={!fileInputText && !fileResult && !error} 
              />
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label" htmlFor="yaml-file-upload">
                Upload YAML File
              </label>
              <FileUploader
                accept=".yaml,.yml"
                label="Choose YAML"
                onFileSelected={(file) => handleFileConversion(file, ConversionType.YAML)}
                onClear={clearFileConversion}
                resetSignal={fileReset.resetSignal}
                disabled={isConverting}
              />
            </div>

            <div className="flex-1">
              <label className="form-label" htmlFor="json-file-upload">
                Upload JSON File
              </label>
              <FileUploader
                accept=".json"
                label="Choose JSON"
                onFileSelected={(file) => handleFileConversion(file, ConversionType.JSON)}
                onClear={clearFileConversion}
                resetSignal={fileReset.resetSignal}
                disabled={isConverting}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label mb-3">Input Text (from file):</label>
              <AutoTextarea
                value={fileInputText}
                readOnly
                disabled={!fileInputText}
                placeholder="Input text from file..."
                className={`input-field w-full h-64 ${
                  !fileInputText ? 'text-zinc-400 dark:text-zinc-500' : ''
                }`}
                aria-label="Input text from uploaded file"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Result:</label>
                <div>
                  <CopyButton 
                    text={fileResult} 
                    className="mr-3" 
                  />
                  <DownloadButton
                    content={fileResult}
                    fileName={`${fileBaseName}_converted.${fileType || 'txt'}`}
                    fileType={fileType || 'txt'}
                    disabled={!fileResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={fileResult}
                readOnly
                disabled={!fileResult}
                placeholder="Converted result will appear here after upload..."
                className={`input-field w-full h-64 ${!fileResult ? 'text-zinc-400 dark:text-zinc-500' : ''}`}
                aria-label="Converted result from uploaded file"
              />
              {fileResult && (
                <p className="text-sm text-muted">
                  Converted: {fileType === ConversionType.JSON ? 'YAML to JSON' : 'JSON to YAML'}
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="yaml-json-file-error" />}
        </SectionCard>
      </div>
    </>
  );
}

export default YAMLJSONConverter;