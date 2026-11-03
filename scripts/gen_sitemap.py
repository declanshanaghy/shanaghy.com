#!/usr/bin/env python3
"""gen_sitemap.py — generate web/public/sitemap.xml + robots.txt from the source tree.

The Next static export copies web/public/ verbatim into web/out/, so the
sitemap must exist in web/public/ BEFORE `next build`. Routes are derived
from the source of truth (web/pages/*.js + web/content/ tree + routes.json),
which makes the output deterministic without needing a build first.

Run:  python3 scripts/gen_sitemap.py   (from the repo root, or anywhere — paths resolve)
"""
import json
import os

BASE = "https://www.shanaghy.com"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WEB = os.path.join(ROOT, "web")
CONTENT = os.path.join(WEB, "content")
PUBLIC = os.path.join(WEB, "public")

urls = [BASE + "/"]

# ── top-level routes: one .js file per page in web/pages ──────────────────
pages_dir = os.path.join(WEB, "pages")
for f in sorted(os.listdir(pages_dir)):
    if f.endswith(".js") and not f.startswith("_"):
        name = f[:-3]
        if name in ("index", "404"):
            continue
        urls.append(f"{BASE}/{name}/")

# ── projects: from routes.json (the extractor's source of truth) ───────────
routes = json.load(open(os.path.join(CONTENT, "routes.json")))
for slug in sorted(routes.get("projects", [])):
    urls.append(f"{BASE}/projects/{slug}/")

# ── flat dynamic dirs: profiles/, laws/ (one .html fragment per route) ────
for d in ("profiles", "laws"):
    dd = os.path.join(CONTENT, d)
    if not os.path.isdir(dd):
        continue
    for f in sorted(os.listdir(dd)):
        if f.endswith(".html"):
            urls.append(f"{BASE}/{d}/{f[:-5]}/")

# ── sessions: true tree shape (beds and deep session pages) ────────────────
sess = os.path.join(CONTENT, "sessions")
for dirpath, _dirnames, filenames in os.walk(sess):
    for f in sorted(filenames):
        if not f.endswith(".html"):
            continue
        rel = os.path.relpath(os.path.join(dirpath, f), CONTENT)
        if f == "index.html":
            rel = os.path.dirname(rel)
        urls.append(f"{BASE}/{rel.replace(os.sep, '/')}")

# ── dedupe + emit ──────────────────────────────────────────────────────────
urls = sorted(set(urls))

os.makedirs(PUBLIC, exist_ok=True)
sitemap_path = os.path.join(PUBLIC, "sitemap.xml")
with open(sitemap_path, "w", encoding="utf-8") as fh:
    fh.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    fh.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for u in urls:
        fh.write(f"  <url><loc>{u}</loc></url>\n")
    fh.write("</urlset>\n")

robots_path = os.path.join(PUBLIC, "robots.txt")
with open(robots_path, "w", encoding="utf-8") as fh:
    fh.write("User-agent: *\n")
    fh.write("Allow: /\n")
    fh.write("\n")
    fh.write(f"Sitemap: {BASE}/sitemap.xml\n")

print(f"[ok] sitemap.xml: {len(urls)} urls -> {sitemap_path}")
print(f"[ok] robots.txt -> {robots_path}")
