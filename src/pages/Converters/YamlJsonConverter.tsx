import { useMemo, useState } from 'react';
import * as yaml from 'js-yaml';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { looksLikeJson } from '../../utils/text';
import { useSourceText } from '../../hooks/useSourceText';

type Mode = 'auto' | 'yaml' | 'json';

function convert(input: string, mode: Mode): { out: string; to: 'yaml' | 'json' } {
  const toYaml = mode === 'json' || (mode === 'auto' && looksLikeJson(input));
  if (toYaml) {
    return { out: yaml.dump(JSON.parse(input), { lineWidth: -1 }), to: 'yaml' };
  }
  return { out: JSON.stringify(yaml.load(input), null, 2), to: 'json' };
}

/**
 * One pane in, one pane out. Direction is detected from the input (JSON
 * starts with { or [) and can be forced with the switch.
 */
export default function YamlJsonConverter() {
  const { text: input, setText: setInput, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [mode, setMode] = useState<Mode>('auto');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { ...convert(input, mode), error: '' };
    } catch (e) {
      return { out: '', to: null, error: getErrorMessage(e, 'Could not parse the input.') };
    }
  }, [input, mode]);

  const to = result?.to ?? null;
  const fileName = `${fileBase || 'converted'}.${to ?? 'txt'}`;

  return (
    <ToolPage id="yaml_json">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'yaml', label: 'YAML → JSON' },
                { value: 'json', label: 'JSON → YAML' },
              ]}
            />
            <ClearButton
              onClick={clearSource}
              disabled={!input}
            />
          </>
        }
      >
        <TwoPane>
          <Field label="Input" htmlFor="yj-input" hint={to ? `Detected ${to === 'json' ? 'YAML' : 'JSON'}; converting to ${to.toUpperCase()}.` : 'Paste YAML or JSON. Direction is detected automatically.'}>
            <TextArea
              id="yj-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'name: xutil\ntools:\n  - jwt\n  - yaml'}
              rows={12}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
            />
            <FileDrop
              className="mt-3"
              accept=".yaml,.yml,.json"
              label="Load a file"
              onFile={loadFile}
              onClear={clearSource}
            />
          </Field>
          <Output
            label={to ? `Output · ${to.toUpperCase()}` : 'Output'}
            value={result?.out ?? ''}
            rows={12}
            fileName={fileName}
            mime={to === 'json' ? 'application/json' : 'application/x-yaml'}
          />
        </TwoPane>
        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
