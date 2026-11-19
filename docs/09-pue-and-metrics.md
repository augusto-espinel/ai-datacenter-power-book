# Chapter 9 — PUE & Energy Flow Analysis

> 📌 **Study Guide Notice:** For the foundational architecture-level overview of data center efficiency metrics, cooling energy trade-offs, and sustainability accounting, please refer directly to **[Part 15 — Sustainability & Efficiency](https://aidatacenterguide.com/part-15-sustainability-and-efficiency)** in the **[AI Data Center Guide](https://aidatacenterguide.com/)**:
> - **[Part 15.1 — Efficiency Metrics: PUE, WUE, ERF, REF & the Post-PUE Metric Stack](https://aidatacenterguide.com/part-15-sustainability-and-efficiency/15-1-efficiency-metrics-pue-wue-erf-ref-and-the-post-pue-metric-stack)** *(ISO/IEC 30134-2 PUE measurement categories, boundary definitions, and limitations)*
> - **[Part 15.2 — Energy Efficiency: Cooling, Free Cooling, Setpoints & Power-Chain Losses](https://aidatacenterguide.com/part-15-sustainability-and-efficiency/15-2-energy-efficiency-cooling-free-cooling-setpoints-and-power-chain-losses)** *(Chiller/economizer operating regimes, coolant supply temperature vs. silicon leakage, and electrical overhead)*
> - **[Part 15.5 — Heat Reuse & District Heating: Sustainability & Economics](https://aidatacenterguide.com/part-15-sustainability-and-efficiency/15-5-heat-reuse-and-district-heating-sustainability-and-economics)** *(Energy Reuse Factor and heat-pump uplift calculations)*
>
> *Disclaimer: To avoid duplicating existing industry documentation, the baseline architectural material covered in the links above is referenced directly. Additional analytical sensitivity models, Total Cost of Ownership (TCO) optimization formulations, and coupled electrical-thermal loss budgets not covered in the AI Data Center Guide will be added to this chapter progressively.*

---

## Planned Deep-Dive Additions (Beyond the Guide)

To complement Part 15 of the Guide, this chapter focuses on quantitative loss-budgeting and TCO trade-off math (see also **[Chapter 15](#ch15)** for the full grid-to-token energy stack):

- **Coupled Coolant-Temperature vs. Silicon-Leakage Optimization:** Formulating the non-linear optimization problem where raising coolant inlet temperature ($T_{inlet}$) reduces chiller/dry-cooler mechanical power but increases GPU sub-threshold leakage current ($I_{leak} \propto e^{T_j / T_0}$) and VRM $R_{DS(on)}(T)$ conduction losses.
- **Part-Load Efficiency Curves & TCO Capitalization:** Integrating non-linear efficiency curves ($\eta(P/P_{rated})$) across realistic AI cluster utilization histograms to calculate capitalized cost per watt of loss over a 10–15 year facility lifecycle.
- **Partial PUE ($\text{pPUE}$) & Boundary Disaggregation:** Separating electrical conversion overhead ($\text{pPUE}_{elec}$) from thermal rejection overhead ($\text{pPUE}_{therm}$) in mixed air- and direct-liquid-cooled halls.

---

## Interactive Simulation

Use the interactive facility energy-flow widget below to adjust IT load, cooling overhead percentage, UPS conversion losses, and auxiliary loads, and observe the resulting PUE and power breakdown in real time:

```sim:pue-thermal
```
