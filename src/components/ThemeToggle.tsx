import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem("xutil-theme");
    if (stored) return stored === "dark";
  } catch {
    // Storage can be unavailable in private mode.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("xutil-theme", darkMode ? "dark" : "light");
    } catch {
      // Preference just will not persist.
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((v) => !v)}
      className="icon-button"
      aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
      title={darkMode ? "Light theme" : "Dark theme"}
    >
      {darkMode ? (
        <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
