import { useState, useRef } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import api from '../../services/api';
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

interface XMLToJSONResponse {
  result: string;
}

interface JSONToXMLResponse {
  result: string;
}

enum ConversionType {
  JSON = 'json',
  XML = 'xml',
}

function XMLJSONConverter() {
  const seo = seoDescriptions.xmlJson;
  const [inputText, setInputText] = useState('');
  const [xmlToJsonResult, setXmlToJsonResult] = useState<XMLToJSONResponse | null>(null);
  const [jsonToXmlResult, setJsonToXmlResult] = useState<JSONToXMLResponse | null>(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingXML_JSON, setIsLoadingXML_JSON] = useState(false);
  const [isLoadingJSON_XML, setIsLoadingJSON_XML] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileType, setFileType] = useState<ConversionType | null>(null);
  const [fileBaseName, setFileBaseName] = useState('');
  const [xmlFileText, setXmlFileText] = useState('');
  const [jsonFileText, setJsonFileText] = useState('');
  const textResultRef = useRef<HTMLDivElement | null>(null);
  const fileResultRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const xmlReset = useFileReset();
  const jsonReset = useFileReset();

  const scrollToTextResult = () => {
    setTimeout(() => {
      textResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  
  const scrollToFileResult = () => {
    setTimeout(() => {
      fileResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };  

  const handleTextConversion = async (type: ConversionType) => {
    if (!inputText.trim()) {
      setError('Text conversion failed: Input text cannot be empty');
      return;
    }
  
    if (type === ConversionType.XML) {
      setIsLoadingXML_JSON(true);
      setJsonToXmlResult(null);
    } else {
      setIsLoadingJSON_XML(true);
      setXmlToJsonResult(null);
    }
  
    setError(null);
  
    try {
      const endpoint =
        type === ConversionType.XML ? '/xml-json/xml-to-json' : '/xml-json/json-to-xml';
  
      const payload =
        type === ConversionType.XML ? { xml_text: inputText } : { json_text: inputText };
  
      const response = await api.post<{ result: string }>(endpoint, payload);
  
      if (type === ConversionType.XML) {
        setXmlToJsonResult(response.data);
      } else {
        setJsonToXmlResult(response.data);
      }
  
      scrollToTextResult();
    } catch (err: any) {
      setError(`Text conversion failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      if (type === ConversionType.XML) {
        setIsLoadingXML_JSON(false);
      } else {
        setIsLoadingJSON_XML(false);
      }
    }
  };

  const clearTextConversion = () => {
    setInputText('');
    setXmlToJsonResult(null);
    setJsonToXmlResult(null);
    setError(null);
  };

  const handleFileConversion = async (file: File, type: ConversionType) => {
    if (!file) {
      setError('File upload failed: No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setFileBaseName(baseName);

    setIsLoadingFile(true);
    setError(null);
    setFileResult('');
    setFileType(null);

    try {
      const fileText = await file.text();

      if (type === ConversionType.XML) {
        setXmlFileText(fileText);
        setJsonFileText('');
        jsonReset.triggerReset();
      } else {
        setJsonFileText(fileText);
        setXmlFileText('');
        xmlReset.triggerReset();
      }

      const endpoint =
        type === ConversionType.XML ? '/xml-json/xml-to-json-file' : '/xml-json/json-to-xml-file';

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFileResult(response.data.result || '');
      scrollToFileResult();
      setFileType(type === ConversionType.XML ? ConversionType.JSON : ConversionType.XML);
    } catch (err: any) {
      setError(`File upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const clearFileConversion = () => {
    setFileResult('');
    setXmlFileText('');
    setJsonFileText('');
    setFileType(null);
    setError(null);
    xmlReset.triggerReset();
    jsonReset.triggerReset();
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
        <SEODescription title={'an ' + seo.title}>{seo.body}</SEODescription>

        {/* Text Conversion Section */}
        <SectionCard>
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Text Conversion</h3>
              <ClearButton onClick={clearTextConversion} disabled = {inputText === '' && (xmlToJsonResult === null && jsonToXmlResult === null)}/>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4" ref={textResultRef}>
              <h3 className="text-lg font-semibold">Text Conversion</h3>
              <ClearButton onClick={clearTextConversion} disabled = {inputText === '' && (xmlToJsonResult === null && jsonToXmlResult === null)}/>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label">Input Text:</label>
              <AutoTextarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input-field w-full"
                disabled={isLoadingXML_JSON || isLoadingJSON_XML}
                placeholder="Enter XML or JSON text to convert"
              />
              <div className="flex space-x-2">
                <LoadingButton onClick={() => handleTextConversion(ConversionType.XML)} isLoading={isLoadingXML_JSON}>
                  XML to JSON
                </LoadingButton>
                <LoadingButton onClick={() => handleTextConversion(ConversionType.JSON)} isLoading={isLoadingJSON_XML}>
                  JSON to XML
                </LoadingButton>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Result:</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={xmlToJsonResult?.result || jsonToXmlResult?.result || ''} className='mr-2' />
                  <DownloadButton
                    content={xmlToJsonResult?.result || jsonToXmlResult?.result || ''}
                    fileName={`converted_result.${xmlToJsonResult ? 'json' : 'xml'}`}
                    fileType={xmlToJsonResult ? 'json' : 'xml'}
                    disabled={!xmlToJsonResult && !jsonToXmlResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={xmlToJsonResult?.result || jsonToXmlResult?.result || ''}
                readOnly
                disabled={!xmlToJsonResult && !jsonToXmlResult}
                placeholder="Converted result will appear here..."
                className={`input-field w-full ${
                  !xmlToJsonResult && !jsonToXmlResult ? 'text-zinc-400 dark:text-zinc-500' : ''
                }`}
              />
              {(xmlToJsonResult || jsonToXmlResult) && (
                <p className="text-sm text-muted mt-1">
                  Converted: {xmlToJsonResult ? 'XML to JSON' : 'JSON to XML'}
                </p>
              )}
            </div>
          </div>
          {error?.startsWith('Text conversion failed') && <ErrorBox message={error} />}
        </SectionCard>

        {/* File Conversion Section */}
        <SectionCard className="mt-6">
          {isMobile ? (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">File Conversion</h3>
              <ClearButton onClick={clearFileConversion} disabled = {xmlFileText === '' && jsonFileText === '' && fileResult === ''}/>
          </div>
          ) : (
            <div className="flex items-center justify-between mb-4" ref={fileResultRef}>
              <h3 className="text-lg font-semibold">File Conversion</h3>
              <ClearButton onClick={clearFileConversion} disabled = {xmlFileText === '' && jsonFileText === '' && fileResult === ''}/>
          </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label">
                Upload XML File
              </label>
              <FileUploader
                accept=".xml"
                label="Choose XML"
                disabled={isLoadingFile}
                onFileSelected={(file) => handleFileConversion(file, ConversionType.XML)}
                onClear={clearFileConversion}
                resetSignal={xmlReset.resetSignal}
              />
            </div>

            <div className="flex-1">
              <label className="form-label">
                Upload JSON File
              </label>
              <FileUploader
                accept=".json"
                label="Choose JSON"
                disabled={isLoadingFile}
                onFileSelected={(file) => handleFileConversion(file, ConversionType.JSON)}
                onClear={clearFileConversion}
                resetSignal={jsonReset.resetSignal}
              />
            </div>
          </div>

          {/* Input Text Box (Always visible) */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label">Input Text (from file):</label>
              <AutoTextarea
                value={xmlFileText || jsonFileText}
                readOnly
                disabled={!xmlFileText && !jsonFileText}
                placeholder="Input text will appear here after uploading a file..."
                className={`input-field w-full h-64 ${
                  !xmlFileText && !jsonFileText ? 'text-zinc-400 dark:text-zinc-500' : ''
                }`}
              />
            </div>

            {/* Result Box (Always visible) */}
            <div className="flex-1 space-y-4">
              {isMobile ? (
                <div className="flex items-center justify-between" ref={fileResultRef}>
                  <label className="form-label">Converted Result:</label>
                  <div>
                    <CopyButton text={fileResult} className="mr-3" />
                    <DownloadButton
                      content={fileResult}
                      fileName={`${fileBaseName}_converted.${fileType}`}
                      fileType={fileType || 'txt'}
                      disabled={!fileResult || !fileType}
                    />
                  </div>
                </div>
              ): (
                <div className="flex items-center justify-between">
                  <label className="form-label">Converted Result:</label>
                  <div>
                    <CopyButton text={fileResult} className="mr-3" />
                    <DownloadButton
                      content={fileResult}
                      fileName={`${fileBaseName}_converted.${fileType}`}
                      fileType={fileType || 'txt'}
                      disabled={!fileResult || !fileType}
                    />
                  </div>
              </div>
              )}
              <AutoTextarea
                value={fileResult}
                readOnly
                disabled={!fileResult}
                placeholder="Converted result will appear here after upload..."
                className={`input-field w-full h-64 ${!fileResult ? 'text-zinc-400 dark:text-zinc-500' : ''}`}
              />
              {fileResult && (
                <p className="text-sm text-muted mt-1">
                  Converted: {fileType === ConversionType.JSON ? 'XML to JSON' : 'JSON to XML'}
                </p>
              )}
            </div>
          </div>

          {error?.startsWith('File upload failed') && <ErrorBox message={error} />}
        </SectionCard>
      </div>
    </>
  );
}

export default XMLJSONConverter;
