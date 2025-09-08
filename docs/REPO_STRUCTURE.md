# 🗂 SUC Ultra Repo Roadmap

This roadmap defines the **directory structure, stub files, and phased build plan** for `/suc-core/`. It ensures every department can drop code, configs, and harnesses in sync with the Ultra workflow.

---

## 📂 Repo Structure

```
/suc-core/
  ├── docs/                 # Department Playbooks
  │     ├── ENGINES.md
  │     ├── TESTING.md
  │     ├── UI_PRODUCT.md
  │     ├── NARRATIVE.md
  │     ├── BUSINESS.md
  │     └── BROADCAST.md
  │
  ├── engines/              # Modular Engines (≤300 LOC)
  │     ├── signalEngine.js
  │     ├── scoringEngine.js
  │     ├── commentaryEngine.js
  │     ├── broadcastEngine.js
  │     ├── modeEngine.js
  │     └── adapterBase.js
  │
  ├── configs/              # Culture-as-Config
  │     ├── rulesets.json
  │     ├── personas.json
  │     ├── sponsorSlots.json
  │     ├── badges.json
  │     └── studioLayouts.json
  │
  ├── schemas/              # Contract-First Validation
  │     ├── metaEventSchemaV2.json
  │     ├── broadcastSchema.json
  │     └── stateSchema.json
  │
  ├── tests/                # Proof of Integrity
  │     ├── vibeHarness.test.js
  │     ├── timingHarness.test.js
  │     ├── replayHarness.test.js
  │     └── greenboardHarness.test.js
  │
  ├── outputs/              # Viewer-Facing Products
  │     ├── HUD/
  │     ├── Broadcast/
  │     └── Recaps/
  │
  └── studio/               # Operator Console
        ├── studioRouter.js
        └── studioConsole.js
```

---

## 🚀 Build Plan (Ultras)

### Ultra 001 → **Signal Engine Spine**
- Deliver `signalEngine.js` (Meta v2 + Pacing fused).
- Lock `metaEventSchemaV2.json` in `/schemas/`.
- Ship Timing & Vibe harnesses.
- HUD demo wired to vibe_score.

### Ultra 002 → **Multi-Feed Broadcast Network**
- Implement `broadcastEngine.js` with multi-feed support.
- Add `broadcastSchema.json` to `/schemas/`.
- Studio router toggles Raw / Analyst / Meme feeds.
- Sponsor SKUs for feed ownership.

### Ultra 003 → **Episodic Arc Engine**
- Add `arc_ref` + continuity logic in Signal Engine.
- Update HUD overlays with rivalry memory strip.
- Business packages Arc Season Passes.
- Narrative maintains arc continuity in personas.json.

### Ultra 004 → **Replay-as-Code Layer**
- Implement `replayHarness.test.js` → log → replay equivalence.
- Build `/outputs/Recaps/` from deterministic logs.
- Market as SUC Certified Proof-of-Integrity product.

### Ultra 005 → **Shrinking Circle Mode**
- Add elimination logic to `modeEngine.js`.
- Update rulesets.json with elimination configs.
- Broadcast chaos cut feed for final arena showdown.
- Sponsor meme overlays tied to chaos moments.

---

## 🧭 Repo Strategy
- **Schema First** → every output validated before consumption.
- **Config Driven** → culture encoded in JSON, not code.
- **Harness Visible** → Greenboard is the trust badge.
- **Ultra Mindset** → we ship systems, not features.

---

⚡ Rally Cry: The repo is not just code. It’s SUC’s nervous system.  
Every engine, config, and harness is a beat. Together → SUC Certified.

