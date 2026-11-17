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

2. **Thermal extraction is harder.** The MF transformer is compact, meaning less surface area for heat extraction. Winding losses2. **Thermal extraction is harder.** The MF transformer is compact, meaning less surface area for heat extraction. Winding losses must be conducted **through the insulation material** to reach cooling surfaces — requiring high thermal conductivity.

3. **Creepage and clearance distances are large.** IEC 60950-1 requires 32 mm creepage distance for 7 kV operation. In a compact transformer, these distances dominate the mechanical design.

> **Material solution:** The ETH Zurich SST uses a two-component silicone compound (Dow Corning TC-4605 HLV) with:
> - Dielectric strength: 24 kV/mm
> - Dissipation factor: < 0.8% at > 50 kHz
> - Thermal conductivity: 1 W/(m·K)
>
> This is filled via a **vacuum pressure potting (VPP)** process to eliminate voids that could cause partial discharges. The silicone's mechanical flexibility prevents cracking during thermal cycling, unlike rigid epoxy resins.

### 4.4.3 Efficiency, Power Density, and Cost

There is always an application-specific trade-off between these three metrics. For data centers:

- **Efficiency is paramount** — operating costs over a 15–20 year lifetime dwarf the initial capital cost. Each 1% efficiency improvement at 25 kW saves ~2,200 kWh/year per rack.
- **Power density matters** — data center floor space is expensive and could host revenue-generating servers instead of power equipment.
- **Initial cost is higher** for SSTs, but can be amortized through lower operating losses.

The ETH Zurich SST's measured performance demonstrates that the single-cell approach with 10 kV SiC devices can achieve both **higher efficiency AND higher power density** simultaneously — a rare result in power electronics where these metrics typically trade against each other.

### 4.4.4 Reliability

LFTs are extremely robust — they withstand lightning impulses, overloads, and decades of thermal cycling. SSTs are more sensitive: semiconductors can fail from overcurrent, insulation can degrade from partial discharges, and the higher component count reduces MTBF.

However, the **per-rack SST architecture** provides inherent redundancy: if one SST fails, only one server rack is offline until replacement. Centralized protection (MV circuit breakers, surge protection) can protect the SSTs from external faults. The ETH Zurich SST also implements an **ultra-fast overcurrent protection (OCP)** circuit with 22 ns reaction time, capable of safely clearing flashover faults at 7 kV DC-link voltage within 200 ns.

---

## 4.5 SST Topology Survey

Four main topology families have been proposed for MV-AC to LV-DC SSTs. The choice determines everything: efficiency, complexity, cost, and reliability.

### 4.5.1 Isolated Back End (IBE) — Multi-Cell

The most mature approach. Multiple converter cells are connected in **input-series, output-parallel (ISOP)** configuration, each cell consisting of:
- A PFC AC/DC front end (1200–1700 V devices)
- An isolated DC/DC back end (MF transformer + rectifier)

**Advantages:** Uses commercially available LV devices; modular; redundant.
**Disadvantages:** High complexity (5–10 cells × gate drivers, sensors, auxiliary supplies); high conduction losses (many switches in the current path); lower power density.

This is the approach used by the **commercial benchmark SST** (5 cells, 25 kW, 2.4 kV AC → 54 V DC, 96% efficiency, 0.4 kW/L).

### 4.5.2 Isolated Front End (IFE) — Multi-Cell

Galvanic isolation is performed **before** current shaping. Each cell uses bidirectional switches on the AC side, a series resonant converter (SRC) as isolation stage, and a single shared |AC|/DC boost converter on the LV side.

**Advantages:** Lower complexity on the MV side (no current/voltage measurements per cell); fewer MV-side semiconductors.
**Disadvantages:** Poor semiconductor utilization (components must be sized for peak AC current, not RMS); lower full-load efficiency than IBE.

### 4.5.3 Modular Multilevel Converter (MMLC)

Uses series-connected full-bridge submodules to synthesize a multilevel waveform directly at the transformer terminals. No DC-link per cell — the submodules derive their energy from the AC waveform itself.

**Advantages:** No HV switches needed; excellent waveform quality; low EMI.
**Disadvantages:** Extremely high component count; high conduction losses (many switches in series per arm); complex modulation and balancing.

### 4.5.4 Single-Cell IBE Using MV SiC Devices

The ETH Zurich approach. A single-cell PFC AC/DC rectifier (10 kV SiC half-bridge) followed by a single-cell isolated DC/DC converter (10 kV SiC half-bridge → MF transformer → 1200 V SiC full-bridge). An LCL filter interfaces the AC/DC stage to the MV grid.

```
                    iTCM AC/DC          Isolated DC/DC
MV-AC ──LCL──┬─── 10 kV SiC ───┬─── 10 kV SiC ──── MF Tr ──── 1200 V SiC ─── 400 V DC
  3.8 kV     │   Half-Bridge   │   Half-Bridge    n=52:6    Full-Bridge
             │                 │                            (3× parallel)
            Lg    7 kV        Lb,Cb         Cr
            DC-link
```

