'use strict';
const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.json({ status:'ok', service:'asciii-continuous-psystem', version:'1.0.0', time: new Date().toISOString() });
});

router.get('/registry', (req, res) => {
  res.json({ name:'asciii-continuous-psystem', version:'1.0.0', author:'Phillip Aguilar Ruiz III', license:'SAL-1.0' });
});

module.exports = router;
