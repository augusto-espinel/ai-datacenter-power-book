# Chapter 2 — MV Switchgear & Protection Coordination

> 📌 **Study Guide Notice:** For the foundational architecture-level overview of utility interconnection, substation design, and grid compliance, please refer directly to the corresponding chapters in the **[AI Data Center Guide](https://aidatacenterguide.com/)**:
> - **[Part 4.2 — Utility Interconnect, On-Site Substation & MV Distribution](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-2-utility-interconnect-on-site-substation-and-mv-distribution)** *(HV/MV intake, primary-selective and ring bus arrangements, MV switchgear selection, and protection schemes)*
> - **[Part 4.3 — Substation & Transmission Ownership, Operations & NERC Compliance](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-3-substation-and-transmission-ownership-operations-and-nerc-compliance)** *(Substation demarcation, utility interface requirements, and operational compliance)*
> - **[Part 4.10 — Grid-Interactive Behavior: Ride-Through, Reactive/Voltage Support & Frequency](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-10-grid-interactive-behavior-ride-through-reactive-voltage-support-and-frequen)** *(Fault ride-through curves, reactive power capability, and synchronous/load step interactions with the transmission grid)*
>
> *Disclaimer: To avoid duplicating existing industry documentation, the baseline architectural material covered in the links above is referenced directly. Additional protection-engineering calculations, relay coordination curves, and short-circuit dimensioning workflows not covered in the AI Data Center Guide will be added to this chapter progressively.*

---

## Planned Deep-Dive Additions (Beyond the Guide)

Where the AI Data Center Guide covers substation topology and grid-level policy, this chapter will focus on quantitative protection and switchgear engineering:

- **Time-Current Characteristic (TCC) Curve Coordination:** Analytical and graphical methods for coordinating inverse-time ($51$), definite-time, and instantaneous ($50$) overcurrent elements across MV feeders, transformers, and LV main breakers, including selectivity margins and zone-selective interlocking (ZSI).
- **Short-Circuit Current & Busbar Mechanical/Thermal Withstand:** Calculating symmetrical and asymmetrical peak fault currents ($I_k''$, $i_p$), $I^2t$ thermal stress, and electrodynamic forces on MV switchgear busbars (IEC 60909 / ANSI C37).
- **Differential & Directional Protection in Ring/Closed-Transition Topologies:** Setting transformer differential ($87\text{T}$), busbar differential ($87\text{B}$), and directional overcurrent ($67$) relays in dual-fed MV distribution rings.
- **Fault Ride-Through vs. Protection Tripping Margins:** Coordinating substation under-voltage/frequency relays with downstream UPS and power converter ride-through envelopes to prevent cascading cluster disconnects.