**Advantages:** Greatly reduced complexity; highest efficiency and power density; fewer failure points.
**Disadvantages:** Requires 10 kV SiC devices (still emerging technology); full MV insulation of all components; no cell-level redundancy.

> **The verdict (context-dependent):** At 25 kW / 3.8 kV, the single-cell IBE approach with 10 kV SiC MOSFETs is the clear winner — ETH Zurich's SST demonstrates 98.1% efficiency and 1.76 kW/L, outperforming the multi-cell commercial benchmark by 2.1% efficiency and 4.4× power density. However, **at the 1–10 MW / 13.8–34.5 kV scale required by modern AI data centers**, the industry has converged on multi-cell ISOP using 1.7–3.3 kV SiC for its supply-chain maturity, N+2 cell redundancy, and lower conduction losses. The single-cell approach may return for 34.5 kV systems once 10–15 kV SiC devices reach volume production with higher current ratings.

---

## 4.6 The iTCM Innovation: Soft-Switching the AC/DC Stage

### The Hard-Switching Problem

A conventional PWM AC/DC full-bridge converter using 10 kV SiC MOSFETs would be limited by **hard-switching losses (HSL)**. At 10 kHz switching frequency with 40% current ripple:

| Parameter | Value |
|-----------|-------|
| Switching energy per cycle ($E_{\text{sw}}$) | 11 mJ |
| Switching losses ($P_{\text{sw}}$) | 110 W |
| Conduction losses ($P_c$) | 53 W |
| Boost inductance ($L_g$) | 47 mH |
| Inductor volume ($V_{Lg}$) | 3.25 L |
| Estimated efficiency | ~98.7% |
| Estimated power density | ~2.1 kW/L |

The switching losses are **twice the conduction losses** — a clear sign that the converter is switch-loss-limited. Increasing frequency to shrink the inductor would make losses worse. This is the fundamental barrier of hard-switched PWM at MV.

### The Soft-Switching Solution: iTCM

Calorimetric measurements (Chapter 3 of the dissertation) show that the **soft-switching losses (SSL) of 10 kV SiC MOSFETs are 30× lower** than their hard-switching losses. If ZVS can be achieved throughout the entire AC grid period, switching losses drop from 110 W to ~3.7 W — almost eliminating them.

The **integrated Triangular Current Mode (iTCM)** topology achieves this by:

1. **Adding a parallel LC branch** ($L_b$, $C_b$) across the bridge-leg
2. The LC branch carries a **triangular HF current** that forces the bridge-leg current to reverse polarity every switching cycle
3. The current reversal enables **zero-voltage switching (ZVS)** at every switching transition
4. The boost inductor $L_g$ still carries the LF grid current with a small HF ripple
5. The capacitor $C_b$ blocks LF current, so only HF current flows through $L_b$

The ZVS condition requires the bridge-leg current to reach a minimum turn-off value before each switching transition:

$$I_{\text{ZVS}} = \frac{Q_{\text{OSS}}}{T_{\text{dt}}}$$

where $Q_{\text{OSS}}$ is the effective output charge of the MOSFETs (and other parasitic capacitances) and $T_{\text{dt}}$ is the dead-time duration. For the ETH Zurich SST, $I_{\text{ZVS}} = 4.5$ A.

The iTCM uses a **variable switching frequency** that adapts over the AC grid period to maintain exactly $I_{\text{ZVS}}$ at every switching transition. The frequency varies between 35 kHz (at the grid current peak) and ~80 kHz (at zero crossings), with an average of 52.6 kHz — **5× higher** than the original PWM converter, but with switching losses 30× lower.

### Measured AC/DC Performance

| Parameter | PWM (hard-switched) | iTCM (soft-switched) |
|-----------|---------------------|----------------------|
| Switching frequency | 10 kHz (constant) | 35–80 kHz (variable, avg. 52.6 kHz) |
| Switching losses | 110 W | ~3.7 W |
| Efficiency (full load) | ~98.7% | **99.1%** |
| Power density | ~2.1 kW/L | **3.28 kW/L** |

The iTCM AC/DC stage achieves **99.1% efficiency** — meaning only 225 W of losses at 25 kW load. This is measured calorimetrically with ±0.1% accuracy, far more precise than electrical methods.

> **Key insight for MV design:** In LV converters, parasitic **inductance** is the enemy — it causes voltage overshoots and ringing. In MV converters, parasitic **capacitance** is the enemy — it causes capacitive currents during switching transitions that increase losses and EMI. This fundamental difference means MV converter PCB layouts and magnetic component designs must be optimized for **low capacitance**, not low inductance.

---

## 4.7 The Isolated DC/DC Stage: "DC Transformer"

The DC/DC converter provides voltage step-down (7 kV → 400 V) and galvanic isolation. Since the AC/DC stage already controls the DC-link voltage, the DC/DC stage can operate as a **fixed-ratio "DC transformer"** — no closed-loop control needed.

