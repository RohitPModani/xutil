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

function CSVJSONConverter() {
  const seo = seoDescriptions.csvJson;
  const [textInput, setTextInput] = useState('');
  const [textSeparator, setTextSeparator] = useState<'_' | '-' | ':' | '.'>('_');
  const [isTextConverting, setIsTextConverting] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [fileSeparator, setFileSeparator] = useState<'_' | '-' | ':' | '.'>('_');
  const [isFileConverting, setIsFileConverting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileResult, setFileResult] = useState('');
  const [fileBaseName, setFileBaseName] = useState('');
  const [textResult, setTextResult] = useState(''); 
  const fileReset = useFileReset();

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
      const endpoint = '/csv-json/json-to-csv'

      const payload = { json_data: textInput, separator: textSeparator }

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
      formData.append('separator', fileSeparator);

      setFileBaseName(fileUpload.name.replace(/\.[^/.]+$/, ''));

      const endpoint = '/csv-json/csv-to-json';

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
    setTextSeparator('_');
    setTextResult('');
  };

  const clearFileConversion = () => {
    setFileUpload(null);
    setFileResult('');
    setFileError('');
    setFileBaseName('');
    setFileSeparator('_');
    fileReset.triggerReset();
  };

  return (
    <>
      <PageSEO title="CSV ⇄ JSON Converter" description="Convert CSV to JSON and JSON to CSV easily." />
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
            <h3 className="text-lg font-semibold">JSON ➔ CSV (Text Conversion)</h3>
            <ClearButton onClick={clearTextConversion} disabled={!textInput} />
          </div>

          <AutoTextarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="input-field w-full h-48"
            placeholder="Paste your JSON here..."
          />

          <div className="flex gap-2 my-4">
            <div className="flex items-center justify-center">
              <label className="form-label text-base mr-2">Separator:</label>
              <select
                value={fileSeparator}
                onChange={(e) => setFileSeparator(e.target.value as '_' | '-' | ':' | '.')}
                className="input-field w-24"
              >
                <option value="_">_</option>
                <option value="-">-</option>
                <option value=":">:</option>
                <option value=".">.</option>
              </select>
            </div>

            <LoadingButton onClick={handleTextConversion} isLoading={isTextConverting}>
              Convert
            </LoadingButton>
          </div>

          { textResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="form-label">Converted CSV:</label>
                <div className="flex items-center gap-2">
                  <CopyButton text={textResult} />
                  <DownloadButton
                    content={textResult}
                    fileName="converted.csv"
                    fileType="csv"
                    disabled={!textResult}
                  />
                </div>
              </div>

              <AutoTextarea
                value={textResult}
                readOnly
                disabled={!textResult}
                className="input-field w-full h-64 overflow-x-auto"
                style={{ whiteSpace: 'pre' }} // Important!
              />
            </div>
          )}

          {textError && <ErrorBox message={textError} />}
        </SectionCard>

        {/* File Conversion Section */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">CSV ➔ JSON (File Conversion)</h3>
            <ClearButton onClick={clearFileConversion} disabled={!fileResult} />
          </div>

          <FileUploader
            accept=".csv"
            label="Choose CSV File"
            onFileSelected={(file) => setFileUpload(file)}
            onClear={clearFileConversion}
            resetSignal={fileReset.resetSignal}
          />

          <div className="flex gap-2 my-4">
            <div className="flex items-center">
              <label className="form-label text-base mr-2">Separator:</label>
              <select
                value={textSeparator}
                onChange={(e) => setTextSeparator(e.target.value as '_' | '-' | ':' | '.')}
                className="input-field w-24"
              >
                <option value="_">_</option>
                <option value="-">-</option>
                <option value=":">:</option>
                <option value=".">.</option>
              </select>
            </div>

            <LoadingButton onClick={handleFileConversion} isLoading={isFileConverting}>
              Convert
            </LoadingButton>
          </div>

          <div ref={scrollRef} className="space-y-4">
            {fileResult && (
              <>
                <div className="flex items-center justify-between">
                  <label className="form-label">Converted Result:</label>
                  <div className="flex items-center gap-2">
                    <CopyButton text={fileResult} className="mr-2" />
                    <DownloadButton
                      content={fileResult}
                      fileName={`${fileBaseName}_converted.json`}
                      fileType="json"
                      disabled={!fileResult}
                    />
                  </div>
                </div>

                <AutoTextarea
                  value={fileResult}
                  readOnly
                  disabled={!fileResult}
                  className="input-field w-full h-64"
                />
              </>
            )}
            {fileError && <ErrorBox message={fileError} />}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default CSVJSONConverter;
