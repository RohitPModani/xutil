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
  type: 'csv' | 'json';
}

enum ConversionType {
  CSV = 'csv',
  JSON = 'json',
}

type AnyDict = { [key: string]: any };
type AnyList = any[];

function flattenJson(data: AnyDict | AnyList, _parentKey: string = '', sep: string = '_'): { records: AnyDict[], headers: string[] } {
  const records: AnyDict[] = [];
  const headers: string[] = [];

  function flatten(obj: any, prefix: string = '', currentRecords: AnyDict[] = [{}]): AnyDict[] {
    if (Array.isArray(obj)) {
      const newRecords: AnyDict[] = [];
      obj.forEach(item => {
        const itemRecords = currentRecords.map(rec => ({ ...rec }));
        newRecords.push(...flatten(item, prefix, itemRecords));
      });
      return newRecords.length > 0 ? newRecords : currentRecords;
    } else if (obj && typeof obj === 'object') {
      let newRecords = currentRecords;
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}${sep}${key}` : key;
        newRecords = flatten(value, newKey, newRecords);
      }
      return newRecords;
    } else {
      if (!headers.includes(prefix)) {
        headers.push(prefix);
      }
      return currentRecords.map(rec => ({ ...rec, [prefix]: obj }));
    }
  }

  const input = Array.isArray(data) ? data : [data];
  input.forEach(item => {
    const resultRecords = flatten(item);
    records.push(...resultRecords);
  });

  return { records, headers };
}

function unflattenDict(d: AnyDict, sep: string = '_'): AnyDict {
  const result: AnyDict = {};
  for (const [key, value] of Object.entries(d)) {
    const parts = key.split(sep);
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      current[part] = current[part] || {};
      current = current[part];
    }
    current[parts[parts.length - 1]] = value === null ? null : value;
  }
  return result;
}

function jsonToCsv(jsonData: string, separator: string = '_'): string {
  try {
    if (!jsonData.trim()) {
      throw new Error('JSON data cannot be empty');
    }

    const data = JSON.parse(jsonData);
    const { records, headers } = flattenJson(data, '', separator);

    if (records.length === 0) {
      return '';
    }

    const rows = records.map(record => 
      headers.map(header => {
        const value = record[header] ?? '';
        return typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  } catch (e: any) {
    throw new Error(`JSON to CSV conversion failed: ${e.message || 'Invalid format'}`);
  }
}

function csvToJson(csvData: string, separator: string = '_'): string {
  try {
    if (!csvData.trim()) {
      throw new Error('CSV data cannot be empty');
    }

    const lines = csvData.trim().split('\n');
    if (lines.length < 1) {
      throw new Error('CSV data must contain at least a header row');
    }

    const headers = parseCsvLine(lines[0]);
    const records: AnyDict[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const record: AnyDict = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || null;
      });
      records.push(record);
    }

    const nestedRecords = records.map(record => unflattenDict(record, separator));
    return JSON.stringify(nestedRecords, null, 2);
  } catch (e: any) {
    throw new Error(`CSV to JSON conversion failed: ${e.message || 'Invalid format'}`);
  }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i - 1] !== '\\') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.replace(/""/g, '"'));
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.replace(/""/g, '"'));
  return result.map(val => val.trim().replace(/^"|"$/g, ''));
}

function CSVJSONConverter() {
  const seo = seoDescriptions.csvJson;
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
    updateToolUsage('csv_json');
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
      if (type === ConversionType.CSV) {
        result = jsonToCsv(inputText);
        setConversionResult({ result, type: 'csv' });
      } else {
        result = csvToJson(inputText);
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

      if (type === ConversionType.CSV) {
        result = jsonToCsv(fileText);
        setFileType(ConversionType.CSV);
      } else {
        result = csvToJson(fileText);
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
    setFileBaseName('');
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
                placeholder="Enter JSON text to convert"
                ref={inputTextRef}
                aria-describedby={error ? "son-text-error" : undefined}
                aria-label="JSON input text"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <LoadingButton 
                  onClick={() => convertText(ConversionType.CSV)} 
                  isLoading={isConverting}
                  disabled={!inputText.trim()}
                >
                  JSON to CSV
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
                style={{ whiteSpace: 'pre' }}
                aria-label="Converted CSV or JSON result"
              />
              {conversionResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: {conversionResult.type === 'json' ? 'CSV to JSON' : 'JSON to CSV'}
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="csv-json-text-error" />}
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
          <div className ="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label" htmlFor="csv-file-upload">
                Upload CSV File
              </label>
              <FileUploader
                accept=".csv"
                label="Choose CSV"
                onFileSelected={(file) => handleFileConversion(file, ConversionType.JSON)}
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
                onFileSelected={(file) => handleFileConversion(file, ConversionType.CSV)}
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
                style={{ whiteSpace: 'pre' }}
                aria-label="Converted result from uploaded file"
              />
              {fileResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: {fileType === ConversionType.JSON ? 'CSV to JSON' : 'JSON to CSV'}
                </p>
              )}
            </div>
          </div>
          {error && <ErrorBox message={error} id="csv-json-file-error" />}
        </SectionCard>
      </div>
    </>
  );
}

export default CSVJSONConverter;