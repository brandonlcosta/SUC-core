// utils/validators.js
// Minimal contract checks for leaderboard / lines / runner_state
export function validateLeaderboard(leaderboard = []) {
  const errors = [];
  let checked = 0;
  for (const [i, a] of leaderboard.entries()) {
    checked++;
    if (!a || typeof a !== 'object') { errors.push(`leaderboard[${i}] not object`); continue; }
    if (typeof a.athlete_id !== 'string') errors.push(`leaderboard[${i}].athlete_id missing`);
    if (!Number.isFinite(a.laps)) errors.push(`leaderboard[${i}].laps not number`);
    if (!Number.isFinite(a.rank)) errors.push(`leaderboard[${i}].rank not number`);
  }
  return { errors, checked };
}

export function validateLines(lines = []) {
  const errors = [];
  let checked = 0;
  for (const [i, l] of lines.entries()) {
    checked++;
    if (!l || typeof l !== 'object') { errors.push(`lines[${i}] not object`); continue; }
    if (typeof l.text !== 'string') errors.push(`lines[${i}].text missing`);
    if (typeof l.role !== 'string') errors.push(`lines[${i}].role missing`);
    const okRole = ['play_by_play', 'analyst', 'color', 'wildcard', 'sponsor'].includes(l.role);
    if (!okRole) errors.push(`lines[${i}].role invalid: ${l.role}`);
  }
  return { errors, checked };
}

export function validateRunnerState(rs = {}) {
  const errors = [];
  let checked = 0;
  const ev = rs.events || [];
  for (const [i, e] of ev.entries()) {
    checked++;
    if (!e || typeof e !== 'object') { errors.push(`events[${i}] not object`); continue; }
    if (typeof e.type !== 'string') errors.push(`events[${i}].type missing`);
  }
  return { errors, checked };
}

export function validateAll({ leaderboard, runner_state, lines }) {
  const L = validateLeaderboard(leaderboard);
  const C = validateLines(lines);
  const R = validateRunnerState(runner_state);
  const errors = [...L.errors, ...C.errors, ...R.errors];
  const samplesChecked = L.checked + C.checked + R.checked;
  return { errors, samplesChecked };
}

export default { validateAll };
