import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, EmptyState, Field, Input, KeyValueList, Output, Panel, Select } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

export interface Unit {
  value: string;
  label: string;
}

export interface UnitConverterProps {
  /** Registry id, e.g. "length". */
  id: string;
  defaultValue: string;
  defaultUnit: string;
  units: Unit[];
  validationMessage: string;
  convert: (value: number, unit: string) => Record<string, number>;
  /** Allow zero and negatives (temperature). Default: positive only. */
  allowNonPositive?: boolean;
}

const format = (n: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(n);

/**
 * One input, every other unit as output, recomputed on each keystroke. The
 * fourteen unit tools are this component with a different table.
 */
export default function UnitConverter({
  id,
  defaultValue,
  defaultUnit,
  units,
  validationMessage,
  convert,
  allowNonPositive,
}: UnitConverterProps) {
  const [value, setValue] = useState(defaultValue);
  const [unit, setUnit] = useState(defaultUnit);

  const result = useMemo(() => {
    const raw = value.trim();
    if (!raw) return { rows: null, error: '' };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { rows: null, error: 'Enter a number.' };
    if (!allowNonPositive && n <= 0) return { rows: null, error: validationMessage };
    try {
      const out = convert(n, unit);
      const rows = units.map((u) => ({ label: u.label, value: u.value in out ? format(out[u.value]) : '' }));
      return { rows, error: '' };
    } catch (e) {
      return { rows: null, error: getErrorMessage(e, 'Conversion failed.') };
    }
  }, [value, unit, convert, units, validationMessage, allowNonPositive]);

  const copyAll = result.rows?.map((r) => `${r.label}: ${r.value}`).join('\n') ?? '';
  const pristine = value === defaultValue && unit === defaultUnit;

  return (
    <ToolPage id={id}>
      <Panel
        title="Convert"
        actions={
          <ClearButton
            label="Reset"
            onClick={() => {
              setValue(defaultValue);
              setUnit(defaultUnit);
            }}
            disabled={pristine}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
          <Field label="Value" htmlFor={`${id}-value`}>
            <Input
              id={`${id}-value`}
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="1"
              maxLength={24}
              autoFocus
              aria-invalid={Boolean(result.error) || undefined}
            />
          </Field>
          <Field label="Unit" htmlFor={`${id}-unit`}>
            <Select id={`${id}-unit`} value={unit} onChange={(e) => setUnit(e.target.value)}>
              {units.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2 md:col-span-1">
            {result.error ? (
              <Callout tone="error">{result.error}</Callout>
            ) : (
              <Output label="Equals" copyText={copyAll} placeholder="Enter a value">
                {result.rows ? <KeyValueList items={result.rows} /> : <EmptyState>Enter a value</EmptyState>}
              </Output>
            )}
          </div>
        </div>
      </Panel>
    </ToolPage>
  );
}
