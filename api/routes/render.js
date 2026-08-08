'use strict';
// POST /v1/engines/asciii/render
// GET  /v1/engines/asciii/frame/:mode
// GET  /v1/engines/asciii/lyapunov
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0
const express = require('express');
const router  = express.Router();
const { renderField, renderVariance, renderMenger, renderDelta } = require('../lib/render');
const { computeLyapunov, phaseState } = require('../lib/attractor');
const { scoreWord } = require('../lib/semantic');

// In-memory rolling buffer — populated on render calls
// External systems push their state here, get an ASCIII frame back
const BUFFER = [];
const PERTURBED = [];
const MAX_BUF = 64;

/**
 * POST /v1/engines/asciii/render
 * Body: {
 *   mode: 'field'|'variance'|'menger'|'delta'|'lyapunov',
 *   nodes: [{ x, y, z?, E: { value } }],  // UFM node array from any engine
 *   params: { tick, resolution, frequency, density, palette, mengerLevel, zDepth },
 *   words: ['joy','grief']                  // optional — semantic mode
 * }
 * Returns: { frame: string, lyapunov: number, phase: string, tick: number }
 */
router.post('/render', (req, res) => {
  try {
    const { mode = 'field', nodes = [], params = {}, words = [] } = req.body;
    const tick = params.tick || 0;

    // Sample the field and push to buffer
    // For external callers: nodes carry the energy state of their system
    // ASCIII renders it, returns the frame + temporal analysis
    const { renderField: rf, wave } = require('../lib/render');

    // Build a snapshot from node energy values projected onto grid
    const W = params.resolution || 44;
    const H = Math.max(6, Math.floor(W * 0.42));
    const snap = new Float32Array(W * H);
    for (let row = 0; row < H; row++) {
      for (let col = 0; col < W; col++) {
        let v = wave((col/W)*6.2832, (row/H)*6.2832, tick*0.014, params.frequency||0.38, params.density||0.62);
        nodes.forEach(nd => {
          const dx=(col/W)-nd.x, dy=(row/H)-nd.y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<0.15) v+=nd.E.value*(1-dist/0.15)*0.4;
        });
        snap[row*W+col]=Math.max(-1,Math.min(1,v));
      }
    }
    BUFFER.push(snap); if(BUFFER.length>MAX_BUF) BUFFER.shift();
    // Perturbed: tiny noise injection for Lyapunov shadow trajectory
    const snapP=new Float32Array(snap.length);
    for(let i=0;i<snap.length;i++) snapP[i]=Math.max(-1,Math.min(1,snap[i]+(Math.random()-0.5)*0.002));
    PERTURBED.push(snapP); if(PERTURBED.length>MAX_BUF) PERTURBED.shift();

    // Render
    let frame = '';
    switch(mode) {
      case 'field':    frame = renderField(nodes, params);               break;
      case 'variance': frame = renderVariance(BUFFER, params);           break;
      case 'delta':    frame = renderDelta(BUFFER, params);              break;
      case 'menger':   frame = renderMenger(params.mengerLevel||2, params.zDepth||0, nodes, params); break;
      default:         frame = renderField(nodes, params);
    }

    const lyap  = computeLyapunov(BUFFER, PERTURBED);
    const phase = phaseState(lyap);

    res.json({ frame, lyapunov: lyap, phase, tick, buf: BUFFER.length,
               provenance: { author:'Phillip Aguilar Ruiz III', license:'SAL-1.0', engine:'asciii-continuous-psystem@1.0.0' } });
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /v1/engines/asciii/lyapunov
 * Returns current Lyapunov exponent and phase state
 * This is the signal the Endocrine layer broadcasts system-wide
 */
router.get('/lyapunov', (req, res) => {
  const lyap  = computeLyapunov(BUFFER, PERTURBED);
  const phase = phaseState(lyap);
  res.json({ lyapunov: lyap, phase, buf: BUFFER.length,
             description: 'Positive=chaos, Negative=order, EDGE=bifurcation boundary' });
});

/**
 * GET /v1/engines/asciii/word/:word
 * Returns the 11D axis-delta vector for a word — semantic scoring
 */
router.get('/word/:word', (req, res) => {
  const delta = scoreWord(req.params.word);
  res.json({ word: req.params.word, delta, axes: ['valence','intensity','arousal','attention',
    'salience','integration','persistence','certainty','self-ref','agency','embodiment'] });
});

module.exports = router;
