import { useCallback, useEffect, useMemo, useState } from 'react';
import { decodeTime, isValid, monotonicFactory, ulid } from 'ulid';
import ToolPage from '../../components/ToolPage';
import { ClearButton, CopyButton, Field, GenerateButton, Input, KeyValueList, Output, Panel, ValueBlock } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

// Bulk IDs made in the same millisecond still sort in creation order.
const nextBulk = monotonicFactory();

export default function ULIDGenerator() {
  const [count, setCount] = useState('5');
  const [single, setSingle] = useState('');
  const [bulk, setBulk] = useState<string[]>([]);
  const [lookup, setLookup] = useState('');

  const n = Math.min(1000, Math.max(1, Math.floor(Number(count)) || 1));

  const newSingle = useCallback(() => setSingle(ulid()), []);
  const newBulk = useCallback(() => setBulk(Array.from({ length: n }, () => nextBulk())), [n]);

  // A fresh value on load; the bulk list follows the count without touching
  // the headline value.
  useEffect(newSingle, [newSingle]);
  useEffect(newBulk, [newBulk]);

  const decoded = useMemo(() => {
    const id = lookup.replace(/["'`\s]/g, '').toUpperCase();
    if (!id) return null;
    try {
      if (!isValid(id)) throw new Error('Not a valid ULID: 26 characters from 0–9 and A–Z without I, L, O and U.');
      return { ms: decodeTime(id), error: '' };
    } catch (e) {
      return { ms: 0, error: getErrorMessage(e, 'Not a valid ULID.') };
    }
  }, [lookup]);

  const when = decoded && !decoded.error ? new Date(decoded.ms) : null;
  const items = when
    ? [
        { label: 'Local time', value: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long' }).format(when) },
        { label: 'ISO 8601', value: when.toISOString() },
        { label: 'Unix ms', value: String(decoded?.ms) },
      ]
    : [];

  return (
    <ToolPage id="ulid">
      <Panel title="Generate">
        <ValueBlock
          value={single}
          actions={
            <>
              <CopyButton text={single} size="md" variant="primary" />
              <GenerateButton
                variant="secondary"
                label="New"
                onClick={() => {
                  newSingle();
                  newBulk();
                }}
              />
            </>
          }
        />
      </Panel>

      <Panel title="Bulk">
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <Field label="How many" htmlFor="ulid-count" hint="1 to 1000">
            <Input
              id="ulid-count"
              type="number"
              min={1}
              max={1000}
              step={1}
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              onBlur={() => setCount(String(n))}
            />
          </Field>
          <Output label={`${bulk.length} ULIDs`} value={bulk.join('\n')} rows={10} fileName="ulids.txt" />
        </div>
      </Panel>

      <Panel title="Decode timestamp" actions={<ClearButton onClick={() => setLookup('')} disabled={!lookup} />}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="ULID" htmlFor="ulid-lookup" hint="The first 10 characters encode when it was made." error={decoded?.error}>
            <Input
              id="ulid-lookup"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="01ARZ3NDEKTSV4RRFFQ69G5FAV"
            />
          </Field>
          <Output label="Created" copyText={items.map((i) => `${i.label}: ${i.value}`).join('\n')} placeholder="Paste a ULID to see its timestamp">
            {items.length > 0 ? <KeyValueList items={items} /> : undefined}
          </Output>
        </div>
      </Panel>
    </ToolPage>
  );
}
