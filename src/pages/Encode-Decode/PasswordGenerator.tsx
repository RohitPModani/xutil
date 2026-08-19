import { useEffect, useState, useCallback } from "react";
import ErrorBox from "../../components/ErrorBox";
import SectionCard from "../../components/SectionCard";
import CopyButton from "../../components/CopyButton";
import SEODescription from "../../components/SEODescription";
import seoDescriptions from "../../data/seoDescriptions";
import { PageSEO } from "../../components/PageSEO";
import { updateToolUsage } from "../../utils/toolUsage";
import LoadingButton from "../../components/LoadingButton";
import { getErrorMessage } from "../../utils/errors";
import ToolHeader from "../../components/ToolHeader";

// Character sets (equivalent to Python's string module)
const DIGITS = "0123456789";
const PUNCTUATION = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const ASCII_LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const ASCII_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Password strength levels
type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

interface StrengthIndicatorProps {
  strength: PasswordStrength;
}

const StrengthIndicator = ({ strength }: StrengthIndicatorProps) => {
  const strengthLevels = {
    weak: { label: "Weak", width: "25%", color: "bg-red-500" },
    medium: { label: "Medium", width: "50%", color: "bg-yellow-500" },
    strong: { label: "Strong", width: "75%", color: "bg-blue-500" },
    "very-strong": {
      label: "Very Strong",
      width: "100%",
      color: "bg-green-500",
    },
  };

  const currentLevel = strengthLevels[strength];

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">Password strength:</span>
        <span className="text-sm">{currentLevel.label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${currentLevel.color}`}
          style={{ width: currentLevel.width }}
          aria-valuenow={
            strength === "weak"
              ? 25
              : strength === "medium"
              ? 50
              : strength === "strong"
              ? 75
              : 100
          }
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={`Password strength: ${currentLevel.label}`}
        />
      </div>
    </div>
  );
};

function calculatePasswordStrength(
  password: string,
  options: {
    includeNumbers: boolean;
    includeSpecial: boolean;
    includeUppercase: boolean;
    includeLowercase: boolean;
  }
): PasswordStrength {
  if (!password) return "weak";

  const { includeNumbers, includeSpecial, includeUppercase, includeLowercase } =
    options;
  let score = 0;

  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Character diversity score
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  // Bonus for using all selected character types
  const selectedTypes = [
    includeLowercase && hasLower,
    includeUppercase && hasUpper,
    includeNumbers && hasNumber,
    includeSpecial && hasSpecial,
  ].filter(Boolean).length;

  score += selectedTypes;

  // Determine strength
  if (score >= 8) return "very-strong";
  if (score >= 6) return "strong";
  if (score >= 4) return "medium";
  return "weak";
}

// Returns a uniformly distributed integer in [0, max) using rejection
// sampling. A plain `random % max` would favour the first
// (2**32 % max) values, which biases the character pool and the shuffle.
function randomInt(max: number): number {
  if (max <= 0) throw new Error("max must be greater than zero");
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function generatePassword(
  length: number,
  includeNumbers: boolean,
  includeSpecial: boolean,
  includeUppercase: boolean,
  includeLowercase: boolean
): string {
  if (length < 8 || length > 128) {
    throw new Error("Password length must be between 8 and 128 characters");
  }

  // Build character pool
  let charPool = "";
  if (includeNumbers) charPool += DIGITS;
  if (includeSpecial) charPool += PUNCTUATION;
  if (includeLowercase) charPool += ASCII_LOWERCASE;
  if (includeUppercase) charPool += ASCII_UPPERCASE;

  if (!charPool) {
    throw new Error("At least one character type must be selected");
  }

  // Ensure at least one character of each selected type
  const requiredChars: string[] = [];
  if (includeNumbers)
    requiredChars.push(
      DIGITS[randomInt(DIGITS.length)]
    );
  if (includeSpecial)
    requiredChars.push(
      PUNCTUATION[randomInt(PUNCTUATION.length)]
    );
  if (includeLowercase)
    requiredChars.push(
      ASCII_LOWERCASE[randomInt(ASCII_LOWERCASE.length)]
    );
  if (includeUppercase)
    requiredChars.push(
      ASCII_UPPERCASE[randomInt(ASCII_UPPERCASE.length)]
    );

  const remainingLength = length - requiredChars.length;
  if (remainingLength < 0) {
    throw new Error(
      `Password length (${length}) is too short to include all required character types. Minimum length for current selection is ${requiredChars.length}.`
    );
  }

  // Generate remaining characters
  const passwordChars = requiredChars.concat(
    Array.from({ length: remainingLength }, () => {
      return charPool[randomInt(charPool.length)];
    })
  );

  // Shuffle the password
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

function PasswordGenerator() {
  const seo = seoDescriptions.passwordGenerator;
  const [password, setPassword] = useState("");
  const [lengthInput, setLengthInput] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>("weak");

  // Calculate password strength whenever password or options change
  useEffect(() => {
    if (password) {
      setStrength(
        calculatePasswordStrength(password, {
          includeNumbers,
          includeSpecial,
          includeUppercase,
          includeLowercase,
        })
      );
    }
  }, [
    password,
    includeNumbers,
    includeSpecial,
    includeUppercase,
    includeLowercase,
  ]);

  // Track tool usage on mount
  useEffect(() => {
    updateToolUsage("password");
    // Generate initial password on mount
    fetchPassword();
  }, []);

  // Regenerate password when any input changes
  useEffect(() => {
    fetchPassword();
  }, [
    lengthInput,
    includeNumbers,
    includeSpecial,
    includeUppercase,
    includeLowercase,
  ]);

  const fetchPassword = useCallback(() => {
    setIsLoading(true);
    try {
      const newPassword = generatePassword(
        lengthInput,
        includeNumbers,
        includeSpecial,
        includeUppercase,
        includeLowercase
      );
      setPassword(newPassword);
      setError("");
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to generate password. Please check your settings.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    lengthInput,
    includeNumbers,
    includeSpecial,
    includeUppercase,
    includeLowercase,
  ]);

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      const numValue = Number(value);
      if (numValue < 0 || numValue > 128) return;
      setLengthInput(numValue);
    }
  };

  const incrementLength = () => {
    setLengthInput((prev) => Math.min(prev + 1, 128));
  };

  const decrementLength = () => {
    setLengthInput((prev) => Math.max(prev - 1, 8));
  };

  return (
    <>
      <PageSEO title={seo.seo} description={seo.body} />
      <div className="py-6 sm:py-8">
        <ToolHeader title={seo.title} />

        <SectionCard>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              Generate Secure Password
            </h2>
            <hr className="line-break" />
            <div className="flex items-center gap-4 mb-4">
              <label
                className="form-label whitespace-nowrap"
                htmlFor="password-length"
              >
                Length (8-128):
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="password-length"
                  value={lengthInput}
                  onChange={handleLengthChange}
                  className="input-field w-20 text-right pr-2"
                  disabled={isLoading}
                  placeholder="8-128"
                  aria-describedby={error ? "password-error" : undefined}
                  aria-invalid={!!error}
                  aria-required="true"
                />
                <div className="flex flex-col ml-1">
                  <button
                    onClick={incrementLength}
                    disabled={isLoading || lengthInput >= 128}
                    className="toggle-count"
                    aria-label="Increment password length"
                  >
                    +
                  </button>
                  <button
                    onClick={decrementLength}
                    disabled={isLoading || lengthInput <= 8}
                    className="toggle-count"
                    aria-label="Decrement password length"
                  >
                    −
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col space-y-2">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="checkbox-primary"
                    disabled={isLoading}
                    aria-checked={includeNumbers}
                    aria-labelledby="numbers-label"
                  />
                  <span id="numbers-label">Include Numbers (0-9)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeSpecial}
                    onChange={(e) => setIncludeSpecial(e.target.checked)}
                    className="checkbox-primary"
                    disabled={isLoading}
                    aria-checked={includeSpecial}
                    aria-labelledby="special-label"
                  />
                  <span id="special-label">
                    Include Special Characters (!@#$%^)
                  </span>
                </label>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="checkbox-primary"
                    disabled={isLoading}
                    aria-checked={includeUppercase}
                    aria-labelledby="uppercase-label"
                  />
                  <span id="uppercase-label">
                    Include Uppercase Letters (A-Z)
                  </span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="checkbox-primary"
                    disabled={isLoading}
                    aria-checked={includeLowercase}
                    aria-labelledby="lowercase-label"
                  />
                  <span id="lowercase-label">
                    Include Lowercase Letters (a-z)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-center">
              <LoadingButton
                onClick={fetchPassword}
                isLoading={isLoading}
                className="btn-primary"
                aria-label="Generate new password"
              >
                Regenerate Password
              </LoadingButton>
            </div>

            {password && (
              <div className="result-box mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label">Generated Password</label>
                  <CopyButton
                    text={password}
                    aria-label="Copy password to clipboard"
                  />
                </div>
                <div className="inner-result">
                  <div className="mono-output" aria-live="polite">
                    {password}
                  </div>
                </div>
                <StrengthIndicator strength={strength} />
              </div>
            )}

            <ErrorBox
              message={error}
              id={error ? "password-error" : undefined}
            />
          </div>
        </SectionCard>
        <SEODescription title={`a ${seo.title}`}>{seo.body}</SEODescription>
      </div>
    </>
  );
}

export default PasswordGenerator;
