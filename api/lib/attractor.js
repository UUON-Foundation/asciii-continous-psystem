'use strict';
// ASCIII Continuous Psystem — Temporal attractor math (v4 core)
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0

/**
 * computeVarianceField — variance across a buffer of field snapshots
 * @param {Float32Array[]} buffer
 * @returns {Float32Array}
 */
function computeVarianceField(buffer) {
  if (!buffer || buffer.length < 2) return null;
  const n = buffer.length, sz = buffer[0].length;
  const vf = new Float32Array(sz);
  for (let i = 0; i < sz; i++) {
    let s = 0, s2 = 0;
    for (let k = 0; k < n; k++) { s += buffer[k][i]; s2 += buffer[k][i] * buffer[k][i]; }
    const m = s / n;
    vf[i] = Math.sqrt(Math.max(0, s2 / n - m * m));
  }
  return vf;
}

/**
 * computeLyapunov — running Lyapunov exponent estimate
 * Positive = chaos (diverging). Negative = order (converging).
 * @param {Float32Array[]} buffer       - main trajectory
 * @param {Float32Array[]} perturbedBuf - shadow trajectory (tiny perturbation applied)
 * @returns {number} — lambda
 */
function computeLyapunov(buffer, perturbedBuf) {
  if (!buffer || !perturbedBuf || buffer.length < 3 || perturbedBuf.length < 3) return 0;
  let lyapSum = 0, count = 0;
  const n = Math.min(buffer.length, perturbedBuf.length);
  for (let k = 1; k < n; k++) {
    const snap  = buffer[k];
    const snapP = perturbedBuf[k];
    const prev  = buffer[k - 1];
    const prevP = perturbedBuf[k - 1];
    if (!snap || !snapP || !prev || !prevP) continue;
    let d = 0, pd = 0;
    for (let i = 0; i < snap.length; i++) {
      d  += (snap[i]  - snapP[i])  * (snap[i]  - snapP[i]);
      pd += (prev[i]  - prevP[i])  * (prev[i]  - prevP[i]);
    }
    d  = Math.sqrt(d  / snap.length);
    pd = Math.sqrt(pd / snap.length);
    if (d > 0 && pd > 0) { lyapSum += Math.log(d / pd); count++; }
  }
  return count > 0 ? lyapSum / count : 0;
}

/**
 * computeAutocorr — autocorrelation at a given lag
 * 1.0 = perfect memory. 0 = no memory. Negative = anti-correlated.
 * @param {Float32Array[]} buffer
 * @param {number} lag
 * @returns {number}
 */
function computeAutocorr(buffer, lag = 1) {
  if (!buffer || buffer.length <= lag) return 0;
  const n = buffer.length, sz = buffer[0].length;
  let cov = 0, v0 = 0;
  for (let i = 0; i < sz; i++) {
    const a = buffer[n - 1][i], b = buffer[n - 1 - lag][i];
    cov += a * b;
    v0  += a * a;
  }
  return v0 > 0 ? Math.max(-1, Math.min(1, cov / v0)) : 0;
}

/**
 * phaseState — classify system based on Lyapunov exponent
 * @param {number} lambda
 * @param {number} threshold (default 0.06)
 * @returns {'CHAOS'|'ORDER'|'EDGE'}
 */
function phaseState(lambda, threshold = 0.06) {
  if (lambda >  threshold) return 'CHAOS';
  if (lambda < -threshold) return 'ORDER';
  return 'EDGE';
}

module.exports = { computeVarianceField, computeLyapunov, computeAutocorr, phaseState };
