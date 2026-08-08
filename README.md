# ASCIII Continuous Psystem

**@uuon-foundation/asciii-continuous-psystem**

Character-space field rendering and provenance layer for the clouud biological OS.

**Author:** Phillip Aguilar Ruiz III  
**Entity:** UUON Foundation Inc.  
**License:** SAL-1.0  
**Contact:** phi1@uuonfoundation.com

---

## What it is

Five versions of the ASCIII engine, a Node.js API, and a plug-in/connector interface.
Any system that produces numerical state can POST it here and receive a plain-text
ASCIII frame back — readable by humans, queryable by machines, storable as a flat file.

## Frontends

| Version | URL | Description |
|---------|-----|-------------|
| v1 | `/` | 7-bit base field language |
| v2 | `/v2` | 8-bit extended — 256 character slots |
| v3 | `/v3` | Menger 3D volumetric field |
| v4 | `/v4` | Temporal attractor — Lyapunov, Poincaré |
| v5 | `/v5` | Semantic attractor — 11D consciousness axes |

## API

```
POST /v1/engines/asciii/render   — render any node state as a field frame
GET  /v1/engines/asciii/lyapunov — current chaos measurement
GET  /v1/engines/asciii/word/:w  — semantic axis score for a word
GET  /v1/plugin/manifest         — MCP/Claude connector manifest
GET  /v1/plugin/openapi.json     — OpenAPI spec for REST connectors
GET  /health                     — health check
```

## Install as dependency

```bash
npm install @uuon-foundation/asciii-continuous-psystem
```

```js
const { renderField, computeLyapunov, inMenger, scoreWord } = require('@uuon-foundation/asciii-continuous-psystem');
```

## gate-uuay registry entry

```js
{ id:'asciii-continuous-psystem', layer:null, bio:'Universal Display Layer',
  stream:false, auth:'PUBLIC', npm:'@uuon-foundation/asciii-continuous-psystem@1.0.0',
  endpoint:'POST /v1/engines/asciii/render', status:'live' }
```