### Topology Selection: Series Resonant Converter (SRC)

An LLC SRC operated at its resonance frequency acts as a DC transformer: the voltage transfer ratio is determined by the transformer turns ratio and is quasi load-independent. This provides:

- **Sinusoidal transformer currents** (beneficial for reducing HF winding effects)
- **Low RMS currents** (only $\pi/(2\sqrt{2}) \approx 1.11×$ the DC current)
- **Clamped switch voltages** (no overshoot)
- **Simple operation** — no closed-loop control required

### ZVS Across the Voltage Mismatch

The 10 kV SiC MOSFETs on the MV-side have a **much larger parasitic output capacitance** ($C_{\text{OSS}}$) than the 1200 V SiC MOSFETs on the LV-side (when referred through the transformer turns ratio). This means:

- The MV-side voltage transitions are **slow** (large $C_{\text{OSS}}$ to charge/discharge)
- The LV-side voltage transitions are **fast** (small $C_{\text{OSS}}$)

To achieve ZVS on **both** sides, a small **phase shift** $t_d = 300$ ns is introduced between the MV-side and LV-side gate signals. The phase shift centers the fast LV-side transition within the slow MV-side transition, creating a current spike that provides the LV-side ZVS current. The MV-side uses the transformer magnetizing current for ZVS.

This modulation is **self-stabilizing** — the ZVS mechanism automatically center-aligns the voltage transitions and is robust against ±10% variations in switching frequency, voltage level, and phase shift.

### MF MV Transformer Design

The transformer is the **most challenging component** in the SST. It must handle 25 kW at 48 kHz with a 7 kV/400 V voltage ratio, while being compact and efficiently cooled.

**Pareto optimization** was performed over:
- Operating frequency (20–70 kHz)
- Core shape (U-core vs E-core)
- Core dimensions, number of turns, litz wire specifications
- HF effects (skin, proximity, fringing field)
- Core losses (iGSE method)
- Dielectric losses in insulation

The selected design:

| Parameter | Value |
|-----------|-------|
| Core type | U-core, BFM8 ferrite, 2500 mm² |
| Turns ratio | 52 : 6 |
| MV winding | 630 × 71 µm litz wire, 3 layers, 2 chambers |
| LV winding | 2500 × 100 µm litz wire, single layer |
| Air gap | 2 × 1.1 mm |
| Insulation | 4.0 mm silicone, rated for 15 kV |
| Magnetizing inductance | 4.1 mH |
| Leakage inductance | 195 µH |
| Boxed volume | 3.4 L (including fan and terminations) |
| Power density | **7.35 kW/L** |
| Measured efficiency | **99.64%** |

### Calorimetric Loss Breakdown (Transformer at Full Load)

| Loss Component | Power | % of Transformer Losses |
|----------------|-------|--------------------------|
| Core losses | 43.2 W | 50% |
| Winding losses | 34.8 W | 40% |
| Dielectric losses | 8.0 W | **9%** |
| Cooling fan | 5.8 W | 7% |
| **Total** | **91.8 W** | **100%** |

> **Critical finding:** Dielectric losses account for **9% of transformer losses** — a quantity that is completely negligible in LV transformers but becomes significant at MV + MF. The dielectric losses scale as $P_{\text{ins}} \propto E^2 \cdot f \cdot \tan \delta$, meaning they increase **quadratically** with electric field and linearly with frequency. Using standard epoxy resin instead of the silicone compound would lead to thermal runaway and transformer destruction.

---

## 4.8 Measured SST System Performance

The complete SST (iTCM AC/DC + isolated DC/DC) was tested at full load with **calorimetric efficiency measurements** — the most accurate method available, achieving ±0.1% accuracy (vs. ~±1% for electrical methods).

### Total SST Efficiency

| Stage | Efficiency | Power Density |
|-------|-----------|---------------|
| iTCM AC/DC converter | **99.1%** | 3.28 kW/L |
| Isolated DC/DC converter | **99.0%** | 3.8 kW/L |
| **Total SST** | **98.1%** | **1.76 kW/L** |

### Comparison with Benchmark

| Metric | commercial benchmark SST (multi-cell) | ETH Zurich SST (single-cell) | Improvement |
|--------|-------------------------------|---------------------------|-------------|
| Topology | 5 ISOP cells | Single-cell IBE | — |
| MV-side devices | 1700 V SiC | 10 kV SiC | — |
| Efficiency (full load) | 96.0% | **98.1%** | +2.1% |
| Losses (full load) | ~1000 W | **~475 W** | **< 50%** |
| Power density | 0.4 kW/L | **1.76 kW/L** | **4.4×** |
| Bidirectional | No | Yes | — |

The ETH Zurich SST generates **less than half the losses** of the commercial benchmark while being **4.4× smaller**. This demonstrates that the single-cell approach with 10 kV SiC devices is fundamentally superior to multi-cell topologies **at the 25 kW / 3.8 kV scale**. However, as shown in §4.4.1, this advantage does not hold at MW scale on 13.8–34.5 kV grids, where the industry has converged on multi-cell ISOP with 1.7–3.3 kV SiC.

