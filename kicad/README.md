# KiCad Schematic References for SST Chapter

These schematics are designed to be compatible with CircuitSmith and KiCad 7+.
Each file describes the topology, component values, and SPICE simulation hooks.

## Schematic 1: `sst-itcm-cell.kicad_sch` — iTCM AC/DC Cell

### Topology
```
                    iTCM AC/DC          Isolated DC/DC
MV-AC ──LCL──┬─── 10 kV SiC ───┬─── 10 kV SiC ──── MF Tr ──── 1200 V SiC ─── 400 V DC
  3.8 kV     │   Half-Bridge   │   Half-Bridge    n=52:6    Full-Bridge
             │                 │                            (3× parallel)
            Lg    7 kV        Lb,Cb         Cr
            DC-link
```

### Key Components
| Ref | Component | Value | Notes |
|-----|-----------|-------|-------|
| Lg | Grid inductor | 47 mH | LCL filter grid-side |
| Cf | Filter cap | 2 µF | LCL filter shunt |
| Lb | iTCM inductor | 120 µH | Triangular current generation |
| Cb | iTCM capacitor | 4.7 µF | LF blocking, HF resonance |
| Q1,Q2 | 10 kV SiC MOSFET | CPM3-10000-0350 | AC/DC half-bridge |
| Cdc | DC-link cap | 100 µF | 7 kV DC bus |
| Q3,Q4 | 10 kV SiC MOSFET | CPM3-10000-0350 | DC/DC primary H-bridge |
| Lr | Resonant inductor | 200 µH | Leakage + discrete |
| Cr | Resonant cap | 50 nF | Series resonant tank |
| T1 | MF transformer | n=52:6 | Nanocrystalline core |
| Q5-Q8 | 1200 V SiC MOSFET | C2M0025120D | LV-side rectifier (3× parallel) |

### SPICE Hook
Export to SPICE via KiCad → ngspice. Use testbench `spice/testbenches/sst_itcm_acdc.cir`.

## Schematic 2: `sst-src-dcdc.kicad_sch` — SRC DC/DC Stage

### Topology
```
DC-in ── H-bridge ── Lr,Cr ── MF Transformer ── Sync Rectifier ── LC filter ── DC-out
7 kV     Q1-Q4       resonant    n=8.67:1         Q5-Q8           Lout,Cout    400 V
                     tank
```

### Key Components
| Ref | Component | Value | Notes |
|-----|-----------|-------|-------|
| Q1-Q4 | MV-side H-bridge | 10 kV SiC | Primary switching |
| Lr | Resonant inductor | 200 µH | f_res ≈ 50 kHz |
| Cr | Resonant cap | 50 nF | Series resonance |
| T1 | MF transformer | n=52:6 | Galvanic isolation |
| Q5-Q8 | LV-side sync rect | 1200 V SiC | Secondary rectification |
| Cout | Output cap | 470 µF | 400 V DC bus |

### SPICE Hook
Use testbench `spice/testbenches/sst_src_dcdc.cir`.

## Schematic 3: `sst-isop-stack.kicad_sch` — 5-Cell ISOP Architecture

### Topology
```
         ┌──── Cell 1 ────┐  ┌──── Cell 2 ────┐        ┌──── Cell 5 ────┐
MV-AC ──┤  PFC + DC/DC   ├──┤  PFC + DC/DC   ├──...──┤  PFC + DC/DC   ├── 800 V DC
         └────────────────┘  └────────────────┘        └────────────────┘
              ↑                      ↑                          ↑
          V_cell = V_MV/N       V_cell = V_MV/N            V_cell = V_MV/N
```

### Cell Bypass Circuit
Each cell has a bypass switch (SCRS) that activates on cell failure.
N+2 redundancy: 5 cells rated, 3 required → 2 spare.
