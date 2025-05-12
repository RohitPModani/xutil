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

interface ConversionResult {
  result: string;
  type: 'ts';
}

enum ConversionType {
  TS = 'ts',
}

type AnyDict = { [key: string]: any };
type AnyList = any[];

function jsonToTypescript(jsonData: string, interfaceName: string): string {
  try {
    if (!jsonData.trim()) {
      throw new Error('JSON data cannot be empty');
    }

    const data = JSON.parse(jsonData);
    const interfaces: string[] = [];
    const interfaceMap = new Map<string, string>();

    function capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getType(value: any, key: string, depth: number): string {
      if (value === null) {
        return 'null';
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          return 'any[]';
        }
        const types = new Set(value.map(item => getType(item, key, depth)));
        return types.size > 1 ? `(${Array.from(types).join(' | ')})[]` : `${Array.from(types)[0]}[]`;
      } else if (value && typeof value === 'object') {
        const subInterfaceName = `${interfaceName}_${capitalize(key)}`;
        if (!interfaceMap.has(subInterfaceName)) {
          generateInterface(value, subInterfaceName, depth + 1);
        }
        return subInterfaceName;
      } else {
        return typeof value;
      }
    }

    function generateInterface(obj: AnyDict | AnyList, name: string, depth: number): void {
      if (interfaceMap.has(name)) {
        return;
      }

      const lines: string[] = [`interface ${name} {`];
      const properties: AnyDict = Array.isArray(obj) ? (obj.length > 0 ? obj[0] : {}) : obj;

      for (const [key, value] of Object.entries(properties)) {
        const type = getType(value, key, depth);
        lines.push(`  ${key}: ${type};`);
      }

      lines.push('}');
      interfaceMap.set(name, lines.join('\n'));
      interfaces.push(lines.join('\n'));
    }

    generateInterface(data, interfaceName, 0);
    return interfaces.join('\n\n');
  } catch (e: any) {
    throw new Error(`JSON to TypeScript conversion failed: ${e.message || 'Invalid format'}`);
  }
}

