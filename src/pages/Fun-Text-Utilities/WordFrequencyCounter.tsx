import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Button, Checkbox, ClearButton, EmptyState, Field, KeyValueList, Output, Panel, Stat, TextArea, Toolbar, TwoPane } from '../../ui';

const STOP_WORDS = new Set(
  'a an and are as at be but by for from has he in is it its of on or that the this to was were will with you your i we they not no so if then than there their'.split(' ')
);

// Letters or digits in any script, with inner apostrophes ("don't" is one word).
const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const TOP = 200;

const format = (n: number) => new Intl.NumberFormat().format(n);

export default function WordFrequencyCounter() {
  const [input, setInput] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [skipStopWords, setSkipStopWords] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    const words = (ignoreCase ? deferred.toLowerCase() : deferred).match(WORD) ?? [];
    const counts = new Map<string, number>();
    for (const w of words) {
      if (skipStopWords && STOP_WORDS.has(w.toLowerCase())) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    const rows = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return { total: rows.reduce((n, [, c]) => n + c, 0), rows };
  }, [deferred, ignoreCase, skipStopWords]);

  const tsv = result.rows.map(([w, c]) => `${w}\t${c}`).join('\n');
  const shown = showAll ? result.rows : result.rows.slice(0, TOP);

  return (
    <ToolPage id="word_frequency_counter">
      <Panel title="Count" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <div className="space-y-4">
            <Field label="Text" htmlFor="wf-input">
              <TextArea id="wf-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="This is fun, this is great" rows={10} stats autoFocus mono={false} autoSize={input.length < 200_000} />
            </Field>
            <Toolbar className="gap-x-5">
              <Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
              <Checkbox label="Ignore common words" checked={skipStopWords} onChange={(e) => setSkipStopWords(e.target.checked)} />
            </Toolbar>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Counted" value={format(result.total)} />
              <Stat label="Unique" value={format(result.rows.length)} />
            </div>
            <Output label="Frequency" copyText={tsv} fileName="word-frequency.tsv" mime="text/tab-separated-values">
              {result.rows.length ? (
                <>
                  <KeyValueList items={shown.map(([w, c]) => ({ label: w, value: format(c), copy: w }))} />
                  {shown.length < result.rows.length && (
                    <Button size="sm" variant="ghost" className="mt-2" onClick={() => setShowAll(true)}>
                      Show all {format(result.rows.length)} words
                    </Button>
                  )}
                </>
              ) : (
                <EmptyState>Counts appear here</EmptyState>
              )}
            </Output>
          </div>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
