import React from "react";

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
  className = "",
}) => {
  return (
    <div
      className={`flex rounded-md bg-raised p-1 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            selected === option.value
              ? "bg-surface shadow text-ink"
              : "text-dim hover:text-ink"
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
