# AI Data Center Power Systems — The System Engineer's Circuit-Level Companion

**From MV to Die — Circuit Engineering, SPICE Simulation, and Interactive Exploration of the Power Delivery Chain**

---

## About This Book

This open-source study and simulation companion builds on the comprehensive [AI Data Center Guide](https://aidatacenterguide.com) (166 chapters at practitioner depth, spanning siting, strategy, power topology, cooling, networking, and operations).

Rather than duplicating baseline architectural material already covered in the AI Data Center Guide, each chapter in this repository links directly to the corresponding sections of [aidatacenterguide.com](https://aidatacenterguide.com) and focuses on **additional circuit-level physics, component dimensioning trade-offs, SPICE/Python simulations, and interactive exploration** from medium voltage down to the GPU die. Full deep-dive chapters are currently live for **Solid-State Transformers ([Chapter 4](./04-solid-state-transformers.md))** and **Energy Per Token ([Chapter 15](./15-energy-per-token.md))**, along with 7 interactive in-browser simulation widgets across the book; additional circuit derivations for the remaining chapters are being added progressively.

**Where the guide tells you _what_ to decide, this book shows you _how_ to engineer it:**

| The Guide covers | This book covers |
|-----------------|-----------------|
| "Choose ±400V or 800V DC architecture" | SiC MOSFET selection, DAB control loop compensation, magnetics design |
| "Size the VRM for EDPp" | Multiphase VRM Bode plot analysis, AVP load-line programming, DrMOS thermal calculations |
| "Design the PDN impedance target" | Capacitor impedance spectroscopy, anti-resonance avoidance, SPICE AC sweep |
| "Select UPS topology" | Battery C-rate sizing, double-conversion efficiency math, flywheel energy equations |
| "Coordinate protection" | TCC curve overlay, arc flash incident energy calc, DC breaker extinction physics |

> **Interactive Simulations:** Every chapter includes zero-build, browser-native simulation widgets (Canvas + parameter sliders) and references to SPICE testbenches you can run locally with ngspice.

---

## Relationship to the AI Data Center Guide

| Our Chapter | Guide Reference (read first) | Our Deep-Dive Focus |
|-------------|------------------------------|---------------------|
| **1. Power Chain Overview** | [Part 4.1](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-1-power-topology-foundations-and-voltage-selection) | Conversion-stage efficiency math, voltage selection first principles, our simulation framework |
| **2. MV Switchgear & Protection** | [Part 4.2](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-2-utility-interconnect-on-site-substation-and-mv-distribution) | TCC coordination curves, relay settings, arc flash calculation workflow (IEEE 1584) |
| **3. Transformer Engineering** | [Part 4.4](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-4-transformers-harmonics-and-the-ai-non-linear-load-problem) | K-factor derating math, Δ-Y / zigzag selection, impedance %, harmonic loss calculation |
| **4. SST Circuit Design** | [Parts 4.4, 4.7](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-7-the-dc-power-revolution-48v-400v-800v-and-disaggregated-sidecar-power) | DAB topology derivation, SiC/GaN device characterization, magnetics design, ZVS boundaries, control loops |
| **5. VRM Design & Stability** | [Part 7.12](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-12-on-package-power-delivery-and-power-integrity) | Multiphase buck design, AVP implementation, DrMOS specs, Bode plot compensation, current sharing |
| **6. GPU Power Transients** | [Part 7.12](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-12-on-package-power-delivery-and-power-integrity) | dI/dt → ΔV math, decoupling impedance target, capacitor selection (MLCC/polymer/electrolytic), TVR measurement |
| **7. UPS & Energy Storage** | [Part 4.5](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-5-ups-and-energy-storage-from-ride-through-to-transient-absorption) | Topology efficiency math, battery sizing (C-rate, DoD), flywheel energy, ESS grid integration |
| **8. Thermal-Electrical Interface** | [Part 5](https://aidatacenterguide.com/part-5-cooling-and-thermal-management) (all 13 chapters) | Power-thermal coupling: transient thermal response, Rθ network calculation, I²R thermal limits |
| **9. PUE & Energy Flow** | [Part 15.1–15.2](https://aidatacenterguide.com/part-15-sustainability-and-efficiency) | Interactive energy flow model, pPUE calculation per rack, efficiency optimization sensitivity |
| **10. Telemetry & PMBus** | [Part 4.12](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-12-metering-power-quality-monitoring-and-electrical-operations) | PMBus protocol deep-dive, Hall-effect sensor signal conditioning, DAQ architecture, Redfish polling |
| **11. DC Protection Engineering** | [Parts 4.7, 4.11](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-11-grounding-bonding-earthing-lightning-protection-spd-and-emc) | DC arc physics (no zero-crossing), breaker extinction techniques, fuse I²t coordination, connector selection |
| **12. Safety, Earthing & Arc Flash** | [Parts 4.11, 4.12, 13.3](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-11-grounding-bonding-earthing-lightning-protection-spd-and-emc) | IEEE 1584 calculation walkthrough, DC arc flash, ground-grid touch/step voltage, high-frequency EMC bonding |
| **13. Measurement, Lab Validation & Commissioning** | [Part 13 (13.1, 13.3, 13.6, 13.8)](https://aidatacenterguide.com/part-13-commissioning-and-go-live) | VNA 2-port PDN impedance measurement, VRM Bode injection, high-voltage differential probing, calorimetric efficiency |
| **14. Simulation Engine Reference** | [Appendices B & C](https://aidatacenterguide.com/appendix-appendices-and-reference-data/b-reference-designs-and-worked-examples) | T1 Canvas widgets, T2 Python notebooks, T3 ngspice/PySpice testbenches — how to use and extend |
| **15. Energy Per Token: Full Cost of AI Inference** | [Parts 15.1, 15.6, 7.12](https://aidatacenterguide.com/part-15-sustainability-and-efficiency/15-1-efficiency-metrics-pue-wue-erf-ref-and-the-post-pue-metric-stack) | 5-layer grid-to-token energy stack, training amortization, empirical token energy footprint, interactive calculator |
| **★ Appendices & Reference Data** | [Appendices A–G](https://aidatacenterguide.com/appendix-appendices-and-reference-data) | Circuit & simulation standards index, SPICE/magnetics/dielectric lookup extensions |

---

## Table of Contents

| Chapter | File | Scope |
|---------|------|-------|
| **1** | **[Power Chain Overview & Reference Map](./01-power-landscape.md)** | Conversion-stage efficiency math, voltage taxonomy, the simulation framework |
| **2** | **[MV Switchgear & Protection Coordination](./02-grid-to-entrance.md)** | TCC curves, relay settings, IEEE 1584 arc flash, coordination study workflow |
| **3** | **[Transformer Engineering](./03-distribution-architecture.md)** | K-factor, harmonic losses, impedance %, Δ-Y selection, paralleling |
| **4** | **[SST Circuit Design](./04-solid-state-transformers.md)** | DAB topology, SiC/GaN devices, magnetics, ZVS/ZCS, control loops |
| **5** | **[VRM Design & Stability](./05-vrm-and-pol.md)** | Multiphase buck, AVP, DrMOS, Bode compensation, current sharing |
| **6** | **[GPU Power Transients & PDN](./06-gpu-power-transients.md)** | dI/dt math, decoupling hierarchy, impedance target, capacitor selection |
| **7** | **[UPS & Energy Storage](./07-ups-and-energy-storage.md)** | Topology efficiency, battery sizing, flywheel, ESS integration |
| **8** | **[Thermal-Electrical Interface](./08-cooling-and-thermal.md)** | Power-thermal coupling, Rθ networks, transient thermal, I²R limits |
| **9** | **[PUE & Energy Flow Analysis](./09-pue-and-metrics.md)** | Interactive PUE model, pPUE per rack, sensitivity analysis |
| **10** | **[Telemetry & PMBus](./10-telemetry-and-monitoring.md)** | PMBus protocol, sensor conditioning, DAQ, Redfish, DCIM integration |
| **11** | **[DC Protection Engineering](./11-advanced-48vdc-hvdc-microgrids.md)** | DC arc, breaker extinction, fuse coordination, connector derating |
| **12** | **[Safety & Arc Flash](./12-safety-and-protection.md)** | IEEE 1584 walkthrough, PPE, LOTO, grounding strategies |
| **13** | **[Measurement & Lab Techniques](./13-simulation-engine-reference.md)** | Oscilloscope PI methods, current probes, Bode measurement, PDN injection |
| **14** | **[Simulation Engine Reference](./14-simulation-engine-reference.md)** | T1/T2/T3 architecture, adding widgets, PySpice setup, notebook workflow |
| **15** | **[Energy Per Token: Full Cost of AI Inference](./15-energy-per-token.md)** | GPU die → node → facility → training amortization, Triantica case study, interactive energy stack calculator |
| **★** | **[Appendices](./appendices.md)** | Standards index, unit conversions, cable ampacity, capacitor impedance charts, glossary |

---

## Interactive Reader (Zero-Build SPA)

Same architecture as the [Triantica RL Training Book](https://github.com/augusto-espinel/Triantica) — modular Markdown, Marked.js + KaTeX, sidebar search, GitHub Pages.

- **Open `docs/index.html`** — no build step required
- **Live simulation widgets** embedded via ` ```sim:widget-id ` code blocks
- **SPICE testbenches** in `spice/testbenches/` — run with `ngspice -b file.cir`
- **Python notebooks** in `notebooks/` — run locally or via Binder/Colab

### Simulation Tiers

| Tier | Technology | Example |
|------|-----------|---------|
| **T1** | Canvas + JS (zero-dep, in-browser) | dI/dt step response slider, DAB efficiency map, PUE energy flow |
| **T2** | Python + Jupyter | Load flow calculation, cable ampacity, thermal Rθ network solver |
| **T3** | ngspice + PySpice | VRM transient with real SiC models, DAB switching waveforms, PDN impedance sweep |

### Running Locally

```bash
# SPA reader
cd docs && python3 -m http.server 8080

# SPICE testbench
cd spice/testbenches && ngspice -b vrm_transient.cir

# Python notebook
cd notebooks/02-gpu-transients && jupyter notebook decoupling_analysis.ipynb
```

---

*Version: 0.2.0-arch (Repositioned as circuit-level companion to the AI Data Center Guide)*  
*Deployment: GitHub Pages (zero-build SPA)*  
*Companion reference: [aidatacenterguide.com](https://aidatacenterguide.com)*
