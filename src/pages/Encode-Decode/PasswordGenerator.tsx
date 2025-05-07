import { useEffect, useState } from 'react';
import BackToHome from '../../components/BackToHome';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import SectionCard from '../../components/SectionCard';
import api from '../../services/api';
import CopyButton from '../../components/CopyButton';
import SEODescription from '../../components/SEODescription';
import BuyMeCoffee from '../../components/BuyMeCoffee';
import seoDescriptions from '../../data/seoDescriptions';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';

function PasswordGenerator() {
  const seo = seoDescriptions.passwordGenerator;
  const [password, setPassword] = useState('');
  const [lengthInput, setLengthInput] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateToolUsage('password');
  }, []);

  const fetchPassword = async () => {
    if(!Number.isInteger(lengthInput) || lengthInput < 8 || lengthInput > 128) {
      setError('Length must be a number between 8 and 128 characters');
      return;
    }
    if (!includeNumbers && !includeSpecial && !includeUppercase && !includeLowercase) {
      setError('At least one character type must be selected');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<string>('/password/generate', {
        params: {
          length: lengthInput,
          include_numbers: includeNumbers,
          include_special: includeSpecial,
          include_uppercase: includeUppercase,
          include_lowercase: includeLowercase,
        },
      });
      setPassword(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setLengthInput(Number(value));
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

        <SectionCard>
          <div className='space-y-4'>
          <h3 className="text-lg font-semibold mb-4">Generate Secure Password</h3>
          <div className="form-grid">
            <div>
              <label className="form-label">Length (8-128):</label>
              <input
                type="text"
                value={lengthInput}
                onChange={handleLengthChange}
                className="input-field"
                disabled={isLoading}
                placeholder="Enter length (8-128)"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="checkbox-primary"
                  disabled={isLoading}
                />
                Include Numbers (0-9)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeSpecial}
                  onChange={(e) => setIncludeSpecial(e.target.checked)}
                  className="checkbox-primary"
                  disabled={isLoading}
                />
                Include Special Characters (!@#$%^)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="checkbox-primary"
                  disabled={isLoading}
                />
                Include Uppercase Letters (A-Z)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="checkbox-primary"
                  disabled={isLoading}
                />
                Include Lowercase Letters (a-z)
              </label>
            </div>
          </div>

          <LoadingButton onClick={fetchPassword} isLoading={isLoading}>Generate</LoadingButton>

          {password && (
            <div className="result-box">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Generated Password</label>
                <CopyButton text={password} />
              </div>
              <div className="inner-result">
                <div className="mono-output">{password}</div>
              </div>
            </div>
          )}

          <ErrorBox message={error} />
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export default PasswordGenerator;