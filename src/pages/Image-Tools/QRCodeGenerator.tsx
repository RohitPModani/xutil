import { useEffect, useState, useCallback, useMemo } from "react";
import BackToHome from "../../components/BackToHome";
import SectionCard from "../../components/SectionCard";
import ClearButton from "../../components/ClearButton";
import ErrorBox from "../../components/ErrorBox";
import SEODescription from "../../components/SEODescription";
import { PageSEO } from "../../components/PageSEO";
import BuyMeCoffee from "../../components/BuyMeCoffee";
import seoDescriptions from "../../data/seoDescriptions";
import { updateToolUsage } from "../../utils/toolUsage";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { saveAs } from "file-saver";

type QRCodeOptions = {
  actionType: string;
  text: string;
  size?: number;
  colorDark?: string;
  colorLight?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  // Contact specific fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  // Email specific fields
  emailSubject?: string;
  emailBody?: string;
  // SMS specific fields
  smsBody?: string;
  // WiFi specific fields
  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: "WPA" | "WEP" | "nopass";
  // WhatsApp specific fields
  whatsappMessage?: string;
  // Calendar event specific fields
  eventTitle?: string;
  eventStart?: Date | string;
  eventEnd?: Date | string;
  eventLocation?: string;
  eventDescription?: string;
  downloadFormat?: "png" | "svg";
};

// Add this helper function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  actionType: "url",
  text: "",
  size: 300,
  colorDark: "#000000",
  colorLight: "#ffffff",
  errorCorrectionLevel: "M",
  eventStart: new Date(),
  eventEnd: new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour later
  downloadFormat: "png",
};

const DEBOUNCE_DELAY = 500;

const ACTION_TYPES = [
  { value: "url", label: "Website URL" },
  { value: "text", label: "Plain Text" },
  { value: "contact", label: "Add to Contacts" },
  { value: "email", label: "Send Email" },
  { value: "sms", label: "Send SMS" },
  { value: "wifi", label: "Connect to WiFi" },
  { value: "phone", label: "Phone Number" },
  { value: "whatsapp", label: "WhatsApp Message" },
  { value: "event", label: "Calendar Event" },
];

