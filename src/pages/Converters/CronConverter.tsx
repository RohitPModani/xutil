import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Button, ClearButton, Field, Input, KeyValueList, Output, Panel, Toolbar, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

// Cron field positions for "every N <unit>" and the largest useful step in each.
const UNIT_POSITION: Record<string, number> = { minute: 0, hour: 1, day: 2, month: 3 };
const STEP_MAX = [59, 23, 31, 12];

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_RE = new RegExp(`\\b(${MONTHS.join('|')})\\b`, 'g');
const WEEKDAY_RE = new RegExp(`\\b(${WEEKDAYS.join('|')})\\b`, 'g');

const TIME = '(?:\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?|midnight|noon)';
const AT_RE = new RegExp(`\\bat (${TIME}(?:\\s*(?:,|and|&)\\s*(?:at )?${TIME})*)`);
const BETWEEN_RE = new RegExp(`\\bbetween (${TIME}) and (${TIME})`);
const ON_DAY_RE = /\bon (?:the |day )?(\d{1,2}(?:st|nd|rd|th)?(?:(?:,|,? and) (?:the )?\d{1,2}(?:st|nd|rd|th)?)*)/;

const EXAMPLES = [
  'every 15 minutes',
  'every weekday at 9:30am',
  'every monday and wednesday at 3 pm',
  'every hour between 9 pm and 5 am',
  'every day at 9am and 5pm',
  'monthly on the 15th',
  'every other day',
  'in january',
];

/** "9:30 pm" → [minute, hour]; throws on 25:00, 13 pm, 9:75. */
function parseTime(token: string): [number, number] {
  const t = token.trim();
  if (t === 'midnight') return [0, 0];
  if (t === 'noon') return [0, 12];
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) throw new Error(`"${t}" is not a time.`);
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (m[3]) {
    if (h < 1 || h > 12) throw new Error(`"${t}" is not a valid 12-hour time.`);
    if (m[3] === 'pm' && h < 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
  } else if (h > 23) throw new Error(`"${t}" is not a valid time; hours go up to 23.`);
  if (min > 59) throw new Error(`"${t}" is not a valid time; minutes go up to 59.`);
  return [min, h];
}

const list = (nums: number[]) => [...new Set(nums)].sort((a, b) => a - b).join(',');

/**
 * Every clause is read independently and composed, so "every 2 hours on
 * weekdays in january" fills three fields. A day-level schedule with no
 * time ("every monday") means midnight, not every minute.
 */
