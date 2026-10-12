/** Does a file satisfy an `accept` string such as `.yaml,.json` or `image/*`? */
export function matchesAccept(file: File, accept: string) {
  const rules = accept.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
  if (rules.length === 0 || rules.includes('*/*')) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}
