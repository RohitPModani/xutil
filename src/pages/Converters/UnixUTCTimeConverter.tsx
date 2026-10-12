import { useEffect, useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Button, ClearButton, EmptyState, Field, Input, KeyValueList, Output, Panel, TwoPane } from '../../ui';

/* ---- Parsing (pure; exercised by scripts/check-time.mjs) --------------- */

// ISO 8601 date, optional time, optional Z / ±HH:mm offset. Nothing else.
const DATE_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?)?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i;

const DATE_FORMAT_ERROR = 'Use ISO 8601 (2025-05-01T13:57:00Z) or YYYY-MM-DD HH:mm:ss. Add Z or an offset such as +05:30 to set the zone; without one the date is read as UTC.';
const DATE_RANGE_ERROR = 'That date does not exist.';

/**
 * Strict parse: the fields are placed with Date.UTC-style setters and read
 * back, so impossible dates (2025-02-30, 24:00) are rejected instead of
 * rolling over. Returns the error message instead of a Date on failure.
 */
function parseDate(s: string): Date | string {
  const m = DATE_RE.exec(s.trim());
  if (!m) return DATE_FORMAT_ERROR;
  const [y, mo, d, h, mi, sec, frac] = [m[1], m[2], m[3], m[4] ?? '0', m[5] ?? '0', m[6] ?? '0', (m[7] ?? '0').padEnd(3, '0')].map(Number);
  const date = new Date(0);
  date.setUTCFullYear(y, mo - 1, d);
  date.setUTCHours(h, mi, sec, frac);
  const same =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d &&
    date.getUTCHours() === h &&
    date.getUTCMinutes() === mi &&
    date.getUTCSeconds() === sec;
  if (!same) return DATE_RANGE_ERROR;
  const zone = m[8];
  if (zone && zone.toUpperCase() !== 'Z') {
    const sign = zone[0] === '-' ? -1 : 1;
    const digits = zone.slice(1).replace(':', '');
    const offsetMin = sign * (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2) || 0));
    if (Math.abs(offsetMin) > 14 * 60) return 'Offsets go up to ±14:00.';
    date.setTime(date.getTime() - offsetMin * 60_000);
  }
  return date;
}

const EPOCH_FORMAT_ERROR = 'Enter a whole number: seconds, milliseconds, microseconds or nanoseconds since 1970.';
const EPOCH_RANGE_ERROR = 'That value is outside the range a date can hold.';

/** Unit is guessed from magnitude: 1e11 s is the year 5138, so bigger values must be finer units. */
function parseEpoch(raw: string): { date: Date; unit: string } | string {
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return EPOCH_FORMAT_ERROR;
  const n = Number(raw);
  if (!Number.isFinite(n)) return EPOCH_RANGE_ERROR;
  const abs = Math.abs(n);
  const [unit, ms] =
    abs >= 1e17 ? ['nanoseconds', n / 1e6] : abs >= 1e14 ? ['microseconds', n / 1e3] : abs >= 1e11 ? ['milliseconds', n] : ['seconds', n * 1000];
  const date = new Date(Math.trunc(ms));
  if (Number.isNaN(date.getTime())) return EPOCH_RANGE_ERROR;
  return { date, unit };
}

/* ---- Page -------------------------------------------------------------- */

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

const isoUtc = (d: Date) => d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
const nowEpoch = () => String(Math.floor(Date.now() / 1000));

function dateRows(d: Date) {
  return [
    { label: 'Seconds', value: String(Math.floor(d.getTime() / 1000)) },
    { label: 'Milliseconds', value: String(d.getTime()) },
    { label: 'ISO 8601', value: d.toISOString() },
    { label: 'UTC', value: utcFmt.format(d), mono: false },
    { label: 'Local', value: localFmt.format(d), mono: false },
    { label: 'Relative', value: relative(d), mono: false },
  ];
}

const copyRows = (rows: { label: string; value: string }[]) => rows.map((r) => `${r.label}: ${r.value}`).join('\n');

export default function UnixUTCTimeConverter() {
  const [epoch, setEpoch] = useState(nowEpoch);
  const [dateText, setDateText] = useState(() => isoUtc(new Date()));

  const fromEpoch = useMemo(() => (epoch.trim() ? parseEpoch(epoch.trim()) : null), [epoch]);
  const fromDate = useMemo(() => (dateText.trim() ? parseDate(dateText) : null), [dateText]);

  const epochInfo = typeof fromEpoch === 'object' ? fromEpoch : null;
  const epochDate = epochInfo?.date ?? null;
  const dateDate = fromDate instanceof Date ? fromDate : null;

  // The "Relative" rows count down while anything is shown.
  const [, setTick] = useState(0);
  const showing = Boolean(epochDate || dateDate);
  useEffect(() => {
    if (!showing) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [showing]);

  const epochRows = epochDate ? dateRows(epochDate) : [];
  const dateRowsOut = dateDate ? dateRows(dateDate) : [];

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
            hint={epochInfo ? `Read as ${epochInfo.unit}.` : 'Seconds, milliseconds, microseconds or nanoseconds; the unit is detected from the size.'}
            error={typeof fromEpoch === 'string' ? fromEpoch : undefined}
          >
            <Input
              id="ue-epoch"
              inputMode="numeric"
              value={epoch}
              onChange={(e) => setEpoch(e.target.value)}
              placeholder="1714583820"
              maxLength={24}
              autoFocus
            />
          </Field>
          <Output label="Date" copyText={copyRows(epochRows)}>
            {epochRows.length > 0 ? <KeyValueList items={epochRows} /> : <EmptyState>Enter a timestamp</EmptyState>}
          </Output>
        </TwoPane>
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
          <Field
            label="Date"
            htmlFor="ue-date"
            hint="ISO 8601 or YYYY-MM-DD HH:mm:ss. Read as UTC unless it ends in Z or an offset such as +05:30."
            error={typeof fromDate === 'string' ? fromDate : undefined}
          >
            <Input
              id="ue-date"
              value={dateText}
              onChange={(e) => setDateText(e.target.value)}
              placeholder="2025-05-01 13:57:00"
              maxLength={40}
            />
          </Field>
          <Output label="Epoch" copyText={copyRows(dateRowsOut)}>
            {dateRowsOut.length > 0 ? <KeyValueList items={dateRowsOut} /> : <EmptyState>Enter a date</EmptyState>}
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
