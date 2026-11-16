# Chapter 7 — UPS & Energy Storage

> 📖 **Read first:** [AI Data Center Guide — Part 4.5: UPS & Energy Storage: From Ride-Through to Transient Absorption](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-5-ups-and-energy-storage-from-ride-through-to-transient-absorption)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers (That the Guide Doesn't)

The guide covers UPS as a dual-duty system (ride-through + transient absorption). This chapter goes deeper into:

- **Topology efficiency math** — double-conversion vs line-interactive vs eco-mode loss calculations
- **Battery sizing** — C-rate, Depth of Discharge (DoD), cycle life vs DoD curves, runtime integration
- **Flywheel energy equations** — stored energy $E = \frac{1}{2} J \omega^2$, ride-through seconds vs kW
- **Li-ion vs VRLA** — cell chemistry (LFP vs NMC), thermal runaway, BMS architecture

## Key Concepts (To Be Developed)

- Double-conversion efficiency chain: rectifier → inverter → filter losses
- Battery runtime: Peukert's law and its limitations at high discharge rates
- Flywheel: energy density vs power density tradeoff, vacuum and bearing losses
- ESS grid integration: P/Q capability, grid-forming vs grid-following inverters

*Content will be developed step by step with Augusto.*
