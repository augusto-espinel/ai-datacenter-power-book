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

  // ── Card scaffold (controls on right side) ──
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

  // ── Card scaffold with controls at top (for wide plots) ──
  function createCardTopControls(container, opts) {
    container.innerHTML =
      '<div class="sim-card sim-card-wide">' +
        '<div class="sim-header">' +
          '<div class="sim-title-wrap">' +
            '<span class="sim-badge">' + (opts.badge || 'LIVE') + '</span>' +
            '<span class="sim-title">' + opts.title + '</span>' +
          '</div>' +
          '<span class="sim-subtitle">' + (opts.subtitle || '') + '</span>' +
        '</div>' +
        '<div class="sim-body sim-body-wide">' +
          '<div class="sim-controls sim-controls-top" id="' + opts.id + '-controls"></div>' +
          '<div class="sim-kpis sim-kpis-horizontal" id="' + opts.id + '-kpis"></div>' +
          '<div class="sim-canvas-wrap sim-canvas-wrap-wide">' +
            '<canvas class="sim-scope" id="' + opts.id + '-canvas"></canvas>' +
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
    var initDisplay = (opts.format ? opts.format(opts.value) : opts.value) + (opts.unit || '');
    wrap.innerHTML =
      '<div class="sim-control-label">' +
        '<span>' + opts.label + '</span>' +
        '<span class="sim-control-val" id="' + opts.id + '-val">' + initDisplay + '</span>' +
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


  // ── Safe frame wrapper ──
  function safeFrame(frameFn, widgetId) {
    try {
      frameFn();
    } catch (err) {
      console.error('[SimWidgets] ' + widgetId + ' frame error:', err.message);
    }
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

  // ════════════════════════════════════════════════════════════
  //  SIM 5: SST Device Voltage Class Scaling Explorer
  // ════════════════════════════════════════════════════════════
  register('sst-device-scaling', function (container) {
    var DEVICE_CLASSES = ['1.2', '1.7', '3.3', '6.5', '10'];
    var p = { mvKv: 13.8, powerMW: 1.0, classIdx: 2 }; // default index 2 => '3.3' kV

    var DEVICES = {
      '1.2': { vBlock: 1200,  iDie: 202, rdsOn: 0.045, costPer: 8 },
      '1.7': { vBlock: 1700,  iDie: 150, rdsOn: 0.072, costPer: 15 },
      '3.3': { vBlock: 3300,  iDie: 52,  rdsOn: 0.160, costPer: 35 },
      '6.5': { vBlock: 6500,  iDie: 35,  rdsOn: 0.420, costPer: 120 },
      '10':  { vBlock: 10000, iDie: 20,  rdsOn: 0.850, costPer: 450 }
    };

    var card = createCard(container, {
      id: 'sst-dev-scale', badge: 'SST-SCALING',
      title: 'SST Device Voltage Class Scaling Trade-off Explorer',
      subtitle: 'Why 3.3 kV SiC wins at MW-scale: cell count x efficiency x cost'
    });

    createSlider(card.controls, { id: 'ds-mv', label: 'MV Grid (kV)', min: 3, max: 35, step: 0.1, value: p.mvKv, unit: ' kV', onChange: function (v) { p.mvKv = v; } });
    createSlider(card.controls, { id: 'ds-pwr', label: 'Power (MW)', min: 0.025, max: 10, step: 0.025, value: p.powerMW, unit: ' MW', onChange: function (v) { p.powerMW = v; } });
    createSlider(card.controls, { id: 'ds-dev', label: 'Device Class (kV)', min: 0, max: DEVICE_CLASSES.length - 1, step: 1, value: p.classIdx, unit: ' kV',
      format: function(v) { return DEVICE_CLASSES[Math.round(v)] || '3.3'; },
      onChange: function (v) { p.classIdx = Math.round(v); } });

    var kCells = createKPI(card.kpis, { id: 'k-cells', label: 'Cells/phase', value: '--' });
    var kDies  = createKPI(card.kpis, { id: 'k-dies', label: 'Parallel dies', value: '--' });
    var kEff   = createKPI(card.kpis, { id: 'k-eff2', label: 'Est. efficiency', value: '-- %' });
    var kCost  = createKPI(card.kpis, { id: 'k-cost', label: 'Rel. cost', value: '--' });

    function computeEff(mvKv, powerMW, devKey) {
      var d = DEVICES[devKey];
      if (!d) return { eff: 0, cells: 0, dies: 0, totalDies: 0 };
      var vLnPeak = mvKv * 1000 / Math.sqrt(3) * Math.SQRT2;
      var vDcLink = vLnPeak * 1.35;
      var sCells = Math.max(1, Math.ceil(vDcLink / (d.vBlock * 0.6)));
      var cellPower = powerMW * 1e6 / (sCells * 3);
      var cellCurrent = cellPower / (d.vBlock * 0.5);
      var pDies = Math.max(1, Math.ceil(cellCurrent / d.iDie));
      var cL = (cellCurrent * cellCurrent * d.rdsOn / pDies * sCells * 3) / 1000;
      var sL = 0.003 * (d.vBlock / 1000) * powerMW * sCells * 3;
      var eff = powerMW > 0 ? (powerMW * 1000 / (powerMW * 1000 + cL + sL)) * 100 : 0;
      return { eff: eff, cells: sCells, dies: pDies, totalDies: sCells * pDies * 3 };
    }

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;
      drawGrid(card.ctx, w, h, { xDivs: 10, yDivs: 6, zeroLine: false });

      var devKey = DEVICE_CLASSES[p.classIdx] || '3.3';
      var dev = DEVICES[devKey] || DEVICES['3.3'];
      var res = computeEff(p.mvKv, p.powerMW, devKey);

      var classes = DEVICE_CLASSES;
      var n = classes.length;
      // Trim y-axis to upper 10% efficiency range (90% to 100%)
      var minEff = 90.0, maxEff = 100.0;
      // Reserve top margin (64px) for header + bar value labels, bottom margin (28px) for x-axis labels
      var topReserve = 64, bottomMargin = 28;
      var maxBarH = Math.max(40, h - topReserve - bottomMargin);

      // Symmetrical bar group geometry centered across canvas width
      var slotW = w / (n + 1);
      var singleBarW = slotW * 0.58;
      var firstBarX = slotW * 0.5 + (slotW - singleBarW) * 0.5;
      var lastBarRight = slotW * (n - 0.5) + (slotW - singleBarW) * 0.5 + singleBarW;
      var barsCenterX = (firstBarX + lastBarRight) * 0.5;

      // Y-axis reference ticks for 90%, 95%, 100%
      card.ctx.font = '10px "Share Tech Mono", monospace';
      card.ctx.textAlign = 'left';
      card.ctx.fillStyle = 'rgba(92,225,230,0.45)';
      var yTicks = [90, 95, 100];
      for (var t = 0; t < yTicks.length; t++) {
        var ty = (h - bottomMargin) - ((yTicks[t] - minEff) / (maxEff - minEff)) * maxBarH;
        card.ctx.strokeStyle = 'rgba(13,64,84,0.45)';
        card.ctx.lineWidth = 1;
        card.ctx.setLineDash([3, 3]);
        card.ctx.beginPath();
        card.ctx.moveTo(0, ty);
        card.ctx.lineTo(w, ty);
        card.ctx.stroke();
        card.ctx.fillText(yTicks[t] + '%', 6, ty - 3);
      }
      card.ctx.setLineDash([]);

      for (var i = 0; i < n; i++) {
        var r = computeEff(p.mvKv, p.powerMW, classes[i]);
        var clampedEff = Math.max(minEff, Math.min(maxEff, r.eff));
        var barH = ((clampedEff - minEff) / (maxEff - minEff)) * maxBarH;
        var barX = slotW * (i + 0.5) + (slotW - singleBarW) * 0.5;
        var barY = h - bottomMargin - barH;
        var isSel = classes[i] === devKey;

        card.ctx.fillStyle = isSel ? '#00FFCC' : 'rgba(0,200,255,0.32)';
        card.ctx.fillRect(barX, barY, singleBarW, barH);
        if (isSel) {
          card.ctx.strokeStyle = '#E6F9FF';
          card.ctx.lineWidth = 1.5;
          card.ctx.strokeRect(barX, barY, singleBarW, barH);
        }

        card.ctx.fillStyle = isSel ? '#00FFCC' : '#E6F9FF';
        card.ctx.font = (isSel ? 'bold ' : '') + '11px "Share Tech Mono", monospace';
        card.ctx.textAlign = 'center';
        card.ctx.fillText(classes[i] + ' kV', barX + singleBarW * 0.5, h - 9);
        card.ctx.fillText(r.eff.toFixed(2) + '%', barX + singleBarW * 0.5, barY - 6);
      }

      // Centered green & yellow titles positioned cleanly above the bars
      var vLnPeak = p.mvKv * 1000 / Math.sqrt(3) * Math.SQRT2;
      var vDcLink = vLnPeak * 1.35;
      card.ctx.textAlign = 'center';
      card.ctx.font = '11px "Share Tech Mono", monospace';
      card.ctx.fillStyle = '#00FFCC';
      card.ctx.fillText('Efficiency (90%–100% zoom) by SiC device class', barsCenterX, 18);
      card.ctx.fillStyle = '#FFB800';
      card.ctx.fillText('MV: ' + p.mvKv.toFixed(1) + ' kV  |  P: ' + p.powerMW.toFixed(2) + ' MW  |  Vdc: ' + (vDcLink / 1000).toFixed(1) + ' kV', barsCenterX, 34);
      card.ctx.textAlign = 'left';

      kCells.textContent = res.cells;
      kDies.textContent = res.dies;
      kEff.textContent = res.eff.toFixed(2) + '%';
      kEff.className = 'sim-kpi-val ' + (res.eff > 98 ? 'good' : res.eff > 95 ? '' : 'warn');
      var base33 = computeEff(p.mvKv, p.powerMW, '3.3');
      var costRatio = res.totalDies ? (res.totalDies * dev.costPer) / Math.max(1, base33.totalDies * DEVICES['3.3'].costPer) : 0;
      kCost.textContent = 'x' + costRatio.toFixed(1);

      requestAnimationFrame(function() { safeFrame(frame, 'sst-device-scaling'); });
    }
    // Delay first frame until canvas has dimensions
    setTimeout(function() { safeFrame(frame, 'sst-device-scaling'); }, 50);
  });

  // ════════════════════════════════════════════════════════════
  //  SIM 6: SST ZVS Boundary Map (iTCM Soft-Switching)
  // ════════════════════════════════════════════════════════════
  register('sst-zvs-boundary', function (container) {
    var p = { vDc: 7000, loadPct: 80, lb: 120, fsw: 50 };

    var card = createCard(container, {
      id: 'sst-zvs', badge: 'ZVS',
      title: 'iTCM Soft-Switching ZVS Boundary Map',
      subtitle: 'Triangular current mode: where ZVS is achieved across the AC grid cycle'
    });

    createSlider(card.controls, { id: 'zv-vdc', label: 'DC-link (V)', min: 1000, max: 10000, step: 100, value: p.vDc, unit: ' V', onChange: function (v) { p.vDc = v; } });
    createSlider(card.controls, { id: 'zv-load', label: 'Load (%)', min: 10, max: 100, step: 5, value: p.loadPct, unit: '%', onChange: function (v) { p.loadPct = v; } });
    createSlider(card.controls, { id: 'zv-lb', label: 'Lb (uH)', min: 20, max: 300, step: 5, value: p.lb, unit: ' uH', onChange: function (v) { p.lb = v; } });
    createSlider(card.controls, { id: 'zv-fsw', label: 'fsw (kHz)', min: 20, max: 100, step: 1, value: p.fsw, unit: ' kHz', onChange: function (v) { p.fsw = v; } });

    var kCov  = createKPI(card.kpis, { id: 'k-zvs-cov', label: 'ZVS coverage', value: '-- %' });
    var kIzvs = createKPI(card.kpis, { id: 'k-izvs', label: 'I_ZVS', value: '-- A' });
    var kPsw  = createKPI(card.kpis, { id: 'k-psw', label: 'P_sw (soft)', value: '-- W' });
    var kPswH = createKPI(card.kpis, { id: 'k-pswh', label: 'P_sw (hard)', value: '-- W' });

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;
      drawGrid(card.ctx, w, h, { xDivs: 12, yDivs: 6 });

      var vBlock = p.vDc * 1.3;
      var qOss = 1500e-9 * Math.pow(vBlock / 10000, 1.5);
      var tDt = 300e-9;
      var iZvs = qOss / tDt;

      var pOut = 25000 * (p.loadPct / 100);
      var iPeak = pOut / (p.vDc * 0.5) * Math.SQRT2;
      var fHz = p.fsw * 1000;
      var iTri = (p.vDc * 0.5) / (p.lb * 1e-6) / (2 * fHz);

      var N = 400;
      var tracePts = [];
      var zvsOk = 0;

      for (var i = 0; i < N; i++) {
        var theta = (i / (N - 1)) * Math.PI;
        var iGrid = iPeak * Math.sin(theta);
        var iTurnOff = iTri - Math.abs(iGrid) * 0.1;
        tracePts.push(iTurnOff / (iPeak * 1.2 + 1));
        if (iTurnOff > iZvs) zvsOk++;
      }

      var yZvsLine = h * 0.5 - (iZvs / (iPeak * 1.2 + 1)) * h * 0.35;

      card.ctx.fillStyle = 'rgba(255,68,68,0.12)';
      card.ctx.fillRect(0, 0, w, yZvsLine);

      card.ctx.strokeStyle = '#FF4444';
      card.ctx.lineWidth = 2;
      card.ctx.setLineDash([6, 4]);
      card.ctx.beginPath();
      card.ctx.moveTo(0, yZvsLine);
      card.ctx.lineTo(w, yZvsLine);
      card.ctx.stroke();
      card.ctx.setLineDash([]);

      drawTrace(card.ctx, tracePts, w, h, '#00FFCC', { scale: h * 0.35, glow: 6, offset: h * 0.5 });

      drawLabel(card.ctx, 'Turn-off current (A)', 8, 18, '#00FFCC');
      drawLabel(card.ctx, 'I_ZVS = ' + iZvs.toFixed(2) + ' A', 8, yZvsLine - 6, '#FF4444');
      drawLabel(card.ctx, 'grid cycle angle', w - 80, h - 8, '#FFB800');
      drawLabel(card.ctx, 'ZVS lost', w * 0.25, 20, '#FF4444');

      var eSoftPerCycle = 0.12e-3;
      var eHardPerCycle = 11e-3;
      var fAvg = p.fsw * 1000;
      var zvsFrac = zvsOk / N;
      var pSwSoft = eSoftPerCycle * fAvg * 2;
      var pSwHard = eHardPerCycle * fAvg * 2 * (1 - zvsFrac);

      var covPct = (zvsOk / N * 100);
      kCov.textContent = covPct.toFixed(0) + '%';
      kCov.className = 'sim-kpi-val ' + (covPct > 90 ? 'good' : covPct > 50 ? 'warn' : 'danger');
      kIzvs.textContent = iZvs.toFixed(2) + ' A';
      kPsw.textContent = pSwSoft.toFixed(1) + ' W';
      kPswH.textContent = pSwHard.toFixed(1) + ' W';
      kPswH.className = 'sim-kpi-val ' + (pSwHard < 10 ? 'good' : pSwHard < 50 ? 'warn' : 'danger');

      requestAnimationFrame(function() { safeFrame(frame, 'sst-zvs-boundary'); });
    }
    setTimeout(function() { safeFrame(frame, 'sst-zvs-boundary'); }, 50);
  });

  // ════════════════════════════════════════════════════════════
  //  SIM 7: SST Dielectric Loss and Thermal Runaway
  // ════════════════════════════════════════════════════════════
  register('sst-dielectric-loss', function (container) {
    var p = { eField: 5, freq: 50, tanDelta: 0.8, thermCond: 1.0 };

    var card = createCard(container, {
      id: 'sst-diel', badge: 'INSULATION',
      title: 'MV-MF Dielectric Loss Thermal Runaway Predictor',
      subtitle: 'P_ins proportional to E^2 * f * tan(delta) -- epoxy fails, silicone works'
    });

    createSlider(card.controls, { id: 'dl-e', label: 'E-field (kV/mm)', min: 1, max: 15, step: 0.5, value: p.eField, unit: ' kV/mm', onChange: function (v) { p.eField = v; } });
    createSlider(card.controls, { id: 'dl-f', label: 'Frequency (kHz)', min: 10, max: 100, step: 5, value: p.freq, unit: ' kHz', onChange: function (v) { p.freq = v; } });
    createSlider(card.controls, { id: 'dl-td', label: 'tan(delta) (%)', min: 0.1, max: 5, step: 0.1, value: p.tanDelta, unit: '%', onChange: function (v) { p.tanDelta = v; } });
    createSlider(card.controls, { id: 'dl-tc', label: 'Therm. cond. (W/mK)', min: 0.2, max: 3, step: 0.1, value: p.thermCond, unit: ' W/mK', onChange: function (v) { p.thermCond = v; } });

    var kPins = createKPI(card.kpis, { id: 'k-pins', label: 'P_insulation', value: '-- W' });
    var kTmax = createKPI(card.kpis, { id: 'k-tmax', label: 'T_max', value: '-- C' });
    var kRun  = createKPI(card.kpis, { id: 'k-run', label: 'Runaway?', value: '--' });
    var kMat  = createKPI(card.kpis, { id: 'k-mat', label: 'Material', value: '--' });

    // Material presets
    var MATERIALS = [
      { name: 'Standard Epoxy',     tanD: 3.0, tc: 0.3, strength: 20 },
      { name: 'Silicone VPP',       tanD: 0.8, tc: 1.0, strength: 24 },
      { name: 'High-Tc Ceramic',    tanD: 0.2, tc: 2.5, strength: 30 }
    ];

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;
      drawGrid(card.ctx, w, h, { xDivs: 10, yDivs: 6 });

      // Dielectric loss: P = epsilon0 * E^      // Dielectric loss: P = eps0 * E^2 * f * tan(delta) * volume_factor
      var eps0 = 8.854e-12;
      var eVm = p.eField * 1e6; // kV/mm to V/m
      var fHz = p.freq * 1000;
      var pIns = eps0 * eVm * eVm * fHz * (p.tanDelta / 100) * 0.001; // W (scaled volume factor)

      // Thermal model: steady-state T = T_amb + P / (k * A_factor)
      var tAmb = 40;
      var tMax = tAmb + pIns / (p.thermCond * 0.05);

      // Runaway check: if tan(delta) increases with T (approx 2x per 50C)
      var runaway = tMax > 120;
      var stableIterations = 0;
      var tCur = tAmb;
      for (var iter = 0; iter < 20; iter++) {
        var tdFactor = Math.pow(2, Math.max(0, (tCur - tAmb) / 50));
        var tdEff = (p.tanDelta / 100) * tdFactor;
        var pIter = eps0 * eVm * eVm * fHz * tdEff * 0.001;
        tCur = tAmb + pIter / (p.thermCond * 0.05);
        if (tCur > 200) { runaway = true; break; }
        if (Math.abs(tCur - tMax) < 1) { stableIterations++; if (stableIterations > 2) break; }
        tMax = tCur;
      }

      // Determine closest material match
      var matMatch = '--';
      for (var mi = 0; mi < MATERIALS.length; mi++) {
        if (Math.abs(MATERIALS[mi].tanD - p.tanDelta) < 0.15 && Math.abs(MATERIALS[mi].tc - p.thermCond) < 0.15) {
          matMatch = MATERIALS[mi].name;
          break;
        }
      }
      if (matMatch === '--') {
        if (p.tanDelta > 2) matMatch = 'Epoxy-like';
        else if (p.tanDelta < 0.3) matMatch = 'Ceramic-like';
        else matMatch = 'Silicone-like';
      }

      // Draw: temperature vs e-field curve for current material
      var N = 300;
      var pts = [];
      for (var i = 0; i < N; i++) {
        var e = 1 + (i / (N - 1)) * 14; // 1 to 15 kV/mm
        var eV = e * 1e6;
        var pL = eps0 * eV * eV * fHz * (p.tanDelta / 100) * 0.001;
        var tL = tAmb + pL / (p.thermCond * 0.05);
        pts.push(Math.min(200, tL) / 200);
      }
      drawTrace(card.ctx, pts, w, h, '#FFB800', { scale: h * 0.35, glow: 6, offset: h * 0.08 });

      // Draw current operating point
      var opX = (p.eField / 15) * w;
      var opY = h * 0.08 + (Math.min(200, tMax) / 200) * h * 0.35;
      card.ctx.fillStyle = runaway ? '#FF4444' : '#00FFCC';
      card.ctx.beginPath();
      card.ctx.arc(opX, opY, 6, 0, Math.PI * 2);
      card.ctx.fill();

      // Draw thermal limit line
      var yLimit = h * 0.08 + (120 / 200) * h * 0.35;
      card.ctx.strokeStyle = '#FF4444';
      card.ctx.lineWidth = 1.5;
      card.ctx.setLineDash([4, 4]);
      card.ctx.beginPath();
      card.ctx.moveTo(0, yLimit);
      card.ctx.lineTo(w, yLimit);
      card.ctx.stroke();
      card.ctx.setLineDash([]);

      drawLabel(card.ctx, 'Temperature (C) vs E-field (kV/mm)', 8, 18, '#FFB800');
      drawLabel(card.ctx, 'T_limit = 120C', 8, yLimit - 6, '#FF4444');
      drawLabel(card.ctx, 'Op point: ' + p.eField.toFixed(1) + ' kV/mm', opX - 30, opY - 12, runaway ? '#FF4444' : '#00FFCC');
      drawLabel(card.ctx, 'E-field (kV/mm)', w - 90, h - 8, '#5CE1E6');

      kPins.textContent = pIns.toFixed(2) + ' W';
      kPins.className = 'sim-kpi-val ' + (pIns < 1 ? 'good' : pIns < 10 ? 'warn' : 'danger');
      kTmax.textContent = tMax.toFixed(0) + ' C';
      kTmax.className = 'sim-kpi-val ' + (tMax < 80 ? 'good' : tMax < 120 ? 'warn' : 'danger');
      kRun.textContent = runaway ? 'YES' : 'STABLE';
      kRun.className = 'sim-kpi-val ' + (runaway ? 'danger' : 'good');
      kMat.textContent = matMatch;

      requestAnimationFrame(frame);
    }
    frame();
  });

  // ══════════════════════════════════════════════════════════════
  // SIM 4: Energy Per Token (moved inside IIFE)
  //  SIM 4: Energy Per Token — Full Stack Calculator
  // ══════════════════════════════════════════════════════════════
  register('energy-per-token', function (container) {
    var p = { gpuPower: 700, throughput: 4000, batchSize: 128, pue: 1.2, nodeFactor: 1.35, trainTokens: 13e12, trainGwh: 50, infLifetime: 1e15 };

    var card = createCard(container, {
      id: 'energy-token', badge: 'ENERGY',
      title: 'Energy Per Token — Full Grid-to-Chip Stack',
      subtitle: 'GPU die → node → facility → training amortization'
    });

    createSlider(card.controls, { id: 's-gpu', label: 'GPU Power (W)', min: 200, max: 1200, step: 50, value: p.gpuPower, unit: ' W', onChange: function (v) { p.gpuPower = v; } });
    createSlider(card.controls, { id: 's-tput', label: 'Throughput (tok/s)', min: 100, max: 10000, step: 100, value: p.throughput, unit: ' t/s', onChange: function (v) { p.throughput = v; } });
    createSlider(card.controls, { id: 's-batch', label: 'Batch Size', min: 1, max: 1024, step: 1, value: p.batchSize, unit: '', onChange: function (v) { p.batchSize = v; } });
    createSlider(card.controls, { id: 's-pue', label: 'PUE', min: 1.05, max: 2.0, step: 0.01, value: p.pue, unit: '', format: function (v) { return v.toFixed(2); }, onChange: function (v) { p.pue = v; } });
    createSlider(card.controls, { id: 's-node', label: 'Node Overhead (×)', min: 1.0, max: 2.0, step: 0.05, value: p.nodeFactor, unit: '×', format: function (v) { return v.toFixed(2); }, onChange: function (v) { p.nodeFactor = v; } });
    createSlider(card.controls, { id: 's-train', label: 'Training Energy (GWh)', min: 0.1, max: 200, step: 0.1, value: p.trainGwh, unit: ' GWh', format: function (v) { return v.toFixed(1); }, onChange: function (v) { p.trainGwh = v; } });
    createSlider(card.controls, { id: 's-life', label: 'Inference Lifetime (tokens)', min: 1e12, max: 1e16, step: 1e12, value: p.infLifetime, unit: '', format: function (v) { return v.toExponential(1); }, onChange: function (v) { p.infLifetime = v; } });

    var kDie   = createKPI(card.kpis, { id: 'k-die', label: 'GPU Die', value: '— J', cls: 'good' });
    var kNode  = createKPI(card.kpis, { id: 'k-node', label: 'Node Level', value: '— J', cls: '' });
    var kDC    = createKPI(card.kpis, { id: 'k-dc', label: 'Facility (PUE)', value: '— J', cls: 'warn' });
    var kTrain = createKPI(card.kpis, { id: 'k-train', label: 'Training Amort.', value: '— J', cls: '' });
    var kTotal = createKPI(card.kpis, { id: 'k-total', label: 'TOTAL', value: '— J', cls: 'danger' });
    var kWh    = createKPI(card.kpis, { id: 'k-wh', label: 'Wh/Million', value: '—', cls: '' });

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;

      // Compute energy stack
      var eDie   = p.gpuPower / p.throughput; // J/token at GPU die
      var eNode  = eDie * p.nodeFactor;        // J/token at node level
      var eDC    = eNode * p.pue;               // J/token at facility level
      var eTrain = (p.trainGwh * 3.6e12) / p.infLifetime; // J/token amortized training
      var eTotal = eDC + eTrain;

      // Draw stacked bar chart
      drawGrid(card.ctx, w, h, { xDivs: 10, yDivs: 5, zeroLine: false });

      var barW = w * 0.5, barX = w * 0.15, barH = h * 0.7, barY = h * 0.15;
      var layers = [
        { label: 'GPU Die',      energy: eDie,   color: '#00F0FF' },
        { label: 'Node',         energy: eDie * (p.nodeFactor - 1), color: '#0066FF' },
        { label: 'Cooling/PUE',  energy: eNode * (p.pue - 1),      color: '#FFB800' },
        { label: 'Training',     energy: eTrain,  color: '#E6193C' }
      ];

      var maxE = eTotal * 1.1;
      var yOff = barY + barH;
      for (var i = 0; i < layers.length; i++) {
        var segH = (layers[i].energy / maxE) * barH;
        yOff -= segH;
        card.ctx.fillStyle = layers[i].color;
        card.ctx.globalAlpha = 0.85;
        card.ctx.fillRect(barX, yOff, barW, segH);
        card.ctx.globalAlpha = 1;
        card.ctx.strokeStyle = 'rgba(3,6,12,0.8)';
        card.ctx.lineWidth = 1;
        card.ctx.strokeRect(barX, yOff, barW, segH);
        if (segH > 18) {
          drawLabel(card.ctx, layers[i].label + ' ' + layers[i].energy.toFixed(3) + ' J', barX + 8, yOff + segH / 2 + 4, '#E6F9FF');
        }
      }

      card.ctx.strokeStyle = 'rgba(0,240,255,0.3)';
      card.ctx.lineWidth = 1.5;
      card.ctx.strokeRect(barX, barY, barW, barH);

      // Scale annotation
      drawLabel(card.ctx, 'Energy per token (J)', barX, barY - 8, '#5CE1E6');
      drawLabel(card.ctx, eTotal.toFixed(3) + ' J total', barX + barW / 2 - 40, barY + barH + 16, '#FFB800');

      // KPIs
      kDie.textContent   = eDie.toFixed(3) + ' J';
      kNode.textContent  = eNode.toFixed(3) + ' J';
      kDC.textContent    = eDC.toFixed(3) + ' J';
      kTrain.textContent = eTrain.toFixed(4) + ' J';
      kTotal.textContent = eTotal.toFixed(3) + ' J';
      kWh.textContent    = (eTotal * 278).toFixed(1) + ' Wh/M';

      requestAnimationFrame(frame);
    }
    frame();
  });

  // ══════════════════════════════════════════════════════════════
  //  SIM 8: Rack Thermal Wall — Air vs. Water & Traction/EV Comparison
  // ══════════════════════════════════════════════════════════════
  register('rack-thermal-wall', function (container) {
    var PRESETS = [
      { name: 'Legacy CPU (15 kW)',     qKw: 15,   dtAir: 15, dtWater: 10, liqPct: 0,  volL: 1200 },
      { name: 'DGX H100 (40 kW)',       qKw: 40,   dtAir: 15, dtWater: 10, liqPct: 0,  volL: 1300 },
      { name: 'GB200 NVL72 (132 kW)',   qKw: 132,  dtAir: 15, dtWater: 10, liqPct: 85, volL: 1350 },
      { name: 'Vera Rubin (250 kW)',    qKw: 250,  dtAir: 15, dtWater: 12, liqPct: 90, volL: 1350 },
      { name: 'Kyber / Rubin Ultra (600 kW)', qKw: 600, dtAir: 15, dtWater: 15, liqPct: 95, volL: 1400 },
      { name: '1 MW Next-Gen AI Rack',  qKw: 1000, dtAir: 15, dtWater: 15, liqPct: 98, volL: 1400 },
      { name: '6 MW Locomotive Converter (90 kW loss)', qKw: 90, dtAir: 15, dtWater: 10, liqPct: 85, volL: 1200 },
      { name: '300 kW EV SiC Inverter (6 kW loss)',     qKw: 6,  dtAir: 15, dtWater: 8,  liqPct: 100, volL: 8 }
    ];

    var p = { presetIdx: 2, qKw: 132, dtAir: 15, dtWater: 10, openAreaM2: 0.65 };

    // Use top-controls layout for wider plot
    var card = createCardTopControls(container, {
      id: 'rack-thermal', badge: 'FIRST-PRINCIPLES THERMAL',
      title: 'The 1 MW Thermal Wall — Air vs. Water Flow & Traction/EV Comparison',
      subtitle: 'Q = m_dot * cp * dT: Why air hits a physics wall above ~50 kW while water uses a garden hose'
    });

    var slPreset, slQ, slDtAir, slDtWater;

    slPreset = createSlider(card.controls, {
      id: 'rt-preset', label: 'System Preset', min: 0, max: PRESETS.length - 1, step: 1, value: p.presetIdx, unit: '',
      format: function (v) { return PRESETS[Math.round(v)].name; },
      onChange: function (v) {
        var idx = Math.round(v);
        p.presetIdx = idx;
        var pr = PRESETS[idx];
        p.qKw = pr.qKw;
        p.dtAir = pr.dtAir;
        p.dtWater = pr.dtWater;
        if (slQ) { slQ.value = p.qKw; container.querySelector('#rt-q-val').textContent = p.qKw + ' kW'; }
        if (slDtAir) { slDtAir.value = p.dtAir; container.querySelector('#rt-dtair-val').textContent = p.dtAir + ' °C'; }
        if (slDtWater) { slDtWater.value = p.dtWater; container.querySelector('#rt-dtwat-val').textContent = p.dtWater + ' °C'; }
      }
    });

    slQ = createSlider(card.controls, {
      id: 'rt-q', label: 'Heat Dissipated Q_loss (kW)', min: 5, max: 1000, step: 5, value: p.qKw, unit: ' kW',
      onChange: function (v) { p.qKw = v; }
    });

    slDtAir = createSlider(card.controls, {
      id: 'rt-dtair', label: 'Air ΔT (Inlet→Exhaust)', min: 5, max: 30, step: 1, value: p.dtAir, unit: ' °C',
      onChange: function (v) { p.dtAir = v; }
    });

    slDtWater = createSlider(card.controls, {
      id: 'rt-dtwat', label: 'Water ΔT (Supply→Return)', min: 5, max: 25, step: 1, value: p.dtWater, unit: ' °C',
      onChange: function (v) { p.dtWater = v; }
    });

    var kAirFlow  = createKPI(card.kpis, { id: 'k-airflow',  label: '100% Air Flow',  value: '-- m³/s' });
    var kAirVel   = createKPI(card.kpis, { id: 'k-airvel',   label: 'Rack Face Vel.', value: '-- m/s' });
    var kFanPwr   = createKPI(card.kpis, { id: 'k-fanpwr',   label: 'Fan Power (∝Q³)', value: '-- kW' });
    var kWatFlow  = createKPI(card.kpis, { id: 'k-watflow',  label: '100% Water Flow', value: '-- L/min' });
    var kRatio    = createKPI(card.kpis, { id: 'k-volratio', label: 'Vol. Ratio (Air/H₂O)', value: '-- ×' });
    var kRegime   = createKPI(card.kpis, { id: 'k-regime',   label: 'Cooling Verdict', value: '--' });

    // Physics constants
    var RHO_AIR   = 1.18;   // kg/m^3 at ~25 C
    var CP_AIR    = 1.005;  // kJ/(kg*K)
    var RHO_WATER = 997.0;  // kg/m^3
    var CP_WATER  = 4.184;  // kJ/(kg*K)

    function computeFlows(qKw, dtAir, dtWat) {
      // Q [kW = kJ/s] = rho * V_dot [m^3/s] * cp [kJ/kgK] * dT [K]
      var vDotAir_m3s  = qKw / (RHO_AIR * CP_AIR * dtAir);
      var vDotAir_cfm  = vDotAir_m3s * 2118.88;
      var vFace_ms     = vDotAir_m3s / p.openAreaM2; // across 0.65 m^2 open perforated door area
      var vFace_kmh    = vFace_ms * 3.6;

      // Fan affinity law: dP_air scales with v^2, P_fan = V_dot * dP / eta_fan ~ k * V_dot^3
      // Calibrated to realistic server rack impedance: at 40 kW (2.25 m^3/s), dP ~ 650 Pa, eta=0.55 => ~2.7 kW fan power
      var dP_air_Pa    = 128.0 * Math.pow(vDotAir_m3s, 1.85);
      var pFan_kW      = (vDotAir_m3s * dP_air_Pa) / (0.55 * 1000.0);

      // Water flow
      var vDotWat_m3s  = qKw / (RHO_WATER * CP_WATER * dtWat);
      var vDotWat_Lmin = vDotWat_m3s * 1000.0 * 60.0;
      // Water pump power (dP ~ 1.5 bar = 150 kPa at full flow, eta=0.65)
      var pPump_kW     = (vDotWat_m3s * 150000.0) / (0.65 * 1000.0);

      var volRatio     = vDotAir_m3s / Math.max(1e-9, vDotWat_m3s);

      return {
        vDotAir_m3s: vDotAir_m3s,
        vDotAir_cfm: vDotAir_cfm,
        vFace_ms: vFace_ms,
        vFace_kmh: vFace_kmh,
        pFan_kW: pFan_kW,
        vDotWat_Lmin: vDotWat_Lmin,
        pPump_kW: pPump_kW,
        volRatio: volRatio
      };
    }

    function frame() {
      var w = card.canvas.clientWidth, h = card.canvas.clientHeight;
      drawGrid(card.ctx, w, h, { xDivs: 10, yDivs: 6, zeroLine: false });

      var cur = computeFlows(p.qKw, p.dtAir, p.dtWater);

      // Margins for dual-axis curve plot (Q from 10 kW to 1000 kW)
      var leftM = 46, rightM = 52, topM = 42, botM = 28;
      var plotW = Math.max(100, w - leftM - rightM);
      var plotH = Math.max(80, h - topM - botM);

      // Shaded Air-Cooling Wall Zone (Q > 50 kW)
      var xWall50 = leftM + (50 / 1000) * plotW;
      card.ctx.fillStyle = 'rgba(230, 25, 60, 0.11)';
      card.ctx.fillRect(xWall50, topM, leftM + plotW - xWall50, plotH);

      // Vertical transition line at 50 kW
      card.ctx.strokeStyle = '#FF4444';
      card.ctx.lineWidth = 1.5;
      card.ctx.setLineDash([5, 4]);
      card.ctx.beginPath();
      card.ctx.moveTo(xWall50, topM);
      card.ctx.lineTo(xWall50, topM + plotH);
      card.ctx.stroke();
      card.ctx.setLineDash([]);

      // Plot curves across 0..1000 kW:
      // 1) Air Flow (m^3/s) normalized to 60 m^3/s full scale (magenta)
      // 2) Air Parasitic Fan Power (% of Rack Q, capped at 100%) (amber)
      // 3) Water Flow (L/min) normalized to 1200 L/min full scale (green)
      var N = 200;
      var maxAirScale = 60.0;   // m^3/s
      var maxWatScale = 1200.0; // L/min

      // Draw Air Flow curve (magenta)
      card.ctx.strokeStyle = '#FF00FF';
      card.ctx.lineWidth = 2.5;
      card.ctx.beginPath();
      for (var i = 0; i < N; i++) {
        var q = 5 + (i / (N - 1)) * 995;
        var r = computeFlows(q, p.dtAir, p.dtWater);
        var x = leftM + (q / 1000) * plotW;
        var y = topM + plotH - Math.min(1.0, r.vDotAir_m3s / maxAirScale) * plotH;
        if (i === 0) card.ctx.moveTo(x, y); else card.ctx.lineTo(x, y);
      }
      card.ctx.stroke();

      // Draw Fan Power Parasitic Curve (orange)
      card.ctx.strokeStyle = '#FF8800';
      card.ctx.lineWidth = 2.0;
      card.ctx.beginPath();
      for (var j = 0; j < N; j++) {
        var q2 = 5 + (j / (N - 1)) * 995;
        var r2 = computeFlows(q2, p.dtAir, p.dtWater);
        var fanPct = (r2.pFan_kW / q2); // 0 to 1.0+
        var x2 = leftM + (q2 / 1000) * plotW;
        var y2 = topM + plotH - Math.min(1.0, fanPct) * plotH;
        if (j === 0) card.ctx.moveTo(x2, y2); else card.ctx.lineTo(x2, y2);
      }
      card.ctx.stroke();

      // Draw Water Flow curve (green)
      card.ctx.strokeStyle = '#00FF88';
      card.ctx.lineWidth = 2.5;
      card.ctx.beginPath();
      for (var k = 0; k < N; k++) {
        var q3 = 5 + (k / (N - 1)) * 995;
        var r3 = computeFlows(q3, p.dtAir, p.dtWater);
        var x3 = leftM + (q3 / 1000) * plotW;
        var y3 = topM + plotH - Math.min(1.0, r3.vDotWat_Lmin / maxWatScale) * plotH;
        if (k === 0) card.ctx.moveTo(x3, y3); else card.ctx.lineTo(x3, y3);
      }
      card.ctx.stroke();

      // X-axis title
      card.ctx.textAlign = 'center';
      card.ctx.fillStyle = '#E6F9FF';
      card.ctx.font = '12px "Share Tech Mono", monospace';
      card.ctx.fillText('Heat Dissipated Q_loss (kW)', leftM + plotW / 2, h - 20);

      // Reference milestones along X-axis (fewer, non-overlapping)
      var markers = [
        { q: 40,   lbl: '40' },
        { q: 132,  lbl: '132' },
        { q: 250,  lbl: '250' },
        { q: 600,  lbl: '600' },
        { q: 1000, lbl: '1000' }
      ];
      card.ctx.font = '10px "Share Tech Mono", monospace';
      for (var m = 0; m < markers.length; m++) {
        var mx = leftM + (markers[m].q / 1000) * plotW;
        card.ctx.fillStyle = 'rgba(230,249,255,0.7)';
        card.ctx.fillText(markers[m].lbl, mx, h - 34);
      }

      // Current operating vertical cursor
      var curX = leftM + (p.qKw / 1000) * plotW;
      card.ctx.strokeStyle = '#E6F9FF';
      card.ctx.lineWidth = 1.5;
      card.ctx.beginPath();
      card.ctx.moveTo(curX, topM);
      card.ctx.lineTo(curX, topM + plotH);
      card.ctx.stroke();

      // Operating dots with outlines for visibility
      var yAirDot = topM + plotH - Math.min(1.0, cur.vDotAir_m3s / maxAirScale) * plotH;
      var yFanDot = topM + plotH - Math.min(1.0, (cur.pFan_kW / p.qKw)) * plotH;
      var yWatDot = topM + plotH - Math.min(1.0, cur.vDotWat_Lmin / maxWatScale) * plotH;
      
      card.ctx.strokeStyle = '#FF00FF'; card.ctx.fillStyle = '#FF00FF';
      card.ctx.beginPath(); card.ctx.arc(curX, yAirDot, 6, 0, Math.PI * 2); card.ctx.fill();
      card.ctx.strokeStyle = '#FF8800'; card.ctx.fillStyle = '#FF8800';
      card.ctx.beginPath(); card.ctx.arc(curX, yFanDot, 5, 0, Math.PI * 2); card.ctx.fill();
      card.ctx.strokeStyle = '#00FF88'; card.ctx.fillStyle = '#00FF88';
      card.ctx.beginPath(); card.ctx.arc(curX, yWatDot, 6, 0, Math.PI * 2); card.ctx.fill();

      // Legends & annotations
      card.ctx.textAlign = 'left';
      card.ctx.font = '11px "Share Tech Mono", monospace';
      drawLabel(card.ctx, 'Y-axis: Relative magnitude (normalized to max scale)', leftM, 14, '#5CE1E6');
      
      // Color-coded legend boxes
      card.ctx.fillStyle = '#FF00FF'; card.ctx.fillRect(leftM, 24, 12, 12);
      drawLabel(card.ctx, 'Air Flow (0–60 m³/s)', leftM + 16, 34, '#FF00FF');
      
      card.ctx.fillStyle = '#FF8800'; card.ctx.fillRect(leftM + 150, 24, 12, 12);
      drawLabel(card.ctx, 'Fan Power (% of Q_rack)', leftM + 166, 34, '#FF8800');
      
      card.ctx.fillStyle = '#00FF88'; card.ctx.fillRect(leftM + 320, 24, 12, 12);
      drawLabel(card.ctx, 'Water Flow (0–1200 L/min)', leftM + 336, 34, '#00FF88');
      
      drawLabel(card.ctx, '◄ Air OK (<50 kW) | LIQUID MANDATORY (velocity = hurricane / fan power ∝ Q³) ►', xWall50 + 6, 48, '#FF6677');

      // Update KPIs
      kAirFlow.textContent = cur.vDotAir_m3s.toFixed(1) + ' m³/s (' + Math.round(cur.vDotAir_cfm).toLocaleString() + ' CFM)';
      kAirFlow.className = 'sim-kpi-val ' + (cur.vDotAir_m3s < 3.0 ? 'good' : cur.vDotAir_m3s < 6.0 ? 'warn' : 'danger');

      kAirVel.textContent = cur.vFace_ms.toFixed(1) + ' m/s (' + Math.round(cur.vFace_kmh) + ' km/h)';
      kAirVel.className = 'sim-kpi-val ' + (cur.vFace_ms < 5.0 ? 'good' : cur.vFace_ms < 10.0 ? 'warn' : 'danger');

      var fanDisplay = cur.pFan_kW > 999 ? (cur.pFan_kW / 1000).toFixed(1) + ' MW!' : cur.pFan_kW.toFixed(1) + ' kW';
      kFanPwr.textContent = fanDisplay + ' (H₂O: ' + cur.pPump_kW.toFixed(2) + ' kW)';
      kFanPwr.className = 'sim-kpi-val ' + (cur.pFan_kW < p.qKw * 0.1 ? 'good' : cur.pFan_kW < p.qKw * 0.25 ? 'warn' : 'danger');

      kWatFlow.textContent = cur.vDotWat_Lmin.toFixed(1) + ' L/min (' + (cur.vDotWat_Lmin / 60).toFixed(2) + ' L/s)';
      kWatFlow.className = 'sim-kpi-val good';

      kRatio.textContent = Math.round(cur.volRatio).toLocaleString() + '× less vol.';
      kRatio.className = 'sim-kpi-val good';

      var verdict = p.qKw <= 45 ? 'AIR FEASIBLE' : p.qKw <= 80 ? 'HYBRID / RDHx' : p.qKw <= 600 ? 'DLC COLD-PLATE' : '100% LIQUID / 2-PHASE';
      kRegime.textContent = verdict;
      kRegime.className = 'sim-kpi-val ' + (p.qKw <= 45 ? 'good' : p.qKw <= 80 ? 'warn' : 'danger');

      requestAnimationFrame(function () { safeFrame(frame, 'rack-thermal-wall'); });
    }
    setTimeout(function () { safeFrame(frame, 'rack-thermal-wall'); }, 50);
  });

  // -- Export --
  window.SimWidgets = { register: register, mount: mount };
})();
