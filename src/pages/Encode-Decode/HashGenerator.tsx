import { useEffect, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, KeyValueList, Output, Panel, TextArea, TwoPane } from '../../ui';
import useDebounce from '../../hooks/useDebounce';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
type Algorithm = (typeof ALGORITHMS)[number];
type Hashes = Record<Algorithm, string>;

async function digest(text: string, algorithm: Algorithm): Promise<string> {
  const buf = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const debounced = useDebounce(input, 150);

  // WebCrypto is async: hash every algorithm at once and keep the previous
  // result on screen until the new one lands.
  useEffect(() => {
    if (!debounced) {
      setHashes(null);
      return;
    }
    let live = true;
    Promise.all(ALGORITHMS.map((a) => digest(debounced, a))).then((values) => {
      if (live) setHashes(Object.fromEntries(ALGORITHMS.map((a, i) => [a, values[i]])) as Hashes);
    });
    return () => {
      live = false;
    };
  }, [debounced]);

  const items = ALGORITHMS.map((a) => ({ label: a, value: hashes?.[a] ?? '' }));
  const all = hashes ? ALGORITHMS.map((a) => `${a}: ${hashes[a]}`).join('\n') : '';

  return (
    <ToolPage id="hash">
      <Panel title="Hash" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <Field label="Text" htmlFor="hash-input" hint="Hashed locally as UTF-8. Whitespace counts.">
            <TextArea
              id="hash-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="The quick brown fox"
              rows={10}
              stats
              autoFocus
            />
          </Field>
          <Output label="Digests" copyText={all} fileName="hashes.txt">
            <KeyValueList items={items} />
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