function toCron(input: string): string {
  const text = input.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\bmid[- ]day\b/g, 'noon');
  const parts = ['*', '*', '*', '*', '*'];
  let known = false;
  let dayLevel = false;

  const every = text.match(/\bevery (\d+) (minute|hour|day|week|month)s?\b/);
  if (every) {
    known = true;
    const n = Number(every[1]);
    const unit = every[2];
    if (unit === 'week') {
      // Cron has no fortnight; */14 in day-of-month restarts on the 1st.
      if (n < 1 || n > 4) throw new Error('Cron cannot express that; "every N weeks" works up to 4.');
      dayLevel = true;
      if (n === 1) parts[4] = '0';
      else parts[2] = `*/${n * 7}`;
    } else {
      const pos = UNIT_POSITION[unit];
      if (n < 1 || n > STEP_MAX[pos]) throw new Error(`"every ${n} ${unit}s" is out of range; steps go from 1 to ${STEP_MAX[pos]}.`);
      parts[pos] = n === 1 ? '*' : `*/${n}`;
      if (unit === 'hour') parts[0] = '0';
      if (unit === 'day') dayLevel = true;
      if (unit === 'month') {
        dayLevel = true;
        parts[2] = '1';
      }
    }
  }

  if (/\b(every minute|minutely)\b/.test(text)) known = true;
  if (/\b(every hour|hourly)\b/.test(text)) {
    known = true;
    parts[0] = '0';
  }
  if (/\b(every day|daily)\b/.test(text)) {
    known = true;
    dayLevel = true;
  }
  if (/\b(every week|weekly)\b/.test(text)) {
    known = true;
    dayLevel = true;
    parts[4] = '0';
  }
  if (/\b(every month|monthly)\b/.test(text)) {
    known = true;
    dayLevel = true;
    parts[2] = '1';
  }
  if (/\b(every year|yearly|annually)\b/.test(text)) {
    known = true;
    dayLevel = true;
    parts[2] = '1';
    parts[3] = '1';
  }
  if (/\b(every other day|alternate days?)\b/.test(text)) {
    known = true;
    dayLevel = true;
    parts[2] = '*/2';
  }

  const onDay = text.match(ON_DAY_RE);
  if (onDay) {
    known = true;
    dayLevel = true;
    const days = (onDay[1].match(/\d+/g) ?? []).map(Number);
    if (days.some((d) => d < 1 || d > 31)) throw new Error('Days of the month go from 1 to 31.');
    parts[2] = list(days);
  }

  const months = [...text.matchAll(MONTH_RE)].map((m) => MONTHS.indexOf(m[1]) + 1);
  if (months.length) {
    known = true;
    parts[3] = list(months);
  }

  if (/\b(every weekday|weekdays|monday (?:to|through|-) friday)\b/.test(text)) {
    known = true;
    dayLevel = true;
    parts[4] = '1-5';
  } else if (/\b(every weekend|weekends)\b/.test(text)) {
    known = true;
    dayLevel = true;
    parts[4] = '0,6';
  } else {
    const span = text.match(new RegExp(`\\b(${WEEKDAYS.join('|')}) (?:to|through|-) (${WEEKDAYS.join('|')})\\b`));
    const days = [...text.matchAll(WEEKDAY_RE)].map((m) => WEEKDAYS.indexOf(m[1]));
    if (span) parts[4] = `${WEEKDAYS.indexOf(span[1])}-${WEEKDAYS.indexOf(span[2])}`;
    else if (days.length) parts[4] = list(days);
    if (span || days.length) {
      known = true;
      dayLevel = true;
    }
  }

  const between = text.match(BETWEEN_RE);
  if (between) {
    known = true;
    const [startMin, a] = parseTime(between[1]);
    const [, b] = parseTime(between[2]);
    // Windows that cross midnight wrap: 21-23,0-5.
    parts[1] = a === b ? String(a) : a < b ? `${a}-${b}` : `${a}-23,0-${b}`;
    // Within a window the default is once an hour; an "every N minutes" step wins over :MM.
    if (parts[0] === '*') parts[0] = String(startMin);
  }

  const at = text.match(AT_RE) ?? (/^(midnight|noon)$/.test(text) ? [text, text] : null);
  if (at) {
    known = true;
    const times = at[1].split(/\s*(?:,|and|&)\s*(?:at )?/).map(parseTime);
    const minutes = new Set(times.map((t) => t[0]));
    if (minutes.size > 1) throw new Error('One expression can hold several hours but only one minute value; use one job per time.');
    parts[0] = String(times[0][0]);
    parts[1] = list(times.map((t) => t[1]));
  }

  if (!known) throw new Error('Could not read that schedule. Try one of the examples below.');
  if (dayLevel && parts[0] === '*' && parts[1] === '*') {
    parts[0] = '0';
    parts[1] = '0';
  }
  return parts.join(' ');
}

const FIELD_LABELS = ['Minute', 'Hour', 'Day of month', 'Month', 'Day of week'];

export default function CronConverter() {
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { cron: toCron(input), error: '' };
    } catch (e) {
      return { cron: '', error: getErrorMessage(e, 'Could not read that schedule.') };
    }
  }, [input]);

  const fields = result?.cron ? result.cron.split(' ').map((value, i) => ({ label: FIELD_LABELS[i], value })) : [];

  return (
    <ToolPage id="cron">
      <Panel title="Convert" actions={<ClearButton onClick={() => setInput('')} disabled={!input} />}>
        <TwoPane>
          <Field label="Schedule in words" htmlFor="cron-input" error={result?.error}>
            <Input
              id="cron-input"
              mono={false}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="every weekday at 9:30am"
              maxLength={120}
              autoFocus
            />
            <Toolbar className="mt-3">
              {EXAMPLES.map((ex) => (
                <Button key={ex} size="sm" onClick={() => setInput(ex)}>
                  {ex}
                </Button>
              ))}
            </Toolbar>
          </Field>
          <div className="space-y-4">
            <Output label="Cron expression" value={result?.cron ?? ''} rows={1} placeholder="* * * * *" />
            {fields.length > 0 && (
              <Output label="Fields" copyText={result?.cron ?? ''}>
                <KeyValueList items={fields} />
              </Output>
            )}
          </div>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