### DC/DC Converter Loss Distribution (Full Load)

| Component | Losses | Notes |
|-----------|--------|-------|
| MV-side MOSFETs | 36.5 W | Includes antiparallel JBS diode conduction |
| LV-side MOSFETs | 116 W | 3× parallel C2M0025120D per switch |
| MF MV Transformer | 91.8 W | See breakdown above |
| Resonance capacitor | 2.17 W | 38× C0G ceramic capacitors |
| Auxiliary supplies | ~25 W | Gate drivers, sensors |
| Cooling fans | ~15 W | MV + LV side |
| **Total** | **~286 W** | → 99.0% efficiency at 25 kW |

> **Where can this be improved?** The LV-side MOSFETs (116 W) are the largest single loss source. Replacing the 2nd generation 1200 V, 25 mΩ devices with 3rd generation 900 V, 11.5 mΩ devices would halve LV-side conduction losses. However, even then, the MV-side MOSFETs (10 kV, 400 mΩ) would still outperform the LV-side on a per-chip-area basis — because SiC bulk resistance dominates at higher blocking voltages, approaching the theoretical $R_{\text{DS,on}} \propto V_B^2$ limit.

---

## 4.9 MV-Specific Design Considerations

### Parasitic Capacitance vs. Parasitic Inductance

In LV converters (< 600 V), parasitic loop inductance is the primary concern — it causes voltage overshoots during fast switching transitions. The standard remedy is low-inductive packaging (e.g., laminated busbars, Kelvin-source connections).

In MV converters (> 3 kV), the situation is **fundamentally different**. The higher voltage means:
- Switching transitions are slower (large $C_{\text{OSS}}$)
- Parasitic capacitances draw significant capacitive currents: $i_C = C \cdot du/dt$
- These capacitive currents increase conduction losses and EMI

> **MV design rule:** Minimize parasitic **capacitances** in the PCB layout, magnetic components, and heatsink arrangement. This is the opposite of LV design rules, which focus on minimizing parasitic **inductance**.

### MV Cable Resonances

SSTs are typically connected to the MV-AC grid via shielded MV cables (50–500 m). From an electromagnetic perspective, these cables are **almost undamped transmission lines** with discrete resonance frequencies. A 500 m cable has its first resonance at ~35 kHz — directly in the SST's switching frequency range.

Without mitigation, the cable resonance amplifies the switching frequency harmonics, causing large current oscillations. The solution is a **passive RC damping network** between the LCL filter and the MV cable — a simple, quasi-lossless termination that eliminates oscillations independently of cable length.

### EMI Standards Gap

Existing harmonic standards for MV grids (IEEE 519) only cover frequencies up to 2.5–9 kHz. SSTs switch at 35–100 kHz — a completely unregulated frequency range. The lack of standards doesn't mean no filtering is needed: switching harmonics can cause:
- Grid resonances (especially with long MV cables)
- Aging of insulation materials in MV cables (dielectric heating)
- Interference with power-line communication systems

The ETH Zurich SST extrapolates IEEE 519 limits to higher frequencies and designs the LCL filter accordingly.

---

## 4.10 The Path to Deployment (2026 Update)

### Where the Industry Stands Today

The SST market went from nearly nonexistent to nearly crowded in 2025–2026. Over **$330 million** in venture funding has flowed into SST startups, and the OCP published the first industry-standard SST specification (v0.3) in June 2026. The key players:

| Company | Funding | Approach | Notable |
|---------|---------|----------|--------|
| **the venture** (US) | $140M | MV-to-800VDC SST | Founded by the venture founder (ex-Tesla); backed by venture capital |
| **the venture** (US) | $60M | SST sidecar for data centers | backed by industrial investors |
| **the venture** (SG) | ~$30M | SST for data centers | Incubated by an investment fund |
| **the venture** (CH) | €5M | Compact MW-scale SST | Founded by the researcher (ETH Zurich) + a co-founder |
| **Eaton / Delta / Schneider** | — | SST products (incumbent) | Traditional power equipment vendors entering SST market |

### What's Ready Now (Circuit Level)

- **iTCM soft-switching** and **ZVS techniques** for MV SiC are validated and applicable within each ISOP cell
- **MF MV transformer technology** including silicone insulation and VPP process is proven
- **1.7 kV and 3.3 kV SiC MOSFET modules** are in automotive-volume production (Wolfspeed, Infineon, onsemi, ROHM, Microchip)
- **Calorimetric measurement methodology** for >99% efficiency is established
- **3.3 kV SiC HV-D3 modules** (Microchip) support both CHB and Matrix converter topologies with 6 kV isolation

### What's Still Needed (System Level)

