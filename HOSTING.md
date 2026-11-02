# shanaghy.com — Hosting & Publishing Design

What this is: a hosting platform for random session publishing and other random
stuff. Not just a static page — a lightweight, convention-driven site that any
machine in the agent fleet (cork, hal-9005, the Mac laptop, any mossy) can
publish to with nothing but git.

Design floor: plain HTML files, no framework, no build step, no server. A file
pushed to `main` is live ~60 seconds later. Everything in this doc exists to
keep that invariant true.

---

## 1. Hosting: GitHub Pages

Served from `github.com/declanshanaghy/shanaghy.com`, branch `main`, site root
`/` (Settings → Pages → deploy from branch).

Why Pages:

- **Agent-friendly publishing.** The entire CMS is `git push`. No API tokens
  for a hosted service, no dashboard, no upload step. Anything that can commit
  can publish — which is exactly the fleet's capability set.
- **Free TLS.** GitHub provisions and renews the cert for the custom domain.
- **Static content is the feature.** Session writeups, notes, and misc pages
  are all plain HTML. Nothing to compromise, nothing to patch.
- **Zero maintenance.** No server to babysit, no dependency upgrades, no
  monitoring. cork stays free for actual dynamic workloads.

What Pages can't do:

- No server-side anything: no PHP, no CGI, no form handlers, no auth.
- No API surface of its own — publishing *is* the git API.
- No dynamic routing; URL structure is literal file structure.

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

## 2. DNS setup

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

Pick one canonical name (recommend the apex, with `www` redirecting to it).
Set the same name in repo Settings → Pages → Custom domain, and in a `CNAME`
file at the repo root — a file literally named `CNAME` containing one line,
the bare domain, e.g. `shanaghy.com`. The CNAME file must match the Pages
setting or each push un-configures the other.

After DNS propagates, wait for GitHub to issue the cert, then enable
**Enforce HTTPS**.

Notes:

- If DNS moves behind Cloudflare later (likely, given the tunnel plan), set
  the Pages records to **DNS-only (grey cloud)** — proxying breaks GitHub's
  cert validation.
- Subdomains for cork services (escape hatch above) are added as their own
  records later; they never touch the apex/www records.

---

## 3. Publishing conventions

Repo layout:

    /                       landing page (index.html), 404.html, CNAME, .nojekyll
    sessions/               one HTML file per session
      _TEMPLATE.html        copy this to start a new session
      index.html            hand-maintained index of all sessions
      YYYY-MM-DD-slug.html  session pages (sortable by filename)
    stuff/                  misc one-off pages that aren't sessions
    assets/                 shared css, fonts, images used by more than one page

Rules of the floor:

- **`sessions/` is the unit of publishing.** A session is a single
  self-contained HTML file, dropped into the directory. Filename is
  `YYYY-MM-DD-slug.html` so `sessions/index.html` (and humans) can keep
  chronological order for free.
- **`_TEMPLATE.html` is the only boilerplate.** Copy it, fill in title, date,
  and content. Don't edit the template unless changing it for everyone —
  that's the one shared file.
- **`sessions/index.html` gets a new entry every publish.** One `<li>` with a
  link and one-line description, newest first. This is the only manual
  bookkeeping in the whole system; keep it disciplined.
- **`stuff/` is a junk drawer.** Anything that isn't a session — link lists,
  scratch pages, embeddable assets — goes here and does not appear in the
  sessions index.
- **`assets/` is shared.** Site css lives in `assets/` and is referenced
  relatively from pages so it works from any directory depth.
- Add **`.nojekyll`** at the root. What you push is what gets served — no
  Liquid processing to mangle content containing `{{ }}`. Side effect:
  `_TEMPLATE.html` is technically fetchable at `/sessions/_TEMPLATE.html`.
  Harmless.

---

## 4. Agent workflow

Any machine in the fleet, from any of its agents:

1. Clone once (per machine):
   `git clone git@github.com:declanshanaghy/shanaghy.com.git`
   — or HTTPS with a credential helper. Repo-scoped deploy keys or a
   fine-grained PAT with `contents: write` on this repo only. No
   fleet-wide tokens.
2. Publish a session:
   - `cp sessions/_TEMPLATE.html sessions/$(date +%F)-slug.html`
   - Fill in the content.
   - Add the `<li>` entry to `sessions/index.html`.
   - `git add` the two files.
3. Commit, message style: **lowercase, `site:` prefix, imperative**, e.g.

       site: add session 2026-11-01-hermes-notes
       site: tweak template meta tags
       site: add stuff/keyboard-firmware-links

4. `git pull --rebase` then `git push` to `main`. Don't force-push main;
   don't rework other machines' files.
5. Pages deploys in about a minute. Verify at the live URL before
   reporting done.

That's the whole workflow: clone, drop a file, index it, `site:` commit,
push. No build, no deploy step, no credentials beyond the one git remote.

Concurrent publishes from multiple machines are fine as long as everyone
rebases before pushing; conflict surface is one file (`sessions/index.html`)
plus new files that don't collide (timestamps make collisions rare).

---

## 5. Future extensions

Ordered by cheapness, all optional, none break the plain-HTML floor:

- **Custom 404** — drop a `404.html` at the root; Pages serves it
  automatically for any missing path. Same template, different banner.
- **Per-session OG tags** — `og:title`, `og:description`, `og:url`,
  `article:published_time` in the template head so sessions unfurl properly
  in Slack/Telegram/Discord when agents share links.
- **RSS feed for sessions** — a static `sessions/feed.xml`, hand-maintained
  at first (same discipline as the index), later generated by the build
  script below.
- **Tags/categories** — a small `sessions/index.json` listing title, date,
  slug, and tags per session, updated on publish alongside the index. Gives
  filtering later without imposing a build system now.
- **Build script** — when hand-maintaining the index and feed gets
  error-prone, add `scripts/build.py`: scan `sessions/*.html` for `<meta>`
  tags, regenerate `sessions/index.html` + `feed.xml`. Still optional, still
  plain HTML in the repo — the script just automates the bookkeeping, and
  the site works identically if nobody runs it.

Everything above stays static. Anything dynamic goes to cork via the escape
hatch, not into this repo.
