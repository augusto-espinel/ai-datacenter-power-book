# Chapter 4 — SST Circuit Design

> 📖 **Read first:**
> - [AI Data Center Guide — Part 4.7: The DC Power Revolution (SST section)](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-7-the-dc-power-revolution-48v-400v-800v-and-disaggregated-sidecar-power)
> - [AI Data Center Guide — Part 4.4: Transformers, Harmonics & SST harmonics context](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-4-transformers-harmonics-and-the-ai-non-linear-load-problem)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers (That the Guide Doesn't)

The guide covers SST as an architectural option and its place in the conversion chain. This chapter goes **deep into the circuit engineering**:

- **DAB (Dual Active Bridge) topology derivation** — power transfer equation, phase-shift modulation, triangular vs trapezoidal mode
- **SiC MOSFET characterization** — reading datasheets, RDS(on) vs temperature, switching energy vs current, gate charge
- **Magnetics design** — high-frequency transformer core selection (ferrite vs nanocrystalline), winding loss (Dowell's equation), leakage inductance as power transfer element
- **ZVS/ZCS boundaries** — dead-time design, soft-switching region mapping vs load and phase shift
- **Control loop design** — single-phase-shift, dual-phase-shift, triple-phase-shift modulation; small-signal modeling; compensator design

## Key Concepts (To Be Developed)

- DAB power equation: $P = \frac{n V_1 V_2}{2 \pi f_s L} \cdot \varphi \cdot (1 - \frac{|\varphi|}{\pi})$
- ZVS condition: dead-time energy must exceed MOSFET output capacitance
- SiC vs Si vs GaN device comparison at 20-100 kHz switching frequencies
- SPICE testbench: `spice/testbenches/dab_switching.cir`

## Interactive Simulation

```sim:sst-dab-efficiency
```

*Content will be developed step by step with Augusto.*
