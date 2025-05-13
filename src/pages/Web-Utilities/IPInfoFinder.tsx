import { useState, useEffect } from 'react';
import SectionCard from '../../components/SectionCard';
import CopyButton from '../../components/CopyButton';
import ClearButton from '../../components/ClearButton';
import SEODescription from '../../components/SEODescription';
import { PageSEO } from '../../components/PageSEO';
import { updateToolUsage } from '../../utils/toolUsage';
import ErrorBox from '../../components/ErrorBox';
import LoadingButton from '../../components/LoadingButton';
import seoDescriptions from '../../data/seoDescriptions';
import BackToHome from '../../components/BackToHome';
import BuyMeCoffee from '../../components/BuyMeCoffee';

interface IPInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  org?: string;
  isp?: string;
  as?: string;
  asname?: string;
}

export default function IPInfoFinder() {
  const seo = seoDescriptions.ipInfo;

  const [ipInput, setIpInput] = useState('');
  const [info, setInfo] = useState<IPInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userIP, setUserIP] = useState('');

  useEffect(() => {
    updateToolUsage('ip_info');
    fetchUserIP();
  }, []);

  const fetchUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIP(data.ip);
    } catch (err) {
      console.error('Failed to fetch user IP:', err);
    }
  };

  const fetchIPInfo = async (ip: string) => {
    setIsLoading(true);
    setError('');
    try {
      // Using ip-api.com which provides more network details
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`);
      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'Invalid IP address');
      }
      
      // Map the response to our IPInfo interface
      const mappedData: IPInfo = {
        ip: data.query,
        city: data.city,
        region: data.regionName,
        country: data.countryCode,
        country_name: data.country,
        postal: data.zip,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        org: data.org,
        isp: data.isp,
        as: data.as,
        asname: data.asname
      };
      
      setInfo(mappedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch IP information');
      setInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipInput.trim()) {
      setError('Please enter an IP address');
      return;
    }
    fetchIPInfo(ipInput);
  };

  const handleClear = () => {
    setIpInput('');
    setInfo(null);
    setError('');
  };

  const handleLookupMyIP = () => {
    if (userIP) {
      setIpInput(userIP);
      fetchIPInfo(userIP);
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-end gap-4">
            <h3 className="text-lg font-semibold">IP Address Lookup</h3>
            {userIP && (
                <LoadingButton onClick={handleLookupMyIP} disabled={isLoading} isLoading={isLoading} className='text-sm'> 
                    My IP
                </LoadingButton>
                )}
            </div>
            <ClearButton 
              onClick={handleClear} 
              disabled={!ipInput && !info && !error} 
            />
          </div>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="ip-input" className="form-label">
                  IP Address:
                </label>
                <input
                  id="ip-input"
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                />
              </div>
              <div className="flex items-end gap-2">
                <LoadingButton onClick={handleSubmit} disabled={isLoading} isLoading= {isLoading}> Lookup </LoadingButton>
              </div>
            </div>
          </form>

          <ErrorBox message={error} />

          {info && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Geolocation Info */}
              <SectionCard className="!p-0">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-lg">Geolocation</h4>
                </div>
                <div className="p-4 space-y-3">
                  <InfoRow label="IP Address" value={info.ip} copyable />
                  <InfoRow label="Country" value={`${info.country_name} (${info.country})`} />
                  <InfoRow label="Region" value={info.region} />
                  <InfoRow label="City" value={info.city} />
                  <InfoRow label="Postal Code" value={info.postal} />
                  <InfoRow label="Coordinates" value={`${info.latitude}, ${info.longitude}`} />
                  <InfoRow label="Timezone" value={info.timezone} />
                </div>
              </SectionCard>

              {/* Network Info - Updated to use new fields */}
              <SectionCard className="!p-0">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-lg">Network Information</h4>
                </div>
                <div className="p-4 space-y-3">
                  <InfoRow label="ISP" value={info.isp || 'Unknown'} />
                  <InfoRow label="Organization" value={info.org || 'Unknown'} />
                  {info.as && (
                    <>
                      <InfoRow label="AS Number" value={info.as.split(' ')[0] || 'Unknown'} />
                      <InfoRow label="AS Name" value={info.asname || info.as.split(' ').slice(1).join(' ') || 'Unknown'} />
                    </>
                  )}
                </div>
              </SectionCard>
            </div>

              {/* Map Preview */}
              <SectionCard>
                <h4 className="font-semibold text-lg mb-4">Location Map</h4>
                <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${info.longitude-0.1}%2C${info.latitude-0.1}%2C${info.longitude+0.1}%2C${info.latitude+0.1}&layer=mapnik&marker=${info.latitude}%2C${info.longitude}`}
                    allowFullScreen
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${info.latitude}&mlon=${info.longitude}#map=10/${info.latitude}/${info.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 dark:text-white hover:underline"
                  >
                    View larger map
                  </a>
                </div>
              </SectionCard>
            </div>
          )}
        </SectionCard>

        <SectionCard className="mt-6">
          <h3 className="text-lg font-semibold mb-4">About IP Lookup</h3>
          <div className="prose">
            <p className="mb-4 text-zinc-900 dark:text-white">
              IP geolocation is the mapping of an IP address to the geographic location of the internet from the connected device.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-900 dark:text-white">
              <li><strong className='text-zinc-900 dark:text-white'>Accuracy:</strong> Typically accurate to city level (50-100km)</li>
              <li><strong className='text-zinc-900 dark:text-white'>IPv4 vs IPv6:</strong> Both address types are supported</li>
              <li><strong className='text-zinc-900 dark:text-white'>Privacy:</strong> This tool doesn't store any IP addresses you lookup</li>
              <li><strong className='text-zinc-900 dark:text-white'>Limitations:</strong> VPNs and proxies may show incorrect locations</li>
            </ul>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

// Helper component for displaying info rows
function InfoRow({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) {
  if (!value) return null;
  
  return (
    <div className="flex justify-between items-start">
      <span className="text-zinc-900 dark:text-white font-medium">{label}:</span>
      <div className="text-right max-w-[70%]">
        {copyable ? (
          <div className="flex items-center gap-2">
            <span className="break-all">{value}</span>
            <CopyButton text={value} />
          </div>
        ) : (
          <span className="break-all">{value}</span>
        )}
      </div>
    </div>
  );
}