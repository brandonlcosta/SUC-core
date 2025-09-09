/**
 * commentaryEngine v0.1
 * Purpose: Deterministic template fill for role-balanced commentary.
 * Inputs:
 *   generate({
 *     event: NormalizedEvent,
 *     rulesetTemplates: { play_by_play[], analyst[], color[], wildcard[] },
 *     metaContext?: object   // optional: scoring, mode, broadcast hints, etc.
 *   })
 * Outputs:
 *   [
 *     { role:"play_by_play", text:string },
 *     { role:"analyst", text:string },
 *     { role:"color", text:string },
 *     { role:"wildcard", text:string },
 *     { role:"extra", text:string, optional?:true } // reserved for riffs
 *   ]
 * Notes:
 *   - No LLM. Deterministic string interpolation on {path.to.value}.
 *   - Role balance: always returns 1 line per core role.
 *   - SLO hooks: deterministic and ≤300 LOC.
 */
const CORE_ROLES = ["play_by_play", "analyst", "color", "wildcard"];

function get(obj, path) {
  if (!obj) return undefined;
  return path.split(".").reduce((acc, k) => (acc && k in acc ? acc[k] : undefined), obj);
}

/** Replace {a.b.c} with values from context; leaves unknown tokens intact. */
export function renderTemplate(tpl, context) {
  if (typeof tpl !== "string") return "";
  return tpl.replace(/\{([^}]+)\}/g, (_, key) => {
    const val = get(context, key.trim());
    return (val === undefined || val === null) ? `{${key}}` : String(val);
  });
}

/** Pick a deterministic template: first non-empty string in the array. */
function pickTemplate(arr) {
  if (!Array.isArray(arr)) return "";
  const t = arr.find(s => typeof s === "string" && s.trim().length > 0);
  return t || "";
}

/**
 * Generate role-balanced commentary lines.
 * context used for interpolation merges: { event, metadata: event.metadata, ...metaContext }
 */
export function createCommentaryEngine() {
  function generate({ event, rulesetTemplates, metaContext = {} }) {
    const started_at = Date.now();
    if (!event || !rulesetTemplates) {
      return {
        lines: [],
        started_at,
        finished_at: Date.now(),
        metrics: { roles: 0, filled: 0 }
      };
    }

    const ctx = {
      event,
      ...event,
      metadata: event.metadata || {},
      meta: metaContext || {}
    };

    const lines = [];
    let filled = 0;

    for (const role of CORE_ROLES) {
      const tpl = pickTemplate(rulesetTemplates[role]);
      const text = renderTemplate(tpl, ctx).trim();
      if (text) filled++;
      lines.push({ role, text: text || `[${role}]` });
    }

    const finished_at = Date.now();
    return {
      lines,
      started_at,
      finished_at,
      metrics: {
        roles: CORE_ROLES.length,
        filled,
      }
    };
  }

  // placeholder for future riff injection
  function riff(_lines, _persona) {
    // no-op deterministic v0
    return _lines;
  }

  return { generate, riff };
}