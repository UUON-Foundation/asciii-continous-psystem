'use strict';
// ASCIII Continuous Psystem — Semantic field math (v5 core)
// 11-dimensional consciousness axis model
// Grounded in: Russell (1980), ANEW norms, Barrett (2017)
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0

const N_AX = 11;
// [valence, intensity, arousal, attention, salience,
//  integration, persistence, certainty, self-ref, agency, embodiment]

const AXIS_DEFAULTS = [0.50,0.50,0.40,0.50,0.35,0.55,0.50,0.50,0.30,0.50,0.40];

/**
 * scoreWord — convert a word to an 11D axis-delta vector
 * If word is in the built-in lexicon: empirically grounded values.
 * If unknown: deterministic signature from char codes.
 * @param {string} word
 * @returns {number[]} — length 11, range [-0.48, +0.48]
 */
function scoreWord(word) {
  const lw = word.toLowerCase().trim();
  if (LEXICON[lw]) return LEXICON[lw].slice();
  // Unknown word: deterministic signature — still gets unique position in 11D space
  const seed = lw.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
  return Array.from({ length: N_AX }, (_, i) => {
    const v = Math.sin(seed * 0.137 * (i + 1)) * 0.40 + Math.cos(seed * 0.071 * (i + 2)) * 0.20;
    return Math.max(-0.45, Math.min(0.45, v));
  });
}

/**
 * buildAxes — return a fresh axis state object at baseline
 */
function buildAxes() {
  return [
    {id:'valence',   lbl:'VALENCE',   base:0.50, cur:0.50, tgt:0.50},
    {id:'intensity', lbl:'INTENSITY', base:0.50, cur:0.50, tgt:0.50},
    {id:'arousal',   lbl:'AROUSAL',   base:0.40, cur:0.40, tgt:0.40},
    {id:'attention', lbl:'ATTENTION', base:0.50, cur:0.50, tgt:0.50},
    {id:'salience',  lbl:'SALIENCE',  base:0.35, cur:0.35, tgt:0.35},
    {id:'integratn', lbl:'INTEGRATN', base:0.55, cur:0.55, tgt:0.55},
    {id:'persist',   lbl:'PERSIST',   base:0.50, cur:0.50, tgt:0.50},
    {id:'certainty', lbl:'CERTAINTY', base:0.50, cur:0.50, tgt:0.50},
    {id:'selfref',   lbl:'SELF-REF',  base:0.30, cur:0.30, tgt:0.30},
    {id:'agency',    lbl:'AGENCY',    base:0.50, cur:0.50, tgt:0.50},
    {id:'embodiment',lbl:'EMBODY',    base:0.40, cur:0.40, tgt:0.40},
  ];
}

/**
 * applyWords — update axis targets from a list of words
 * @param {object[]} axes — from buildAxes()
 * @param {string[]} words
 * @returns {object[]} — updated axes
 */
function applyWords(axes, words) {
  axes.forEach(a => { a.tgt = a.base; });
  words.forEach(w => {
    const delta = scoreWord(w);
    axes.forEach((a, i) => { a.tgt = Math.max(0, Math.min(1, a.tgt + delta[i])); });
  });
  return axes;
}

// Partial lexicon export — core emotional/cognitive words
// Full lexicon lives in v5 frontend. This covers API use cases.
const LEXICON = {
  'joy':     [+.48,+.42,+.42,+.32,+.42,+.42,+.22,+.32,+.22,+.32,+.32],
  'pain':    [-.42,+.48,+.42,+.48,+.48,+.12,+.32,+.22,+.32,-.18,+.48],
  'fear':    [-.42,+.48,+.48,+.48,+.48,-.18,+.22,-.28,+.22,-.18,+.42],
  'love':    [+.48,+.42,+.32,+.32,+.42,+.48,+.42,+.32,+.32,+.22,+.32],
  'calm':    [+.32,-.18,-.28,+.22,-.08,+.42,+.32,+.42,+.22,+.22,+.12],
  'anger':   [-.18,+.48,+.48,+.48,+.48,-.28,+.12,+.12,+.22,+.48,+.42],
  'grief':   [-.48,+.42,-.08,+.42,+.42,-.18,+.48,-.18,+.42,-.18,+.42],
  'awe':     [+.32,+.48,+.32,+.48,+.48,+.42,+.32,-.08,+.12,+.12,+.32],
  'clarity': [+.32,+.22,+.12,+.32,+.32,+.48,+.32,+.48,+.22,+.32,+.22],
  'chaos':   [-.08,+.42,+.48,+.42,+.48,-.42,+.12,-.42,+.12,+.12,+.22],
  'flow':    [+.42,+.32,+.22,+.48,+.32,+.48,+.32,+.42,+.22,+.42,+.22],
  'meaning': [+.32,+.32,+.12,+.42,+.42,+.48,+.42,+.32,+.42,+.32,+.22],
};

module.exports = { scoreWord, buildAxes, applyWords, N_AX, AXIS_DEFAULTS };
