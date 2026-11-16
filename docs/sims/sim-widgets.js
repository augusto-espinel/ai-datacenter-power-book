/* ══════════════════════════════════════════════════════════════
   SIM WIDGETS — Live Electrical & Thermal Simulation Framework
   Zero-dependency Canvas oscilloscope + parameter sliders.
   Chapter MD embeds via:  ```sim:widget-id
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const REGISTRY = {};

  function register(id, factory) { REGISTRY[id] = factory; }

  function mount(container, simId) {
    const factory = REGISTRY[simId];
    if (!factory) {
      container.innerHTML = '<div class="sim-error">⚠️ Unknown simulation: <code>' + simId + '</code></div>';
      return;
    }
    factory(container);
  }

  // ── Card scaffold ──
  function createCard(container, opts) {
    container.innerHTML =
      '<div class="sim-card">' +
        '<div class="sim-header">' +
          '<div class="sim-title-wrap">' +
            '<span class="sim-badge">' + (opts.badge || 'LIVE') + '</span>' +
            '<span class="sim-title">' + opts.title + '</span>' +
          '</div>' +
          '<span class="sim-subtitle">' + (opts.subtitle || '') + '</span>' +
        '</div>' +
        '<div class="sim-body">' +
          '<div class="sim-controls" id="' + opts.id + '-controls"></div>' +
          '<div class="sim-canvas-wrap">' +
            '<canvas class="sim-scope" id="' + opts.id + '-canvas"></canvas>' +
            '<div class="sim-kpis" id="' + opts.id + '-kpis"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var controls = container.querySelector('#' + opts.id + '-controls');
    var canvas   = container.querySelector('#' + opts.id + '-canvas');
    var kpis     = container.querySelector('#' + opts.id + '-kpis');
    var ctx      = canvas.getContext('2d');

    function resizeCanvas() {
      var dpr = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return { controls: controls, canvas: canvas, kpis: kpis, ctx: ctx, resizeCanvas: resizeCanvas };
  }

  function createSlider(parent, opts) {
    var wrap = document.createElement('div');
    wrap.className = 'sim-control-group';
    wrap.innerHTML =
      '<div class="sim-control-label">' +
        '<span>' + opts.label + '</span>' +
        '<span class="sim-control-val" id="' + opts.id + '-val">' + opts.value + (opts.unit || '') + '</span>' +
      '</div>' +
      '<input type="range" class="sim-slider" id="' + opts.id + '"' +
        ' min="' + opts.min + '" max="' + opts.max + '" step="' + (opts.step || 1) + '" value="' + opts.value + '">';
    parent.appendChild(wrap);
    var input = wrap.querySelector('input');
    var valEl = wrap.querySelector('#' + opts.id + '-val');
    input.addEventListener('input', function () {
      var v = parseFloat(input.value);
      valEl.textContent = (opts.format ? opts.format(v) : v) + (opts.unit || '');
      if (opts.onChange) opts.onChange(v);
    });
    return input;
  }

  function createKPI(parent, opts) {
    var tile = document.createElement('div');
    tile.className = 'sim-kpi';
    tile.innerHTML =
      '<div class="sim-kpi-val ' + (opts.cls || '') + '" id="' + opts.id + '">' + opts.value + '</div>' +
      '<div class="sim-kpi-label">' + opts.label + '</div>';
    parent.appendChild(tile);
    return tile.querySelector('#' + opts.id);
  }

  function drawGrid(ctx, w, h, opts) {
    opts = opts || {};
    ctx.fillStyle = opts.bg || '#03070E';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = opts.grid || 'rgba(13,64,84,0.35)';
    ctx.lineWidth = 1;
    var xDivs = opts.xDivs || 10, yDivs = opts.yDivs || 5;
    for (var i = 1; i < xDivs; i++) { var x = (w / xDivs) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (var j = 1; j < yDivs; j++) { var y = (h / yDivs) * j; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    if (opts.zeroLine !== false) {
      ctx.strokeStyle = opts.axis || 'rgba(13,64,84,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    }
  }

  function drawTrace(ctx, points, w, h, color, opts) {
    opts = opts || {};
    ctx.strokeStyle = color;
    ctx.lineWidth = opts.lineWidth || 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = opts.glow || 6;
    ctx.beginPath();
    var n = points.length, scale = opts.scale || (h / 2 * 0.85);
    for (var i = 0; i < n; i++) {
      var x = (i / (n - 1)) * w;
      var y = h / 2 - points[i] * scale;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawLabel(ctx, text, x, y, color) {
    ctx.fillStyle = color || '#5CE1E6';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.fillText(text, x, y);
  }

  // ════════════════════════════════════════════════════════════
  //  SIM 1: GPU Load Transient (dI/dt Step Response)
  // ════════════════════════════════════════════════════════════
  register('gpu-transient', function (container) {
    var p = { di_dt: 500, vdd: 0.75, capacitance: 4700, esr: 0.2 };

    var card = createCard(container, {
      id: 'gpu-transient', badge: 'TRANSIENT',
      title: 'GPU Load Transient — dI/dt Step Response',
      subtitle: 'VRM + decoupling network reaction to sudden current demand'
    });

    createSlider(card.controls, { id: 's-didt', label: 'dI/dt (A/µs)', min: 100, max: 2000, step: 50, value: p.di_dt, unit: ' A/µs', onChange: function (v) { p.di_dt = v; } });
    createSlider(card.controls, { id: 's-vdd', label: 'VDD (V)', min: 0.6, max: 1.2, step: 0.01, value: p.vdd, unit: ' V', format: function (v) { return v.toFixed(2); }, onChange: function (v) { p.vdd = v; } });
    createSlider(card.controls, { id: 's-cap', label: 'Decoupling C (µF)', min: 500, max: 20000, step: 100, value: p.capacitance, unit: ' µF', format: function (v) { return v.toLocaleString(); }, onChange: function (v) { p.capacitance = v; } });
    createSlider(card.controls, { id: 's-esr', label: 'ESR (mΩ)', min: 0.5, max: 5, step: 0.1, value: p.esr, unit: ' mΩ', format: function (v) { return v.toFixed(1); }, onChange: function (v) { p.esr = v; } });

    var kV = createKPI(card.kpis, { id: 'k-vdroop', label: 'V Droop', value: '— mV', cls: 'warn' });
    var kI = createKPI(card.kpis, { id: 'k-ipeak', label: 'I Peak', value: '— A', cls: 'good' });
    var kT = createKPI(card.kpis, { id: 'k-tau', label: 'τ Recovery', value: '— µs', cls: '' });

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;
      drawGrid(card.ctx, w, h, { xDivs: 10, yDivs: 6 });

      var N = 600, pts = [], vpts = [];
      var di_dt = p.di_dt * 1e6, iStep = 400;
      var tau_us = (p.esr / 1000) * p.capacitance * 1e-6 * 1e6;
      var vDrop = (p.esr / 1000) * iStep * 1000;
      var vRec = vDrop * 0.4;
      var rampEnd = iStep / di_dt * 1e6;

      for (var i = 0; i < N; i++) {
        var t_us = (i / N) * 50;
        var I = t_us < rampEnd ? di_dt * t_us * 1e-6 : iStep;
        pts.push(I / iStep);
        var vD = t_us < rampEnd ? (p.esr / 1000) * I * 1000 * 0.8 : vDrop * Math.exp(-(t_us - rampEnd) / tau_us) + vRec;
        vpts.push(-vD / 200);
      }
      drawTrace(card.ctx, vpts, w, h, '#FFB800', { scale: h * 0.35, glow: 8 });
      drawTrace(card.ctx, pts, w, h, '#00F0FF', { scale: h * 0.3, glow: 6 });
      drawLabel(card.ctx, 'I_GPU', 8, 18, '#00F0FF');
      drawLabel(card.ctx, 'ΔV_VDD', 8, 34, '#FFB800');
      kV.textContent = vDrop.toFixed(0) + ' mV';
      kI.textContent = iStep + ' A';
      kT.textContent = tau_us.toFixed(1) + ' µs';
      requestAnimationFrame(frame);
    }
    frame();
  });

  // ════════════════════════════════════════════════════════════
  //  SIM 2: SST DAB Efficiency Map
  // ════════════════════════════════════════════════════════════
  register('sst-dab-efficiency', function (container) {
    var p = { fin: 20, vin: 800, phaseShift: 30, loadPct: 60 };

    var card = createCard(container, {
      id: 'sst-dab', badge: 'SST',
      title: 'Solid-State Transformer — DAB Efficiency Map',
      subtitle: 'Dual Active Bridge, SiC MOSFET, soft-switching region'
    });

    createSlider(card.controls, { id: 's-fin', label: 'Switching freq (kHz)', min: 10, max: 100, step: 5, value: p.fin, unit: ' kHz', onChange: function (v) { p.fin = v; } });
    createSlider(card.controls, { id: 's-vin', label: 'Input V (V)', min: 400, max: 1500, step: 50, value: p.vin, unit: ' V', onChange: function (v) { p.vin = v; } });
    createSlider(card.controls, { id: 's-ps', label: 'Phase Shift (°)', min: 5, max: 45, step: 1, value: p.phaseShift, unit: '°', onChange: function (v) { p.phaseShift = v; } });
    createSlider(card.controls, { id: 's-load', label: 'Load (%)', min: 10, max: 100, step: 5, value: p.loadPct, unit: '%', onChange: function (v) { p.loadPct = v; } });

    var kE = createKPI(card.kpis, { id: 'k-eff', label: 'Efficiency', value: '— %', cls: 'good' });
    var kP = createKPI(card.kpis, { id: 'k-pout', label: 'P Out', value: '— kW', cls: '' });
    var kZ = createKPI(card.kpis, { id: 'k-zvs', label: 'ZVS', value: '—', cls: '' });

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;
      drawGrid(card.ctx, w, h, { xDivs: 10, yDivs: 5 });

      var psRad = p.phaseShift * Math.PI / 180;
      var Pout = (p.vin * p.vin * psRad * (1 - psRad / Math.PI)) / (2 * Math.PI * p.fin * 1000 * 1e-6) * (p.loadPct / 100);
      var cl = Pout * 0.02 * (p.loadPct / 100);
      var sl = Pout * 0.015 * (p.fin / 50);
      var co = Pout * 0.008;
      var eff = Pout > 0 ? (Pout / (Pout + cl + sl + co)) * 100 : 0;
      var zvs = p.phaseShift < 25 && p.loadPct > 30;

      var N = 300, pts = [];
      for (var i = 0; i < N; i++) {
        var lf = i / (N - 1);
        var pp = Pout * lf / (p.loadPct / 100);
        var cl2 = pp * 0.02 * lf, sl2 = pp * 0.015 * (p.fin / 50), co2 = pp * 0.008;
        var e2 = pp > 0 ? (pp / (pp + cl2 + sl2 + co2)) * 100 : 0;
        pts.push((e2 - 80) / 20);
      }
      drawTrace(card.ctx, pts, w, h, '#00FFCC', { scale: h * 0.4, glow: 8 });

      var mx = (p.loadPct / 100) * w;
      card.ctx.strokeStyle = '#FFB800'; card.ctx.lineWidth = 2; card.ctx.setLineDash([4, 4]);
      card.ctx.beginPath(); card.ctx.moveTo(mx, 0); card.ctx.lineTo(mx, h); card.ctx.stroke();
      card.ctx.setLineDash([]);

      drawLabel(card.ctx, 'Efficiency (%)', 8, 18, '#00FFCC');
      drawLabel(card.ctx, 'Load →', w - 50, h - 8, '#FFB800');
      kE.textContent = eff.toFixed(1) + '%';
      kE.className = 'sim-kpi-val ' + (eff > 95 ? 'good' : eff > 90 ? '' : 'warn');
      kP.textContent = (Pout / 1000).toFixed(1) + ' kW';
      kZ.textContent = zvs ? 'YES' : 'NO';
      kZ.className = 'sim-kpi-val ' + (zvs ? 'good' : 'danger');
      requestAnimationFrame(frame);
    }
    frame();
  });

  // ════════════════════════════════════════════════════════════
  //  SIM 3: PUE & Thermal Energy Flow
  // ════════════════════════════════════════════════════════════
  register('pue-thermal', function (container) {
    var p = { itLoad: 50, coolingPct: 35, upsLoss: 3, lighting: 2 };

    var card = createCard(container, {
      id: 'pue-thermal', badge: 'THERMAL',
      title: 'PUE & Energy Flow — IT Load vs Facility Overhead',
      subtitle: 'Where every watt goes: IT, cooling, UPS, lighting'
    });

    createSlider(card.controls, { id: 's-it', label: 'IT Load (kW)', min: 5, max: 500, step: 5, value: p.itLoad, unit: ' kW', onChange: function (v) { p.itLoad = v; } });
    createSlider(card.controls, { id: 's-cool', label: 'Cooling (% of IT)', min: 10, max: 80, step: 1, value: p.coolingPct, unit: '%', onChange: function (v) { p.coolingPct = v; } });
    createSlider(card.controls, { id: 's-ups', label: 'UPS Losses (%)', min: 1, max: 10, step: 0.5, value: p.upsLoss, unit: '%', onChange: function (v) { p.upsLoss = v; } });
    createSlider(card.controls, { id: 's-light', label: 'Lighting/Misc (%)', min: 0, max: 5, step: 0.1, value: p.lighting, unit: '%', onChange: function (v) { p.lighting = v; } });

    var kPUE = createKPI(card.kpis, { id: 'k-pue', label: 'PUE', value: '—', cls: 'good' });
    var kTotal = createKPI(card.kpis, { id: 'k-total', label: 'Total Power', value: '— kW', cls: '' });
    var kCool = createKPI(card.kpis, { id: 'k-cool', label: 'Cooling', value: '— kW', cls: 'warn' });

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;
      drawGrid(card.ctx, w, h, { xDivs: 10, yDivs: 5, zeroLine: false });

      var itPower = p.itLoad;
      var coolPower = itPower * (p.coolingPct / 100);
      var upsPower = itPower * (p.upsLoss / 100);
      var lightPower = itPower * (p.lighting / 100);
      var total = itPower + coolPower + upsPower + lightPower;
      var pue = total / itPower;

      // Stacked bar chart
      var barW = w * 0.6, barX = w * 0.2, barY = h * 0.2, barH = h * 0.6;
      var segments = [
        { label: 'IT',      frac: itPower / total,   color: '#00F0FF' },
        { label: 'Cooling', frac: coolPower / total,  color: '#FFB800' },
        { label: 'UPS',     frac: upsPower / total,   color: '#E6193C' },
        { label: 'Misc',    frac: lightPower / total, color: '#0066FF' }
      ];

      var yOff = barY;
      for (var i = 0; i < segments.length; i++) {
        var segH = barH * segments[i].frac;
        card.ctx.fillStyle = segments[i].color;
        card.ctx.globalAlpha = 0.85;
        card.ctx.fillRect(barX, yOff, barW, segH);
        card.ctx.globalAlpha = 1;
        card.ctx.strokeStyle = 'rgba(3,6,12,0.8)';
        card.ctx.lineWidth = 1;
        card.ctx.strokeRect(barX, yOff, barW, segH);
        drawLabel(card.ctx, segments[i].label + ' ' + (segments[i].frac * 100).toFixed(1) + '%', barX + 8, yOff + segH / 2 + 4, '#E6F9FF');
        yOff += segH;
      }

      // Border
      card.ctx.strokeStyle = 'rgba(0,240,255,0.3)';
      card.ctx.lineWidth = 1.5;
      card.ctx.strokeRect(barX, barY, barW, barH);

      kPUE.textContent = pue.toFixed(2);
      kPUE.className = 'sim-kpi-val ' + (pue < 1.3 ? 'good' : pue < 1.5 ? '' : 'danger');
      kTotal.textContent = total.toFixed(0) + ' kW';
      kCool.textContent = coolPower.toFixed(0) + ' kW';

      requestAnimationFrame(frame);
    }
    frame();
  });

  // ── Export ──
  window.SimWidgets = { register: register, mount: mount };
})();
