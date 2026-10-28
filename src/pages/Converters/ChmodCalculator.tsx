import { useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Checkbox, Field, Input, Output, Panel, TwoPane } from '../../ui';

/* ---- Conversions (pure; exercised by scripts/check-dev.mjs) ------------ */

// A mode is the 12-bit number chmod takes: setuid 4000, setgid 2000, sticky 1000, then rwx for owner, group, others.
const SETUID = 0o4000;
const SETGID = 0o2000;
const STICKY = 0o1000;
const CLASSES = ['Owner', 'Group', 'Others'] as const;
const PERMS = ['read', 'write', 'execute'] as const;

const bit = (cls: number, perm: number) => 1 << (8 - cls * 3 - perm);

function octalToMode(text: string): number {
  const digits = text.trim();
  if (!/^[0-7]{3,4}$/.test(digits)) throw new Error('Use three or four octal digits (0 to 7), for example 755 or 4755.');
  return parseInt(digits, 8);
}

function symbolicToMode(text: string): number {
  let s = text.trim();
  // Tolerate the file-type column from `ls -l`.
  if (s.length === 10 && '-dlcbps'.includes(s[0])) s = s.slice(1);
  if (!/^[rwxsStT-]{9}$/.test(s)) throw new Error('Use nine characters in rwx order, for example rwxr-xr-x. s, S, t and T set setuid, setgid and sticky.');
  let mode = 0;
  for (let cls = 0; cls < 3; cls++) {
    const [r, w, x] = s.slice(cls * 3, cls * 3 + 3);
    if (r !== '-' && r !== 'r') throw new Error(`Position ${cls * 3 + 1} must be r or -.`);
    if (w !== '-' && w !== 'w') throw new Error(`Position ${cls * 3 + 2} must be w or -.`);
    const special = cls === 2 ? 'tT' : 'sS';
    if (x !== '-' && x !== 'x' && !special.includes(x)) throw new Error(`Position ${cls * 3 + 3} must be x, ${special[0]}, ${special[1]} or -.`);
    if (r === 'r') mode |= bit(cls, 0);
    if (w === 'w') mode |= bit(cls, 1);
    if (x === 'x' || x === 's' || x === 't') mode |= bit(cls, 2);
    if (x === 's' || x === 'S') mode |= cls === 0 ? SETUID : SETGID;
    if (x === 't' || x === 'T') mode |= STICKY;
  }
  return mode;
}

const modeToOctal = (mode: number) => mode.toString(8).padStart(mode >= STICKY ? 4 : 3, '0');

function modeToSymbolic(mode: number): string {
  let out = '';
  for (let cls = 0; cls < 3; cls++) {
    const x = Boolean(mode & bit(cls, 2));
    const special = cls === 0 ? mode & SETUID : cls === 1 ? mode & SETGID : mode & STICKY;
    const letter = cls === 2 ? 't' : 's';
    out += mode & bit(cls, 0) ? 'r' : '-';
    out += mode & bit(cls, 1) ? 'w' : '-';
    out += special ? (x ? letter : letter.toUpperCase()) : x ? 'x' : '-';
  }
  return out;
}

const joinWords = (words: string[]) => (words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0] ?? '');

/** "Owner can read, write and execute; group and others can read and execute." */
function describeMode(mode: number): string {
  const groups = new Map<string, string[]>();
  CLASSES.forEach((name, cls) => {
    const can = PERMS.filter((_, p) => mode & bit(cls, p));
    const key = can.length ? `can ${joinWords(can)}` : 'has no access';
    groups.set(key, [...(groups.get(key) ?? []), name]);
  });
  const clauses = [...groups].map(([what, who], i) => {
    const names = who.map((n, j) => (i === 0 && j === 0 ? n : n.toLowerCase()));
    const verb = names.length > 1 && what === 'has no access' ? 'have no access' : what;
    return `${joinWords(names)} ${verb}`;
  });
  const special = [mode & SETUID && 'setuid', mode & SETGID && 'setgid', mode & STICKY && 'sticky'].filter((s): s is string => Boolean(s));
  return `${clauses.join('; ')}.${special.length ? ` The ${joinWords(special)} bit${special.length > 1 ? 's are' : ' is'} set.` : ''}`;
}

const tryParse = (fn: (s: string) => number, text: string) => {
  try {
    fn(text);
    return '';
  } catch (e) {
    return (e as Error).message;
  }
};

/* ---- Page -------------------------------------------------------------- */

export default function ChmodCalculator() {
  const [mode, setMode] = useState(0o755);
  const [octal, setOctal] = useState('755');
  const [symbolic, setSymbolic] = useState('rwxr-xr-x');

  const apply = (next: number) => {
    setMode(next);
    setOctal(modeToOctal(next));
    setSymbolic(modeToSymbolic(next));
  };
  const toggle = (flag: number) => apply(mode & flag ? mode & ~flag : mode | flag);

  const onOctal = (text: string) => {
    setOctal(text);
    try {
      const next = octalToMode(text);
      setMode(next);
      setSymbolic(modeToSymbolic(next));
    } catch {
      // Left as typed; the Field shows why.
    }
  };
  const onSymbolic = (text: string) => {
    setSymbolic(text);
    try {
      const next = symbolicToMode(text);
      setMode(next);
      setOctal(modeToOctal(next));
    } catch {
      // Same as above.
    }
  };

  const command = `chmod ${modeToOctal(mode)} file`;

  return (
    <ToolPage id="chmod">
      <Panel title="Permissions">
        <TwoPane>
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-muted">
                  <th className="pb-2 font-medium" />
                  {PERMS.map((p) => (
                    <th key={p} className="pb-2 font-medium capitalize">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLASSES.map((name, cls) => (
                  <tr key={name} className="border-t border-line">
                    <th scope="row" className="py-2 text-left font-medium text-ink">
                      {name}
                    </th>
                    {PERMS.map((p, perm) => (
                      <td key={p} className="py-2">
                        <Checkbox label={<span className="sr-only">{`${name} ${p}`}</span>} checked={Boolean(mode & bit(cls, perm))} onChange={() => toggle(bit(cls, perm))} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3">
              <Checkbox label="Setuid" checked={Boolean(mode & SETUID)} onChange={() => toggle(SETUID)} />
              <Checkbox label="Setgid" checked={Boolean(mode & SETGID)} onChange={() => toggle(SETGID)} />
              <Checkbox label="Sticky" checked={Boolean(mode & STICKY)} onChange={() => toggle(STICKY)} />
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Octal" htmlFor="chmod-octal" error={tryParse(octalToMode, octal) || undefined}>
              <Input id="chmod-octal" inputMode="numeric" value={octal} onChange={(e) => onOctal(e.target.value)} placeholder="755" maxLength={4} autoComplete="off" />
            </Field>
            <Field label="Symbolic" htmlFor="chmod-symbolic" error={tryParse(symbolicToMode, symbolic) || undefined}>
              <Input id="chmod-symbolic" value={symbolic} onChange={(e) => onSymbolic(e.target.value)} placeholder="rwxr-xr-x" maxLength={10} autoComplete="off" />
            </Field>
            <Output label="Command" value={command} rows={1} />
            <Output label="Meaning" value={describeMode(mode)} rows={2} mono={false} />
          </div>
        </TwoPane>
      </Panel>
    </ToolPage>
  );
}
