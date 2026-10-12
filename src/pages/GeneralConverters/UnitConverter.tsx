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
  /** Shown when a non-positive value is entered (ignored with `allowNonPositive`). */
  validationMessage?: string;
  convert: (value: number, unit: string) => Record<string, number>;
  /** Allow zero and negatives (temperature, angle). Default: positive only. */
  allowNonPositive?: boolean;
}

// Relative precision, so 1 ns → 1e-9 s instead of 0 and 1 eV → 1.6e-19 J.
const display = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 10 });
const plain = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12, useGrouping: false });

const formatDisplay = (n: number) =>
  Math.abs(n) !== 0 && (Math.abs(n) < 1e-6 || Math.abs(n) >= 1e15) ? n.toExponential(6).replace(/\.?0+e/, 'e') : display.format(n);

/** Mid-entry fragments such as "-", ".", "1e", "1." are not errors yet. */
const PARTIAL = /^[-+]?(\d*\.?\d*)?(e[-+]?)?$/i;
const DECIMAL = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * One input, every other unit as output, recomputed on each keystroke. The
 * fourteen unit tools are this component with a different table.
 */
export default function UnitConverter({
  id,
  defaultValue,
  defaultUnit,
  units,
  validationMessage = 'Enter a value greater than zero.',
  convert,
  allowNonPositive,
}: UnitConverterProps) {
  const [value, setValue] = useState(defaultValue);
  const [unit, setUnit] = useState(defaultUnit);

  const result = useMemo(() => {
    const raw = value.trim();
    if (!raw || PARTIAL.test(raw)) return { rows: null, copy: '', error: '' };
    if (!DECIMAL.test(raw)) return { rows: null, copy: '', error: 'Enter a decimal number.' };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { rows: null, copy: '', error: 'That number is too large.' };
    if (!allowNonPositive && n <= 0) return { rows: null, copy: '', error: validationMessage };
    try {
      const out = convert(n, unit);
      const rows = units
        .filter((u) => u.value !== unit && u.value in out)
        .map((u) => ({ label: u.label, value: formatDisplay(out[u.value]), copy: plain.format(out[u.value]) }));
      const copy = rows.map((r) => `${r.label}: ${r.copy}`).join('\n');
      return { rows, copy, error: '' };
    } catch (e) {
      return { rows: null, copy: '', error: getErrorMessage(e, 'Conversion failed.') };
    }
  }, [value, unit, convert, units, validationMessage, allowNonPositive]);

  const pristine = value === defaultValue && unit === defaultUnit;
  const from = units.find((u) => u.value === unit)?.label ?? unit;

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
          <Field label="Value" htmlFor={`${id}-value`} error={result.error}>
            <Input id={`${id}-value`} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="1" maxLength={32} autoFocus />
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
            <Output label={result.rows ? `${value.trim()} ${from} equals` : 'Equals'} copyText={result.copy} placeholder="Enter a value">
              {result.rows ? <KeyValueList items={result.rows} /> : <EmptyState>{result.error ? 'Fix the value to see results' : 'Enter a value'}</EmptyState>}
            </Output>
          </div>
        </div>
        {result.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
