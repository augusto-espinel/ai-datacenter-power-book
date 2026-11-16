# Chapter 8 — Thermal-Electrical Interface

> 📖 **Read first:** [AI Data Center Guide — Part 5: Cooling & Thermal Management (all 13 chapters)](https://aidatacenterguide.com/part-5-cooling-and-thermal-management)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers (That the Guide Doesn't)

The guide's Part 5 is a comprehensive 13-chapter treatment of cooling architecture. We do **not** reinvent that. This chapter focuses narrowly on the **power-thermal coupling** — where electrical engineering decisions create thermal consequences:

- **I²R thermal limits** — conductor sizing as a thermal problem, not just an ampacity lookup
- **Transient thermal response** — Rθ network modeling, thermal time constants, pulsed load handling
- **Power stage thermal design** — DrMOS junction temperature calculation, heatsink RθSA selection
- **Electrical efficiency → heat** — every lost watt becomes heat: where it goes and what it heats

## Key Concepts (To Be Developed)

- Thermal resistance network: $T_j = T_a + P \cdot (R_{\theta JC} + R_{\theta CS} + R_{\theta SA})$
- Transient thermal impedance: Foster and Cauer RC network models
- Conductor temperature rise: NEC Table 310.16 vs IEC 60364-5-52
- Busbar thermal design: Joule heating, skin effect at 50/60 Hz, forced air cooling

*Content will be developed step by step with Augusto.*
