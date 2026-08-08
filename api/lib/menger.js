'use strict';
// ASCIII Continuous Psystem — Menger sponge geometry (v3 core)
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0

// Hausdorff dimension: log(20)/log(3) ≈ 2.7268...
const MENGER_DIM = Math.log(20) / Math.log(3);

/**
 * inMenger — check if cell (ix,iy,iz) survives the Menger removal rule
 * Uses the 3×3×3 removal rule: a cell is void if at any recursion level
 * two or more of its (x%3, y%3, z%3) coordinates equal 1 (face centers).
 * @param {number} ix, iy, iz — integer grid coordinates
 * @param {number} level — recursion depth
 * @returns {boolean}
 */
function inMenger(ix, iy, iz, level) {
  let x = ix, y = iy, z = iz;
  for (let l = 0; l < level; l++) {
    const rx = x % 3, ry = y % 3, rz = z % 3;
    const mid = (rx === 1 ? 1 : 0) + (ry === 1 ? 1 : 0) + (rz === 1 ? 1 : 0);
    if (mid >= 2) return false;
    x = Math.floor(x / 3);
    y = Math.floor(y / 3);
    z = Math.floor(z / 3);
  }
  return true;
}

/**
 * buildMengerCells — return all surviving and void cell coordinates
 * at a given recursion level. Sampled for performance at level 3+.
 * @param {number} level
 * @returns {{ cells: Array, voids: Array, survivalRate: number }}
 */
function buildMengerCells(level) {
  const gridSize = Math.pow(3, level);
  const step = level >= 3 ? 3 : 1;
  const cells = [], voids = [];
  for (let iz = 0; iz < gridSize; iz += step) {
    for (let iy = 0; iy < gridSize; iy += step) {
      for (let ix = 0; ix < gridSize; ix += step) {
        const cell = { x: ix / gridSize, y: iy / gridSize, z: iz / gridSize, ix, iy, iz };
        if (inMenger(ix, iy, iz, level)) cells.push(cell);
        else voids.push(cell);
      }
    }
  }
  const total = cells.length + voids.length;
  return { cells, voids, survivalRate: total > 0 ? cells.length / total : 0 };
}

module.exports = { inMenger, buildMengerCells, MENGER_DIM };
