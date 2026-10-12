import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Button, Callout, ClearButton, Field, Input, KeyValueList, Output, Panel, Toolbar, TwoPane } from '../../ui';
import { getErrorMessage } from '../../utils/errors';

// Cron field positions for "every N <unit>".
const UNIT_POSITION: Record<string, number> = { minute: 0, hour: 1, day: 2, month: 3, weekday: 4 };

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const TIME_KEYWORDS: Record<string, [string, string]> = {
  midnight: ['0', '0'],
  noon: ['0', '12'],
  'mid-day': ['0', '12'],
  'mid day': ['0', '12'],
};

const EXAMPLES = [
  'every 15 minutes',
  'every weekday at 9:30am',
  'every monday at 3 pm',
  'every hour between 9 am and 5 pm',
  'every other day',
  'every weekend',
  'midnight',
  'in january',
];

const to24h = (hour: string, period?: string) => {
  let h = parseInt(hour, 10);
  if (period === 'pm' && h < 12) h += 12;
  if (period === 'am' && h === 12) h = 0;
  return h;
};

/**
 * Applies an "at 9:30 pm" clause to the minute and hour fields. A day-level
 * schedule with no time ("every monday") means midnight, not every minute.
 */
function setTime(parts: string[], text: string, dayLevel = false): boolean {
  const m = text.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/);
  if (!m) {
    if (dayLevel && parts[0] === '*' && parts[1] === '*') {
      parts[0] = '0';
      parts[1] = '0';
    }
    return false;
  }
  parts[0] = m[2] ?? '0';
  parts[1] = String(to24h(m[1], m[3]));
  return true;
}

function toCron(input: string): string {
  const text = input.trim().toLowerCase();
  const parts = ['*', '*', '*', '*', '*'];
  const done = () => parts.join(' ');

  if (text in TIME_KEYWORDS) {
    [parts[0], parts[1]] = TIME_KEYWORDS[text];
    return done();
  }

  const every = text.match(/every (\d+) (minute|hour|day|month|weekday)s?/);
  if (every) {
    parts[UNIT_POSITION[every[2]]] = `*/${every[1]}`;
    // "every 2 hours" means on the hour, not every minute of those hours.
    if (every[2] === 'hour') parts[0] = '0';
  } else if (text.includes('every hour') || text === 'hourly') {
    parts[0] = '0';
  }

  const range = text.match(/between (\d+)(?::(\d+))?\s*(am|pm)? and (\d+)(?::(\d+))?\s*(am|pm)?/);
  if (range) {
    parts[1] = `${to24h(range[1], range[3])}-${to24h(range[4], range[6])}`;
    // Within a window the default is once an hour, unless minutes were given.
    if (range[2]) parts[0] = range[2];
    else if (parts[0] === '*') parts[0] = '0';
    return done();
  }

  if (every) {
    if (text.includes('alternate day') || text.includes('every other day')) parts[2] = '*/2';
    if (text.includes('every weekday') || text.includes('weekdays')) parts[4] = '1-5';
    if (text.includes('every weekend') || text.includes('weekends')) parts[4] = '0,6';
    setTime(parts, text, every[2] === 'day' || every[2] === 'month' || every[2] === 'weekday');
    return done();
  }

  const weekday = text.match(/every (sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (weekday) {
    parts[4] = String(WEEKDAYS.indexOf(weekday[1]));
    setTime(parts, text, true);
    return done();
  }

  if (text.includes('every weekday') || text.includes('weekdays')) {
    parts[4] = '1-5';
    setTime(parts, text, true);
    return done();
  }
  if (text.includes('every weekend') || text.includes('weekends')) {
    parts[4] = '0,6';
    setTime(parts, text, true);
    return done();
  }
  if (text.includes('alternate day') || text.includes('every other day')) {
    parts[2] = '*/2';
    setTime(parts, text, true);
    return done();
  }
  if (setTime(parts, text)) return done();

  if (text === 'every minute' || text === 'minutely') return done();
  if (text === 'every hour' || text === 'hourly') return done();
  if (text === 'every day' || text === 'daily') {
    parts[0] = '0';
    parts[1] = '0';
    return done();
  }

  const month = text.match(/in (january|february|march|april|may|june|july|august|september|october|november|december)/);
  if (month) {
    parts[3] = String(MONTHS.indexOf(month[1]) + 1);
    return done();
  }

  throw new Error('Could not read that schedule. Try one of the examples below.');
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
          <Field label="Schedule in words" htmlFor="cron-input">
            <Input
              id="cron-input"
              mono={false}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="every weekday at 9:30am"
              maxLength={120}
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
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
        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
