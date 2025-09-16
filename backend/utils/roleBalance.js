// Ensure required roles exist; synthesize deterministic fallbacks from ruleset templates
const FALLBACKS = {
  play_by_play: ({ ts }) => ({ text: 'Action continues on course.', ts }),
  analyst:     ({ ts }) => ({ text: 'Pacing trends favor the leaders.', ts }),
  color:       ({ ts }) => ({ text: 'Community energy lifting the field.', ts }),
  wildcard:    ({ ts }) => ({ text: 'Grassroots grit on display.', ts })
};

export function ensureRoleBalance(lines = [], requiredRoles = [], ruleset = {}) {
  const existingRoles = new Set(lines.map(l => l.role));
  const missing = requiredRoles.filter(r => !existingRoles.has(r));
  const ts = Math.floor(Date.now() / 1000);
  const templates = ruleset?.templates?.commentary || {};
  const added = [];

  for (const role of missing) {
    const template = Array.isArray(templates[role]) && templates[role][0]
      ? templates[role][0]
      : FALLBACKS[role]?.({ ts }).text;

    const line = {
      priority: 4,
      role,
      text: template || FALLBACKS[role]?.({ ts }).text || `${role} update`,
      ts
    };
    added.push(role);
    lines.push(line);
  }
  return { lines, missingBefore: missing, added };
}

export default { ensureRoleBalance };
