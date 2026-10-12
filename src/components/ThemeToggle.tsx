import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IconButton } from '../ui';

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem('xutil-theme');
    if (stored) return stored === 'dark';
  } catch {
    // Storage can be unavailable in private mode.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('xutil-theme', dark ? 'dark' : 'light');
    } catch {
      // Preference just will not persist.
    }
  }, [dark]);

  return (
    <IconButton label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setDark((v) => !v)}>
      {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
    </IconButton>
  );
}
