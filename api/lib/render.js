'use strict';
// ASCIII Continuous Psystem — Field render functions
// These are the character-space renderers. Input: numerical state.
// Output: plain-text string. No DOM, no browser required.
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0

const { inMenger } = require('./menger');

const PALETTES = {
  density:  [' ','·','░','▒','▓','█'],
  organic:  [' ','·',',',';','o','O','@'],
  symbolic: [' ','·','◦','○','◎','●'],
  variance: [' ','·','˙','░','▒','▓','█','◈','◈','✕','✕'],
  attractor:[' ','·','∘','○','◎','●','◉','◈','▓'],
};

function charFor(v, palette = 'density') {
  const chars = PALETTES[palette] || PALETTES.density;
  const norm  = Math.max(0, Math.min(1, (v + 1) / 2));
  return chars[Math.min(chars.length - 1, Math.floor(norm * chars.length))];
}

function normalize(arr) {
  let mn = Infinity, mx = -Infinity;
  for (let i = 0; i < arr.length; i++) { if (arr[i] < mn) mn = arr[i]; if (arr[i] > mx) mx = arr[i]; }
  const rng = mx - mn || 1;
  const out = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = (arr[i] - mn) / rng;
  return out;
}

function wave(x, y, t, frequency = 0.38, density = 0.62) {
  const f = frequency;
  return (
    Math.sin(x * f + t * 0.71) * Math.cos(y * f * 0.83 + t * 0.53) +
    Math.sin(x * f * 1.31 - y * f * 0.62 + t * 0.29) * 0.5 +
    Math.cos((x + y) * f * 0.47 + t * 0.91) * 0.25
  ) / 1.75 * density;
}

/**
 * renderField — base field renderer
 * @param {Array} nodes - UFM node array [{ x, y, E: { value } }]
 * @param {Object} params - { tick, resolution, frequency, density, palette }
 * @returns {string} — plain-text ASCIII frame with provenance header
 */
function renderField(nodes = [], params = {}) {
  const { tick = 0, resolution = 44, frequency = 0.38,
          density = 0.62, palette = 'density' } = params;
  const W = resolution, H = Math.max(6, Math.floor(W * 0.42));
  const t = tick;
  const lines = [];

  lines.push(`ASCIII·FIELD  t=${String(t).padStart(6,'0')}  res=${W}×${H}  pal=${palette.toUpperCase()}`);
  lines.push(`Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0`);
  lines.push('');

  let totalE = 0;
  for (let row = 0; row < H; row++) {
    let line = '';
    for (let col = 0; col < W; col++) {
      const x = (col / W) * 6.2832, y = (row / H) * 6.2832;
      let v = wave(x, y, t, frequency, density);
      nodes.forEach(nd => {
        const dx = (col / W) - nd.x, dy = (row / H) - nd.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.15) v += nd.E.value * (1 - dist / 0.15) * 0.4;
      });
      v = Math.max(-1, Math.min(1, v));
      totalE += Math.abs(v);
      line += charFor(v, palette);
    }
    lines.push(line);
  }
  const energy = (totalE / (W * H)).toFixed(5);
  lines.push('');
  lines.push(`energy:${energy}  nodes:${nodes.length}  tick:${t}`);
  return lines.join('\n');
}

/**
 * renderVariance — temporal stability map from buffer
 * @param {Float32Array[]} buffer - rolling field snapshots
 * @param {Object} params
 * @returns {string}
 */
