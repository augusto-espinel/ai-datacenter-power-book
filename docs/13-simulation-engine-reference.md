# Chapter 13 — Simulation Engine Reference

> 🚧 **Status:** Architecture placeholder — content to be populated.

## Overview

This chapter documents the simulation architecture embedded in the book and how to extend it.

## Tier 1: Canvas Widgets (Built-in)

Zero-dependency JavaScript widgets running directly in the browser via Canvas API.

### Available Widgets

| Widget ID | Description | Used In |
|-----------|-------------|---------|
| `gpu-transient` | dI/dt step response with VRM + decoupling model | Ch. 1, Ch. 6 |
| `sst-dab-efficiency` | DAB converter efficiency map with ZVS indicator | Ch. 4 |
| `pue-thermal` | Energy flow breakdown with PUE calculation | Ch. 9 |

### Embedding a Widget in Markdown

In any chapter `.md` file, use a fenced code block with the `sim:` prefix:

````
```sim:gpu-transient
```
````

### Adding New Widgets

Register a new widget in `docs/sims/sim-widgets.js`:

```javascript
SimWidgets.register('my-widget', function(container) {
  var card = createCard(container, {
    id: 'my-widget', badge: 'CUSTOM',
    title: 'My Simulation', subtitle: 'Description'
  });
  // Add sliders, canvas drawing, KPIs...
});
```

## Tier 2: Python Notebooks

Jupyter notebooks for computational analysis (load flow, thermal modeling, cable sizing).

- Stored in `notebooks/` directory
- Pre-rendered to static HTML via `jupyter nbconvert --to html`
- Embedded in chapters as iframe links or Binder/Colab badges

## Tier 3: ngspice / PySpice

Full circuit simulation for VRM transient, SST DAB switching, PFC stages.

- SPICE models stored in `spice/models/`
- Subcircuits in `spice/subcircuits/`
- Testbenches in `spice/testbenches/`
- Run via `ngspice -b testbench.cir -o output.txt`
- PySpice wrapper for Python-driven parameter sweeps

*Content will be developed step by step with Augusto.*
