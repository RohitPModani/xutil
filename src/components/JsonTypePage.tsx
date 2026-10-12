import { useDeferredValue, useMemo, useState } from 'react';
import ToolPage from './ToolPage';
import { Callout, ClearButton, Field, FileDrop, Input, Output, Panel, TextArea, TwoPane } from '../ui';
import { useSourceText } from '../hooks/useSourceText';
import { getErrorMessage } from '../utils/errors';
import { describeJsonError, hasUnsafeIntegers, UNSAFE_INTEGER_NOTE } from '../utils/json';
import { validateClassName } from '../utils/jsonPythonUtils';
import { inferSchema, parseJsonSample, type Schema } from '../utils/jsonSchema';

export interface JsonTypePageProps {
  /** Registry id. */
  id: string;
  nameLabel: string;
  nameHint: string;
  defaultName: string;
  outputLabel: string;
  /** Download name when no file was loaded, and the extension. */
  fileStem: string;
  ext: string;
  mime: string;
  placeholder: string;
  /** Prints the inferred schema in the target language. */
  emit: (schema: Schema, rootName: string) => string;
}

/**
 * The shared shape of the JSON → types pages: a root name, a JSON sample
 * (typed or from a file) and the generated code. Inference runs on a
 * deferred copy of the input so typing stays responsive.
 */
export function JsonTypePage({ id, nameLabel, nameHint, defaultName, outputLabel, fileStem, ext, mime, placeholder, emit }: JsonTypePageProps) {
  const { text: input, setText, file, fileBase, loadFile, clear } = useSourceText();
  const [name, setName] = useState(defaultName);
  const deferred = useDeferredValue(input);
  const nameError = validateClassName(name);

  const result = useMemo(() => {
    if (!deferred.trim() || nameError) return null;
    try {
      return { out: emit(inferSchema(parseJsonSample(deferred), name), name), error: '' };
    } catch (e) {
      return { out: '', error: e instanceof SyntaxError ? describeJsonError(e, deferred) : getErrorMessage(e, 'Could not parse the JSON.') };
    }
  }, [deferred, name, nameError, emit]);

  const bigInts = useMemo(() => Boolean(result && !result.error && hasUnsafeIntegers(deferred)), [result, deferred]);

  return (
    <ToolPage id={id}>
      <Panel
        title="Convert"
        actions={
          <ClearButton
            onClick={() => {
              clear();
              setName(defaultName);
            }}
            disabled={!input && name === defaultName}
          />
        }
      >
        <Field label={nameLabel} htmlFor={`${id}-name`} className="mb-4 max-w-xs" hint={nameHint} error={nameError}>
          <Input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultName} maxLength={64} />
        </Field>
        <TwoPane>
          <Field label="JSON" htmlFor={`${id}-input`} error={result?.error}>
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
            <FileDrop className="mt-3" accept=".json" label="Load a file" file={file} onFile={loadFile} onClear={clear} />
          </Field>
          <Output label={outputLabel} value={result?.out ?? ''} rows={12} wrap={false} fileName={`${fileBase || fileStem}.${ext}`} mime={mime} />
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
