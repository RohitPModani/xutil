import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="relative border border-zinc-400 dark:border-zinc-500 inline-flex items-center sm:h-8 sm:w-16 h-6 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700 transition-colors focus:outline-none shadow-inner"
    >
      <span
        className={`absolute left-1 flex items-center justify-center sm:h-6 sm:w-6 h-4 w-4 rounded-full bg-white dark:bg-zinc-900 shadow-md transform transition-all duration-500 ease-in-out ${
          darkMode ? 'translate-x-6 sm:translate-x-8' : ''
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