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

interface YAMLToJSONResponse {
  result: string;
}

interface JSONToYAMLResponse {
  result: string;
}

enum ConversionType {
  JSON = 'json',
  YAML = 'yaml',
}

function YAMLJSONConverter() {
  const seo = seoDescriptions.yamlJson;
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [inputText, setInputText] = useState('');
  const [yamlToJsonResult, setYamlToJsonResult] = useState<YAMLToJSONResponse | null>(null);
  const [jsonToYamlResult, setJsonToYamlResult] = useState<JSONToYAMLResponse | null>(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingYAML_JSON, setIsLoadingYAML_JSON] = useState(false);
  const [isLoadingJSON_YAML, setIsLoadingJSON_YAML] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileType, setFileType] = useState<ConversionType | null>(null);
  const [fileBaseName, setFileBaseName] = useState('');
  const [yamlFileText, setYamlFileText] = useState('');
  const [jsonFileText, setJsonFileText] = useState('');
  const textResultRef = useRef<HTMLDivElement | null>(null);
  const fileResultRef = useRef<HTMLDivElement | null>(null);

  const yamlReset = useFileReset();
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
  
    if (type === ConversionType.YAML) {
      setIsLoadingYAML_JSON(true);
      setJsonToYamlResult(null);
    } else {
      setIsLoadingJSON_YAML(true);
      setYamlToJsonResult(null);
    }
  
    setError(null);
  
    try {
      const endpoint =
        type === ConversionType.YAML ? '/yaml-json/yaml-to-json' : '/yaml-json/json-to-yaml';
  
      const payload =
        type === ConversionType.YAML ? { yaml_text: inputText } : { json_text: inputText };
  
      const response = await api.post<{ result: string }>(endpoint, payload);
  
      if (type === ConversionType.YAML) {
        setYamlToJsonResult(response.data);
      } else {
        setJsonToYamlResult(response.data);
      }
  
      scrollToTextResult();
    } catch (err: any) {
      setError(`Text conversion failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      if (type === ConversionType.YAML) {
        setIsLoadingYAML_JSON(false);
      } else {
        setIsLoadingJSON_YAML(false);
      }
    }
  };  

  const clearTextConversion = () => {
    setInputText('');
    setYamlToJsonResult(null);
    setJsonToYamlResult(null);
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

      if (type === ConversionType.YAML) {
        setYamlFileText(fileText);
        setJsonFileText('');
        jsonReset.triggerReset();
      } else {
        setJsonFileText(fileText);
        setYamlFileText('');
        yamlReset.triggerReset();
      }

      const endpoint =
        type === ConversionType.YAML ? '/yaml-json/yaml-to-json-file' : '/yaml-json/json-to-yaml-file';

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFileResult(response.data.result || '');
      scrollToFileResult();
      setFileType(type === ConversionType.YAML ? ConversionType.JSON : ConversionType.YAML);
    } catch (err: any) {
      setError(`File upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const clearFileConversion = () => {
    setFileResult('');
    setYamlFileText('');
    setJsonFileText('');
    setFileType(null);
    setError(null);
    yamlReset.triggerReset();
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
        <SEODescription title={'a ' + seo.title}>{seo.body}</SEODescription>

        {/* Text Conversion Section */}
        <SectionCard>
            {isMobile ? (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Text Conversion</h3>
                    <ClearButton
                    onClick={clearTextConversion}
                    disabled={inputText === '' && !yamlToJsonResult && !jsonToYamlResult}
                    />
                </div>
            ): (
                <div className="flex items-center justify-between mb-4" ref={textResultRef}>
                    <h3 className="text-lg font-semibold">Text Conversion</h3>
                    <ClearButton
                    onClick={clearTextConversion}
                    disabled={inputText === '' && !yamlToJsonResult && !jsonToYamlResult}
                    />
                </div>
            )}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <label className="form-label">Input Text:</label>
                    <AutoTextarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="input-field w-full"
                        disabled={isLoadingYAML_JSON || isLoadingJSON_YAML}
                        placeholder="Enter YAML or JSON text to convert"
                    />
                    <div className="flex space-x-2">
                        <LoadingButton onClick={() => handleTextConversion(ConversionType.YAML)} isLoading={isLoadingYAML_JSON}>
                        YAML to JSON
                        </LoadingButton>
                        <LoadingButton onClick={() => handleTextConversion(ConversionType.JSON)} isLoading={isLoadingJSON_YAML}>
                        JSON to YAML
                        </LoadingButton>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <label className="form-label">Converted Result:</label>
                    {(yamlToJsonResult || jsonToYamlResult) && (
                    <CopyButton text={yamlToJsonResult?.result || jsonToYamlResult?.result || ''} />
                    )}
                </div>
                <AutoTextarea
                    value={yamlToJsonResult?.result || jsonToYamlResult?.result || ''}
                    readOnly
                    disabled={!yamlToJsonResult && !jsonToYamlResult}
                    placeholder="Converted result will appear here..."
                    className={`input-field w-full ${
                    !yamlToJsonResult && !jsonToYamlResult ? 'text-gray-400 dark:text-gray-500' : ''
                    }`}
                />
                {(yamlToJsonResult || jsonToYamlResult) && (
                    <p className="text-sm text-muted mt-1">
                    Converted: {yamlToJsonResult ? 'YAML to JSON' : 'JSON to YAML'}
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
                <ClearButton
                  onClick={clearFileConversion}
                  disabled={yamlFileText === '' && jsonFileText === '' && fileResult === ''}
                />
              </div>
            ) : (
                <div className="flex items-center justify-between mb-4" ref={fileResultRef}>
                    <h3 className="text-lg font-semibold">File Conversion</h3>
                    <ClearButton
                    onClick={clearFileConversion}
                    disabled={yamlFileText === '' && jsonFileText === '' && fileResult === ''}
                    />
                </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                <label className="form-label block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload YAML File
                </label>
                <FileUploader
                    accept=".yaml"
                    label="Choose YAML"
                    disabled={isLoadingFile}
                    onFileSelected={(file) => handleFileConversion(file, ConversionType.YAML)}
                    onClear={clearFileConversion}
                    resetSignal={yamlReset.resetSignal}
                />
                </div>

                <div className="flex-1">
                <label className="form-label block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                <label className="form-label">Input Text (from file):</label>
                <AutoTextarea
                    value={yamlFileText || jsonFileText}
                    readOnly
                    disabled={!yamlFileText && !jsonFileText}
                    placeholder="Input text will appear here after uploading a file..."
                    className={`input-field w-full h-64 ${
                    !yamlFileText && !jsonFileText ? 'text-gray-400 dark:text-gray-500' : ''
                    }`}
                />
                </div>

                <div className="flex-1 space-y-4">
                    {isMobile ? (
                        <div className="flex items-center justify-between" ref = {fileResultRef}>
                        <label className="form-label">Converted Result:</label>
                        <div>
                            <CopyButton text={fileResult} className="mr-3" />
                            <DownloadButton
                                content={fileResult}
                                fileName={`${fileBaseName}_converted.${fileType?.toLowerCase() || 'txt'}`}
                                fileType={fileType || 'txt'}
                                disabled={!fileResult || !fileType}
                            />
                        </ div>
                    </div>
                    ) : (
                        <div className="flex items-center justify-between">
                        <label className="form-label">Converted Result:</label>
                        <div>
                            <CopyButton text={fileResult} className="mr-3" />
                            <DownloadButton
                                content={fileResult}
                                fileName={`${fileBaseName}_converted.${fileType?.toLowerCase() || 'txt'}`}
                                fileType={fileType || 'txt'}
                                disabled={!fileResult || !fileType}
                            />
                        </ div>
                    </div>
                    )}
                    <AutoTextarea
                    value={fileResult}
                    readOnly
                    disabled={!fileResult}
                    placeholder="Converted result will appear here after upload..."
                    className={`input-field w-full h-64 ${!fileResult ? 'text-gray-400 dark:text-gray-500' : ''}`}
                />
                    {fileResult && (
                        <p className="text-sm text-muted mt-1">
                        Converted: {fileType === ConversionType.JSON ? 'YAML to JSON' : 'JSON to YAML'}
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

export default YAMLJSONConverter;