// components/ToggleSwitch.tsx
import React from 'react';

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleSwitchProps {
  options: ToggleOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  options, 
  selected, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`flex rounded-md bg-zinc-200 dark:bg-zinc-700 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selected === option.value
              ? 'bg-white dark:bg-zinc-800 shadow text-zinc-900 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-white'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleSwitch;