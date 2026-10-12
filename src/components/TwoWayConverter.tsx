import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import ToolPage from './ToolPage';
import { Callout, ClearButton, Field, FileDrop, Output, Panel, Segmented, TextArea, TwoPane } from '../ui';
import { useSourceText } from '../hooks/useSourceText';
import { getErrorMessage } from '../utils/errors';
import { hasUnsafeIntegers, UNSAFE_INTEGER_NOTE } from '../utils/json';

export interface Format {
  /** Short label used in the direction switch, e.g. "YAML". */
  label: string;
  ext: string;
  mime: string;
  /** True when this side is JSON, so big-integer loss can be flagged. */
  json?: boolean;
}

export interface TwoWayConverterProps {
  /** Registry id. */
  id: string;
  formats: [Format, Format];
  /** File types accepted by the drop zone, e.g. ".yaml,.yml,.json". */
  accept: string;
  /** Which side the text looks like; null when unsure (defaults to side 0). */
  detect: (input: string) => 0 | 1 | null;
  /** Converts text from side `from` to the other side. Throw to report an error. */
  convert: (input: string, from: 0 | 1) => string;
  placeholder?: string;
  hint?: string;
  /** Extra controls rendered above the panes (delimiter choice, etc.). */
  options?: ReactNode;
  /** Do not soft-wrap the output (CSV, wide XML). */
  wrapOutput?: boolean;
  maxSizeMB?: number;
}

type Mode = 'auto' | 0 | 1;

/**
 * The shared shape of every "X ⇄ Y" page: one input (typed or from a file),
 * auto-detected direction with an override, one output named after the file.
 * Conversion runs on a deferred copy of the input so typing stays responsive
 * with large documents.
 */
export function TwoWayConverter({ id, formats, accept, detect, convert, placeholder, hint, options, wrapOutput = true, maxSizeMB = 5 }: TwoWayConverterProps) {
  const { text: input, setText, file, fileBase, loadFile, clear } = useSourceText();
  const [mode, setMode] = useState<Mode>('auto');
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred.trim()) return null;
    const from: 0 | 1 = mode === 'auto' ? (detect(deferred) ?? 0) : mode;
    const to: 0 | 1 = from === 0 ? 1 : 0;
    try {
      return { out: convert(deferred, from), from, to, error: '' };
    } catch (e) {
      return { out: '', from, to, error: getErrorMessage(e, 'Could not parse the input.') };
    }
  }, [deferred, mode, detect, convert]);

  const [a, b] = formats;
  const toFormat = result ? formats[result.to] : null;
  const fromFormat = result ? formats[result.from] : null;
  const bigInts = useMemo(() => Boolean(result && !result.error && (fromFormat?.json || toFormat?.json) && hasUnsafeIntegers(fromFormat?.json ? deferred : result.out)), [result, fromFormat, toFormat, deferred]);

  return (
    <ToolPage id={id}>
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode === 'auto' ? 'auto' : String(mode)}
              onChange={(v) => setMode(v === 'auto' ? 'auto' : (Number(v) as 0 | 1))}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: '0', label: `${a.label} → ${b.label}` },
                { value: '1', label: `${b.label} → ${a.label}` },
              ]}
            />
            <ClearButton onClick={clear} disabled={!input} />
          </>
        }
      >
        {options && <div className="mb-4 flex flex-wrap items-end gap-3">{options}</div>}
        <TwoPane>
          <Field
            label="Input"
            htmlFor={`${id}-input`}
            error={result?.error}
            hint={result && !result.error ? `Detected ${fromFormat?.label}; converting to ${toFormat?.label}.` : hint ?? `Paste ${a.label} or ${b.label}. Direction is detected automatically.`}
          >
            <TextArea
              id={`${id}-input`}
              value={input}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept={accept} label="Load a file" file={file} maxSizeMB={maxSizeMB} onFile={loadFile} onClear={clear} />
          </Field>
          <Output
            label={toFormat ? `Output · ${toFormat.label}` : 'Output'}
            value={result?.out ?? ''}
            rows={12}
            wrap={wrapOutput}
            fileName={`${fileBase || 'converted'}.${toFormat?.ext ?? 'txt'}`}
            mime={toFormat?.mime}
          />
        </TwoPane>
        {bigInts && (
          <Callout tone="info" className="mt-4">
            {UNSAFE_INTEGER_NOTE}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
