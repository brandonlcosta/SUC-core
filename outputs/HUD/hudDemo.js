/**************************************************
 * HUD Demo (Stub)
 * Purpose: Show vibe_score as glow bar
 **************************************************/

export function renderHUD(signal) {
  const glow = "█".repeat(Math.max(1, Math.floor(signal.vibe_score / 2)));
  console.log(`[HUD] Vibe ${signal.vibe_score} → ${glow}`);
}
