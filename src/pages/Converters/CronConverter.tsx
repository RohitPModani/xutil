import { useEffect, useState } from "react";
import SectionCard from "../../components/SectionCard";
import ErrorBox from "../../components/ErrorBox";
import ClearButton from "../../components/ClearButton";
import CopyButton from "../../components/CopyButton";
import { PageSEO } from "../../components/PageSEO";
import SEODescription from "../../components/SEODescription";
import seoDescriptions from "../../data/seoDescriptions";
import AutoTextarea from "../../hooks/useAutoSizeTextArea";
import { updateToolUsage } from "../../utils/toolUsage";
import ToolHeader from "../../components/ToolHeader";

// Common time units and their cron field positions
const TIME_UNITS = {
  minute: { position: 0, range: [0, 59] },
  hour: { position: 1, range: [0, 23] },
  day: { position: 2, range: [1, 31] },
  month: { position: 3, range: [1, 12] },
  weekday: { position: 4, range: [0, 6] },
};

// Month name to number mapping
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

// Weekday name to number mapping (0 = Sunday)
const WEEKDAYS = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

// Special time keywords
const TIME_KEYWORDS = {
  midnight: { hour: 0, minute: 0 },
  noon: { hour: 12, minute: 0 },
  "mid-day": { hour: 12, minute: 0 },
  "mid day": { hour: 12, minute: 0 },
};

