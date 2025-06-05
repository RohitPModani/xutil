import { useEffect, useState, useCallback } from "react";
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
import LoadingButton from "../../components/LoadingButton";
import { Download } from "lucide-react";
import { saveAs } from "file-saver";
import DownloadButton from "../../components/DownloadButton";

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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    updateToolUsage("qr_code");
  }, []);

  const generateQRCode = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);

      let qrContent = "";

      switch (options.actionType) {
        case "url":
        case "text":
          qrContent = options.text;
          break;
        case "contact":
          if (
            !options.firstName &&
            !options.lastName &&
            !options.phone &&
            !options.email
          ) {
            throw new Error("Please fill at least one contact field");
          }
          qrContent = `BEGIN:VCARD\nVERSION:3.0\n`;
          if (options.firstName || options.lastName) {
            qrContent += `N:${options.lastName || ""};${
              options.firstName || ""
            }\n`;
            qrContent += `FN:${options.firstName || ""} ${
              options.lastName || ""
            }\n`;
          }
          if (options.phone) qrContent += `TEL:${options.phone}\n`;
          if (options.email) qrContent += `EMAIL:${options.email}\n`;
          qrContent += `END:VCARD`;
          break;
        case "email":
          if (!options.email) throw new Error("Email address is required");
          qrContent = `mailto:${options.email}`;
          if (options.emailSubject || options.emailBody) {
            qrContent += "?";
            const params = [];
            if (options.emailSubject)
              params.push(
                `subject=${encodeURIComponent(options.emailSubject)}`
              );
            if (options.emailBody)
              params.push(`body=${encodeURIComponent(options.emailBody)}`);
            qrContent += params.join("&");
          }
          break;
        case "sms":
          if (!options.phone) throw new Error("Phone number is required");
          qrContent = `smsto:${options.phone}`;
          if (options.smsBody) {
            qrContent += `:${encodeURIComponent(options.smsBody)}`;
          }
          break;
        case "wifi":
          if (!options.wifiSsid) throw new Error("WiFi SSID is required");
          qrContent = `WIFI:T:${options.wifiEncryption || "WPA"};S:${
            options.wifiSsid
          };`;
          if (options.wifiPassword) qrContent += `P:${options.wifiPassword};`;
          qrContent += ";";
          break;
        case "phone":
          if (!options.phone) throw new Error("Phone number is required");
          qrContent = `tel:${options.phone}`;
          break;
        case "whatsapp":
          if (!options.phone) throw new Error("Phone number is required");
          qrContent = `https://wa.me/${options.phone}`;
          if (options.whatsappMessage) {
            qrContent += `?text=${encodeURIComponent(options.whatsappMessage)}`;
          }
          break;
        case "event":
          if (!options.eventTitle) throw new Error("Event title is required");
          qrContent = `BEGIN:VEVENT\nSUMMARY:${options.eventTitle}\n`;
          if (options.eventStart) {
            const start = new Date(options.eventStart);
            qrContent += `DTSTART:${
              start.toISOString().replace(/[-:]/g, "").split(".")[0]
            }Z\n`;
          }
          if (options.eventEnd) {
            const end = new Date(options.eventEnd);
            qrContent += `DTEND:${
              end.toISOString().replace(/[-:]/g, "").split(".")[0]
            }Z\n`;
          }
          if (options.eventLocation)
            qrContent += `LOCATION:${options.eventLocation}\n`;
          if (options.eventDescription)
            qrContent += `DESCRIPTION:${options.eventDescription}\n`;
          qrContent += `END:VEVENT`;
          break;
        default:
          qrContent = options.text;
      }

      if (!qrContent) {
        throw new Error("Please enter content to generate QR code");
      }

      const [pngDataUrl, svgDataUrl] = await Promise.all([
        QRCode.toDataURL(qrContent, {
          width: options.size,
          color: {
            dark: options.colorDark,
            light: options.colorLight,
          },
          errorCorrectionLevel: options.errorCorrectionLevel,
          type: "image/png",
          margin: 1,
        }),
        QRCode.toString(qrContent, {
          type: "svg",
          width: options.size,
          margin: 1,
          color: {
            dark: options.colorDark,
            light: options.colorLight,
          },
          errorCorrectionLevel: options.errorCorrectionLevel,
        }),
      ]);

      setQrCodeDataUrls({
        png: pngDataUrl,
        svg: svgDataUrl,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code"
      );
      console.error("QR code generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setOptions((prev) => ({ ...prev, [name]: value }));
    },
    []
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
    },
    []
  );

  const handleClear = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
    setQrCodeDataUrls({
      png: "",
      svg: "",
    });
    setError(null);
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
                required
              />
            )}
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

              <div className="flex justify-center item-center">
                <LoadingButton
                  onClick={generateQRCode}
                  disabled={isGenerating}
                  isLoading={isGenerating}
                >
                  Generate QR Code
                </LoadingButton>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              {qrCodeDataUrls.png ? (
                <>
                  <img
                    src={qrCodeDataUrls.png}
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
