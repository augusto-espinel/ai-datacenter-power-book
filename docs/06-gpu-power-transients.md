# Chapter 6 — GPU Power Transients & PDN

> 📖 **Read first:** [AI Data Center Guide — Part 7.12: On-Package Power Delivery & Power Integrity](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-12-on-package-power-delivery-and-power-integrity)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers (That the Guide Doesn't)

The guide covers the PDN impedance target and decoupling hierarchy architecture. This chapter goes deeper into:

- **dI/dt → ΔV first-principles math** — parasitic inductance, loop area, mutual coupling
- **Decoupling capacitor selection** — MLCC vs polymer vs electrolytic: ESR/ESL/ capacitance vs frequency
- **Impedance target method** — $Z_{target} = \frac{\Delta V_{allowed}}{\Delta I_{transient}}$, flat impedance design
- **Anti-resonance avoidance** — interaction between capacitor networks, ESR damping
- **NVIDIA TVR (Transient Voltage Response)** — specification interpretation and compliance testing

## Key Concepts (To Be Developed)

- Voltage droop equation: $\Delta V = L_{loop} \cdot \frac{di}{dt} + ESR \cdot \Delta I + \frac{1}{C} \int i \, dt$
- Capacitor impedance spectroscopy and Bode plot interpretation
- Bulk vs mid vs local decoupling: time-domain vs frequency-domain design
- PCB loop inductance minimization techniques
- Measurement: oscilloscope setup, bandwidth, probe selection (→ Ch. 13)

## Interactive Simulation

```sim:gpu-transient
```

*Content will be developed step by step with Augusto.*
