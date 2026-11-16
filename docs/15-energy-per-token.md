# Chapter 15 — Energy Per Token: The Full Cost of AI Inference

> 📖 **Related guide references:**
> - [AI Data Center Guide — Part 15.1: Efficiency Metrics](https://aidatacenterguide.com/part-15-sustainability-and-efficiency/15-1-efficiency-metrics-pue-wue-erf-ref-and-the-post-pue-metric-stack)
> - [AI Data Center Guide — Part 7.12: On-Package Power Delivery](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-12-on-package-power-delivery-and-power-integrity)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers

This is the capstone chapter that connects everything in this book to the actual unit of AI work: **a single token of inference**. It answers the question: *when I generate one token, how much energy was consumed to produce it — and where did that energy go?*

The cost of a token is not just the joules consumed by the GPU at the moment of generation. It includes:

1. **Inference electricity** — the GPU power at the instant of token generation
2. **Power chain losses** — every conversion stage from MV to die (this book's core topic)
3. **Cooling overhead** — the PUE multiplier (→ Ch. 9)
4. **Data center embodied energy** — amortized construction, manufacturing, and decommissioning
5. **Training energy amortization** — the energy to train the model, spread over its inference lifetime

## The Energy Stack Per Token

### Layer 1: GPU Die-Level Energy

The fundamental equation:

$$E_{token}^{GPU} = \frac{P_{GPU}}{T}$$

where $P_{GPU}$ is GPU board power (watts) and $T$ is throughput (tokens/second).

**Measured values (2026 benchmarks):**

| GPU | Model | Batch | Power Draw | Throughput | J/Token | Source |
|-----|-------|-------|-----------|------------|---------|--------|
| H100 SXM | — | — | 700W (TDP) | — | — | NVIDIA spec |
| B200 | Qwen3 32B | 128 | ~1000W | ~4,800 t/s | **0.209** | ML.ENERGY (arXiv 2601.22076) |
| B200 | Qwen3 32B | 512 | ~1000W | ~6,600 t/s | **0.151** | ML.ENERGY |
| H200 NVL | 20-27B params | high load | 337W | varies | **0.003–1.0** | Watt Counts (arXiv 2604.09048) |

> **Key insight:** Batch size is the dominant lever. Going from batch 128 to 512 on B200 cut energy per token by 28%. At low load, an H200 draws only ~125W (1/5 of TDP) but produces few tokens — so *energy per token can be higher at low utilization*.

### Layer 2: Server Node Energy

The GPU doesn't work alone. A typical 8×H100 node draws ~10–10.5 kW total (GPUs + CPUs + memory + networking + fans). The node-level energy per token is:

$$E_{token}^{node} = \frac{P_{node}}{T_{node}} = E_{token}^{GPU} \times \frac{P_{node}}{P_{GPU} \times N_{GPU}}$$

Typically the node multiplier is ~1.3–1.5× the GPU-only energy.

### Layer 3: Data Center Energy (PUE)

The full facility energy includes cooling, UPS losses, lighting, and distribution:

$$E_{token}^{DC} = E_{token}^{node} \times PUE$$

| Operator | PUE | Source |
|----------|-----|--------|
| Google (global fleet) | 1.09 | Google disclosure |
| Microsoft | 1.16–1.17 | Microsoft disclosure |
| Industry average | 1.54 | IEA |

**So a token that costs 0.15 J at the GPU die costs ~0.17 J at Google's facility or ~0.23 J at an average DC.**

### Layer 4: Embodied/Amortized Data Center Energy

The building itself consumed energy to construct. Steel, concrete, copper, transformers, chillers — all have embodied energy.

| Component | Embodied Energy | Notes |
|-----------|----------------|-------|
| Data center building | ~2,000–5,000 kWh/m² | Construction, materials, MEP |
| H100 GPU (manufacturing) | ~30–50 kWh per GPU | Wafer fabrication, packaging, HBM |
| Power infrastructure (transformers, switchgear, UPS) | ~500–2,000 kWh per MW of capacity | |

Amortized over a data center's ~15-year lifespan and ~10¹⁸ tokens of lifetime inference, embodied energy adds roughly **0.01–0.05 J/token** — small but non-zero.

### Layer 5: Training Energy Amortization

Training a frontier model consumes enormous energy. This cost is amortized over every inference token the model ever generates.

| Model | Training Energy (est.) | Training Tokens | J/Training-Token | Inference Lifetime (est.) | J/Inference-Token (amortized) |
|-------|----------------------|-----------------|-------------------|--------------------------|-------------------------------|
| GPT-4 (~1.7T params) | ~50 GWh | ~13T tokens | ~14 J/token | ~10¹⁴–10¹⁵ inference tokens | **0.0001–0.001 J** |
| Llama 3 70B | ~3–5 GWh | ~15T tokens | ~1 J/token | ~10¹⁴ inference tokens | **~0.0001 J** |
| Small model (7B) | ~0.1–0.5 GWh | ~2T tokens | ~0.2 J/token | ~10¹³ inference tokens | **~0.0001 J** |

Training energy per inference token is tiny *if the model serves billions of queries*. It becomes significant for models with short deployment lifespans or low utilization.

## Interactive Simulation

```sim:energy-per-token
```

## Case Study: Triantica's Token Energy Footprint

The Triantica project provides a rare opportunity: we know **exactly** how many tokens were processed, by which models, and at what cost. The full token economics are documented in the [Triantica Training Book, Appendix D](https://github.com/augusto-espinel/Triantica/blob/main/docs/training-book/appendix_d.md).

### The Numbers

| Metric | Value | Source |
|--------|-------|--------|
| Total billed tokens (prompt + completion) | **1.18 billion** | OpenRouter billing API |
| Uncached input tokens (actual compute) | **81.3 million** | OR billing (31.5M GLM-5 + 49.8M Argon) |
| Completion tokens | **3.23 million** | OR billing (2.03M GLM-5 + 1.20M Argon) |
| Total invoiced cost | **$267.00** | OR billing API |
| Duration | **15 days** | Day 1–15 |
| Local hardware | Mac Studio M2 Ultra (200W avg) | — |
| Remote inference hardware | OpenRouter GPUs (H100/B200-class) | — |

### Energy Calculation

**Local Mac Studio energy (derived from training session logs):**

Apple's official specifications (support.apple.com/en-us/102027) rate the Mac Studio M2 Ultra (24-core CPU, 76-core GPU, 192GB) at:

| State | Power Draw |
|-------|-----------|
| Idle (Finder only) | **10 W** |
| Max (compute-intensive benchmark) | **295 W** |

Rather than assuming a flat average, we can derive the actual GPU-active time from the Triantica training session logs (`dashboard/data/*.json`), which record `startedAt` and `endedAt` timestamps for every experiment:

| Experiment | Duration | Source |
|-----------|----------|--------|
| TF-B1_optimized | 47 min | JSON timestamp |
| TF-B1_pure | 38 min | JSON timestamp |
| TF-B2_mixed | 39 min | JSON timestamp |
| TF-B4_replay | 42 min | JSON timestamp |
| TF-B5_conv | 42 min | Experiment reference table |
| TF-B6_optimized | 42 min | Experiment reference table |
| TF-B8-V2 | 432 min (7.2h) | JSON timestamp |
| TF-B8 | 309 min (5.2h) | JSON timestamp |
| TF-B9 | 293 min (4.9h) | JSON timestamp |
| TF-B10 | 161 min (2.7h) | JSON timestamp |
| TF-B12 | 270 min (4.5h) | JSON timestamp |
| TF-B13 | 341 min (5.7h) | JSON timestamp |
| TF-B14 | 397 min (6.6h) | JSON timestamp |
| TF-B15 | 585 min (9.8h) | JSON timestamp |
| exp20, exp22 + earlier brain.js | ~66 min | Experiment reference table |
| **Total GPU-active training** | **~51.8 hours** | |

Over the 15-day project (360 hours total), this gives three distinct power regimes:

| Regime | Hours | Power (W) | Rationale |
|--------|-------|-----------|----------|
| **Training (GPU via Metal)** | 51.8h | ~220W | Sustained TF.js matrix ops on M2 Ultra GPU (below 295W max since not 100% CPU+GPU) |
| **Active coding (agentic)** | ~92.5h | ~25W | OpenClaw runtime, API calls, file I/O, git (30% of non-training time) |
| **Truly idle** | ~215.8h | ~15W | Machine on but waiting (70% of non-training time) |

$$E_{local} = (51.8 \times 220) + (92.5 \times 25) + (215.8 \times 15) = 16{,}933 \text{ Wh} \approx 16.9 \text{ kWh} = 61.0 \text{ MJ}$$

This is derived from actual session timestamps rather than a flat power assumption. The training sessions account for **48.8%** of local energy despite being only **14.4%** of calendar time — the GPU compute density during training dominates the energy profile.

**Remote GPU inference energy (the actual token compute):**

Only uncached tokens require fresh prefill computation. Cached tokens (KV-cache reuse) cost ~10× less energy.

$$E_{remote} \approx (81.3\text{M uncached} \times 0.2\text{ J/token}) + (3.23\text{M completion} \times 0.5\text{ J/token}) \approx 17.8\text{ MJ} = 0.005\text{ kWh}$$

**With data center overhead (PUE ~1.3):**
$$E_{remote+DC} \approx 17.8 \times 1.3 \approx 23.1\text{ MJ} = 0.0064\text{ kWh}$$

### The Insight

| Energy Component | Value | % of Total |
|-----------------|-------|------------|
| Mac Studio — Training (51.8h @ 220W) | 41.0 MJ (11.4 kWh) | **48.8%** |
| Mac Studio — Active coding (92.5h @ 25W) | 8.3 MJ (2.3 kWh) | **9.9%** |
| Mac Studio — Idle (215.8h @ 15W) | 11.7 MJ (3.2 kWh) | **13.9%** |
| Remote GPU inference (actual token compute) | 17.8 MJ (0.005 kWh) | **21.2%** |
| DC overhead on remote inference (PUE 1.3) | 5.3 MJ (0.0015 kWh) | **6.3%** |
| Training amortization (negligible for API calls) | ~0.001 MJ | **<0.1%** |
| **Total** | **~84 MJ (23.4 kWh)** | **100%** |

> **The insight:** The actual GPU computation to generate 1.18 billion tokens consumed only **21%** of the project's total energy. The local Mac Studio's training sessions (51.8h of GPU-active TF.js compute at ~220W) consumed **49%** — nearly half of all energy. The *agent runtime* (coding + idle) added another **24%**. This reveals a key dynamic for AI projects that include local model training: the training phase, not inference, is often the dominant energy cost.

### Per-Token Energy

| Scope | Energy/Token |
|-------|-------------|
| Remote inference only (81.3M uncached + 3.23M completion) | **0.21 J/token** |
| Full project (all 1.18B billed tokens) | **0.071 J/token** (84 MJ ÷ 1.18B) |
| Full project (÷ completion tokens only) | **26 J/completion-token** |

> The per-completion-token cost of ~26 J is roughly **130× the raw GPU inference energy** (~0.2 J/token). This overhead comes from two sources: (1) the Mac Studio's GPU-active training sessions (51.8h at ~220W), and (2) the massive prompt-token inflation of agentic workflows — most of the 1.18B billed tokens were context re-sends, not new output. The training session energy is actually the *largest single component* of the project's energy footprint, which is an important insight for AI projects that include local model training as part of the development cycle.

### Connecting to the Power Chain

This is where the rest of this book comes in. The 0.2 J/token at the GPU die becomes:

| Stage | Multiplier | Cumulative J/Token |
|-------|-----------|-------------------|
| GPU die | 1.0× | 0.20 |
| + Node overhead (CPU, memory, fans) | 1.35× | 0.27 |
| + Rack PDU + busway losses (~2%) | 1.02× | 0.28 |
| + UPS losses (~3%) | 1.03× | 0.29 |
| + Transformer losses (~1.5%) | 1.015× | 0.29 |
| + Cooling (PUE 1.2 for liquid-cooled) | 1.2× | 0.35 |
| **Full grid-to-chip** | **1.75×** | **0.35** |

Every stage in this book's chapters (Ch. 2–8) adds a few percent to the per-token energy. Understanding where those losses occur — and how to minimize them — is the system engineer's job.

## Key Concepts (To Be Developed)

- Vendor-disclosed per-query energy (Google 0.24 Wh, OpenAI 0.34 Wh, Microsoft 0.31 Wh)
- Reasoning models and test-time scaling: 13× more energy per query
- Carbon intensity of inference by region (grid mix matters as much as PUE)
- The training-inference energy ratio and why amortization favors high-utilization models
- Embodied carbon of the data center building vs. operational carbon

## References

- Microsoft Research (2026), "Energy use of AI inference, efficiency pathways, and test-time scaling", *Joule* (arXiv:2509.20241)
- ML.ENERGY Benchmark, "Where Do the Joules Go?", arXiv:2601.22076v2 (Jan 2026)
- Watt Counts benchmark, arXiv:2604.09048v1 (April 2026)
- Google, "Measuring the environmental impact of AI inference" (2026 blog)
- OpenAI, "The Gentle Singularity" (Sam Altman blog, 2026)
- IEA, "Energy and AI" report (2024)
- NVIDIA H100/H200/B200 specifications and product briefs

*Content will be developed step by step with Augusto.*
