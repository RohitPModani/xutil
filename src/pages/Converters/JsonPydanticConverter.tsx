import { useState, useRef } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import api from '../../services/api';
import CopyButton from '../../components/CopyButton';
import AutoTextarea from '../../hooks/useAutoSizeTextArea';
import DownloadButton from '../../components/DownloadButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import FileUploader from '../../components/FileUploader';
import { PageSEO } from '../../components/PageSEO';
import ClearButton from '../../components/ClearButton';
import { useFileReset } from '../../hooks/useFileReset';
import seoDescriptions from '../../data/seoDescriptions';

function JSONPydanticClassConverter() {
  const seo = seoDescriptions.jsonToPydantic;
  const [textInput, setTextInput] = useState('');
  const [className, setClassName] = useState('Root');
  const [isTextConverting, setIsTextConverting] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [fileClassName, setFileClassName] = useState('Root');
  const [isFileConverting, setIsFileConverting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileResult, setFileResult] = useState('');
  const [textResult, setTextResult] = useState(''); 
  const fileReset = useFileReset();
  const [jsonFileText, setJsonFileText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTextConversion = async () => {
    if (!textInput.trim()) {
      setTextError('Input text cannot be empty');
      return;
    }
    setIsTextConverting(true);
    setTextError(null);
    setTextResult(''); // Clear previous

    try {
      const endpoint = '/json-pydantic/json-to-pydantic'

      const payload = { json_data: textInput, class_name: className }

      const response = await api.post<{ result: string }>(endpoint, payload);

      setTextResult(response.data.result || ''); // <-- Set into textResult now
    } catch (err: any) {
      setTextError(err.response?.data?.detail || err.message);
    } finally {
      setIsTextConverting(false);
    }
  };

  const handleFileConversion = async () => {
    if (!fileUpload) {
      setFileError('Please upload a file first');
      return;
    }
    setIsFileConverting(true);
    setFileError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileUpload);
      formData.append('class_name', fileClassName);

      const fileText = await fileUpload.text();
      setJsonFileText(fileText)

      const endpoint = '/json-pydantic/json-to-pydantic-file';

      const response = await api.post<{ result: string }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFileResult(response.data.result || '');
      setFileUpload(null);
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setFileError(err.response?.data?.detail || err.message);
    } finally {
      setIsFileConverting(false);
    }
  };

  const clearTextConversion = () => {
    setTextInput('');
    setTextError('');
    setClassName('Root');
    setTextResult('');
  };

  const clearFileConversion = () => {
    setFileUpload(null);
    setFileResult('');
    setFileError('');
    setFileClassName('Root');
    setJsonFileText('');
    fileReset.triggerReset();
  };

  return (
    <>
      <PageSEO title="JSON to Pydantic Class Converter" description="Convert JSON to Pydantic class." />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>

        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>
        <SEODescription title={'a ' + seo.title}>{seo.body}</SEODescription>

        {/* Text Conversion Section */}
        <SectionCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">JSON ➔ Pydantic Class (Text Conversion)</h3>
            <ClearButton onClick={clearTextConversion} disabled={!textInput} />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label">Input Text:</label>
              <AutoTextarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="input-field w-full h-48"
                placeholder="Paste your JSON here..."
              />

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center">
                    <label className="form-label text-sm sm:text-base mr-2">Class Name:</label>
                    <input
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="input-field rounded-md w-auto"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <LoadingButton onClick={handleTextConversion} isLoading={isTextConverting}>
                      Convert
                    </LoadingButton>
                  </div>
                </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted Result:</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={textResult} className="mr-2" />
                  <DownloadButton
                    content={textResult}
                    fileName={`${className}.txt`}
                    fileType="txt"
                    disabled={!textResult}
                  />
                </div>
              </div>
              <AutoTextarea
                value={textResult || ''}
                readOnly
                disabled={!textResult}
                placeholder="Converted result will appear here..."
                className={`input-field w-full ${
                  !textResult? 'text-zinc-400 dark:text-zinc-500' : ''
                }`}
              />
            </div>
          </div>

          {textError && <ErrorBox message={textError} />}
        </SectionCard>

        {/* File Conversion Section */}
        <SectionCard className="mt-6">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">JSON ➔ Pydantic Class (File Conversion)</h3>
              <ClearButton onClick={clearFileConversion} disabled = {jsonFileText === '' && fileResult === ''}/>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="form-label">
                Upload JSON File
              </label>
              <FileUploader
                accept=".json"
                label="Choose JSON File"
                onFileSelected={(file) => setFileUpload(file)}
                onClear={clearFileConversion}
                resetSignal={fileReset.resetSignal}
              />
              <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                  <div className="flex items-center">
                    <label className="form-label text-sm sm:text-base mr-2">Class Name:</label>
                    <input
                      value={fileClassName}
                      onChange={(e) => setFileClassName(e.target.value)}
                      className="input-field rounded-md w-auto"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <LoadingButton onClick={handleFileConversion} isLoading={isFileConverting}>
                      Convert
                    </LoadingButton>
                  </div>
                </div>
            </div>
          </div>

          {/* Input Text Box (Always visible) */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <label className="form-label">Input Text (from file):</label>
              <AutoTextarea
                value={jsonFileText}
                readOnly
                placeholder="Input text will appear here after uploading a file..."
                className={`input-field w-full h-64 ${
                  !jsonFileText ? 'text-zinc-400 dark:text-zinc-500' : ''
                }`}
              />
            </div>

            {/* Result Box (Always visible) */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="form-label">Converted Result:</label>
                  <div>
                    <CopyButton text={fileResult} className="mr-3" />
                    <DownloadButton
                      content={fileResult}
                      fileName={`${fileClassName}.txt`}
                      fileType='txt'
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
              />
            </div>
          </div>

          {fileError?.startsWith('File upload failed') && <ErrorBox message={fileError} />}
        </SectionCard>
      </div>
    </>
  );
}

export default JSONPydanticClassConverter;
