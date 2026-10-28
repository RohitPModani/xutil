import { useDeferredValue, useMemo, useState } from 'react';
import { format, type KeywordCase, type SqlLanguage } from 'sql-formatter';
import ToolPage from '../../components/ToolPage';
import { ClearButton, Field, FileDrop, Output, Panel, Segmented, Select, TextArea, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';
import { useSourceText } from '../../hooks/useSourceText';

type Indent = '2' | '4' | 'tab';

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'tsql', label: 'SQL Server (T-SQL)' },
  { value: 'plsql', label: 'Oracle (PL/SQL)' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'spark', label: 'Spark SQL' },
];

export default function SqlFormatter() {
  const { text: input, setText: setInput, file, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [language, setLanguage] = useState<SqlLanguage>('sql');
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper');
  const [indent, setIndent] = useState<Indent>('2');
  const deferred = useDeferredValue(input);

  const result = useMemo(() => {
    if (!deferred.trim()) return { out: '', error: '' };
    try {
      const out = format(deferred, {
        language,
        keywordCase,
        tabWidth: indent === '4' ? 4 : 2,
        useTabs: indent === 'tab',
      });
      return { out, error: '' };
    } catch (e) {
      // The first line says where it failed; the rest is a dump of the grammar's expectations.
      return { out: '', error: getErrorMessage(e, 'Could not parse this SQL.').split('\n')[0] };
    }
  }, [deferred, language, keywordCase, indent]);

  return (
    <ToolPage id="sql_formatter">
      <Panel
        title="Format"
        actions={
          <>
            <Select aria-label="Dialect" value={language} onChange={(e) => setLanguage(e.target.value as SqlLanguage)} className="w-auto">
              {DIALECTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
            <Segmented
              size="sm"
              label="Keyword case"
              value={keywordCase}
              onChange={setKeywordCase}
              options={[
                { value: 'preserve', label: 'Keep' },
                { value: 'upper', label: 'UPPER' },
                { value: 'lower', label: 'lower' },
              ]}
            />
            <Segmented
              size="sm"
              label="Indent"
              value={indent}
              onChange={setIndent}
              options={[
                { value: '2', label: '2' },
                { value: '4', label: '4' },
                { value: 'tab', label: 'Tab' },
              ]}
            />
            <ClearButton onClick={clearSource} disabled={!input} />
          </>
        }
      >
        <TwoPane>
          <Field label="SQL" htmlFor="sql-input" error={result.error || undefined}>
            <TextArea
              id="sql-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="select id, name from users where active = 1 order by name"
              rows={12}
              stats
              autoFocus
              autoSize={input.length < 200_000}
            />
            <FileDrop className="mt-3" accept=".sql,text/plain" label="Load a file" file={file} onFile={loadFile} onClear={clearSource} />
          </Field>
          <Output label="Formatted" value={result.out} rows={12} wrap={false} fileName={`${fileBase || 'formatted'}.sql`} mime="application/sql" />
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
