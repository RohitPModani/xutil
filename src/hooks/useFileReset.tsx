// src/hooks/useFileReset.ts
import { useState } from 'react';

export function useFileReset() {
  const [resetSignal, setResetSignal] = useState(0);

  const triggerReset = () => {
    setResetSignal(prev => prev + 1);
  };

  return {
    resetSignal,
    triggerReset,
  };
}