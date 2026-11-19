# Chapter 14 — Simulation Engine Reference

> 📌 **Study Guide Notice:** This chapter documents the 3-tier interactive simulation architecture built specifically for this repository. For system-level reference designs and decision calculators, see also **[Appendix B — Reference Designs & Worked Examples](https://aidatacenterguide.com/appendix-appendices-and-reference-data/b-reference-designs-and-worked-examples)** and **[Appendix C — Decision Tables & Calculators](https://aidatacenterguide.com/appendix-appendices-and-reference-data/c-decision-tables-and-calculators)** in the **[AI Data Center Guide](https://aidatacenterguide.com/)**.
>
> *Disclaimer: Additional Python notebooks and ngspice/PySpice testbenches for the remaining chapters will be added progressively as their circuit derivations are completed.*

---

## Overview

This repository uses a **3-tier simulation architecture** to connect first-principles equations in the text with interactive and executable models:

1. **Tier 1 (T1) — Browser-Native Canvas Widgets (`docs/sims/sim-widgets.js`):** Zero-dependency JavaScript/Canvas simulations embedded directly inside the Markdown chapters.
2. **Tier 2 (T2) — Python & Jupyter Notebooks (`notebooks/`):** Multi-parameter optimization scripts, semiconductor figure-of-merit sweeps, and electro-thermal solvers.
3. **Tier 3 (T3) — ngspice / PySpice Circuit Testbenches (`spice/`):** Time-domain and frequency-domain SPICE netlists for switching stages, resonant converters, and PDN impedance networks.

---

## Tier 1: Browser-Native Canvas Widgets (`docs/sims/sim-widgets.js`)

### Currently Implemented Widgets

| Widget ID | Description | Embedded In |
|-----------|-------------|-------------|
| `gpu-transient` | GPU $dI/dt$ load-step transient response with VRM & decoupling RLC model | [Ch. 1](#ch01), [Ch. 6](#ch06) |
| `sst-device-scaling` | MV SiC device voltage class ($1.2\text{–}10\text{ kV}$) vs. cascaded cell count & parallel die scaling | [Ch. 4](#ch04) |
| `sst-zvs-boundary` | iTCM / resonant ZVS soft-switching boundary & switching loss comparator | [Ch. 4](#ch04) |
| `sst-dab-efficiency` | Dual Active Bridge (DAB) / SRC efficiency map vs. load & phase shift | [Ch. 4](#ch04) |
| `sst-dielectric-loss` | Medium-frequency MV transformer dielectric heating & thermal runaway boundary | [Ch. 4](#ch04) |
| `pue-thermal` | Facility energy-flow breakdown and real-time PUE sensitivity calculator | [Ch. 9](#ch09) |
| `energy-per-token` | Full 5-layer grid-to-token energy & training amortization calculator | [Ch. 15](#ch15) |

### Embedding a Widget in Markdown

In any chapter `.md` file, include a fenced code block with the `sim:` language prefix:

````markdown
```sim:gpu-transient
```
````

### Registering a New Widget

Add a factory function in `docs/sims/sim-widgets.js`:

```javascript
SimWidgets.register('my-widget', function(container) {
  var card = createCard(container, {
    id: 'my-widget', badge: 'CUSTOM',
    title: 'My Simulation', subtitle: 'Interactive parameter sweep'
  });
  // Add sliders, Canvas 2D rendering, and real-time KPIs
});
```

---

## Tier 2: Python & Jupyter Notebooks (`notebooks/`)

### Currently Available & Planned Notebooks

| Path | Status | Scope |
|------|--------|-------|
| `notebooks/sst/device-selection-optimizer.ipynb` | **Available** | SiC MOSFET voltage class ($1.2\text{ kV}$ vs. $3.3\text{ kV}$ vs. $10\text{ kV}$) conduction/switching loss optimization for modular SST cells ([Ch. 4](#ch04)) |
| `notebooks/01-power-chain/` | *Planned* | AC vs. $800\text{ VDC}$ conversion-stage efficiency & copper mass comparison ([Ch. 1](#ch01)) |
| `notebooks/02-gpu-transients/` | *Planned* | Multi-tier MLCC/polymer PDN impedance synthesis & anti-resonance damping ([Ch. 6](#ch06)) |
| `notebooks/04-thermal-liquid/` | *Planned* | Cauer/Foster $R_\theta C_\theta$ transient thermal network solver ([Ch. 8](#ch08)) |

---

## Tier 3: ngspice / PySpice Testbenches (`spice/`)

### Currently Available & Planned SPICE Netlists

| File | Status | Circuit & Verification Scope |
|------|--------|------------------------------|
| `spice/testbenches/sst_itcm_acdc.cir` | **Available** | Integrated Triangular Current Mode (iTCM) AC/DC rectifier stage ZVS zero-voltage switching verification ([Ch. 4](#ch04)) |
| `spice/testbenches/sst_src_dcdc.cir` | **Available** | Series Resonant Converter (SRC) medium-frequency isolated DC/DC stage operating at resonance ([Ch. 4](#ch04)) |
| `spice/testbenches/vrm_transient.cir` | *Planned* | Multiphase buck VRM with AVP load-line under GPU current step ([Ch. 5](#ch05)) |
| `spice/testbenches/decoupling_impedance.cir` | *Planned* | AC small-signal impedance sweep across bulk, MLCC, and package decoupling tiers ([Ch. 6](#ch06)) |

### Running SPICE Netlists Locally

```bash
# Run in batch mode with ngspice
ngspice -b spice/testbenches/sst_itcm_acdc.cir -o sst_itcm.log

# Or drive parameter sweeps from Python via PySpice
pip3 install PySpice
```
