import { useCallback, useRef, useState } from 'react';
import { fileBaseName } from '../utils/text';

/**
 * Text that can be typed or loaded from a file. `fileBase` remembers the
 * loaded file's name (without extension) so a download can reuse it; it is
 * forgotten as soon as the text is edited, because the text is then no
 * longer that file.
 */
export function useSourceText(initial = '') {
  const [text, setTextState] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [fileBase, setFileBase] = useState('');
  // Loads can resolve out of order; only the latest one may win.
  const loadSeq = useRef(0);

  const setText = useCallback((value: string) => {
    loadSeq.current += 1;
    setTextState(value);
    setFile(null);
    setFileBase('');
  }, []);

  const loadFile = useCallback(async (f: File) => {
    const seq = ++loadSeq.current;
    const content = await f.text();
    if (seq !== loadSeq.current) return;
    setFile(f);
    setFileBase(fileBaseName(f.name));
    setTextState(content);
  }, []);

  const clear = useCallback(() => {
    loadSeq.current += 1;
    setTextState('');
    setFile(null);
    setFileBase('');
  }, []);

  return { text, setText, file, fileBase, loadFile, clear };
}
