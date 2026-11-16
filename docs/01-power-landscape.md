# Chapter 1 — Power Chain Overview & Reference Map

> 📖 **Read first:** [AI Data Center Guide — Part 4.1: Power Topology Foundations & Voltage Selection](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-1-power-topology-foundations-and-voltage-selection)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers (That the Guide Doesn't)

The guide's Part 4.1 covers the architecture-level voltage selection and conversion-stage accounting. This chapter goes deeper into:

- **Conversion-stage efficiency math** — first-principles derivation of each stage's loss budget
- **Voltage selection physics** — why I²R loss scales with the inverse square of voltage, with worked examples
- **The simulation framework** — how our T1/T2/T3 tiered simulation architecture maps to each concept in the book

## Key Concepts (To Be Developed)

- Worked example: AC chain (MV→LV→UPS→PSU→VRM) vs DC chain (MV→SST→DC/DC) efficiency accounting
- Impedance matching between conversion stages
- Our interactive simulation widgets as a learning tool

## Interactive Simulation

```sim:gpu-transient
```

*Content will be developed step by step with Augusto.*
