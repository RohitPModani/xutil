import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const getInitialTheme = () => {
  const stored = localStorage.getItem("xutil-theme");
  if (stored) return stored === "dark";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark;
};

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("xutil-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative border border-zinc-400 dark:border-zinc-500 inline-flex items-center sm:h-8 sm:w-16 h-6 w-12 rounded-full bg-zinc-300/30 dark:bg-zinc-700/30 transition-colors focus:outline-none shadow-inner"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span
        className={`absolute left-1 flex items-center justify-center sm:h-6 sm:w-6 h-4 w-4 rounded-full bg-white dark:bg-zinc-900 shadow-md transform transition-all duration-500 ease-in-out ${
          darkMode ? "translate-x-6 sm:translate-x-8" : ""
        }`}
      >
        {darkMode ? (
          <Moon className="sm:w-4 sm:h-4 w-3 h-3 text-white" />
        ) : (
          <Sun className="sm:w-4 sm:h-4 w-3 h-3 text-zinc-900" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
