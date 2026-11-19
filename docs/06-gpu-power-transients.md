# Chapter 6 — GPU Power Transients & PDN

> 📌 **Study Guide Notice:** For the foundational architecture-level overview of GPU accelerator power profiles, Power Delivery Network (PDN) impedance hierarchies, and system-level transient mitigation, please refer directly to the corresponding chapters in the **[AI Data Center Guide](https://aidatacenterguide.com/)**:
> - **[Part 7.12 — On-Package Power Delivery & Power Integrity](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-12-on-package-power-delivery-and-power-integrity)** *(PDN impedance hierarchy from VRM to package/on-die decoupling, voltage droop budgets, and power integrity fundamentals)*
> - **[Part 7.2 — NVIDIA Accelerators: Hopper, Blackwell, Vera Rubin, Rubin Ultra, Feynman](https://aidatacenterguide.com/part-7-compute-silicon-and-system-integration/7-2-nvidia-accelerators-hopper-blackwell-vera-rubin-rubin-ultra-feynman)** *(TDP vs. EDPp peak power envelopes and workload-induced current transients)*
> - **[Part 4.5 — UPS & Energy Storage: From Ride-Through to Transient Absorption](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-5-ups-and-energy-storage-from-ride-through-to-transient-absorption)** *(How synchronized GPU cluster load steps propagate upstream to rack, row, and facility power levels)*
>
> *Disclaimer: To avoid duplicating existing industry documentation, the baseline architectural material covered in the links above is referenced directly. Additional frequency-domain impedance derivations, decoupling network synthesis, and circuit-level transient models not covered in the AI Data Center Guide will be added to this chapter progressively.*

---

## Planned Deep-Dive Additions (Beyond the Guide)

Where the AI Data Center Guide establishes the architectural PDN hierarchy, this chapter will provide the circuit-level equations and simulation models needed to design a flat-impedance PDN across six decades of frequency:

- **Time-Domain Droop Decomposition:** First-principles breakdown of the instantaneous voltage droop equation under a high-$dI/dt$ current step:
  $$\Delta V(t) = L_{loop} \frac{di(t)}{dt} + R_{ESR} \Delta I(t) + \frac{1}{C} \int_0^t \Delta i(\tau) \, d\tau$$
- **Target Impedance ($Z_{target}$) & Anti-Resonance Damping:** Synthesizing multi-tier capacitor banks (bulk electrolytic/polymer $\rightarrow$ board MLCC $\rightarrow$ package land-side/die-side MLCC $\rightarrow$ on-die MIM capacitance) to maintain $|Z_{PDN}(j\omega)| \le \frac{\Delta V_{max}}{\Delta I_{max}}$ while damping parallel LC anti-resonance peaks between stages.
- **Parasitic Inductance Extraction & BGA/Via Array Geometry:** Calculating loop and mutual inductance ($L_{self}$, $M$) across PCB planes and package power/ground pin checkerboards.

---

## Interactive Simulation

Explore how GPU load-step slew rate ($dI/dt$), nominal core voltage ($V_{DD}$), decoupling capacitance ($C$), and equivalent series resistance ($\text{ESR}$) govern the first-droop and recovery trajectory:

```sim:gpu-transient
```
