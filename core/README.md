# core/

This directory is for proprietary engine logic — gitignored from the public repo.

`core/engine.js` lives on your Mac and is served from uuon.world with:
  - `Cross-Origin-Resource-Policy: cross-origin`
  - `Content-Type: application/javascript`

The public API layer (`api/lib/`) exposes the render functions.
The core proprietary algorithms remain protected.

Do not commit any files from this directory.
