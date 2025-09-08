/**************************************************
 * Rivalry Strip HUD
 * Purpose: Show episodic rivalry memory in HUD
 **************************************************/

export function renderRivalryStrip(arcs) {
  console.log("\n[HUD] Rivalry Memory Strip");
  arcs
    .filter(a => a.arc_type === "rivalry")
    .forEach(a => {
      console.log(`⚔️ ${a.title} | Beats: ${a.beats.length} | Priority: ${a.priority}`);
    });
}
