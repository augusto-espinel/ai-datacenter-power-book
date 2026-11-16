# Chapter 6 — GPU Power Transients

> 🚧 **Status:** Architecture placeholder — content to be populated.

## Overview

Modern GPUs exhibit transient current steps of 500–2000 A/µs. This chapter covers the decoupling network design, bulk capacitance sizing, and the physics of dI/dt.

## Key Concepts (To Be Developed)

- dI/dt and the voltage droop equation: $\Delta V = L \cdot \frac{di}{dt}$
- Decoupling hierarchy: bulk (electrolytic) → mid (ceramic) → local (MLCC on package)
- ESR × C time constant and recovery window
- NVIDIA TVR (Transient Voltage Response) specification
- PCB loop inductance and capacitor placement

## Interactive Simulation

```sim:gpu-transient
```

*Content will be developed step by step with Augusto.*
