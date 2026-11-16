# Chapter 5 — VRM Design & Stability

> 📖 **Read first:** [AI Data Center Guide — Part 7.12: On-Package Power Delivery & Power Integrity](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-12-on-package-power-delivery-and-power-integrity)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers (That the Guide Doesn't)

The guide covers VRM architecture choices (board-edge, lateral, vertical) and the PDN impedance target. This chapter goes deeper into:

- **Multiphase buck converter design** — phase count selection, interleaving benefits, ripple cancellation math
- **AVP (Adaptive Voltage Positioning) implementation** — load-line slope programming, steady-state vs transient tradeoffs
- **DrMOS / Smart Power Stage specs** — reading datasheets, RDS(on), current/temperature telemetry, thermal design
- **Bode plot compensation** — loop gain measurement, Type III compensator design, phase margin targets
- **Current sharing between phases** — passive vs active sharing, current balance tolerance

## Key Concepts (To Be Developed)

- Buck converter small-signal model and compensator design
- AVP load-line: $\Delta V = -R_{LL} \cdot \Delta I$
- Phase interleaving and effective ripple frequency
- PMBus programming: VOUT_COMMAND, LOADLINE, IOUT_CAL_GAIN
- SPICE testbench: `spice/testbenches/vrm_transient.cir`

*Content will be developed step by step with Augusto.*
