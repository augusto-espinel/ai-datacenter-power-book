# Chapter 4 — Solid-State Transformers: Replacing the 50 Hz Workhorse

> 📖 **Read first:**
> - [AI Data Center Guide — Part 4.7: The DC Power Revolution (SST section)](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-7-the-dc-power-revolution-48v-400v-800v-and-disaggregated-sidecar-power)
> - [AI Data Center Guide — Part 4.4: Transformers, Harmonics & SST harmonics context](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-4-transformers-harmonics-and-the-ai-non-linear-load-problem)

> 📚 **Primary reference (circuit physics):** *"10 kV SiC-Based Medium-Voltage Solid-State Transformer for Data Center Power Supplies,"* PhD dissertation, ETH Zurich, 2019. All measured efficiency figures, topology comparisons, and design trade-offs in §4.6–§4.9 originate from this work.
>
> ⚠️ **Temporal scope:** The dissertation was completed in 2019, when AI rack power was 15–40 kW and the 400 VDC distribution standard was emerging. The **system-level architecture** proposed in the thesis (25 kW per-rack single-cell SST → 400 VDC) has been superseded by the 2026 industry reality of **1–10 MW perimeter/sidecar SSTs → 800 VDC / ±400 VDC** (OCP SST v0.3, NVIDIA 800V HVDC). However, the **circuit-level engineering** (iTCM soft-switching, MF-MV dielectric loss, calorimetric measurement, parasitic capacitance management) remains the definitive reference and applies directly within each cell of a modern multi-cell SST.

---

## 4.1 Why Replace the Low-Frequency Transformer?

The traditional data center power chain — from the MV-AC grid to the 12 V DC server supply — passes through **four to six cascaded conversion stages**, each dissipating 2–5% of the transmitted power. Measurements from operational data centers show that **12–27% of the energy delivered at MV level is lost in power conversion alone** before reaching the IT load [ETH Zurich, 2019, §1.2].

The root cause is the **low-frequency transformer (LFT)**. Operating at 50/60 Hz, the LFT is bulky, heavy, and provides no controllability — it is a passive component in an active power system. When the downstream load is DC (as in modern data centers with 400 V DC distribution), the LFT must be followed by a rectifier, adding another stage. The LFT's low operating frequency forces large core cross-sections and copper volumes, making it the **single largest passive component** in the power chain.

> **The key question:** Can we replace the LFT + rectifier with a single power-electronic system that provides galvanic isolation, voltage step-down, and grid controllability — all in a smaller, more efficient package?

This is the **Solid-State Transformer (SST)** proposition.

---

## 4.2 What Is a Solid-State Transformer?

An SST is a power electronic converter that provides galvanic isolation via a **medium-frequency (MF) transformer** — typically operating at 20–100 kHz — instead of a 50/60 Hz iron-core transformer. The term encompasses several architectures (also called *Smart Transformer*, *Electronic Transformer*, or *Energy Router*), but all share three characteristics:

1. **Power semiconductor switching** at frequencies 500–2000× higher than grid frequency
2. **Medium-frequency galvanic isolation** via a compact MF transformer
3. **Active controllability** — reactive power compensation, fault handling, bidirectional power flow

The higher isolation frequency is the fundamental advantage: transformer power density scales roughly linearly with frequency (for the same core material and flux density), so a 50 kHz transformer can be **~1000× smaller** than a 50 Hz transformer of the same power rating — before accounting for the power electronics volume.

### SST vs. LFT: When Does the SST Win?

| Criterion | LFT + Rectifier | SST |
|--|-------|-----|
| Efficiency (MV-AC → LV-DC) | ~94–96% | Up to **98.1%** (measured) |
| Power density | ~0.4 kW/L | Up to **1.76 kW/L** (measured) |
| Controllability | None (passive) | Full (reactive power, fault handling) |
| Bidirectional | No (needs separate inverter) | Yes (inherent) |
| Grid monitoring | None | Yes |
| Initial cost | Lower | Higher |
| Operating cost | Higher (losses) | Lower |
| Reliability | Very high (mature) | Developing (MV insulation, semiconductors) |

