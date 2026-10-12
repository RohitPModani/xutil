import { useCallback, useState } from 'react';
import { fileBaseName } from '../utils/text';

/**
 * Text that can be typed or loaded from a file. `fileBase` remembers the
 * loaded file's name (without extension) so a download can reuse it.
 */
export function useSourceText(initial = '') {
  const [text, setText] = useState(initial);
  const [fileBase, setFileBase] = useState('');

  const loadFile = useCallback(async (file: File) => {
    setFileBase(fileBaseName(file.name));
    setText(await file.text());
  }, []);

  const clear = useCallback(() => {
    setText('');
    setFileBase('');
  }, []);

  return { text, setText, fileBase, setFileBase, loadFile, clear };
}