- **First commercial MW-scale SST products:** Most startups are in prototype/pre-production stage (2026–2027). The OCP v0.3 spec sets targets but no product has been certified against it yet.
- **DC protection ecosystem:** DC circuit breakers, fuses, and connectors rated for 800 VDC at kiloampere scale are still maturing. DC arcs do not self-extinguish at zero-crossing.
- **Long-term reliability data:** SSTs must demonstrate 10–20 year field reliability comparable to LFTs (which routinely last 30+ years).
- **10 kV+ SiC device maturation:** For 34.5 kV substation-level SSTs, 10–15 kV SiC needs higher current ratings, lower cost, and volume production to become the cell-count reducer the industry expects.
- **Regulatory and code updates:** A century of AC-based electrical codes must be rewritten for DC distribution. DC arc-flash, shock-boundary, and fault-interruption standards are still being defined.

### Case Study: a the venture (ETH Zurich's Startup)

In a telling validation of how the field evolved, **the researcher himself pivoted** from his 2019 PhD architecture when he founded **a the venture** in Zurich in 2025:

| Parameter | ETH Zurich PhD (2019) | the venture (2026) |
|-----------|---------------------|-------------------------|
| Rated power | 25 kW | **3.3 MW** (132× increase) |
| Input voltage | 3.8 kV AC (L-N) | **13.8 kV AC** (US grid standard) |
| Output voltage | 400 V DC | **800 V DC** (OCP/NVIDIA standard) |
| Topology | Single-cell, 10 kV SiC only | **Proprietary, SiC + GaN** (multi-cell likely) |
| Placement | Per-rack | **Perimeter / sidecar** |
| Efficiency | 98.1% (measured) | 98.5% (target) |

The startup raised a **€5M seed round** in March 2026 (backed by European deep-tech investors), is part of the a deep-tech accelerator program, and is growing to 15 people. The venture claims:  The company claims **10× smaller** than existing solutions and **~90% less material** usage.

The pivot is instructive: the researcher who proved single-cell 10 kV SiC superiority at 25 kW recognized that at MW scale on 13.8 kV grids, the engineering optimum shifts to a different architecture — one that combines his deep circuit-physics expertise (high-frequency operation, soft-switching, advanced magnetics) with the industry-standard MV input and 800 VDC output that hyperscalers demand.

### The Scaling Path

For data center operators planning 2027–2028 deployments:
1. **Phase 1–2 (2026–2027):** Sidecar retrofits on existing AC facilities — 800VDC power rack beside compute rack, fed from 415/480 VAC. No SST yet.
2. **Phase 3 (2028–2029):** Facility-level 800VDC distribution with first commercial MW-scale SSTs at the perimeter. SST replaces LFT + rectifier chain.
3. **Phase 4 (2029+):** 34.5 kV substation-level SSTs using 10 kV+ SiC to minimize cell count. Potential matrix converter topologies eliminating MV DC-link capacitors.

---

## 4.11 Key Takeaways

1. **SSTs replace the LFT** for MV-AC to LV-DC conversion in modern AI data centers, collapsing multiple conversion stages into one. The 2026 industry target is **1–10 MW perimeter/sidecar SSTs** converting 13.8–34.5 kV MV-AC directly to 800 VDC (OCP v0.3 spec), not the per-rack 25 kW SSTs envisioned in 2019.

2. **The multi-cell vs. single-cell debate is voltage-and-power-dependent.** At 25 kW / 3.8 kV, single-cell 10 kV SiC wins decisively (ETH Zurich 2019). At 1–10 MW / 13.8–34.5 kV, **modular ISOP using 1.7–3.3 kV SiC** is the commercial winner — offering automotive-volume supply chain, N+2 cell redundancy, and lower conduction losses. 10 kV+ SiC will return as a cell-count reducer for 34.5 kV systems post-2029.

3. **Soft-switching is essential** at MV. The iTCM topology reduces AC/DC switching losses by 30×, enabling 99.1% efficiency in the AC/DC stage. This applies within each cell of a modern multi-cell SST.

4. **MF MV transformer insulation** is the hidden challenge. Dielectric losses at 50 kHz + several kV can cause thermal runaway in standard materials. Silicone-based insulation with vacuum pressure potting is required.

5. **Calorimetric measurement** is the only reliable way to verify > 99% efficiency. Electrical methods have insufficient accuracy at these efficiency levels.

6. **3.3 kV SiC is the 2026 efficiency sweet spot** for MW-scale ISOP SSTs. The UK Semiconductor Catapult's multi-objective optimization for a 1 MW, 11 kV→800 VDC block found 3.3 kV SiC delivered 98.54% full-load efficiency — beating both 1.2 kV and 10 kV device classes.

7. **Parasitic capacitance, not inductance**, is the primary layout concern in MV converters. This inverts standard LV design rules.

8. **The architecture follows the market.** The 2019 academic prototype (25 kW / 3.8 kV / 400 VDC / 10 kV SiC-only) demonstrated that the circuit physics was sound. The 2026 commercial reality (MW-scale / 13.8 kV / 800 VDC / SiC+GaN) demonstrates that the system architecture must follow the market — the circuit-level innovations transfer, but the topology and device selection adapt to the voltage, power, and standard requirements of the AI factory era.

