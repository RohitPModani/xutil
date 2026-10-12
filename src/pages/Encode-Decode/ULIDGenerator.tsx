import { useCallback, useEffect, useMemo, useState } from 'react';
import { decodeTime, ulid } from 'ulid';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, CopyButton, Field, GenerateButton, Input, KeyValueList, Output, Panel, ValueBlock } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

export default function ULIDGenerator() {
  const [count, setCount] = useState('5');
  const [single, setSingle] = useState('');
  const [bulk, setBulk] = useState<string[]>([]);
  const [lookup, setLookup] = useState('');

  const n = Math.min(1000, Math.max(1, Number(count) || 1));

  const regenerate = useCallback(() => {
    setSingle(ulid());
    setBulk(Array.from({ length: n }, () => ulid()));
  }, [n]);

  // A fresh value on load and whenever the count changes.
  useEffect(regenerate, [regenerate]);

  const decoded = useMemo(() => {
    const id = lookup.trim().toUpperCase();
    if (!id) return null;
    try {
      if (id.length !== 26) throw new Error('A ULID is exactly 26 characters.');
      const ms = decodeTime(id);
      return { ms, error: '' };
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
              <GenerateButton variant="secondary" label="New" onClick={regenerate} />
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
          <Field label="ULID" htmlFor="ulid-lookup" hint="The first 10 characters encode when it was made.">
            <Input
              id="ulid-lookup"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="01ARZ3NDEKTSV4RRFFQ69G5FAV"
              maxLength={26}
              aria-invalid={Boolean(decoded?.error) || undefined}
            />
          </Field>
          <Output label="Created" copyText={items.map((i) => `${i.label}: ${i.value}`).join('\n')} placeholder="Paste a ULID to see its timestamp">
            {items.length > 0 ? <KeyValueList items={items} /> : undefined}
          </Output>
        </div>
        {decoded?.error && (
          <Callout tone="error" className="mt-4">
            {decoded.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
