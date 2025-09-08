# 🏁 SUC Ultra Documentation Set

This set replaces the fragmented 10-doc pack with **6 aligned Ultra docs** under `/suc-core/docs/`. Each follows our new repo structure, Ultra workflow, and cultural processor vision.

---

## 1. `/suc-core/docs/ENGINES.md`

### 🎯 Mandate

Engineering builds the rails — modular, schema-driven engines (≤300 LOC each) that all feed into `signals.beat`, SUC’s nervous system.

### 🔑 Integration Points

* **Signal Engine (Meta + Pacing fused)** → emits vibe, arcs, beat roles, sponsor slots.
* **Event Bus** → infra-agnostic (in-mem ↔ Redis/Kafka).
* **Adapters** → inherit from base class; normalize all inputs into contract-clean events.
* **Scoring, Mode, Commentary, Broadcast** → consumers of signals.beat.

### 💡 Innovation Bets

* Event Bus → plug-and-play infra.
* Engines as cultural organs → vibe-aware, schema-first.
* Config-as-culture → rulesets, personas, sponsor slots in `/configs/`.

### 🚀 Ultra Contributions

* Ultra 001 → Ship Signal Engine + Event Bus wrapper.
* Ultra 002 → Multi-feed broadcaster modules.
* Ultra 003 → Episodic Arc Engine.

# ⚡ Rally Cry

Engineering builds the beat.
UI shows the beat.
Business sells the beat.
Narrative writes the beat.
Testing validates the beat.
Broadcast directs the beat.

👉 Together → SUC Certified.
