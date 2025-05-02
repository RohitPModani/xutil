import { useMemo } from 'react';

interface Unit {
  value: string;
  label: string;
}

const useResultText = <T extends Record<string, number | undefined>>(
  result: T | null,
  units: Unit[]
): string => {
  return useMemo(() => {
    if (!result) return '';
    return Object.entries(result)
      .map(([key, val]) => {
        if (val === undefined) return null;
        const unit = units.find(u => u.value === key);
        const displayLabel = unit ? unit.label : key.toUpperCase();
        return `${displayLabel}: ${val}`;
      })
      .filter((entry): entry is string => entry !== null)
      .join('\n');
  }, [result, units]);
};

export default useResultText;