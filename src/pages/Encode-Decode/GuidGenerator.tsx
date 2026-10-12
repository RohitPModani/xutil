import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ToolPage from '../../components/ToolPage';
import { Checkbox, CopyButton, Field, GenerateButton, Input, Output, Panel, Segmented, Toolbar, ValueBlock } from '../../ui';

// Formats 16 bytes as a canonical 8-4-4-4-12 UUID string.
const formatUuid = (bytes: Uint8Array): string => {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
};

// UUID v7 per RFC 9562: 48-bit big-endian Unix ms timestamp, then 74 random
// bits, with version and variant set in place.
const uuidv7 = (): string => {
  const bytes = new Uint8Array(16);
  let ts = Date.now();
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ts % 256;
    ts = Math.floor(ts / 256);
  }
  crypto.getRandomValues(bytes.subarray(6));
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return formatUuid(bytes);
};

type Version = 'v4' | 'v7';

const make = (v: Version) => (v === 'v4' ? uuidv4() : uuidv7());

export default function GuidGenerator() {
  const [version, setVersion] = useState<Version>('v4');
  const [count, setCount] = useState('5');
  const [upper, setUpper] = useState(false);
  const [braces, setBraces] = useState(false);
  const [single, setSingle] = useState('');
  const [bulk, setBulk] = useState<string[]>([]);

  const n = Math.min(1000, Math.max(1, Number(count) || 1));

  const style = useCallback(
    (id: string) => {
      let s = upper ? id.toUpperCase() : id;
      if (braces) s = `{${s}}`;
      return s;
    },
    [upper, braces]
  );

  const regenerate = useCallback(() => {
    setSingle(make(version));
    setBulk(Array.from({ length: n }, () => make(version)));
  }, [version, n]);

  // A fresh value on load and whenever the settings change, so there is
  // always something to copy without pressing a button first.
  useEffect(regenerate, [regenerate]);

  const bulkText = bulk.map(style).join('\n');

  return (
    <ToolPage id="guid">
      <Panel
        title="Generate"
        actions={
          <Segmented
            size="sm"
            label="UUID version"
            value={version}
            onChange={setVersion}
            options={[
              { value: 'v4', label: 'v4 random' },
              { value: 'v7', label: 'v7 time-ordered' },
            ]}
          />
        }
      >
        <ValueBlock
          value={single ? style(single) : ''}
          actions={
            <>
              <CopyButton text={style(single)} size="md" variant="primary" />
              <GenerateButton variant="secondary" label="New" onClick={regenerate} />
            </>
          }
        />

        <Toolbar className="mt-4 gap-x-5">
          <Checkbox label="Uppercase" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          <Checkbox label="Braces" checked={braces} onChange={(e) => setBraces(e.target.checked)} />
        </Toolbar>
      </Panel>

      <Panel title="Bulk">
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <Field label="How many" htmlFor="guid-count" hint="1 to 1000">
            <Input
              id="guid-count"
              type="number"
              min={1}
              max={1000}
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              onBlur={() => setCount(String(n))}
            />
          </Field>
          <Output label={`${bulk.length} UUIDs`} value={bulkText} rows={10} fileName={`uuids-${version}.txt`} />
        </div>
      </Panel>
    </ToolPage>
  );
}