---

## 4.12 Simulation Lab — Hands-On SST Trade-offs

The chapter covers three fundamental technology enablers that make SSTs viable for AI data centers:

1. **Device voltage class selection** — why 3.3 kV SiC wins at MW scale but 10 kV wins at 25 kW (§4.4.1)
2. **Soft-switching via iTCM** — how triangular current mode eliminates 97% of switching losses (§4.6)
3. **Dielectric loss management** — why medium-frequency insulation can self-destruct and how silicone potting solves it (§4.4.2)

The simulation lab lets you explore each of these from first principles. The simulations are organized in three tiers by depth and tooling requirements.

### How to Run the Simulations

**Tier 1 (Canvas widgets) — No installation required.** These run directly in the book's web reader. Open the book by navigating to `docs/index.html` in a browser (or serve locally with `python3 -m http.server 8080` from the `docs/` directory). The widgets are embedded inline in the chapter — use the sliders to adjust parameters and observe the results in real time.

**Tier 2 (Jupyter notebook) — Requires Python 3.10+.**

```bash
cd notebooks/sst
pip3 install numpy matplotlib jupyter
jupyter notebook device-selection-optimizer.ipynb
```

Run all cells to produce efficiency bar charts, 2D heatmaps, and the optimal device selector map. Saved figures appear in `docs/assets/`.

**Tier 3 (ngspice) — Requires ngspice installed.**

```bash
# Install ngspice (macOS)
brew install ngspice

# Run the iTCM AC/DC testbench
ngspice -b spice/testbenches/sst_itcm_acdc.cir -o output.txt

# Run the SRC DC/DC testbench
ngspice -b spice/testbenches/sst_src_dcdc.cir -o output.txt

# For Python-driven parameter sweeps via PySpice:
pip3 install PySpice
python3 -c "from PySpice.Spice.NgSpice import NgSpiceShared; print('OK')"
```

The testbenches produce `.plot` waveform traces viewable in ngspice's built-in viewer or any compatible waveform tool (Gaw, GTKWave, etc.).

---

### Sim 1: Device Voltage Class Scaling Explorer (Tier 1 — Canvas Widget)

#### Principle

The central architectural question of SST design is: **which SiC MOSFET voltage class should you use?** The answer depends on the operating point, and the physics is governed by two competing effects:

- **Conduction loss** scales with $R_{DS,on}$, which itself scales as $V_B^{2.5}$ (the theoretical SiC limit). Higher-voltage devices are exponentially worse conductors per unit area, requiring more dies in parallel to carry the current.
- **Cell count** scales inversely with device voltage class. Higher-voltage devices need fewer series-connected cells to block the MV grid, reducing complexity, component count, and switching-stage losses.

At low power / low MV voltage (e.g., 25 kW / 3.8 kV), a single 10 kV SiC cell can block the entire DC-link voltage (7 kV with margin), so the cell-count advantage dominates — no series losses, fewer gate drivers, highest efficiency. At high power / high MV voltage (e.g., 1 MW / 13.8 kV), even 10 kV devices need multiple series cells (the DC-link exceeds 18 kV), and the conduction-loss penalty of high-voltage dies makes 3.3 kV SiC in a multi-cell ISOP arrangement the winner.

The widget models five device classes (1.2, 1.7, 3.3, 6.5, 10 kV) with their per-die specifications (current rating, on-resistance, cost). For each class, it computes: the number of series cells needed (with 60% voltage derating), the parallel dies per cell, the conduction and switching losses, and the resulting system efficiency.

```sim:sst-device-scaling
```

#### What to Explore

| Operating Point | Sliders | Expected Winner | Why |
|-----------------|---------|-----------------|-----|
| 25 kW / 3.8 kV | MV=3.8, P=0.025 | **10 kV SiC** | Single cell blocks 7 kV DC; zero series-cell losses |
| 1 MW / 13.8 kV | MV=13.8, P=1.0 | **3.3 kV SiC** | 10 kV needs multiple cells anyway; 3.3 kV has lower $R_{DS,on}$ per die |
| 10 MW / 34.5 kV | MV=34.5, P=5.0 | **6.5-10 kV SiC** | DC-link >45 kV forces many cells regardless; higher-voltage devices reduce cell count |

Observe how the "Rel. cost" KPI changes — 10 kV SiC dies cost ~50x more than 1.2 kV dies per unit, which dominates the bill of materials at scale.

---

### Sim 2: iTCM ZVS Boundary Map (Tier 1 — Canvas Widget)

#### Principle

In a hard-switched PWM converter, the switching losses ($P_{sw} = E_{sw} \times f_{sw}$) are proportional to the switching frequency. At 10 kV, each switching event dissipates 11 mJ — at 50 kHz, this means 110 W of pure switching loss, twice the conduction loss. You cannot simply raise the frequency to shrink the magnetic components, because losses scale with frequency.