The SST **outperforms** the LFT solution specifically for **MV-AC to LV-DC conversion** — exactly the use case in modern data centers. For pure AC/AC isolation (same frequency in and out), SSTs perform worse than LFTs and are not recommended [ETH Zurich, 2019, §1.1].

---

## 4.3 The Data Center Motivation (2019 vs 2026)

### The 2019 Context: Per-Rack SST at 25 kW

When the foundational ETH Zurich research was conducted (2014–2019), a high-density CPU/early-GPU rack drew **15–40 kW**. The thesis proposed running MV-AC (6.6 kV phase-to-phase, 3.8 kV phase-to-neutral) directly to each server rack and placing a **25 kW single-phase SST** inside or atop each rack to output 400 VDC:

```
MV-AC Grid → SST → 400 V DC Bus → Server Rack DC/DC → Server
  3.8 kV      400V      12V
```

The advantages of per-rack MV distribution included lower cable cross-sections, lower ohmic losses, per-rack power conversion with redundancy, and bidirectional energy flow for on-site renewables.

### The 2026 Reality: Megawatt-Scale Perimeter SSTs at 800 VDC

The AI factory era invalidated the per-rack SST premise. Rack power exploded from 30–40 kW to **140 kW → 600 kW → >1 MW** in just a few years:

| Rack Generation | Power | Year |
|--------|-------|------|
| GB200 / GB300 NVL72 | ~132–155 kW | 2025–2026 |
| Vera Rubin NVL72 / NVL144 | ~188–228 kW (up to 330 kW DSX) | 2026–2027 |
| Kyber / Rubin Ultra | ~600–660 kW → 1 MW target | 2027–2028 |

At these power levels, routing MV-AC to every rack and placing a 25 kW SST on each became physically and economically unworkable. The industry converged on a different architecture:

```
MV-AC Grid → Perimeter/Sidecar SST → 800 V DC Bus → Rack DC/DC → GPU
  13.8/34.5 kV     1–10 MW block         800V/±400V     6V→sub-1V
```

**Key 2026 industry standards and milestones:**

- **OCP Solid-State Transformer Specification v0.3** (June 2026, authored by Google, Microsoft, NVIDIA):
  - Input: 13.8 kV or 34.5 kV MV-AC (US grid) / 11 kV (EU/UK)
  - Building block: **1 MW modular**, scaling to **5 MW or 10 MW** systems
  - Output: **800 V DC** bus (or ±400 V DC bipolar)
  - Efficiency: **≥ 98% from 50% to full load**
  - Transient overload: **150% for 150 ms** (absorbing synchronized GPU cluster power steps)

- **NVIDIA 800V HVDC Architecture** (announced May 2025, production target 2027):
  - Monopolar 800 V DC (2-wire, +800 V and return)
  - Supports 1 MW+ racks (Kyber class)
  - Claims 45% copper reduction, 85% more power per conductor, 30% TCO reduction

- **OCP Mt. Diablo** (hyperscaler coalition: Google, Meta, Microsoft, Amazon):
  - Bipolar ±400 V DC (3-wire, center-grounded) — leverages EV supply chain for connectors, contactors, switchgear
  - Scales 100 kW to 1 MW per rack

The SST moved **upstream** from the rack to the facility perimeter or row-end sidecar, converting MV-AC to 800 VDC in a single megawatt-scale block. The 800 VDC bus then distributes clean DC power throughout the data hall to each rack, where a compact DC/DC converter (800 V → 6 V or 12 V) handles the final step-down.

### System Specifications: From Academic Prototype (2019) to OCP v0.3 (2026)

| Parameter | ETH Zurich Prototype (2019) | OCP SST v0.3 (2026) | Commercial Target (2026) |
|--|--|----||
| Rated power | 25 kW | 1–10 MW modular | 1–5 MW |
| MV-side AC voltage | 3.8 kV (L-N) | 13.8 or 34.5 kV | 13.8 kV |
| LV-side DC voltage | 400 V | 800 V (or ±400 V) | 800 V |
| Target efficiency | 98% | ≥ 98% | ≥ 98.5% |
| Measured efficiency | 98.1% (calorimetric) | TBD (pre-production) | TBD (pre-production) |
| Power density | 1.76 kW/L | ~100 kW/m³ (industry target) | "10× smaller" (claim) |
| Topology | Single-cell IBE, 10 kV SiC | ISOP CHB / Matrix (industry) | Proprietary |
| Placement | Per-rack | Perimeter / sidecar | Perimeter / sidecar |

