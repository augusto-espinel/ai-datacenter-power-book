# AI Data Center Power Systems — Engineering Reference Book

**From Grid to Chip — Mastering Power Delivery, Solid-State Transformers, GPU Load Transients, and Liquid Cooling for AI-Scale Infrastructure**

---

## About This Book

This is a living engineering reference and interactive simulation environment for systems engineers working on AI data center power infrastructure. It covers the complete power chain — from utility grid interconnection down to the GPU die — with live, in-browser simulations of core electrical concepts.

**What you'll learn:**
- The full power delivery chain: MV switchgear → transformer → PDU → busway → rack PDU → VRM → GPU
- Solid-State Transformer (SST) topologies: DAB, LLC resonant, SiC/GaN device characteristics, bidirectional power flow
- GPU power transients: dI/dt step response, decoupling network design, VRM multi-phase transient management
- Cooling architectures: air-cooled limits, direct-to-chip liquid cooling, immersion, CDU design
- 48VDC rack architectures (Open Compute), HVDC distribution, and DC microgrids
- PUE, pPUE, and energy flow analysis with interactive thermal models
- Telemetry, monitoring, and DCIM integration for real-time power management

> **Interactive Simulations:** Each chapter includes zero-build, browser-native simulation widgets (Canvas + parameter sliders) illustrating core electrical principles. No server, no build step — just open the page.

---

## Table of Contents

| Chapter | File | Scope & Key Topics |
|---------|------|--------------------|
| **1** | **[The AI DC Power Landscape](./01-power-landscape.md)** | Power density evolution (10kW → 100kW+ per rack), why AI workloads changed the rules, NVIDIA H100/B200 power profiles. |
| **2** | **[Grid to DC Entrance](./02-grid-to-entrance.md)** | Utility interconnection, MV switchgear (15kV/35kV), transformer configurations (Δ-Y, zigzag), redundancy (N+1, 2N, block redundant). |
| **3** | **[Power Distribution Architecture](./03-distribution-architecture.md)** | Busway vs cabling, PDU hierarchy, panelboards, rack-level distribution, phase balancing, harmonic currents. |
| **4** | **[Solid-State Transformers (SST)](./04-solid-state-transformers.md)** | DAB topology, LLC resonant, isolated DC-DC stages, SiC MOSFETs, ZVS/ZCS regions, bidirectional power flow. |
| **5** | **[Voltage Regulator Modules (VRM)](./05-vrm-and-pol.md)** | Multi-phase VRMs, AVP (Adaptive Voltage Positioning), load-line regulation, transient response specs. |
| **6** | **[GPU Power Transients](./06-gpu-power-transients.md)** | dI/dt challenges (500–2000 A/µs), decoupling capacitor sizing, bulk vs local MLCC, NVIDIA TVR profiles. |
| **7** | **[UPS & Energy Storage](./07-ups-and-energy-storage.md)** | Double-conversion vs eco-mode, lithium-ion vs VRLA, flywheel, ESS integration, ride-through time. |
| **8** | **[Cooling & Thermal Management](./08-cooling-and-thermal.md)** | Air cooling TDP limits, direct-to-chip liquid (CDU, quick disconnects), immersion (single/two-phase), coolant chemistry. |
| **9** | **[PUE & Efficiency Metrics](./09-pue-and-metrics.md)** | PUE, pPUE (per-rack), CUE, WUE, energy flow analysis, free cooling hours, economizer modes. |
| **10** | **[Telemetry & Monitoring](./10-telemetry-and-monitoring.md)** | Hall-effect sensors, PMBus, IPMI/Redfish, DCIM platforms, real-time power profiling at rack level. |
| **11** | **[48VDC, HVDC & Microgrids](./11-advanced-48vdc-hvdc-microgrids.md)** | Open Compute 48V rack standard, OCP ORv3, ±400V HVDC, DC microgrid integration with renewables. |
| **12** | **[Safety & Protection Systems](./12-safety-and-protection.md)** | Arc flash, coordination study, breaker selectivity, grounding strategies, PPE categories. |
| **13** | **[Simulation Engine Reference](./13-simulation-engine-reference.md)** | How to use the embedded simulators, PySpice/ngspice integration, Python notebook setup, adding custom widgets. |
| **★** | **[Appendices](./appendices.md)** | Reference tables, standards (IEEE/UL/IEC), unit conversions, cable ampacity, glossary. |

---

## Interactive Reader (Zero-Build SPA)

This book ships with a custom **Zero-Build Single-Page Application** reader — the same architecture proven in the [Triantica RL Training Book](https://github.com/augusto-espinel/Triantica):

- **Open `docs/index.html`** — no build step, no server required
- Dynamic Markdown rendering via **Marked.js** + **KaTeX** math
- **SPA hash routing** (`#/ch04`, `#/ch06`) for deep-linkable chapters
- **Full-text search** across all chapters (press `/`)
- **Reading progress** tracking via `localStorage`
- **Live simulation widgets** embedded in chapter content via ` ```sim:widget-id ` code blocks
- **Neon Manifold** visual theme adapted with power-engineering accent palette

### Simulation Architecture

The book uses a **tiered simulation strategy**:

| Tier | Technology | Use Case | Delivery |
|------|-----------|----------|----------|
| **T1 — Canvas Widgets** | Zero-dep JS + Canvas API | Real-time interactive concepts (transients, efficiency maps, energy flow) | Embedded in SPA, runs in-browser |
| **T2 — Python Notebooks** | Jupyter → HTML embeds | Computational analysis (load flow, thermal modeling, cable sizing) | Pre-rendered static HTML or Binder/Colab links |
| **T3 — SPICE Simulation** | ngspice via PySpice | Circuit-level simulation (VRM transient, SST DAB switching, PFC) | Pre-run waveforms + optional server-side runner |

**Currently implemented T1 widgets:**
- `gpu-transient` — dI/dt step response with VRM + decoupling model
- `sst-dab-efficiency` — DAB converter efficiency map with ZVS indicator
- `pue-thermal` — Energy flow breakdown (IT / cooling / UPS / misc) with PUE calculation

### Running Locally

```bash
# Option 1: Open directly
open docs/index.html

# Option 2: Python HTTP server (GitHub Pages parity)
cd docs && python3 -m http.server 8080
# → http://localhost:8080

# Option 3: Deploy to GitHub Pages
# Push to main branch; docs/ folder is served automatically
```

### SPICE Environment (Tier 3)

For local circuit simulation with ngspice:

```bash
# Install ngspice (macOS)
brew install ngspice

# Install PySpice (Python wrapper)
pip3 install PySpice

# Run a testbench
cd spice/testbenches
ngspice -b vrm_transient.cir -o output.txt
```

---

*Version: 0.1.0-arch (Repository Architecture — Chapters Pending Content)*  
*Simulation Engine: Zero-build Canvas + ngspice/PySpice integration*  
*Deployment: GitHub Pages (zero-build SPA)*
