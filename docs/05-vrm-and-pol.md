# Chapter 5 — VRM Design & Stability

> 📌 **Study Guide Notice:** For the foundational architecture-level overview of point-of-load power delivery, board-edge vs. vertical power delivery (VPD), and rack-to-silicon integration, please refer directly to the corresponding chapters in the **[AI Data Center Guide](https://aidatacenterguide.com/)**:
> - **[Part 7.12 — On-Package Power Delivery & Power Integrity](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-12-on-package-power-delivery-and-power-integrity)** *(48 V / 54 V intermediate bus conversion, lateral vs. vertical VRM architectures, integrated voltage regulators, and package power delivery)*
> - **[Part 7.14 — Server & System Integration](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-14-server-and-system-integration)** *(GPU baseboard topologies, busbar interfaces, and cold-plate mechanical/electrical co-design)*
>
> *Disclaimer: To avoid duplicating existing industry documentation, the baseline architectural material covered in the links above is referenced directly. Additional small-signal control derivations, compensation network synthesis, and circuit-level SPICE testbenches not covered in the AI Data Center Guide will be added to this chapter progressively.*

---

## Planned Deep-Dive Additions (Beyond the Guide)

Building on the architectural overview in Part 7.12 of the Guide, this chapter will focus on the circuit design and control loop stability of high-current multiphase Voltage Regulator Modules (VRMs):

- **Multiphase Interleaved Buck Converter Math:** Analytical derivation of phase count ($N$) vs. output current ripple cancellation, inductor volt-second balance, and coupled-inductor transient response acceleration.
- **Adaptive Voltage Positioning (AVP) & Load-Line Synthesis:** Designing the closed-loop output impedance ($Z_{out}(s) = R_{LL}$) so voltage droop is purposefully positioned across steady-state and transient windows ($\Delta V = -R_{LL} \cdot \Delta I$) to minimize peak-to-peak capacitor volume.
- **Small-Signal Modeling & Loop Compensation:** Bode plot analysis, Type III / digital PID compensator pole-zero placement, crossover frequency ($f_c$) vs. switching frequency limits, and phase/gain margin verification.
- **DrMOS / Smart Power Stage Characterization:** Extracting switching, conduction ($I_{rms}^2 R_{DS(on)}$), gate-drive, and body-diode reverse-recovery losses from datasheets, along with active current-balancing loops across parallel phases.