---

## 4.4 SST Key Challenges

The transition from LFT to SST is not straightforward. Four fundamental engineering challenges must be solved:

### 4.4.1 Interfacing the Medium-Voltage Grid: The Scaling Problem

The MV-side of the SST must block several kilovolts. The architectural choice between multi-cell and single-cell approaches **depends critically on the MV grid voltage and power level** — and the optimum shifts dramatically between the 25 kW / 3.8 kV academic prototype and a modern 1–10 MW / 13.8–34.5 kV data center SST.

**Multi-cell approach (ISOP):** Series-connect multiple low-voltage converter cells (1200–1700 V or 3.3 kV SiC MOSFETs), each handling a fraction of the total blocking voltage. This is mature, modular, and provides **N+1 / N+2 cell-level redundancy** — a failed cell is bypassed and the remaining cells absorb the voltage headroom without dropping the MW-scale block offline.

**Single-cell approach:** Use **10–15 kV SiC MOSFETs** to interface the MV grid directly with one converter cell. This dramatically reduces complexity but demands careful MV insulation and device handling, and has **zero internal cell redundancy**.

> **Why the single-cell approach was correct at 25 kW / 3.8 kV but NOT at 1 MW / 13.8 kV:**
>
> At 3.8 kV AC (5.4 kV peak → 7 kV DC link), a 10 kV SiC device has sufficient margin. At 13.8 kV AC (11.3 kV L-N peak → >18 kV DC link), **even 10 kV devices require multiple cells in series** — the single-cell advantage vanishes. At 34.5 kV AC (>28 kV L-N peak → >45 kV DC link), the requirement for series-connected cells is unavoidable regardless of device voltage class.
>
> Simultaneously, as power scales from 25 kW to 1–10 MW, the current rating per die becomes the binding constraint. 10 kV SiC dies carry only ~20 A per die (vs 202 A for 1.2 kV and 52 A for 3.3 kV), forcing dozens of ultra-expensive thick-epi dies in parallel just to carry the current — their high specific $R_{\text{DS,on}} \propto V_B^{2.5}$ actually *degrades* full-load conduction efficiency.

**The 2026 industry consensus:** Multi-cell ISOP (Cascaded H-Bridge or Matrix) using **1.7 kV and 3.3 kV SiC MOSFET modules** at 40–50 kW per cell, with 10–14 cascaded cells per phase. A 2026 UK Semiconductor Catapult study found **3.3 kV SiC delivered the highest full-load system efficiency (98.54%)** across every topology tested for a 1 MW, 11 kV→800 VDC SST block — beating both 1.2 kV (too many series cells) and 10 kV (too much conduction loss and parallel die count). 10 kV+ SiC is viewed as a **later-phase cell-count reducer for 34.5 kV substation-level SSTs** (2029+), once wafer yields and current ratings mature.

> **Design rule (updated):** At 25 kW / 3.8 kV, the single-cell 10 kV approach is superior (the measured results confirm this). At 1–10 MW / 13.8–34.5 kV, **modular ISOP using 1.7–3.3 kV SiC is the commercial winner** — it trades higher cell count for automotive-volume supply chain, N+2 redundancy, and lower conduction losses. The two approaches are complementary across different voltage/power regimes, not competitive.

### 4.4.2 Medium-Voltage Insulation at Medium Frequency

This is the **most underappreciated challenge** in SST design. In a conventional LFT, oil insulation and large physical dimensions make dielectric losses negligible. In an SST, the MF transformer operates at 50 kHz and several kilovolts — a regime where:

1. **Dielectric losses become significant.** The dissipation factor $\tan \delta$ of the insulation material causes losses proportional to $E^2 \cdot f \cdot \tan \delta$ (where $E$ is the electric field and $f$ is the switching frequency). Standard epoxy resin can experience **thermal runaway** and destruction under these conditions [ETH Zurich, 2019, §5.3.4].

2. **Thermal extraction is harder.** The MF transformer is compact, meaning less surface area for heat extraction. Winding losses