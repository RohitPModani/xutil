import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DateTime } from 'luxon';
import ToolPage from '../../components/ToolPage';
import { CopyButton, KeyValueList, Output, Panel, TwoPane } from '../../ui';

const ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long', timeZone: ZONE });

const SNIPPETS = [
  { label: 'JavaScript', value: 'Math.floor(Date.now() / 1000)' },
  { label: 'Python', value: 'import time; int(time.time())' },
  { label: 'Go', value: 'time.Now().Unix()' },
  { label: 'Java', value: 'Instant.now().getEpochSecond()' },
  { label: 'C#', value: 'DateTimeOffset.UtcNow.ToUnixTimeSeconds()' },
  { label: 'PHP', value: 'time()' },
  { label: 'Ruby', value: 'Time.now.to_i' },
  { label: 'Rust', value: 'SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()' },
  { label: 'Bash', value: 'date +%s' },
  { label: 'PostgreSQL', value: 'select extract(epoch from now())::bigint;' },
  { label: 'MySQL', value: 'select unix_timestamp();' },
];

export default function EpochClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const seconds = Math.floor(now / 1000);
  const date = new Date(now);
  const rows = [
    { label: 'Milliseconds', value: String(now) },
    { label: 'ISO 8601 (UTC)', value: date.toISOString() },
    { label: `Local (${ZONE})`, value: localFmt.format(date), mono: false },
    { label: 'RFC 2822', value: DateTime.fromMillis(now).toRFC2822() ?? '' },
  ];

  return (
    <ToolPage id="epoch">
      <Panel
        title="Now"
        actions={
          <Link
            to="/unix_utc"
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            Convert a specific timestamp
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface px-4 py-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted">Unix time · seconds</div>
            <output aria-live="off" className="mt-0.5 block font-mono text-3xl tabular-nums text-ink sm:text-4xl">
              {seconds}
            </output>
          </div>
          <CopyButton text={String(seconds)} variant="primary" size="md" />
        </div>
        <TwoPane className="mt-4">
          <Output label="This instant" copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}>
            <KeyValueList items={rows} />
          </Output>
          <Output label="Current epoch in code" copyText={SNIPPETS.map((r) => `${r.label}: ${r.value}`).join('\n')}>
            <KeyValueList items={SNIPPETS} />
          </Output>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
