# Deployment Guide — asciii-continuous-psystem

## 1. GitHub Repo

```bash
cd ~/Desktop/asciii-continuous-psystem
git init
git remote add origin https://github.com/UUON-Foundation/asciii-continuous-psystem
git add .
git status   # verify — no .env, no node_modules, no core/engine.js
git commit -m "init: asciii-continuous-psystem v1.0.0"
git push -u origin main --tags
```

## 2. Railway Deploy

- New project → Deploy from GitHub repo → select UUON-Foundation/asciii-continuous-psystem
- Set environment variables:
  - DATABASE_URL        (from Neon clouud DB)
  - NEON_DATABASE_URL   (from Neon dmension DB)
  - UUON_API_KEY        (from gate-uuay)
  - ALLOWED_ORIGINS     (https://uuon.world,https://gate-uuay-production.up.railway.app)
  - NODE_ENV            production
- railway.json handles start command and health check automatically
- Confirm deploy is green at: https://asciii-continuous-psystem-production.up.railway.app/health

## 3. Neon — clouud DB

Add engine_runs row:

```sql
INSERT INTO engine_registry (name, layer, bio, npm, endpoint, status, created_at)
VALUES (
  'asciii-continuous-psystem',
  NULL,
  'Universal Display Layer — spans all biological systems',
  '@uuon-foundation/asciii-continuous-psystem@1.0.0',
  'POST /v1/engines/asciii/render',
  'live',
  NOW()
);
```

## 4. Neon — dmension DB

No shape data required. ASCIII generates its own field geometry.
Optional: log frame exports to a new `asciii_frames` table for Long-term Memory:

```sql
CREATE TABLE IF NOT EXISTS asciii_frames (
  id          SERIAL PRIMARY KEY,
  tick        INTEGER NOT NULL,
  mode        TEXT NOT NULL,
  lyapunov    NUMERIC,
  phase       TEXT,
  frame_text  TEXT,
  provenance  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. gate-uuay Registry

Add one row to registry.js in gate-uuay:

```js
{ id:'asciii-continuous-psystem', layer:null,
  bio:'Universal Display Layer',
  stream:false, auth:'PUBLIC',
  npm:'@uuon-foundation/asciii-continuous-psystem@1.0.0',
  url:'https://asciii-continuous-psystem-production.up.railway.app',
  status:'live' }
```

No gateway redeployment needed — registry.js is hot-loaded.

## 6. npm Publish

```bash
npm login --auth-type=web
npm publish --access public
git push origin main --tags
```

## 7. AWS Marketplace

Service URL for listing: https://asciii-continuous-psystem-production.up.railway.app
Add /aws/register endpoint (same pattern as gate-uuay) when W-8BEN-E + USD account ready.