function CronConverter() {
  const seo = seoDescriptions.cronConverter;

  const [inputText, setInputText] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateToolUsage("cron");
  }, []);

  const parseMonth = (text: string): number | null => {
    const month = text.toLowerCase();
    return MONTHS[month as keyof typeof MONTHS] || null;
  };

  const parseWeekday = (text: string): number | null => {
    const day = text.toLowerCase();
    return WEEKDAYS[day as keyof typeof WEEKDAYS] || null;
  };

  const parseSpecialTime = (text: string): { hour: number; minute: number } | null => {
    const time = text.toLowerCase();
    return TIME_KEYWORDS[time as keyof typeof TIME_KEYWORDS] || null;
  };

  const convertToCron = (text: string): string => {
    if (!text.trim()) {
      setError(null);
      return "";
    }

    try {
      const lowerText = text.toLowerCase();
      const parts = ["*", "*", "*", "*", "*"]; // Default cron expression

      // Handle special time keywords first
      const specialTime = parseSpecialTime(lowerText);
      if (specialTime) {
        parts[0] = specialTime.minute.toString();
        parts[1] = specialTime.hour.toString();
        setError(null);
        return parts.join(" ");
      }

      // Handle time ranges (e.g., "every hour between 9 AM and 5 PM")
      const timeRangeMatch = lowerText.match(/between (\d+)(?::(\d+))?\s*(am|pm)? and (\d+)(?::(\d+))?\s*(am|pm)?/i);
      if (timeRangeMatch) {
        const [_, startHour, startMin, startPeriod, endHour, __, endPeriod] = timeRangeMatch;
        let startHourNum = parseInt(startHour);
        let endHourNum = parseInt(endHour);
        
        if (startPeriod === "pm" && startHourNum < 12) startHourNum += 12;
        if (startPeriod === "am" && startHourNum === 12) startHourNum = 0;
        if (endPeriod === "pm" && endHourNum < 12) endHourNum += 12;
        if (endPeriod === "am" && endHourNum === 12) endHourNum = 0;

        parts[1] = `${startHourNum}-${endHourNum}`;
        if (startMin) parts[0] = startMin;
        setError(null);
        return parts.join(" ");
      }

      // Handle "every X minutes/hours/days"
      const everyMatch = lowerText.match(/every (\d+) (minute|hour|day|month|weekday)s?/i);
      if (everyMatch) {
        const [, value, unit] = everyMatch;
        const position = TIME_UNITS[unit as keyof typeof TIME_UNITS].position;
        parts[position] = `*/${value}`;

        // Check for additional patterns
        if (lowerText.includes("alternate day") || lowerText.includes("every other day")) {
          parts[2] = "*/2";
        }
        if (lowerText.includes("every weekday") || lowerText.includes("weekdays")) {
          parts[4] = "1-5";
        }
        if (lowerText.includes("every weekend") || lowerText.includes("weekends")) {
          parts[4] = "0,6";
        }

        // Check for specific time
        const timeMatch = lowerText.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
        if (timeMatch) {
          const [_, hours, minutes, period] = timeMatch;
          let hourNum = parseInt(hours);
          if (period === "pm" && hourNum < 12) hourNum += 12;
          if (period === "am" && hourNum === 12) hourNum = 0;
          parts[0] = minutes ? minutes : "0";
          parts[1] = hourNum.toString();
        }

        setError(null);
        return parts.join(" ");
      }

      // Handle specific days of the week
      const weekdayMatch = lowerText.match(/every (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      if (weekdayMatch) {
        const weekday = parseWeekday(weekdayMatch[1]);
        if (weekday !== null) {
          parts[4] = weekday.toString();
          
          // Check for time specification
          const timeMatch = lowerText.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
          if (timeMatch) {
            const [_, hours, minutes, period] = timeMatch;
            let hourNum = parseInt(hours);
            if (period === "pm" && hourNum < 12) hourNum += 12;
            if (period === "am" && hourNum === 12) hourNum = 0;
            parts[0] = minutes ? minutes : "0";
            parts[1] = hourNum.toString();
          }
          setError(null);
          return parts.join(" ");
        }
      }

      // Handle "every weekday" (Monday to Friday)
      if (lowerText.includes("every weekday") || lowerText.includes("weekdays")) {
        // Check if there's a time specification
        const timeMatch = lowerText.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
        if (timeMatch) {
          const [_, hours, minutes, period] = timeMatch;
          let hourNum = parseInt(hours);
          if (period === "pm" && hourNum < 12) hourNum += 12;
          if (period === "am" && hourNum === 12) hourNum = 0;
          parts[0] = minutes ? minutes : "0";
          parts[1] = hourNum.toString();
          parts[4] = "1-5";
          setError(null);
          return parts.join(" ");
        }
        parts[4] = "1-5";
        setError(null);
        return parts.join(" ");
      }

      // Handle "every weekend" (Saturday and Sunday)
      if (lowerText.includes("every weekend") || lowerText.includes("weekends")) {
        // Check if there's a time specification
        const timeMatch = lowerText.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
        if (timeMatch) {
          const [_, hours, minutes, period] = timeMatch;
          let hourNum = parseInt(hours);
          if (period === "pm" && hourNum < 12) hourNum += 12;
          if (period === "am" && hourNum === 12) hourNum = 0;
          parts[0] = minutes ? minutes : "0";
          parts[1] = hourNum.toString();
          parts[4] = "0,6";
          setError(null);
          return parts.join(" ");
        }
        parts[4] = "0,6";
        setError(null);
        return parts.join(" ");
      }

      // Handle "every alternate day"
      if (lowerText.includes("alternate day") || lowerText.includes("every other day")) {
        // Check if there's a time specification
        const timeMatch = lowerText.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
        if (timeMatch) {
          const [_, hours, minutes, period] = timeMatch;
          let hourNum = parseInt(hours);
          if (period === "pm" && hourNum < 12) hourNum += 12;
          if (period === "am" && hourNum === 12) hourNum = 0;
          parts[0] = minutes ? minutes : "0";
          parts[1] = hourNum.toString();
          parts[2] = "*/2";
          setError(null);
          return parts.join(" ");
        }
        parts[2] = "*/2";
        setError(null);
        return parts.join(" ");
      }

      // Handle specific time (e.g., "at 2:30 PM")
      const timeMatch = lowerText.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
      if (timeMatch) {
        const [_, hours, minutes, period] = timeMatch;
        let hourNum = parseInt(hours);
        if (period === "pm" && hourNum < 12) hourNum += 12;
        if (period === "am" && hourNum === 12) hourNum = 0;
        parts[0] = minutes ? minutes : "0";
        parts[1] = hourNum.toString();
        setError(null);
        return parts.join(" ");
      }

      // Handle "every day"
      if (lowerText === "every day" || lowerText === "daily") {
        setError(null);
        return parts.join(" ");
      }

      // Handle "every hour"
      if (lowerText === "every hour" || lowerText === "hourly") {
        parts[0] = "0";
        setError(null);
        return parts.join(" ");
      }

      // Handle "every minute"
      if (lowerText === "every minute" || lowerText === "minutely") {
        setError(null);
        return parts.join(" ");
      }

      // Handle specific months
      const monthMatch = lowerText.match(/in (january|february|march|april|may|june|july|august|september|october|november|december)/i);
      if (monthMatch) {
        const month = parseMonth(monthMatch[1]);
        if (month !== null) {
          parts[3] = month.toString();
          setError(null);
          return parts.join(" ");
        }
      }

      setError("Could not parse the time description. Please try a different format.");
      return "";
    } catch {
      setError("Error converting to cron expression");
      return "";
    }
  };

  useEffect(() => {
    const result = convertToCron(inputText);
    setCronExpression(result);
  }, [inputText]);

  const handleClear = () => {
    setInputText("");
    setCronExpression("");
    setError(null);
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="py-6 sm:py-8">
        <ToolHeader title={seo.title} />

        <SectionCard className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Text to Cron Expression</h3>
            <ClearButton onClick={handleClear} disabled={!inputText} />
          </div>
          <hr className="line-break" />
          <div className="flex-1 space-y-4">
            <label className="form-label">Input Text:</label>
            <AutoTextarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field"
              placeholder="every weekday at 9:30am"
            />
          </div>

          <div className="result-box mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Cron Expression</label>
              <CopyButton text={cronExpression} />
            </div>
            {cronExpression && (
              <div className="scrollbox mt-2">
                <div className="inner-result">
                  <div className="w-full mono-output break-all">
                    {cronExpression}
                  </div>
                </div>
              </div>
            )}
          </div>
          <ErrorBox message={error} />
        </SectionCard>

        <SectionCard>
          <h3 className="section-title mb-4">Supported Formats</h3>
          <div className="space-y-2 text-sm">
            <p>• Time intervals (e.g., "every 15 minutes", "every 2 hours")</p>
            <p>• Specific times (e.g., "at 2:30 PM", "at midnight")</p>
            <p>• Daily schedules (e.g., "every day at 9 AM")</p>
            <p>• Weekly schedules (e.g., "every Monday at 3 PM")</p>
            <p>• Monthly schedules (e.g., "first day of every month")</p>
            <p>• Custom intervals (e.g., "every 2 months", "every 3 weeks")</p>
            <p>• Special times (e.g., "midnight", "noon")</p>
            <p>• Weekday patterns (e.g., "every weekday", "every weekend")</p>
            <p>• Alternate day patterns (e.g., "every alternate day")</p>
            <p>• Time ranges (e.g., "every hour between 9 AM and 5 PM")</p>
            <p>• Combined patterns (e.g., "every 15 minutes every alternate day")</p>
            <p>• Specific months (e.g., "in January", "in December")</p>
            <p>• Simple schedules (e.g., "every day", "every hour", "every minute")</p>
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default CronConverter; 