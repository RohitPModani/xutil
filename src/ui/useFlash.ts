import { useEffect, useRef, useState } from 'react';

/**
 * Feedback for the small, repeated actions lives on the button itself: the
 * label swaps to "Copied" for a moment. No toast, nothing to dismiss.
 */
export function useFlash(ms = 1500) {
  const [on, setOn] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = () => {
    setOn(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOn(false), ms);
  };
  return [on, flash] as const;
}
