import modeLoader from "../backend/modeLoader.js";

try {
  const rulesets = modeLoader.get("rulesets");
  console.log("modeLoader ✅ rulesets keys:", Object.keys(rulesets));

  const personas = modeLoader.get("personas");
  console.log("modeLoader ✅ personas count:", personas.length || Object.keys(personas).length);

  const sponsors = modeLoader.get("sponsors");
  console.log("modeLoader ✅ sponsors slots:", Object.keys(sponsors));

  const branding = modeLoader.get("branding");
  console.log("modeLoader ✅ branding keys:", Object.keys(branding));

  const studio = modeLoader.get("studio");
  console.log("modeLoader ✅ studio keys:", Object.keys(studio));
} catch (err) {
  console.error("modeLoader ❌", err.message);
}
