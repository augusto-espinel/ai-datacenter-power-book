# AI Data Center Power Systems — The System Engineer's Circuit-Level Companion

**From MV to Die — Circuit Engineering, SPICE Simulation, and Interactive Exploration of the Power Delivery Chain**

This is **not** another architecture-level reference. The [AI Data Center Guide](https://aidatacenterguide.com) already covers that comprehensively (166 chapters, vendor-neutral, practitioner depth). This book is the **engineer's deep-dive companion**: circuit-level physics, component selection, SPICE simulation, measurement methodology, and interactive widgets that let you *feel* the engineering tradeoffs.

## Quick Start

```bash
# Read the book locally
cd docs && python3 -m http.server 8080
# → http://localhost:8080

# Run a SPICE testbench
cd spice/testbenches && ngspice -b vrm_transient.cir

# Python notebook
cd notebooks/02-gpu-transients && jupyter notebook decoupling_analysis.ipynb
```

## Repository Structure

```
ai-datacenter-power-book/
├── docs/                          # GitHub Pages root (zero-build SPA)
│   ├── index.html                 # SPA entry point
│   ├── reader.js                  # Markdown loader + router + search + sim boot
│   ├── power-book.css             # Neon Manifold theme + sim widget styles
│   ├── sim-widgets.js             # T1 Canvas simulation widgets
│   ├── README.md                  # Book index with guide cross-references
│   ├── 01-power-landscape.md      # Ch.1 — Power chain overview + ref map
│   ├── 02-grid-to-entrance.md     # Ch.2 — MV switchgear & protection coordination
│   ├── 03-distribution-architecture.md  # Ch.3 — Transformer engineering
│   ├── 04-solid-state-transformers.md   # Ch.4 — SST circuit design (DAB, SiC, magnetics)
│   ├── 05-vrm-and-pol.md          # Ch.5 — VRM design & stability (Bode, AVP, DrMOS)
│   ├── 06-gpu-power-transients.md # Ch.6 — PDN, decoupling, dI/dt math
│   ├── 07-ups-and-energy-storage.md      # Ch.7 — UPS topology & battery sizing
│   ├── 08-cooling-and-thermal.md  # Ch.8 — Power-thermal coupling (Rθ networks)
│   ├── 09-pue-and-metrics.md      # Ch.9 — Interactive PUE & energy flow
│   ├── 10-telemetry-and-monitoring.md    # Ch.10 — PMBus, sensors, DAQ
│   ├── 11-advanced-48vdc-hvdc-microgrids.md  # Ch.11 — DC protection engineering
│   ├── 12-safety-and-protection.md       # Ch.12 — Arc flash (IEEE 1584), PPE, LOTO
│   ├── 13-simulation-engine-reference.md # Ch.13 — Measurement & lab techniques
│   ├── 14-simulation-engine-reference.md # Ch.14 — Sim engine architecture (T1/T2/T3)
│   ├── appendices.md              # Standards, conversions, glossary
│   └── assets/diagrams/           # SVG architecture diagrams
├── notebooks/                     # T2 Python Jupyter notebooks
├── spice/                         # T3 ngspice circuit simulation
│   ├── models/                    # SPICE device models (SiC, GaN, etc.)
│   ├── subcircuits/               # Reusable subcircuit definitions
│   └── testbenches/               # .cir testbench files
├── scripts/                       # Build/convert utilities
├── .github/workflows/deploy.yml   # GitHub Pages auto-deploy
└── README.md                      # This file
```

## Companion Reference

Each chapter opens with a cross-reference to the relevant section(s) of the [AI Data Center Guide](https://aidatacenterguide.com), then goes deeper into the circuit-level engineering that the guide's architecture-level treatment doesn't cover.

| Our Focus | Guide's Coverage |
|-----------|-----------------|
| TCC coordination curves, relay settings | "Choose MV switchgear topology" |
| DAB topology math, SiC datasheet reading, magnetics design | "SST is an architectural option" |
| Multiphase Bode plot, AVP programming, DrMOS thermal | "Choose board-edge vs VPD" |
| Capacitor impedance spectroscopy, anti-resonance | "Design PDN impedance target" |
| IEEE 1584 step-by-step calculation | "Coordinate protection" |
| Oscilloscope methods, VNA PDN measurement | _(not covered)_ |

## Deployment

Push to `main` → GitHub Actions deploys `docs/` to GitHub Pages automatically.

## Origin

Architecture adapted from the [Triantica RL Training Book](https://github.com/augusto-espinel/Triantica).
