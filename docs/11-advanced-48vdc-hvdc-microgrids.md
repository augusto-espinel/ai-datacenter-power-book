# Chapter 11 — DC Protection Engineering

> 📖 **Read first:**
> - [AI Data Center Guide — Part 4.7: The DC Power Revolution (DC protection section)](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-7-the-dc-power-revolution-48v-400v-800v-and-disaggregated-sidecar-power)
> - [AI Data Center Guide — Part 4.11: Grounding, Bonding, Earthing, Lightning Protection](https://aidatacenterguide.com/part-4-electrical-and-energy-infrastructure/4-11-grounding-bonding-earthing-lightning-protection-spd-and-emc)

> 🚧 **Status:** Architecture placeholder — content to be populated.

## What This Chapter Covers (That the Guide Doesn't)

The guide covers DC protection as part of the architectural decision. This chapter goes deeper into:

- **DC arc physics** — why no current zero-crossing makes interruption fundamentally different from AC
- **Breaker extinction techniques** — magnetic blowout, arc chute design, SF6 vs air vs vacuum for DC
- **Fuse I²t coordination** — melting integral, clearing time, selective coordination with upstream breakers
- **Connector selection and derating** — contact resistance, hot-plug sequencing, arc-on-disconnect

## Key Concepts (To Be Developed)

- DC fault current: capacitor bank discharge + battery contribution + grid contribution
- Arc energy: $E_{arc} = V_{arc} \cdot I_{arc} \cdot t_{clear}$
- Solid-state circuit breakers (SSCB) — ultra-fast MOSFET/GTO interruption, <1ms clearing
- OCP ORv3 BBU fault coordination
- ±400V vs 800V fault: pole-to-ground vs pole-to-pole scenarios

*Content will be developed step by step with Augusto.*
