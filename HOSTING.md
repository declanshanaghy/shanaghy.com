# shanaghy.com — Hosting & Publishing Design

What this is: a hosting platform for random session publishing and other random
stuff. A convention-driven static site that any machine in the agent fleet
(cork, hal-9005, the Mac, any mossy) can publish to with nothing but git.

The garden grows in `web/` — a Next.js static export. `git push` to `main`
is the entire CMS: GitHub Actions builds the garden once and serves it on
GitHub Pages at `www.shanaghy.com`, the one bed and the only server of
this content. (A parallel GKE bed at `gke.shanaghy.com` stood briefly and
was decommissioned 2026-11-05 — the garden serves from Pages alone.)

---

## 1. Repo layout

    web/                    the garden — everything below ships
      content/              page bodies (creed, laws, profiles, projects,
                            sessions, sites, videos, index…)
        garden.json         the living garden's souls — every entity the
                            /garden/ scene displays; grown, not drawn
      pages/                one route per page; owns title + meta description
      public/              shipped verbatim into the build output
        CNAME               shanaghy.com — must match the Pages setting
        robots.txt, sitemap.xml, favicon.svg, assets/
      lib/                  ContentPage.js — the one source of truth for
                            header, footer, nav on every page
      styles/               page css
    infrastructure/k8s/     values.env for pack dispatch orchestration —
                            the fleet's GKE agent jobs, not a serving bed
    .github/workflows/deploy.yml      the Pages pipeline — canonical www
    data/                   catalogs for The Sync (projects, videos, profiles)
                            + towers-photos.json — the private Google Photos
                            albums' manifest (grove + piece lore, Google ids)
    scripts/gen_sitemap.py  regenerates web/public/sitemap.xml + robots.txt
                            from web/pages + web/content; run when routes change
    scripts/gen_garden.py   renders the living-garden scene SVG between the
                            garden-scene markers in web/content/garden.html
                            from web/content/garden.json; run when souls change
    scripts/sync_towers_photos.py
                            draws the Towers' second source: drives the Photos
                            Picker API (a pick session per album — Google's
                            Library API no longer reads private libraries),
                            downloads thumbs to web/public/assets/towers/,
                            renders groves between the towers-photos markers
                            in videos.html; OAuth creds live in ~/.hermes/,
                            never in the repo
    HOSTING.md              this doc

There is no second static layer. If a file isn't under `web/`, `data/`, or
`scripts/`, it doesn't ship.

---

## 2. Hosting: GitHub Pages (via Actions)

`.github/workflows/deploy.yml` on every push to `main`:

1. `npm ci && npm run build` in `web/` (Next static export → `web/out/`)
2. the built 404 page copied to `web/out/404.html`; `.nojekyll` touched
3. `web/out` uploaded as the Pages artifact and deployed

Why Pages:

- **Agent-friendly publishing.** The entire CMS is `git push`. No API tokens
  for a hosted service, no dashboard, no upload step. Anything that can commit
  can publish — which is exactly the fleet's capability set.
- **Free TLS.** GitHub provisions and renews the cert for the custom domain.
- **Zero maintenance.** No server to babysit. cork stays free for actual
  dynamic workloads.

What Pages can't do — no server-side anything, no API of its own — stays
that way.

### Escape hatch: cork

If something needs to be dynamic (API, search, webhooks, a small app), it does
**not** move the site. Instead, run the service on cork (192.168.1.3, Linux,
docker/portainer) and expose it on a subdomain:

- **Cloudflare Tunnel** (preferred): outbound-only connection from cork, no
  port forwarding, no home-IP exposure, works behind NAT. `api.shanaghy.com`
  or similar points at the tunnel, not at Pages.
- **Caddy** as a reverse proxy on cork, if DNS is ever moved somewhere that
  points a subdomain directly at the house.

Pages keeps serving `www`/apex content forever; subdomains are a separate
problem with a separate, cheap solution. This split is deliberate.

---

## 3. DNS setup

At the registrar (or wherever shanaghy.com's DNS lives). GitHub Pages'
documented addresses:

Apex (`shanaghy.com`) — four A records:

    185.199.108.153
    185.199.109.153
    185.199.110.153
    185.199.111.153

and four AAAA records:

    2606:50c0:8000::153
    2606:50c0:8001::153
    2606:50c0:8002::153
    2606:50c0:8003::153

`www` — CNAME:

    www  CNAME  declanshanaghy.github.io

The canonical name is `www.shanaghy.com` (apex 301s to it). The same name
sits in repo Settings → Pages → Custom domain and in `web/public/CNAME`
(one line, the bare domain) — the two must match or each deploy
un-configures the other.

After DNS propagates, wait for GitHub to issue the cert, then enable
**Enforce HTTPS**.

Notes:

- If DNS moves behind Cloudflare later, set the Pages records to
  **DNS-only (grey cloud)** — proxying breaks GitHub's cert validation.
- Subdomains — cork services — are their own records;
  they never touch the apex/www records.

---

## 4. Agent workflow

1. Clone once per machine:
   `git clone git@github.com:declanshanaghy/shanaghy.com.git`
   — or HTTPS with a credential helper. Repo-scoped deploy keys or a
   fine-grained PAT with `contents: write` on this repo only. No
   fleet-wide tokens.
2. Publish: add or edit a page body under `web/content/` and its route
   under `web/pages/` (sessions land in `web/content/sessions/`, filed by
   project bed). New pages need a route file and an index/card entry where
   the bed has one.
3. Commit, message style: **lowercase, `site:` prefix, imperative**, e.g.

       site: add session the-ballad-of-many-mossys
       site: tweak creed meta tags

4. Build locally before pushing — `npm ci && npm run build` in `web/` —
   and assert the built page in `web/out/` carries what you meant
   (law 10: what is generated is asserted).
5. `git pull --rebase` then `git push` to `main`. Don't force-push main;
   don't rework other machines' files. Actions deploys in about a minute —
   verify at the live URL before reporting done.

Concurrent publishes from multiple machines are fine as long as everyone
rebases before pushing.
