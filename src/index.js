'use strict';
// ASCIII Continuous Psystem — API Server
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const renderRoutes = require('../api/routes/render');
const statusRoutes = require('../api/routes/status');
const pluginRoutes = require('../api/routes/plugin');

const app  = express();
const PORT = process.env.PORT || 3007;

app.use(helmet({ contentSecurityPolicy:false, crossOriginResourcePolicy:{ policy:'cross-origin' } }));

const origins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin:(o,cb)=>(!o||origins.includes(o)||origins.length===0)?cb(null,true):cb(new Error('CORS')),
  methods:['GET','POST','OPTIONS'],
  allowedHeaders:['Content-Type','X-API-Key','Authorization'],
}));
app.use(express.json({ limit:'1mb' }));
app.use('/v1/', rateLimit({ windowMs:60_000, max:120, standardHeaders:true, legacyHeaders:false }));

// Static frontends — v1 at root (first thing front-end users see)
app.use('/',   express.static(path.join(process.cwd(), 'public/v1')));
app.use('/v2', express.static(path.join(process.cwd(), 'public/v2')));
app.use('/v3', express.static(path.join(process.cwd(), 'public/v3')));
app.use('/v4', express.static(path.join(process.cwd(), 'public/v4')));
app.use('/v5', express.static(path.join(process.cwd(), 'public/v5')));

// API
app.use('/v1/engines/asciii', renderRoutes);
app.use('/health',            statusRoutes);
app.use('/v1/plugin',         pluginRoutes);

app.use((req,res)=>res.status(404).json({ error:'not found', path:req.path }));
app.use((err,req,res,next)=>{ console.error(err.message); res.status(500).json({ error:'internal error' }); });

app.listen(PORT, ()=>{
  console.log(`ASCIII Continuous Psystem — port ${PORT}`);
  console.log(`Frontends: / /v2 /v3 /v4 /v5`);
  console.log(`API: POST /v1/engines/asciii/render`);
});
