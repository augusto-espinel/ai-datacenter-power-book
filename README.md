# AI Data Center Power Systems — Engineering Reference Book

**From Grid to Chip — Mastering Power Delivery, Solid-State Transformers, GPU Load Transients, and Liquid Cooling for AI-Scale Infrastructure**

Interactive engineering reference with live electrical simulations, covering the complete power chain from utility grid to GPU die.

## Quick Start

```bash
# Read the book locally
cd docs && python3 -m http.server 8080
# → http://localhost:8080

# Or just open the index
open docs/index.html
```

## Repository Structure

```
ai-datacenter-power-book/
├── docs/                          # GitHub Pages root (zero-build SPA)
│   ├── index.html                 # SPA entry point
│   ├── reader.js                  # Markdown loader + router + search
│   ├── power-book.css             # Neon Manifold theme + sim widget styles
│   ├── README.md                  # Book index page (loaded by SPA)
│   ├── 01-power-landscape.md      # Ch.1 — AI DC power density evolution
│   ├── 02-grid-to-entrance.md     # Ch.2 — Utility to MV switchgear
│   ├── 03-distribution-architecture.md  # Ch.3 — Busway, PDU, rack power
│   ├── 04-solid-state-transformers.md   # Ch.4 — SST, DAB, SiC/GaN
│   ├── 05-vrm-and-pol.md          # Ch.5 — Multi-phase VRMs, AVP
│   ├── 06-gpu-power-transients.md # Ch.6 — dI/dt, decoupling, TVR
│   ├── 07-ups-and-energy-storage.md      # Ch.7 — UPS topologies, Li-ion
│   ├── 08-cooling-and-thermal.md  # Ch.8 — Air → liquid → immersion
│   ├── 09-pue-and-metrics.md      # Ch.9 — PUE, pPUE, CUE, WUE
│   ├── 10-telemetry-and-monitoring.md    # Ch.10 — Sensors, DCIM, Redfish
│   ├── 11-advanced-48vdc-hvdc-microgrids.md  # Ch.11 — OCP 48V, HVDC
│   ├── 12-safety-and-protection.md       # Ch.12 — Arc flash, coordination
│   ├── 13-simulation-engine-reference.md # Ch.13 — Sim architecture docs
│   ├── appendices.md              # Standards, conversions, glossary
│   ├── assets/
│   │   └── diagrams/              # SVG architecture diagrams
│   └── sims/
│       └── sim-widgets.js         # T1 Canvas simulation widgets
├── notebooks/                     # T2 Python Jupyter notebooks
│   ├── 01-power-chain/
│   ├── 02-gpu-transients/
│   ├── 03-sst-topologies/
│   └── 04-thermal-liquid/
├── spice/                         # T3 ngspice circuit simulation
│   ├── models/                    # SPICE device models (SiC, GaN, etc.)
│   ├── subcircuits/               # Reusable subcircuit definitions
│   └── testbenches/               # .cir testbench files
├── scripts/                       # Build/convert utilities
├── .github/workflows/
│   └── deploy.yml                 # GitHub Pages auto-deploy
└── README.md                      # This file
```

## Simulation Tiers

| Tier | Technology | Runs Where | Purpose |
|------|-----------|------------|---------|
| **T1** | Canvas + JS | In-browser (zero-dep) | Real-time interactive concepts |
| **T2** | Python + Jupyter | Local / Binder / Colab | Computational analysis |
| **T3** | ngspice + PySpice | Local CLI / server | Full circuit simulation |

## Deployment

Push to `main` → GitHub Actions deploys `docs/` to GitHub Pages automatically.

## Origin

Architecture adapted from the [Triantica RL Training Book](https://github.com/augusto-espinel/Triantica) — a zero-build SPA reader with modular Markdown chapters, SVG diagrams, KaTeX math, and interactive widgets.