The iTCM (integrated Triangular Current Mode) solution adds a parallel LC branch ($L_b$, $C_b$) across the bridge-leg. This branch carries a triangular high-frequency current that forces the bridge-leg current to reverse polarity every switching cycle. When the current reverses **before** the switch turns on, the MOSFET's parasitic output capacitance ($C_{OSS}$) is naturally discharged — achieving **zero-voltage switching (ZVS)** with near-zero switching loss.

The ZVS condition is:

$$I_{ZVS} = \frac{Q_{OSS}}{T_{dt}}$$

where $Q_{OSS}$ is the MOSFET output charge (scales with blocking voltage) and $T_{dt}$ is the dead-time duration (typically 300 ns). If the turn-off current at any point in the AC grid cycle falls below $I_{ZVS}$, ZVS is lost at that point — and hard-switching losses return.

The widget sweeps the turn-off current across the AC grid cycle (0 to $\pi$) and compares it to the $I_{ZVS}$ threshold. The red-shaded region shows where ZVS is lost. The KPIs show the ZVS coverage percentage and the resulting soft-switching vs. hard-switching power loss.

```sim:sst-zvs-boundary
```

#### What to Explore

- **Increase load** (slider to 100%) → ZVS coverage improves because the grid current amplitude rises, keeping the turn-off current above $I_{ZVS}$ for more of the cycle.
- **Decrease $L_b$** (slider to 20 µH) → the triangular current amplitude increases ($I_{tri} = V_{DC}/(2 L_b f_{sw})$), pushing the turn-off current above $I_{ZVS}$ even at grid current peaks. But smaller $L_b$ also means higher RMS current and more conduction loss.
- **Increase DC-link voltage** (slider to 10 kV) → $Q_{OSS}$ increases (it scales with blocking voltage), raising $I_{ZVS}$ and making ZVS harder to achieve. This is why MV converters are fundamentally harder to soft-switch than LV converters.
- **Decrease switching frequency** (slider to 20 kHz) → the triangular current amplitude increases (more time for $L_b$ to charge/discharge), extending ZVS coverage — but the magnetic components grow larger.

---

### Sim 3: Dielectric Loss and Thermal Runaway (Tier 1 — Canvas Widget)

#### Principle

In a conventional 50 Hz transformer, oil-impregnated paper or cast epoxy insulation has negligible dielectric losses — the dissipation factor $\tan \delta$ is small, and the frequency is low. In an SST's medium-frequency transformer operating at 50 kHz and several kilovolts, the dielectric loss equation becomes critical:

$$P_{ins} = \epsilon_0 \cdot E^2 \cdot f \cdot \tan \delta \cdot V_{material}$$

The losses scale **quadratically** with electric field ($E^2$) and **linearly** with frequency ($f$). At 50 kHz and 5 kV/mm, the dielectric loss density can be 1000x higher than at 50 Hz and the same field.

The danger is **thermal runaway**: dielectric loss heats the insulation, which raises $\tan \delta$ (which itself increases with temperature), which increases dielectric loss further. If the heat generation rate exceeds the thermal extraction rate, the insulation self-destructs.

The widget models this with an iterative thermal solver: it computes the steady-state temperature considering $\tan \delta$ doubling every 50°C. Standard epoxy ($\tan \delta \approx 3\%$, thermal conductivity $\approx 0.3$ W/m·K) enters thermal runaway at moderate E-fields. Silicone-based potting compound ($\tan \delta < 0.8\%$, thermal conductivity $\approx 1.0$ W/m·K) remains stable due to both lower loss generation and better heat extraction.

```sim:sst-dielectric-loss
```

#### What to Explore

| Material | tan(δ) slider | Therm. cond. slider | Expected Result |
|----------|---------------|---------------------|-----------------|
| Standard epoxy | 3.0% | 0.3 W/mK | **Thermal runaway** above ~3 kV/mm — red zone |
| Silicone VPP | 0.8% | 1.0 W/mK | **Stable** up to ~10 kV/mm — green zone |
| High-Tc ceramic | 0.2% | 2.5 W/mK | **Stable** at all explored E-fields |

The temperature curve (yellow trace) shows T vs E-field for the current material. The red dashed line at 120°C marks the thermal limit. The operating point dot turns red when runaway is predicted.

---

### Sim 4: DAB Efficiency Map (Tier 1 — Canvas Widget)

The original DAB (Dual Active Bridge) converter efficiency explorer. This widget models a DAB topology with adjustable switching frequency, input voltage, phase shift, and load — showing the ZVS boundary and efficiency map.

```sim:sst-dab-efficiency
```

---

### SPICE Testbenches (Tier 3 — ngspice)

For circuit-level deep dives, two ngspice testbenches simulate the actual switching waveforms. These are the most detailed simulations available — they show transistor-level voltage and current traces, resonant tank oscillation, and ZVS transitions.

#### Testbench 1: iTCM AC/DC Stage

**File:** `spice/testbenches/sst_itcm_acdc.cir`

