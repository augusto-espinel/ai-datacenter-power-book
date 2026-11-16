# Chapter 4 — Solid-State Transformers: Replacing the 50 Hz Workhorse

> 📖 **Read first:**
> - [AI Data Center Guide — Part 4.7: The DC Power Revolution (SST section)](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-7-the-dc-power-revolution-48v-400v-800v-and-disaggregated-sidecar-power)
> - [AI Data Center Guide — Part 4.4: Transformers, Harmonics & SST harmonics context](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-4-transformers-harmonics-and-the-ai-non-linear-load-problem)

> 📚 **Primary reference:** D. ETH Zurich, *"10 kV SiC-Based Medium-Voltage Solid-State Transformer for Data Center Power Supplies,"* PhD dissertation, ETH Zurich, 2019. All measured efficiency figures, topology comparisons, and design trade-offs cited in this chapter originate from this work unless otherwise noted.

---

## 4.1 Why Replace the Low-Frequency Transformer?

The traditional data center power chain — from the MV-AC grid to the 12 V DC server supply — passes through **four to six cascaded conversion stages**, each dissipating 2–5% of the transmitted power. Measurements from operational data centers show that **12–27% of the energy delivered at MV level is lost in power conversion alone** before reaching the IT load [ETH Zurich 2019, §1.2].

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
|-----------|----------------|-----|
| Efficiency (MV-AC → LV-DC) | ~94–96% | Up to **98.1%** (measured) |
| Power density | ~0.4 kW/L | Up to **1.76 kW/L** (measured) |
| Controllability | None (passive) | Full (reactive power, fault handling) |
| Bidirectional | No (needs separate inverter) | Yes (inherent) |
| Grid monitoring | None | Yes |
| Initial cost | Lower | Higher |
| Operating cost | Higher (losses) | Lower |
| Reliability | Very high (mature) | Developing (MV insulation, semiconductors) |

The SST **outperforms** the LFT solution specifically for **MV-AC to LV-DC conversion** — exactly the use case in modern data centers. For pure AC/AC isolation (same frequency in and out), SSTs perform worse than LFTs and are not recommended [ETH Zurich 2019, §1.1].

---

## 4.3 The Data Center Motivation

The ICT sector consumes approximately **10% of the world's generated electric energy** [ETH Zurich 2019, §1.2], and data centers are the fastest-growing segment. The power supply chain in a conventional data center involves:

```
MV-AC Grid → LFT → UPS → PDU (LFT) → PSU (PFC + DC/DC) → Server
  35 kV      480V    480V     208V        400V/12V
```

Each arrow represents a conversion with associated losses. The shift to **400 V DC distribution** (Chapter 11) eliminates the UPS, one LFT, and the rack-internal PFC rectifier, improving efficiency by ~7%. But the remaining LFT — stepping from MV to 400 V — is still a 50 Hz component in a DC system.

The SST-based architecture goes further:

```
MV-AC Grid → SST → 400 V DC Bus → Server Rack DC/DC → Server
  6.6 kV      400V      12V
```

The SST **directly interfaces the MV-AC grid to the 400 V DC bus**, eliminating the LFT entirely. Power is distributed at MV level throughout the data center (e.g., 6.6 kV phase-to-phase, 3.8 kV phase-to-neutral), with individual single-phase SSTs feeding each server rack at 20–40 kW. The advantages of MV distribution include:

- **Lower cable cross-sections** (for the same power, current scales as $1/V$)
- **Lower ohmic losses** in distribution cabling ($P_{\text{loss}} \propto I^2$)
- **Per-rack power conversion**, enabling redundancy and granular control
- **Bidirectional energy flow** for integrating on-site renewables or battery storage

### System Specifications (ETH Zurich SST)

| Parameter | Symbol | Value |
|-----------|--------|-------|
| Rated power | $P$ | 25 kW |
| MV-side AC voltage (rms) | $u_g$ | 3.8 kV |
| LV-side DC voltage | $U_{\text{DC,LV}}$ | 400 V |
| Mains frequency | $f_g$ | 50 Hz |
| Target efficiency | $\eta_{t,\text{SST}}$ | **98%** |
| Achieved efficiency (measured) | $\eta_{\text{SST}}$ | **98.1%** |
| Achieved power density | $\rho_{\text{SST}}$ | **1.76 kW/L** |

The 98% efficiency target was mandated by the **Swiss National Research Program 70** as part of the Swiss Energy Strategy 2050, which requires a 13% per-capita decrease in electric energy consumption by 2035 compared to 2000. This means the SST must generate **less than half the losses** of the benchmark commercial benchmark SST (96% efficiency at full load).

---

## 4.4 SST Key Challenges

The transition from LFT to SST is not straightforward. Four fundamental engineering challenges must be solved:

### 4.4.1 Interfacing the Medium-Voltage Grid

The MV-side of the SST must block several kilovolts. There are two architectural approaches:

**Multi-cell approach:** Series-connect several low-voltage converter cells (1200–1700 V SiC MOSFETs or IGBTs), each handling a fraction of the total blocking voltage. This is mature but **highly complex** — a 25 kW SST might use 5–10 ISOP-connected cells, each with its own gate drivers, isolated supplies, sensors, and control circuitry. The commercial benchmark benchmark uses five ISOP cells.

**Single-cell approach:** Use emerging **10–15 kV SiC MOSFETs** to interface the MV grid directly with one converter cell. This dramatically reduces complexity but demands careful MV insulation and device handling. The ETH Zurich SST uses Wolfspeed CPM3-10000-0350 (10 kV, 20 A, 3rd generation) devices.

