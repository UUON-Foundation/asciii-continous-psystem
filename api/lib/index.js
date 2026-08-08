'use strict';
// ASCIII Continuous Psystem — Node.js module
// This is what other engines install via npm and require()
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0

const { renderField, renderVariance, renderBasin,
        renderDelta, renderMenger } = require('./render');
const { computeLyapunov, computeVarianceField,
        computeAutocorr }          = require('./attractor');
const { inMenger, buildMengerCells,
        MENGER_DIM }               = require('./menger');
const { scoreWord, buildAxes }     = require('./semantic');

module.exports = {
  // ── Field renderers — returns a plain-text string ──────────────────────
  renderField,       // (nodes, params) → string
  renderVariance,    // (fieldBuffer, params) → string
  renderBasin,       // (fieldBuffer, perturbedBuffer, params) → string
  renderDelta,       // (fieldBuffer, params) → string
  renderMenger,      // (level, zDepth, nodes, params) → string

  // ── Temporal analysis — returns numbers ───────────────────────────────
  computeLyapunov,   // (fieldBuffer, perturbedBuffer) → float
  computeVarianceField, // (fieldBuffer) → Float32Array
  computeAutocorr,   // (fieldBuffer, lag) → float

  // ── Menger geometry ───────────────────────────────────────────────────
  inMenger,          // (ix, iy, iz, level) → bool
  buildMengerCells,  // (level) → { cells, voids }
  MENGER_DIM,        // 2.7268... — Hausdorff dimension

  // ── Semantic (v5) ─────────────────────────────────────────────────────
  scoreWord,         // (word) → Float32Array[11] — axis delta vector
  buildAxes,         // () → axis state object

  // ── Provenance ────────────────────────────────────────────────────────
  provenance: {
    author:  'Phillip Aguilar Ruiz III',
    entity:  'UUON Foundation Inc.',
    license: 'SAL-1.0',
    version: '1.0.0',
    package: '@uuon-foundation/asciii-continuous-psystem',
  },
};