function QRCodeGenerator() {
  const seo = seoDescriptions.qrCodeGenerator;

  const [options, setOptions] = useState<QRCodeOptions>(DEFAULT_OPTIONS);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<{
    png: string;
    svg: string;
  }>({
    png: "",
    svg: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    updateToolUsage("qr_code");
  }, []);

  const validateUrl = (url: string): { isValid: boolean; normalizedUrl: string; error?: string } => {
    if (!url.trim()) {
      return { isValid: false, normalizedUrl: '', error: 'Please enter a valid URL' };
    }

    const trimmedUrl = url.trim();
    
    // Check for common URL patterns and normalize them
    let normalizedUrl = trimmedUrl;
    
    // If it doesn't start with a protocol, assume https://
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Handle common cases where users might enter invalid protocols
    if (normalizedUrl.startsWith('www.')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    try {
      const urlObj = new URL(normalizedUrl);
      
      // Check for valid protocols
      const validProtocols = ['http:', 'https:', 'ftp:', 'ftps:', 'mailto:', 'tel:', 'sms:'];
      if (!validProtocols.includes(urlObj.protocol)) {
        return { 
          isValid: false, 
          normalizedUrl: trimmedUrl, 
          error: 'Please enter a URL with a valid protocol (http, https, ftp, etc.)' 
        };
      }
      
      // Basic hostname validation
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return { 
          isValid: false, 
          normalizedUrl: trimmedUrl, 
          error: 'Please enter a valid URL with a hostname' 
        };
      }
      
      // Check for valid hostname format (basic check)
      const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
      if (!hostnameRegex.test(urlObj.hostname) && !isValidIP(urlObj.hostname)) {
        return { 
          isValid: false, 
          normalizedUrl: trimmedUrl, 
          error: 'Please enter a valid hostname or IP address' 
        };
      }
      
      return { isValid: true, normalizedUrl: urlObj.toString() };
    } catch (error) {
      // Try some common fixes for malformed URLs
      const fixes = [
        // Remove extra spaces
        normalizedUrl.replace(/\s+/g, ''),
        // Fix double slashes
        normalizedUrl.replace(/([^:]\/)\/+/g, '$1'),
        // Add missing top-level domain for simple cases
        normalizedUrl.includes('.') ? normalizedUrl : `${normalizedUrl}.com`
      ];
      
      for (const fix of fixes) {
        try {
          const fixedUrl = new URL(fix);
          if (fixedUrl.hostname) {
            return { isValid: true, normalizedUrl: fixedUrl.toString() };
          }
        } catch {
          continue;
        }
      }
      
      return { 
        isValid: false, 
        normalizedUrl: trimmedUrl, 
        error: 'Please enter a valid URL (e.g., https://example.com)' 
      };
    }
  };

  // Helper function to validate IP addresses
  const isValidIP = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) return true;
    
    // IPv6 validation (basic)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) return true;
    
    return false;
  };

  const validateInputs = useCallback(() => {
    const errors: Record<string, string> = {};

    switch (options.actionType) {
      case "url":
        const urlValidation = validateUrl(options.text);
        if (!urlValidation.isValid) {
          errors.text = urlValidation.error || "Please enter a valid URL";
        }
        break;
      case "text":
        if (!options.text.trim()) {
          errors.text = "Please enter some text";
        }
        break;
      case "contact":
        if (!options.firstName && !options.lastName && !options.phone && !options.email) {
          errors.contact = "Please enter at least one contact detail";
        }
        if (options.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.email)) {
          errors.email = "Please enter a valid email address";
        }
        if (options.phone && !/^\+?[\d\s-()]{10,}$/.test(options.phone)) {
          errors.phone = "Please enter a valid phone number";
        }
        break;
      case "email":
        if (!options.email) {
          errors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.email)) {
          errors.email = "Please enter a valid email address";
        }
        break;
      case "sms":
      case "phone":
        if (!options.phone) {
          errors.phone = "Phone number is required";
        } else if (!/^\+?[\d\s-()]{10,}$/.test(options.phone)) {
          errors.phone = "Please enter a valid phone number";
        }
        break;
      case "wifi":
        if (!options.wifiSsid) {
          errors.wifiSsid = "WiFi SSID is required";
        }
        break;
      case "whatsapp":
        if (!options.phone) {
          errors.phone = "Phone number is required";
        } else if (!/^\+?[\d\s-()]{10,}$/.test(options.phone)) {
          errors.phone = "Please enter a valid phone number";
        }
        break;
      case "event":
        if (!options.eventTitle) {
          errors.eventTitle = "Event title is required";
        }
        if (options.eventStart && options.eventEnd) {
          const start = new Date(options.eventStart);
          const end = new Date(options.eventEnd);
          if (end <= start) {
            errors.eventEnd = "End time must be after start time";
          }
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [options]);

  const debouncedGeneratePreview = useMemo(
    () =>
      debounce(async (opts: QRCodeOptions) => {
        try {
          if (!validateInputs()) {
            setPreviewDataUrl("");
            setQrCodeDataUrls({
              png: "",
              svg: "",
            });
            return;
          }
          const qrContent = generateQRContent(opts);
          if (qrContent) {
            const dataUrl = await QRCode.toDataURL(qrContent, {
              width: opts.size,
              color: {
                dark: opts.colorDark,
                light: opts.colorLight,
              },
              errorCorrectionLevel: opts.errorCorrectionLevel,
              type: "image/png",
              margin: 1,
            });
            setPreviewDataUrl(dataUrl);
            setQrCodeDataUrls({
              png: dataUrl,
              svg: await QRCode.toString(qrContent, {
                type: "svg",
                width: opts.size,
                margin: 1,
                color: {
                  dark: opts.colorDark,
                  light: opts.colorLight,
                },
                errorCorrectionLevel: opts.errorCorrectionLevel,
              }),
            });
          }
        } catch (err) {
          console.error("Preview generation error:", err);
          setPreviewDataUrl("");
          setQrCodeDataUrls({
            png: "",
            svg: "",
          });
        }
      }, DEBOUNCE_DELAY),
    [validateInputs]
  );

  const generateQRContent = (opts: QRCodeOptions): string => {
    switch (opts.actionType) {
      case "url":
      case "text":
        return opts.text;
      case "contact":
        if (!opts.firstName && !opts.lastName && !opts.phone && !opts.email) {
          return "";
        }
        let qrContent = `BEGIN:VCARD\nVERSION:3.0\n`;
        if (opts.firstName || opts.lastName) {
          qrContent += `N:${opts.lastName || ""};${opts.firstName || ""}\n`;
          qrContent += `FN:${opts.firstName || ""} ${opts.lastName || ""}\n`;
        }
        if (opts.phone) qrContent += `TEL:${opts.phone}\n`;
        if (opts.email) qrContent += `EMAIL:${opts.email}\n`;
        qrContent += `END:VCARD`;
        return qrContent;
      case "email":
        if (!opts.email) throw new Error("Email address is required");
        qrContent = `mailto:${opts.email}`;
        if (opts.emailSubject || opts.emailBody) {
          qrContent += "?";
          const params = [];
          if (opts.emailSubject)
            params.push(`subject=${encodeURIComponent(opts.emailSubject)}`);
          if (opts.emailBody)
            params.push(`body=${encodeURIComponent(opts.emailBody)}`);
          qrContent += params.join("&");
        }
        return qrContent;
      case "sms":
        if (!opts.phone) throw new Error("Phone number is required");
        qrContent = `smsto:${opts.phone}`;
        if (opts.smsBody) {
          qrContent += `:${encodeURIComponent(opts.smsBody)}`;
        }
        return qrContent;
      case "wifi":
        if (!opts.wifiSsid) throw new Error("WiFi SSID is required");
        qrContent = `WIFI:T:${opts.wifiEncryption || "WPA"};S:${
          opts.wifiSsid
        };`;
        if (opts.wifiPassword) qrContent += `P:${opts.wifiPassword};`;
        qrContent += ";";
        return qrContent;
      case "phone":
        if (!opts.phone) throw new Error("Phone number is required");
        qrContent = `tel:${opts.phone}`;
        return qrContent;
      case "whatsapp":
        if (!opts.phone) throw new Error("Phone number is required");
        qrContent = `https://wa.me/${opts.phone}`;
        if (opts.whatsappMessage) {
          qrContent += `?text=${encodeURIComponent(opts.whatsappMessage)}`;
        }
        return qrContent;
      case "event":
        if (!opts.eventTitle) throw new Error("Event title is required");
        qrContent = `BEGIN:VEVENT\nSUMMARY:${opts.eventTitle}\n`;
        if (opts.eventStart) {
          const start = new Date(opts.eventStart);
          qrContent += `DTSTART:${
            start.toISOString().replace(/[-:]/g, "").split(".")[0]
          }Z\n`;
        }
        if (opts.eventEnd) {
          const end = new Date(opts.eventEnd);
          qrContent += `DTEND:${
            end.toISOString().replace(/[-:]/g, "").split(".")[0]
          }Z\n`;
        }
        if (opts.eventLocation) qrContent += `LOCATION:${opts.eventLocation}\n`;
        if (opts.eventDescription)
          qrContent += `DESCRIPTION:${opts.eventDescription}\n`;
        qrContent += `END:VEVENT`;
        return qrContent;
      default:
        return opts.text;
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setOptions((prev) => {
        const newOptions = { ...prev, [name]: value };
        debouncedGeneratePreview(newOptions);
        return newOptions;
      });
    },
    [debouncedGeneratePreview]
  );

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setOptions((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      setOptions((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleActionTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      setOptions((_prev) => ({ ...DEFAULT_OPTIONS, actionType: value }));
      setQrCodeDataUrls({
        png: "",
        svg: "",
      });
      setPreviewDataUrl("");
      setError(null);
    },
    []
  );

  const handleUrlBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === 'text' && options.actionType === 'url' && value.trim()) {
        const urlValidation = validateUrl(value);
        if (urlValidation.isValid && urlValidation.normalizedUrl !== value) {
          setOptions((prev) => {
            const newOptions = { ...prev, [name]: urlValidation.normalizedUrl };
            debouncedGeneratePreview(newOptions);
            return newOptions;
          });
        }
      }
    },
    [options.actionType, debouncedGeneratePreview]
  );

  const handleClear = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setQrCodeDataUrls({
      png: "",
      svg: "",
    });
    setPreviewDataUrl("");
    setError(null);
    setValidationErrors({});
  }, []);

  const downloadQRCode = useCallback(() => {
    if (!qrCodeDataUrls.png) return;
    const format = options.downloadFormat;
    const fileName = `qr-code-${options.actionType}-${Date.now()}.${format}`;
    if (format === "png") {
      const link = document.createElement("a");
      link.href = qrCodeDataUrls.png;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([qrCodeDataUrls.svg], { type: "image/svg+xml" });
      saveAs(blob, fileName);
    }
  }, [qrCodeDataUrls, options.actionType, options.downloadFormat]);

  const renderActionFields = () => {
    const renderError = (field: string) => {
      if (validationErrors[field]) {
        return (
          <div className="text-red-500 text-sm mt-1">
            {validationErrors[field]}
          </div>
        );
      }
      return null;
    };

    switch (options.actionType) {
      case "contact":
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name:
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input-field"
                value={options.firstName || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name:
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input-field"
                value={options.lastName || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="form-label">
                Phone:
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-field"
                value={options.phone || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="form-label">
                Email:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input-field"
                value={options.email || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      case "email":
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="form-label">
                Email Address:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input-field"
                value={options.email || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="emailSubject" className="form-label">
                Subject:
              </label>
              <input
                id="emailSubject"
                name="emailSubject"
                type="text"
                className="input-field"
                value={options.emailSubject || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="emailBody" className="form-label">
                Body:
              </label>
              <textarea
                id="emailBody"
                name="emailBody"
                className="input-field scrollbar"
                rows={3}
                value={options.emailBody || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      case "sms":
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number:
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-field"
                value={options.phone || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="smsBody" className="form-label">
                Message:
              </label>
              <textarea
                id="smsBody"
                name="smsBody"
                className="input-field scrollbar"
                rows={3}
                value={options.smsBody || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      case "wifi":
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="wifiSsid" className="form-label">
                WiFi SSID:
              </label>
              <input
                id="wifiSsid"
                name="wifiSsid"
                type="text"
                className="input-field"
                value={options.wifiSsid || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="wifiPassword" className="form-label">
                Password:
              </label>
              <input
                id="wifiPassword"
                name="wifiPassword"
                type="password"
                className="input-field"
                value={options.wifiPassword || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="wifiEncryption" className="form-label">
                Encryption:
              </label>
              <select
                id="wifiEncryption"
                name="wifiEncryption"
                className="input-field"
                value={options.wifiEncryption || "WPA"}
                onChange={handleSelectChange}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
            </div>
          </div>
        );
      case "phone":
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number:
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-field"
                value={options.phone || ""}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        );
      case "whatsapp":
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number:
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-field"
                value={options.phone || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="whatsappMessage" className="form-label">
                Message:
              </label>
              <textarea
                id="whatsappMessage"
                name="whatsappMessage"
                className="input-field scrollbar"
                rows={3}
                value={options.whatsappMessage || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      case "event":
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="eventTitle" className="form-label">
                Event Title:
              </label>
              <input
                id="eventTitle"
                name="eventTitle"
                type="text"
                className="input-field"
                value={options.eventTitle || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="eventStart" className="form-label">
                Start Date & Time:
              </label>
              <input
                id="eventStart"
                name="eventStart"
                type="datetime-local"
                className="input-field"
                value={
                  options.eventStart
                    ? new Date(options.eventStart).toISOString().slice(0, 16)
                    : ""
                }
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="eventEnd" className="form-label">
                End Date & Time:
              </label>
              <input
                id="eventEnd"
                name="eventEnd"
                type="datetime-local"
                className="input-field"
                value={
                  options.eventEnd
                    ? new Date(options.eventEnd).toISOString().slice(0, 16)
                    : ""
                }
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="eventLocation" className="form-label">
                Location:
              </label>
              <input
                id="eventLocation"
                name="eventLocation"
                type="text"
                className="input-field"
                value={options.eventLocation || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="eventDescription" className="form-label">
                Description:
              </label>
              <textarea
                id="eventDescription"
                name="eventDescription"
                className="input-field scrollbar"
                rows={3}
                value={options.eventDescription || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      default:
        return (
          <div>
            <label htmlFor="text" className="form-label">
              {options.actionType === "url" ? "Website URL:" : "Text Content:"}
            </label>
            {options.actionType === "text" ? (
              <textarea
                id="text"
                name="text"
                className="input-field scrollbar"
                rows={3}
                value={options.text}
                onChange={handleInputChange}
                required
              />
            ) : (
              <input
                id="text"
                name="text"
                type="url"
                className="input-field"
                value={options.text}
                onChange={handleInputChange}
                onBlur={handleUrlBlur}
                required
              />
            )}
            {renderError("text")}
          </div>
        );
    }
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 section">
        <div className="flex items-center justify-between mb-4">
          <BackToHome />
          <BuyMeCoffee variant="inline" />
        </div>
        <h2 className="text-2xl font-bold mb-6">{seo.title}</h2>

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">QR Code Generator</h3>
            <ClearButton
              onClick={handleClear}
              disabled={
                !options.text &&
                !qrCodeDataUrls.png &&
                !qrCodeDataUrls.svg &&
                !options.firstName &&
                !options.phone &&
                !options.email &&
                !options.wifiSsid
              }
              aria-label="Clear inputs"
            />
          </div>
          <hr className="line-break" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="actionType" className="form-label">
                  QR Code Type:
                </label>
                <select
                  id="actionType"
                  name="actionType"
                  className="input-field"
                  value={options.actionType}
                  onChange={handleActionTypeChange}
                >
                  {ACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {renderActionFields()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="size" className="form-label">
                    Size (px):
                  </label>
                  <input
                    id="size"
                    name="size"
                    type="number"
                    min="100"
                    max="1000"
                    className="input-field"
                    value={options.size}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="errorCorrectionLevel" className="form-label">
                    Error Correction:
                  </label>
                  <select
                    id="errorCorrectionLevel"
                    name="errorCorrectionLevel"
                    className="input-field"
                    value={options.errorCorrectionLevel}
                    onChange={handleSelectChange}
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="colorDark" className="form-label">
                    Dark Color:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="colorDark"
                      name="colorDark"
                      type="color"
                      className="h-10 w-10 cursor-pointer"
                      value={options.colorDark}
                      onChange={handleColorChange}
                    />
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={options.colorDark}
                      onChange={handleInputChange}
                      name="colorDark"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="colorLight" className="form-label">
                    Light Color:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="colorLight"
                      name="colorLight"
                      type="color"
                      className="h-10 w-10 cursor-pointer"
                      value={options.colorLight}
                      onChange={handleColorChange}
                    />
                    <input
                      type="text"
                      className="input-field flex-1"
                      value={options.colorLight}
                      onChange={handleInputChange}
                      name="colorLight"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              {qrCodeDataUrls.png || previewDataUrl ? (
                <>
                  <img
                    src={qrCodeDataUrls.png || previewDataUrl}
                    alt="Generated QR Code"
                    className="mb-4 border rounded p-2 bg-white"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <select
                        id="downloadFormat"
                        name="downloadFormat"
                        className="input-field w-24"
                        value={options.downloadFormat}
                        onChange={handleSelectChange}
                      >
                        <option value="png">PNG</option>
                        <option value="svg">SVG</option>
                      </select>
                    </div>
                    <button
                      onClick={downloadQRCode}
                      className="button-primary flex items-center justify-center gap-2"
                      disabled={!previewDataUrl}
                    >
                      <Download /> Download
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-64 text-gray-400">
                  QR Code will appear here
                </div>
              )}
            </div>
          </div>

          <ErrorBox message={error} aria-live="polite" />
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default QRCodeGenerator;