> **Design rule:** The single-cell approach is superior when 10 kV SiC devices are available — the ETH Zurich SST achieves **4× the power density** and **2.1% higher efficiency** than the multi-cell commercial benchmark benchmark, with fewer components and lower complexity.

### 4.4.2 Medium-Voltage Insulation at Medium Frequency

This is the **most underappreciated challenge** in SST design. In a conventional LFT, oil insulation and large physical dimensions make dielectric losses negligible. In an SST, the MF transformer operates at 50 kHz and several kilovolts — a regime where:

1. **Dielectric losses become significant.** The dissipation factor $\tan \delta$ of the insulation material causes losses proportional to $E^2 \cdot f \cdot \tan \delta$ (where $E$ is the electric field and $f$ is the switching frequency). Standard epoxy resin can experience **thermal runaway** and destruction under these conditions [ETH Zurich 2019, §5.3.4].

2. **Thermal extraction is harder.** The MF transformer is compact, meaning less surface area for heat extraction. Winding losses must be conducted **through the insulation material** to reach cooling surfaces — requiring high thermal conductivity.

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

> **The verdict:** The single-cell IBE approach, enabled by 10 kV SiC MOSFETs, is the **clear winner** for data center SSTs. The ETH Zurich SST demonstrates **98.1% efficiency** and **1.76 kW/L** power density — outperforming the multi-cell commercial benchmark benchmark by **2.1% efficiency** (i.e., less than half the losses) and **4.4× power density**.

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

The ETH Zurich SST generates **less than half the losses** of the commercial benchmark benchmark while being **4.4× smaller**. This demonstrates that the single-cell approach with 10 kV SiC devices is fundamentally superior to multi-cell topologies for data center SSTs.

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

## 4.10 The Path to Deployment

### What's Ready Now

- **10 kV SiC MOSFETs** (Wolfspeed CPM3 series) are commercially available and demonstrate outstanding performance under soft-switching conditions
- **Single-cell SST topology** has been validated at 25 kW, 98.1% efficiency
- **MF MV transformer technology** including silicone insulation and VPP process is proven
- **iTCM soft-switching** enables switching frequencies 5× higher than hard-switched PWM at MV

### What's Still Needed

- **10 kV SiC device maturation:** Current devices are single-chip, 20 A modules. Higher current ratings or module-level integration (with built-in gate drivers) would simplify converter design.
- **Cost reduction:** 10 kV SiC devices are still expensive. Volume production and competing technologies (e.g., GaN at lower voltages, Si IGBTs at higher voltages) will drive costs down.
- **MV circuit breakers:** Standard MV breakers are large and designed for much higher currents. Compact solid-state or hybrid breakers matching the SST's power density are needed.
- **Long-term reliability data:** The SST has been validated in laboratory conditions. Field deployment data over 10+ years is needed to prove reliability comparable to LFTs.
- **Dielectric material improvement:** Even the silicone compound's $\tan \delta = 0.8\%$ generates measurable losses. Materials with lower dissipation factor and higher thermal conductivity would further improve transformer power density.

### The Scaling Path

The ETH Zurich SST is rated at 25 kW per single-phase unit. For three-phase data center applications:

- **3 × single-phase SSTs** (one per phase) → 75 kW per rack cluster
- **Direct MV-AC to 400 V DC** conversion eliminates all intermediate stages
- **Per-rack granularity** → natural redundancy, no single point of failure for the data center

For higher power levels (e.g., 100+ kW per rack with next-generation GPUs), the SST can be scaled by:
- Parallel operation of multiple SSTs on the LV-side
- Higher current 10 kV SiC devices (in development)
- Multi-phase interleaved iTCM for lower ripple and higher effective frequency

---

## 4.11 Key Takeaways

1. **SSTs replace the LFT** for MV-AC to LV-DC conversion in data centers, eliminating the largest passive component and enabling per-rack power conversion at 98.1% efficiency.

2. **10 kV SiC MOSFETs** are the enabling technology — they allow single-cell topologies with dramatically lower complexity than multi-cell approaches.

3. **Soft-switching is essential** at MV. The iTCM topology reduces AC/DC switching losses by 30×, enabling 99.1% efficiency in the AC/DC stage.

4. **MF MV transformer insulation** is the hidden challenge. Dielectric losses at 50 kHz + several kV can cause thermal runaway in standard materials. Silicone-based insulation with vacuum pressure potting is required.

5. **Calorimetric measurement** is the only reliable way to verify > 99% efficiency. Electrical methods have insufficient accuracy at these efficiency levels.

6. **The single-cell approach wins** on both efficiency and power density — 98.1% and 1.76 kW/L vs. 96% and 0.4 kW/L for the multi-cell benchmark.

7. **Parasitic capacitance, not inductance**, is the primary layout concern in MV converters. This inverts standard LV design rules.

---

## Interactive Simulation

```sim:sst-dab-efficiency
```

### SPICE Testbench

A ngspice-based DAB switching testbench is available for circuit-level simulation:

- **Testbench:** `spice/testbenches/dab_switching.cir`
- **Models:** 10 kV SiC MOSFET behavioral model, MF transformer subcircuit
- **Measurements:** ZVS boundary mapping, soft-switching loss extraction, efficiency vs. load

---

> **Next:** [Chapter 5 — VRM & Point-of-Load](05-vrm-and-pol.md) covers the final conversion stage from the 400 V DC bus (or 12 V rack rail) down to the sub-1 V chip supply, where multi-phase VRMs handle load transients of hundreds of amps per microsecond.