function JSONTypescriptConverter() {
  const seo = seoDescriptions.jsonToTs;
  const [inputText, setInputText] = useState('');
  const [interfaceName, setInterfaceName] = useState('Data');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState('');
  const [, setFileType] = useState<ConversionType | null>(null);
  const [fileBaseName, setFileBaseName] = useState('');
  const [fileInputText, setFileInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const textResultRef = useRef<HTMLDivElement | null>(null);
  const fileResultRef = useRef<HTMLDivElement | null>(null);
  const inputTextRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const fileReset = useFileReset();

  useEffect(() => {
    updateToolUsage('json_ts');
  }, []);

  const scrollToResult = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const convertText = async () => {
    if (!inputText.trim()) {
      setError('Conversion failed: Input text cannot be empty');
      setConversionResult(null);
      return;
    }

    setError('');
    setIsConverting(true);

    try {
      const result = jsonToTypescript(inputText, interfaceName);
      setConversionResult({ result, type: 'ts' });
      scrollToResult(textResultRef);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(`Conversion failed: ${err.message || 'Invalid format'}`);
      setConversionResult(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileSelection = async (file: File) => {
    if (!file) {
      setError('File upload failed: No file selected');
      setFileInputText('');
      setSelectedFile(null);
      return;
    }

    try {
      const fileText = await file.text();
      setFileInputText(fileText);
      setSelectedFile(file);
      setFileBaseName(file.name.replace(/\.[^/.]+$/, ''));
      setError('');
    } catch (err: any) {
      console.error('File read error:', err);
      setError(`File read failed: ${err.message || 'Unable to read file'}`);
      setFileInputText('');
      setSelectedFile(null);
    }
  };

  const handleFileConversion = async () => {
    if (!selectedFile || !fileInputText.trim()) {
      setError('Conversion failed: No file selected or file content is empty');
      setFileResult('');
      setFileType(null);
      return;
    }

    setError('');
    setIsConverting(true);

    try {
      const result = jsonToTypescript(fileInputText, interfaceName);
      setFileResult(result);
      setFileType(ConversionType.TS);
      scrollToResult(fileResultRef);
    } catch (err: any) {
      console.error('File conversion error:', err);
      setError(`Conversion failed: ${err.message || 'Invalid format'}`);
      setFileResult('');
      setFileType(null);
    } finally {
      setIsConverting(false);
    }
  };

  const clearTextConversion = () => {
    setInputText('');
    setInterfaceName('Data');
    setConversionResult(null);
    setError('');
  };

  const clearFileConversion = () => {
    setFileResult('');
    setFileInputText('');
    setSelectedFile(null);
    setFileType(null);
    setFileBaseName('');
    setInterfaceName('Data');
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
                Input JSON:
              </label>
              <AutoTextarea
                id="input-text"
                value={inputText}
                onChange={handleInputTextChange}
                className="input-field w-full"
                placeholder="Enter JSON text to convert"
                ref={inputTextRef}
                aria-describedby={error ? "json-ts-text-error" : undefined}
                aria-label="JSON input text"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center">
                  <label className="form-label text-base mr-2">Interface Name:</label>
                  <input
                    value={interfaceName}
                    onChange={(e) => setInterfaceName(e.target.value || 'Data')}
                    className="input-field rounded-md w-32"
                    placeholder="Data"
                  />
                </div>
                <LoadingButton 
                  onClick={convertText} 
                  isLoading={isConverting}
                  disabled={!inputText.trim()}
                >
                  Convert
                </LoadingButton>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted TypeScript:</label>
                <div className="flex items-center gap-2">
                  <CopyButton 
                    text={conversionResult?.result || ''} 
                  />
                  <DownloadButton
                    content={conversionResult?.result || ''}
                    fileName={`converted_result.ts`}
                    fileType="ts"
                    disabled={!conversionResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={conversionResult?.result || ''}
                readOnly
                disabled={!conversionResult}
                placeholder="Converted TypeScript interface will appear here..."
                className={`input-field w-full ${
                  !conversionResult ? 'text-zinc-400 dark:text-zinc-500' : ''
                }`}
                style={{ whiteSpace: 'pre' }}
                aria-label="Converted TypeScript result"
              />
              {conversionResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: JSON to TypeScript
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="json-ts-text-error" />}
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
              <label className="form-label" htmlFor="json-file-upload">
                Upload JSON File
              </label>
              <FileUploader
                accept=".json"
                label="Choose JSON"
                onFileSelected={handleFileSelection}
                onClear={clearFileConversion}
                resetSignal={fileReset.resetSignal}
                disabled={isConverting}
              />
              <div className="flex flex-wrap gap-2 items-center mt-4">
                <div className="flex items-center">
                  <label className="form-label text-base mr-2">Interface Name:</label>
                  <input
                    value={interfaceName}
                    onChange={(e) => setInterfaceName(e.target.value || 'Data')}
                    className="input-field rounded-md w-32"
                    placeholder="Data"
                  />
                </div>
                <LoadingButton 
                  onClick={handleFileConversion} 
                  isLoading={isConverting}
                  disabled={!selectedFile || !fileInputText.trim()}
                >
                  Convert
                </LoadingButton>
              </div>
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
                style={{ whiteSpace: 'pre' }}
                aria-label="Input text from uploaded file"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted TypeScript:</label>
                <div>
                  <CopyButton 
                    text={fileResult} 
                    className="mr-3" 
                  />
                  <DownloadButton
                    content={fileResult}
                    fileName={`${fileBaseName}_converted.ts`}
                    fileType="ts"
                    disabled={!fileResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={fileResult}
                readOnly
                disabled={!fileResult}
                placeholder="Converted result will appear here..."
                className={`input-field w-full h-64 ${!fileResult ? 'text-zinc-400 dark:text-zinc-500' : ''}`}
                style={{ whiteSpace: 'pre' }}
                aria-label="Converted result from uploaded file"
              />
              {fileResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: JSON to TypeScript
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="json-ts-file-error" />}
        </SectionCard>
      </div>
    </>
  );
}

export default JSONTypescriptConverter;