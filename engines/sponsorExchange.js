/**************************************************
* /engines/sponsorExchange.js — TTL + rotation (≤260 LOC)
**************************************************/
import fs from 'fs';
export function createSponsorExchange(configPath = './configs/sponsorAssets.json'){
const cfg = JSON.parse(fs.readFileSync(configPath,'utf8'));
const state = new Map(); // key -> { lastShownAt, shownCount }
return { resolveCreative };
function resolveCreative(trigger, now = Date.now()){
const slot = cfg.slots.find(s=>s.trigger===trigger); if(!slot) return null;
if(now < Date.parse(slot.ttl.start) || now > Date.parse(slot.ttl.end)) return null; // fail‑closed
for(const cr of slot.creatives){
const key = slot.id + ':' + cr.id; const rec = state.get(key) || { lastShownAt:0, shownCount:0 };
if(cr.frequency_cap && rec.shownCount >= cr.frequency_cap) continue;
if(cr.cooldown_ms && now - rec.lastShownAt < cr.cooldown_ms) continue;
rec.lastShownAt = now; rec.shownCount++; state.set(key, rec);
const ms_remaining = Date.parse(slot.ttl.end) - now; return { slot:slot.id, creative:cr, ms_remaining };
}
return null;
}
}