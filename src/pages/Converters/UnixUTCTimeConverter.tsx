import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, ClearButton, EmptyState, Field, Input, KeyValueList, Output, Panel, TwoPane } from '../../ui';

const utcFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long', timeZone: 'UTC' });
const localFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' });
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

function relative(date: Date): string {
  const diff = (date.getTime() - Date.now()) / 1000;
  const [unit, secs] = UNITS.find(([, s]) => Math.abs(diff) >= s) ?? UNITS[UNITS.length - 1];
  return rtf.format(Math.round(diff / secs), unit);
}

/** Treat "YYYY-MM-DD HH:mm:ss" and zone-less ISO strings as UTC. */
function parseDate(s: string): Date | null {
  const iso = s.trim().replace(' ', 'T');
  const zoneless = /^\d{4}-\d{2}-\d{2}(T[\d:.]+)?$/.test(iso);
  const ms = Date.parse(zoneless ? `${iso}Z` : iso);
  return Number.isNaN(ms) ? null : new Date(ms);
}

const isoUtc = (d: Date) => d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
const nowEpoch = () => String(Math.floor(Date.now() / 1000));

function dateRows(d: Date) {
  return [
    { label: 'ISO 8601', value: d.toISOString() },
    { label: 'UTC', value: utcFmt.format(d), mono: false },
    { label: 'Local', value: localFmt.format(d), mono: false },
    { label: 'Relative', value: relative(d), mono: false },
  ];
}

export default function UnixUTCTimeConverter() {
  const [epoch, setEpoch] = useState(nowEpoch);
  const [dateText, setDateText] = useState(() => isoUtc(new Date()));

  const fromEpoch = useMemo(() => {
    const raw = epoch.trim();
    if (!raw) return null;
    const n = Number(raw);
    if (!/^-?\d+(\.\d+)?$/.test(raw) || !Number.isFinite(n)) return { date: null, unit: '', error: 'Enter a whole number of seconds or milliseconds.' };
    // 1e11 seconds is the year 5138; anything bigger must be milliseconds.
    const isMs = Math.abs(n) >= 1e11;
    const date = new Date(isMs ? n : n * 1000);
    if (Number.isNaN(date.getTime())) return { date: null, unit: '', error: 'That value is outside the range a date can hold.' };
    return { date, unit: isMs ? 'milliseconds' : 'seconds', error: '' };
  }, [epoch]);

  const fromDate = useMemo(() => {
    if (!dateText.trim()) return null;
    const date = parseDate(dateText);
    return date ? { date, error: '' } : { date: null, error: 'Could not read that date. Use ISO 8601, e.g. 2025-05-01 13:57:00.' };
  }, [dateText]);

  const epochRows = fromEpoch?.date
    ? [
        { label: 'Seconds', value: String(Math.floor(fromEpoch.date.getTime() / 1000)) },
        { label: 'Milliseconds', value: String(fromEpoch.date.getTime()) },
        ...dateRows(fromEpoch.date),
      ]
    : [];
  const dateRowsOut = fromDate?.date
    ? [
        { label: 'Seconds', value: String(Math.floor(fromDate.date.getTime() / 1000)) },
        { label: 'Milliseconds', value: String(fromDate.date.getTime()) },
        ...dateRows(fromDate.date),
      ]
    : [];

  const copyRows = (rows: { label: string; value: string }[]) => rows.map((r) => `${r.label}: ${r.value}`).join('\n');

  return (
    <ToolPage id="unix_utc">
      <Panel
        title="Epoch to date"
        actions={
          <>
            <Button size="sm" onClick={() => setEpoch(nowEpoch())}>
              Now
            </Button>
            <ClearButton onClick={() => setEpoch('')} disabled={!epoch} />
          </>
        }
      >
        <TwoPane>
          <Field
            label="Epoch"
            htmlFor="ue-epoch"
            hint={fromEpoch?.unit ? `Read as ${fromEpoch.unit}.` : 'Seconds or milliseconds; the unit is detected from the size.'}
          >
            <Input
              id="ue-epoch"
              inputMode="numeric"
              value={epoch}
              onChange={(e) => setEpoch(e.target.value)}
              placeholder="1714583820"
              maxLength={20}
              autoFocus
              aria-invalid={Boolean(fromEpoch?.error) || undefined}
            />
          </Field>
          <Output label="Date" copyText={copyRows(epochRows)}>
            {epochRows.length > 0 ? <KeyValueList items={epochRows} /> : <EmptyState>Enter a timestamp</EmptyState>}
          </Output>
        </TwoPane>
        {fromEpoch?.error && (
          <Callout tone="error" className="mt-4">
            {fromEpoch.error}
          </Callout>
        )}
      </Panel>

      <Panel
        title="Date to epoch"
        actions={
          <>
            <Button size="sm" onClick={() => setDateText(isoUtc(new Date()))}>
              Now
            </Button>
            <ClearButton onClick={() => setDateText('')} disabled={!dateText} />
          </>
        }
      >
        <TwoPane>
          <Field label="Date" htmlFor="ue-date" hint="ISO 8601 or YYYY-MM-DD HH:mm:ss. Treated as UTC unless a zone is given.">
            <Input
              id="ue-date"
              value={dateText}
              onChange={(e) => setDateText(e.target.value)}
              placeholder="2025-05-01 13:57:00"
              maxLength={40}
              aria-invalid={Boolean(fromDate?.error) || undefined}
            />
          </Field>
          <Output label="Epoch" copyText={copyRows(dateRowsOut)}>
            {dateRowsOut.length > 0 ? <KeyValueList items={dateRowsOut} /> : <EmptyState>Enter a date</EmptyState>}
          </Output>
        </TwoPane>
        {fromDate?.error && (
          <Callout tone="error" className="mt-4">
            {fromDate.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