**Circuit:** A single-phase PFC rectifier with iTCM soft-switching. The grid source is 3.8 kV AC (L-N) at 50 Hz. An LCL filter interfaces to the grid. A parallel LC branch ($L_b$ = 120 µH, $C_b$ = 4.7 µF) generates the triangular current for ZVS. Two 10 kV SiC MOSFETs form a half-bridge switching at 50 kHz with 300 ns dead-time. The DC-link is 7 kV, loaded at 25 kW (1960 Ω).

**What to look for in the waveforms:**

| Plot | What It Shows | How to Interpret |
|------|--------------|------------------|
| `i(Lg)` | Grid-side inductor current | Should follow 50 Hz sinusoid with small HF ripple — confirms PFC operation |
| `i(Lb)` | Triangular branch current | Should be a triangle wave at 50 kHz — confirms iTCM action |
| `v(3)` | Switch node (half-bridge midpoint) | Should transition to 0V before gate-on — confirms ZVS |
| `v(6), v(7)` | Gate signals | Should show 300 ns dead-time between complementary pulses |
| `v(5)` | DC-link voltage | Should be stable at 7 kV with small ripple |

**To run:**

```bash
ngspice -b spice/testbenches/sst_itcm_acdc.cir -o output.txt
```

#### Testbench 2: SRC DC/DC Stage

**File:** `spice/testbenches/sst_src_dcdc.cir`

**Circuit:** A Series Resonant Converter (SRC) providing isolated DC/DC conversion from 7 kV to 400 V. The MV-side H-bridge (four 10 kV SiC MOSFETs) switches at 50 kHz. The resonant tank ($L_r$ = 200 µH, $C_r$ = 50 nF) is tuned to ~50.3 kHz — near resonance for "DC transformer" operation. An ideal transformer (n = 52:6) provides galvanic isolation. The LV-side synchronous rectifier uses four 1200 V SiC MOSFETs with a 300 ns phase shift for ZVS alignment.

**What to look for in the waveforms:**

| Plot | What It Shows | How to Interpret |
|------|--------------|------------------|
| `i(Lr)` | Resonant tank current | Should be sinusoidal at ~50 kHz — confirms resonance operation |
| `v(5)` | Primary (MV-side) voltage | Square wave at 50 kHz, 7 kV amplitude |
| `v(7)` | Secondary (LV-side) voltage | Square wave at 50 kHz, ~800 V amplitude (7 kV / 8.67 ratio) |
| `v(9)` | Output voltage | Should settle at ~400 V DC with small ripple |
| `v(10), v(11)` | MV-side gate signals | Complementary with 300 ns dead-time |
| `v(12), v(13)` | LV-side gate signals | Phase-shifted by 300 ns from MV-side for ZVS alignment |

**To run:**

```bash
ngspice -b spice/testbenches/sst_src_dcdc.cir -o output.txt
```

---

### Jupyter Notebook: Device Selection Optimizer (Tier 2)

**File:** `notebooks/sst/device-selection-optimizer.ipynb`

This notebook performs a systematic sweep of the SST design space, computing efficiency for every combination of MV grid voltage (3-35 kV), power level (25 kW - 10 MW), and SiC device class (1.2-10 kV). It produces three visualization sections:

1. **Efficiency bar charts** at three canonical operating points (25 kW/3.8 kV, 1 MW/13.8 kV, 10 MW/34.5 kV) — showing which device class wins at each scale
2. **2D efficiency heatmaps** for three device classes (1.7 kV, 3.3 kV, 10 kV) — showing the full design space with efficiency as color
3. **Optimal device selector map** — a single chart showing which device class is optimal at every operating point, with the three canonical points marked

**To run:**

```bash
cd notebooks/sst
pip3 install numpy matplotlib jupyter
jupyter notebook device-selection-optimizer.ipynb
```

Run all cells (Cell → Run All). Saved figures appear in `docs/assets/`.

---

### KiCad Schematic References

**Directory:** `kicad/`

CircuitSmith-compatible schematic references documenting the three core SST topologies:

| File | Topology | Description |
|------|----------|-------------|
| `kicad/README.md` | iTCM AC/DC cell | Single-cell PFC rectifier with iTCM LC branch, 10 kV SiC half-bridge, LCL filter |
| `kicad/README.md` | SRC DC/DC stage | Series Resonant Converter with MV-side H-bridge, resonant tank, MF transformer, LV-side rectifier |
| `kicad/README.md` | 5-cell ISOP stack | Input-Series Output-Parallel multi-cell architecture with cell bypass and N+2 redundancy |

Each schematic reference includes component value tables (inductor values, capacitor values, MOSFET part numbers, transformer specs) and SPICE simulation hooks pointing to the corresponding testbench files.

---

> **Next:** [Chapter 5 — VRM & Point-of-Load](05-vrm-and-pol.md) covers the final conversion stage from the 400 V DC bus (or 12 V rack rail) down to the sub-1 V chip supply, where multi-phase VRMs handle load transients of hundreds of amps per microsecond.
