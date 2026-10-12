import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, Output, Panel, TextArea, TwoPane } from '../../ui';

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function PalindromeChecker() {
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    const normalised = normalise(input);
    if (!normalised) return null;
    return { normalised, palindrome: normalised === [...normalised].reverse().join('') };
  }, [input]);

  return (
    <ToolPage id="palindrome">
      <Panel title="Check" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <Field label="Text" htmlFor="pal-input" hint="Case, spaces and punctuation are ignored.">
            <TextArea id="pal-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="A man, a plan, a canal: Panama" rows={6} autoFocus mono={false} />
          </Field>
          <Output label="Normalised" value={result?.normalised ?? ''} placeholder="Letters and digits only" rows={6} />
        </TwoPane>
        {result && (
          <Callout tone={result.palindrome ? 'success' : 'info'} className="mt-4">
            {result.palindrome ? 'Yes, this is a palindrome.' : 'No, this is not a palindrome.'}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
