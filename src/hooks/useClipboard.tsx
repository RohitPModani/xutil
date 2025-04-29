import { useState } from 'react';
import { showSuccess, showError } from '../utils/toast';

export function useClipboard(timeout: number = 1500) {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false); // ✅ NEW

  const copy = async (text: string, options?: { index?: number; all?: boolean }) => {
    try {
      await navigator.clipboard.writeText(text);

      if (options?.all) {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), timeout);
        showSuccess("All Items Copied!");
      } else if (options?.index !== undefined) {
        setCopiedIndex(options.index);
        setTimeout(() => setCopiedIndex(null), timeout);
        showSuccess("Copied to clipboard!");
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        showSuccess("Copied to clipboard!");
      }
    } catch (err) {
      console.error('Copy failed:', err);
      showError('Failed to copy');
    }
  };

  return {
    copy,
    copied,
    copiedIndex,
    copiedAll, // ✅ RETURN IT
  };
}