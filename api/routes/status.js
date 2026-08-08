'use strict';
// GET /health
// GET /v1/registry
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0
const express = require('express');
const router  = express.Router();

const MANIFEST = {
  name:        'asciii-continuous-psystem',
  version:     '1.0.0',
  author:      'Phillip Aguilar Ruiz III',
  entity:      'UUON Foundation Inc.',
  license:     'SAL-1.0',
  description: 'Character-space field rendering and provenance layer for the clouud biological OS',
  bio:         'Universal Display Layer — spans all biological systems',
  endpoints: {
    render:   'POST /v1/engines/asciii/render',
    lyapunov: 'GET  /v1/engines/asciii/lyapunov',
    word:     'GET  /v1/engines/asciii/word/:word',
    manifest: 'GET  /v1/plugin/manifest',
    openapi:  'GET  /v1/plugin/openapi.json',
  },
  frontends: { v1:'/', v2:'/v2', v3:'/v3', v4:'/v4', v5:'/v5' },
};

router.get('/health', (req, res) => {
  res.json({ status:'ok', service:'asciii-continuous-psystem', version:'1.0.0',
             time: new Date().toISOString() });
});

router.get('/v1/registry', (req, res) => {
  res.json(MANIFEST);
});

module.exports = router;
