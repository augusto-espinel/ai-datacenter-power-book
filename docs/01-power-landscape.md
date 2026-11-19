# Chapter 1 — Power Chain Overview & Reference Map

> 📌 **Study Guide Notice:** For the foundational architecture-level overview of this topic, please refer directly to the corresponding chapters in the **[AI Data Center Guide](https://aidatacenterguide.com/)**:
> - **[Part 4.1 — Power Topology Foundations & Voltage Selection](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-1-power-topology-foundations-and-voltage-selection)** *(MV-to-die voltage taxonomy, cascaded conversion-stage accounting, and architectural trade-offs)*
> - **[Part 4.6 — LV Distribution: Busway, PDUs, RPPs & Rack Power](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-6-lv-distribution-busway-pdus-rpps-and-rack-power)** *(480/415 VAC distribution, busway sizing, and rack power delivery)*
> - **[Part 7.13 — The Rack as Integration Unit](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-13-the-rack-as-integration-unit)** *(100 kW to 1 MW rack power envelopes, busbars, and liquid-cooled manifold integration)*
>
> *Disclaimer: To avoid duplicating existing industry documentation, the baseline architectural material covered in the links above is referenced directly. Additional circuit-level derivations, component dimensioning trade-offs, and SPICE/analytical simulation models not covered in the AI Data Center Guide will be added to this chapter progressively.*

---

## Planned Deep-Dive Additions (Beyond the Guide)

While the AI Data Center Guide establishes the system-level voltage taxonomy and conversion-stage budgets, this section will be expanded with quantitative circuit and system modeling:

- **First-Principles Conversion-Stage Efficiency Accounting:** Stage-by-stage loss decomposition comparing the legacy AC chain ($\text{MV AC} \rightarrow \text{LFT} \rightarrow \text{LV AC UPS} \rightarrow \text{PDU} \rightarrow \text{PSU} \rightarrow 48\text{–}54\text{ VDC} \rightarrow \text{VRM}$) against emerging $\pm 400\text{ VDC}$ / $800\text{ VDC}$ Solid-State Transformer (SST) and sidecar DC chains (see **[Chapter 4](#ch04)** for the complete SST circuit analysis).
- **Voltage Scaling & $I^2R$ Conductor Physics:** Analytical trade-offs between voltage level, busbar/cable cross-section, skin/proximity effects, and voltage drop under pulsed AI cluster loads.
- **Stage-to-Stage Impedance Matching & Stability:** Middlebrook criterion and small-signal input/output impedance interaction across cascaded power converters.

---

## Interactive Simulation Preview

Use the interactive transient model below to explore how load-step slew rates ($dI/dt$), supply voltage ($V_{DD}$), and decoupling parameters interact at the point-of-load end of the power chain:

```sim:gpu-transient
```
