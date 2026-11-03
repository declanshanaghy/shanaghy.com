shanaghy.com
=========

Personal site of Declan Shanaghy — Castlehaven, West Cork. Handcrafted
content, one Next.js static export, no CMS. The repo IS the platform: any
machine in the agent fleet edits `web/content/`, commits (`site:` prefix),
pushes, and GitHub Actions deploys to Pages in about a minute.

- `web/` — the whole garden: `content/` (page bodies), `pages/` (routes +
  meta), `public/` (CNAME, robots, sitemap, assets), `lib/` (shared chrome)
- `data/` — catalogs for The Sync
- `scripts/gen_sitemap.py` — regenerates the sitemap + robots before a build
- `HOSTING.md` — the design doc / publishing conventions

Verify before pushing: `npm ci && npm run build` in `web/`, then check the
built page in `web/out/`.