function renderVariance(buffer = [], params = {}) {
  const { tick = 0, resolution = 44, palette = 'variance' } = params;
  if (buffer.length < 2) return `ASCIII·VARIANCE  t=${String(tick).padStart(6,'0')}\nBuilding buffer (${buffer.length} frames)…`;
  const W = resolution, H = Math.max(6, Math.floor(W * 0.42));
  const n = buffer.length;
  const sz = W * H;
  const varField = new Float32Array(sz);
  for (let i = 0; i < sz; i++) {
    let s = 0, s2 = 0;
    for (let k = 0; k < n; k++) { const v = buffer[k][i] || 0; s += v; s2 += v * v; }
    const m = s / n; varField[i] = Math.sqrt(Math.max(0, s2 / n - m * m));
  }
  const nf = normalize(varField);
  const lines = [`ASCIII·VARIANCE  t=${String(tick).padStart(6,'0')}  buf=${n}  SAL-1.0`, ''];
  for (let row = 0; row < H; row++) {
    let line = '';
    for (let col = 0; col < W; col++) {
      const chars = PALETTES[palette] || PALETTES.variance;
      const idx = Math.min(chars.length - 1, Math.floor(nf[row * W + col] * chars.length));
      line += chars[idx];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/**
 * renderBasin — attractor basin topology
 */
function renderBasin(buffer = [], perturbedBuffer = [], params = {}) {
  const { tick = 0, resolution = 44 } = params;
  if (buffer.length < 4) return `ASCIII·BASIN  t=${String(tick).padStart(6,'0')}\nBuilding buffer…`;
  const W = resolution, H = Math.max(6, Math.floor(W * 0.42));
  const n = buffer.length, sz = W * H;
  const varField = new Float32Array(sz);
  const divField = new Float32Array(sz);
  const last = buffer.length - 1;
  for (let i = 0; i < sz; i++) {
    let s = 0, s2 = 0;
    for (let k = 0; k < n; k++) { const v = buffer[k][i] || 0; s += v; s2 += v * v; }
    const m = s / n; varField[i] = Math.sqrt(Math.max(0, s2 / n - m * m));
    if (perturbedBuffer[last]) divField[i] = Math.min(1, Math.abs((buffer[last][i] || 0) - (perturbedBuffer[last][i] || 0)) * 16);
  }
  let vmx = 0, dmx = 0;
  for (let i = 0; i < sz; i++) { if (varField[i] > vmx) vmx = varField[i]; if (divField[i] > dmx) dmx = divField[i]; }
  vmx = vmx || 1; dmx = dmx || 1;
  const chars = PALETTES.attractor;
  const lines = [`ASCIII·BASIN  t=${String(tick).padStart(6,'0')}  SAL-1.0`, ''];
  for (let row = 0; row < H; row++) {
    let line = '';
    for (let col = 0; col < W; col++) {
      const i = row * W + col;
      const v = varField[i] / vmx, d = divField[i] / dmx;
      if (v > 0.40 && d > 0.35) line += '✕';
      else { const idx = Math.min(chars.length - 1, Math.floor(((v + d) / 2) * chars.length)); line += chars[idx]; }
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/**
 * renderDelta — rate of change across the field
 */
function renderDelta(buffer = [], params = {}) {
  const { tick = 0, resolution = 44 } = params;
  if (buffer.length < 2) return `ASCIII·DELTA  t=${String(tick).padStart(6,'0')}\nNeed 2+ frames…`;
  const W = resolution, H = Math.max(6, Math.floor(W * 0.42));
  const last = buffer[buffer.length - 1], prev = buffer[buffer.length - 2];
  let mx = 0;
  for (let i = 0; i < last.length; i++) { const d = Math.abs(last[i] - prev[i]); if (d > mx) mx = d; }
  mx = mx || 1;
  const chars = [' ','·','─','═','≈','≋','▒','▓','◈','✕'];
  const lines = [`ASCIII·DELTA  t=${String(tick).padStart(6,'0')}  SAL-1.0`, ''];
  for (let row = 0; row < H; row++) {
    let line = '';
    for (let col = 0; col < W; col++) {
      const d = Math.abs(last[row * W + col] - prev[row * W + col]) / mx;
      line += chars[Math.min(chars.length - 1, Math.floor(d * chars.length))];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/**
 * renderMenger — 2D face-plane slice at given z depth
 */
function renderMenger(level = 2, zDepth = 0, nodes = [], params = {}) {
  const { tick = 0, resolution = 44, frequency = 0.38, density = 0.62, palette = 'density' } = params;
  const gridSize = Math.pow(3, level);
  const W = Math.min(resolution, 48), H = Math.floor(W * 0.45);
  const zSlice = zDepth / Math.max(1, gridSize - 1);
  const lines = [
    `ASCIII·MENGER  t=${String(tick).padStart(6,'0')}  level=${level}  z=${zDepth}/${gridSize}`,
    `dim=log(20)/log(3)≈2.7268  SAL-1.0`,
    '',
  ];
  let surv = 0, total = 0;
  for (let row = 0; row < H; row++) {
    let line = '';
    for (let col = 0; col < W; col++) {
      const ix = Math.floor((col / W) * gridSize);
      const iy = Math.floor((row / H) * gridSize);
      total++;
      if (inMenger(ix, iy, zDepth, level)) {
        surv++;
        let v = wave((col / W) * 6.2832, (row / H) * 6.2832, tick * 0.014, frequency, density);
        nodes.forEach(nd => {
          const dx = (col / W) - nd.x, dy = (row / H) - nd.y;
          const dist = Math.sqrt(dx * dx + dy * dy + (zSlice - (nd.z || 0)) * (zSlice - (nd.z || 0)) * 0.5);
          if (dist < 0.18) v += nd.E.value * (1 - dist / 0.18) * 0.4;
        });
        v = Math.max(-1, Math.min(1, v));
        line += charFor(v, palette);
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }
  lines.push('');
  lines.push(`surviving:${surv}/${total} (${(surv/total*100).toFixed(1)}%)  void:${total-surv}`);
  return lines.join('\n');
}

module.exports = { renderField, renderVariance, renderBasin, renderDelta, renderMenger, wave, charFor };
