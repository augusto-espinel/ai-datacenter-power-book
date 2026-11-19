# Chapter 3 — Transformer Engineering

> 📌 **Study Guide Notice:** For the foundational architecture-level overview of data center transformers, harmonic distortion, and low-voltage distribution, please refer directly to the corresponding chapters in the **[AI Data Center Guide](https://aidatacenterguide.com/)**:
> - **[Part 4.4 — Transformers, Harmonics & the AI Non-Linear-Load Problem](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-4-transformers-harmonics-and-the-ai-non-linear-load-problem)** *(Dry-type vs. liquid-filled transformers, K-factor ratings, harmonic spectrums of AI rectifiers, and thermal impacts)*
> - **[Part 4.6 — LV Distribution: Busway, PDUs, RPPs & Rack Power](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-6-lv-distribution-busway-pdus-rpps-and-rack-power)** *(Secondary distribution topologies from transformer terminals to rack busways)*
>
> *Disclaimer: To avoid duplicating existing industry documentation, the baseline architectural material covered in the links above is referenced directly. Additional electromagnetic modeling, harmonic loss derivations, and impedance/thermal dimensioning calculations not covered in the AI Data Center Guide will be added to this chapter progressively.*

---

## Planned Deep-Dive Additions (Beyond the Guide)

To complement the architectural selection criteria in Part 4.4 of the Guide, this chapter will add analytical and simulation models for 50/60 Hz MV/LV power transformers (for medium-frequency Solid-State Transformers, see **[Chapter 4](#ch04)**):

- **Harmonic Loss Decomposition & K-Factor Derating Math:** First-principles calculation of winding eddy-current losses ($P_{EC} \propto \sum I_h^2 h^2$) and stray losses ($P_{OSL} \propto \sum I_h^2 h^{0.8}$) under non-sinusoidal current waveforms (IEEE C57.110).
- **Short-Circuit Impedance ($u_k\%$) Trade-Off Optimization:** Balancing secondary fault-current limitation (switchgear kAIC rating) against voltage regulation under rapid AI cluster load steps ($\Delta V\%$ vs. reactive power demand).
- **Vector Group & Grounding Topologies:** Zero-sequence impedance, triplen harmonic trapping, and ground-fault current paths across $\text{Dyn11}$, $\text{Yyn0}$, and zig-zag phase-shifting configurations.
- **Electro-Thermal Aging & Pulsed Overload Capability:** Top-oil ($\Delta \theta_{TO}$) and winding hot-spot ($\Delta \theta_{HS}$) differential equations, thermal time constants, and insulation loss-of-life modeling (IEC 60076-7 / IEEE C57.91) under cyclic AI training workloads.
