#!/usr/bin/env python3
"""sync_towers_photos.py — the Google Photos source of the Towers.

The Towers (/videos/) has a second well beside YouTube: the smith's own
private Google Photos albums. Since Google removed the Library API's
read scopes (April 1st, 2025), the draw-rope is the **Photos Picker
API**: one picking session per album — the smith opens the pickerUri,
searches the album, selects its pieces — and this script then pulls the
picked items (still and moving intermingled), ordered newest-first,
downloads thumbnails into web/public/assets/towers/<slug>/, preserves the
manifest's per-item lore (picked item ids persist between sessions), and
renders the groves into web/content/videos.html between the
towers-photos markers (never hand-tended between them).

  OAuth (one-time, then refreshes silently), scope
  photospicker.mediaitems.readonly — credentials live OUTSIDE the repo:
      client secret:  ~/.hermes/google_photos_client_secret.json
      token:          ~/.hermes/google_photos_token.json

  --auth-url            mint the consent URL (user approves in browser)
  --auth-code "URL"     exchange the pasted redirect for a token
  --check               prove auth + API enablement (probe session)
  --pick "Album Title"  create a picking session for a manifest album,
                        print its pickerUri (the smith picks there)
  --poll "Album Title"  wait for the pick to land, then sync that album
  --sync [Title]        ingest every ready album (or just the named one):
                        merge items, download new thumbs, render
  --render              render the groves from the manifest alone

The garden's law: what is generated is asserted — after rendering, run
`cd web && npm ci && npm run build` and grep the built page.

Run from the repo root:  python3 scripts/sync_towers_photos.py --check
"""
import argparse
import base64
import hashlib
import html
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import NoReturn

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WEB = os.path.join(ROOT, "web")
MANIFEST_PATH = os.path.join(ROOT, "data", "towers-photos.json")
PAGE_PATH = os.path.join(WEB, "content", "videos.html")
PUBLIC_TOWERS = os.path.join(WEB, "public", "assets", "towers")

HERMES_HOME = os.environ.get("HERMES_HOME", os.path.expanduser("~/.hermes"))
CLIENT_SECRET_PATH = os.path.join(HERMES_HOME, "google_photos_client_secret.json")
TOKEN_PATH = os.path.join(HERMES_HOME, "google_photos_token.json")
PENDING_PATH = os.path.join(HERMES_HOME, "google_photos_pending.json")

SCOPE = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
PICKER = "https://photospicker.googleapis.com/v1"
AUTH_WAIT = 600  # seconds the loopback listener waits for Google's redirect

MARK_TABS = "towers-photos-tabs"
MARK_GROVES = "towers-photos"
RENDERER_NOTE = ("rendered by scripts/sync_towers_photos.py from "
                 "data/towers-photos.json; hands off between the markers")

THUMB_PARAMS = "=w800-h500-c"  # one uniform card crop, still and reel alike
POLL_TIMEOUT = 900              # the smith may pick at leisure


def die(msg, code=1) -> NoReturn:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(code)


# ── OAuth ──────────────────────────────────────────────────────────────────

def load_client():
    if not os.path.exists(CLIENT_SECRET_PATH):
        die(f"no client secret at {CLIENT_SECRET_PATH} — create an OAuth "
            f"Desktop client with the Photos Picker API enabled and copy "
            f"the downloaded JSON there")
    raw: dict = json.load(open(CLIENT_SECRET_PATH))
    c: dict = raw.get("installed") or raw.get("web") or {}
    if not c.get("client_id"):
        die("client secret JSON has no client_id (need a Desktop OAuth client)")
    return c


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def auth_url_cmd():
    """Mint the consent URL with a loopback listener as the redirect.

    A one-shot HTTP server binds an ephemeral loopback port, the consent
    URL points at it, and after the user approves, Google redirects to
    the listener — the code is exchanged on the spot, no error page, no
    pasting. (Desktop OAuth clients may use http://localhost:<any port>.)
    """
    from http.server import BaseHTTPRequestHandler, HTTPServer

    c = load_client()
    verifier = b64url(secrets.token_bytes(64))
    challenge = b64url(hashlib.sha256(verifier.encode()).digest())
    state = b64url(secrets.token_bytes(16))

    captured: dict = {}

    class Catch(BaseHTTPRequestHandler):
        def do_GET(self):
            captured["query"] = self.path
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"<html><body style='background:#120c07;"
                             b"color:#e8dcb8;font:15px serif;padding:3em'>"
                             b"<h2>The well is authorized.</h2>"
                             b"<p>Return to the garden - the teller finishes "
                             b"the rest.</p></body></html>")

        def log_message(self, format, *args):
            pass

    srv = HTTPServer(("127.0.0.1", 0), Catch)
    port = srv.server_address[1]
    redirect_uri = f"http://localhost:{port}"
    q = urllib.parse.urlencode({
        "client_id": c["client_id"],
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "code_challenge": challenge,
        "code_challenge_method": "S256",
        "state": state,
    })
    url = f"{AUTH_URL}?{q}"
    print(f"Waiting for approval on {redirect_uri} (up to {AUTH_WAIT}s)…")
    print(f"Open this URL and approve:\n\n{url}\n")
    srv.timeout = AUTH_WAIT
    srv.handle_request()
    srv.server_close()
    if "query" not in captured:
        die(f"no redirect arrived within {AUTH_WAIT}s — rerun --auth-url")
    params = dict(urllib.parse.parse_qsl(captured["query"]))
    if params.get("state") != state:
        die("state mismatch on the OAuth redirect — rerun --auth-url")
    code = params.get("code") or die(f"Google redirected an error: "
                                     f"{params.get('error', 'no code')}")
    json.dump({"verifier": verifier, "state": state,
               "redirect_uri": redirect_uri}, open(PENDING_PATH, "w"))
    auth_code_cmd(f"http://localhost:{port}/?{urllib.parse.urlencode(params)}")


def auth_code_cmd(callback):
    c = load_client()
    pend = json.load(open(PENDING_PATH))
    raw = callback.strip()
    if raw.startswith("http"):
        params = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(raw).query))
        code = params.get("code") or die("no code in that URL")
    else:
        code = raw
    body = urllib.parse.urlencode({
        "client_id": c["client_id"],
        "client_secret": c["client_secret"],
        "code": code,
        "code_verifier": pend["verifier"],
        "grant_type": "authorization_code",
        "redirect_uri": pend.get("redirect_uri", "http://localhost:1"),
    }).encode()
    resp = json.load(urllib.request.urlopen(
        urllib.request.Request(TOKEN_URL, data=body,
                               headers={"Content-Type": "application/x-www-form-urlencoded"})))
    if "refresh_token" not in resp:
        die("Google returned no refresh_token — rerun --auth-url and approve "
            "with the consent prompt (or revoke the app at "
            "https://myaccount.google.com/permissions first)")
    resp["scope"] = SCOPE
    json.dump(resp, open(TOKEN_PATH, "w"), indent=2)
    os.unlink(PENDING_PATH)
    print("token saved — authenticated.")


def access_token():
    if not os.path.exists(TOKEN_PATH):
        die(f"no token at {TOKEN_PATH} — run --auth-url, approve, then --auth-code")
    t = json.load(open(TOKEN_PATH))
    if t.get("expires_at", 0) > time.time() + 30:
        return t["access_token"]
    c = load_client()
    body = urllib.parse.urlencode({
        "client_id": c["client_id"],
        "client_secret": c["client_secret"],
        "refresh_token": t["refresh_token"],
        "grant_type": "refresh_token",
    }).encode()
    resp = json.load(urllib.request.urlopen(
        urllib.request.Request(TOKEN_URL, data=body,
                               headers={"Content-Type": "application/x-www-form-urlencoded"})))
    t["access_token"] = resp["access_token"]
    t["expires_at"] = time.time() + resp.get("expires_in", 3600)
    json.dump(t, open(TOKEN_PATH, "w"), indent=2)
    return t["access_token"]


def picker(method, path, data=None):
    url = f"{PICKER}/{path}"
    headers = {"Authorization": f"Bearer {access_token()}"}
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode()
    req = urllib.request.Request(url, method=method, headers=headers, data=body)
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        die(f"Picker API {e.code} on {path}: {e.read().decode()[:400]}")


def check():
    probe = picker("POST", "sessions", {})
    picker("DELETE", f"sessions/{probe['id']}")
    print("AUTHENTICATED — Picker API reachable (probe session minted and struck)")


# ── manifest ───────────────────────────────────────────────────────────────

def load_manifest():
    if not os.path.exists(MANIFEST_PATH):
        die(f"no manifest at {MANIFEST_PATH} — it is minted by hand, album by "
            f"album: [{{\"title\": \"…\", \"slug\": \"…\"}}] entries under \"albums\"")
    return json.load(open(MANIFEST_PATH))


def find_album(m, title):
    for alb in m.get("albums", []):
        if alb["title"] == title:
            return alb
    die(f"no album titled '{title}' in the manifest — mint its entry "
        f"(title, slug, grove_title, lede, rune, icon, tab) in "
        f"{MANIFEST_PATH} first")


def slugify(title):
    out = []
    for ch in title.lower():
        if ch.isalnum():
            out.append(ch)
        elif out and out[-1] != "-":
            out.append("-")
    return "".join(out).strip("-") or "album"


def download(url, path):
    try:
        req = urllib.request.Request(url, headers={
            # Picker baseUrls demand the OAuth bearer, unlike the old
            # Library API's unsigned ones.
            "Authorization": f"Bearer {access_token()}",
        })
        data = urllib.request.urlopen(req).read()
    except urllib.error.HTTPError as e:
        print(f"  ! fetch failed ({e.code}): {url[:120]} — skipped")
        return 0
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


# ── the picker flow ────────────────────────────────────────────────────────

def pick_cmd(title):
    m = load_manifest()
    alb = find_album(m, title)
    s = picker("POST", "sessions", {})
    alb["session"] = {"id": s["id"], "picker_uri": s["pickerUri"],
                      "picked_at": None}
    json.dump(m, open(MANIFEST_PATH, "w"), indent=2, ensure_ascii=False)
    print(f"picking session minted for '{title}'.")
    print(f"Open the picker (signed into the smith's own Google account), "
          f"search the album, select its pieces, then Done:\n\n{s['pickerUri']}\n")
    print(f"then: python3 scripts/sync_towers_photos.py --poll '{title}'")


def poll_cmd(title):
    m = load_manifest()
    alb = find_album(m, title)
    sess = alb.get("session") or die(f"'{title}' has no live picking session "
                                      f"— run --pick '{title}' first")
    sid = sess["id"]
    print(f"polling session {sid} for '{title}' (up to {POLL_TIMEOUT}s)…")
    deadline = time.time() + POLL_TIMEOUT
    while time.time() < deadline:
        s = picker("GET", f"sessions/{sid}")
        if s.get("mediaItemsSet"):
            sess["picked_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            sync_cmd(title, m)
            return
        time.sleep(5)
    die("the smith never finished picking — session still open; "
        "rerun --poll when the picking is done")


def iter_picked(session_id):
    qsid = urllib.parse.quote(session_id)
    page = picker("GET", f"mediaItems?sessionId={qsid}&pageSize=100")
    while True:
        for it in page.get("mediaItems", []):
            yield it
        if not page.get("nextPageToken"):
            return
        page = picker("GET", f"mediaItems?sessionId={qsid}&pageSize=100"
                             f"&pageToken={page['nextPageToken']}")


def sync_cmd(title=None, m=None):
    m = m or load_manifest()
    needs_lore = []
    for alb in m.get("albums", []):
        if title and alb["title"] != title:
            continue
        sess = alb.get("session")
        if not sess or not sess.get("picked_at"):
            continue
        if "slug" not in alb:
            alb["slug"] = slugify(alb["title"])
        old = {i["id"]: i for i in alb.setdefault("items", [])}
        picked = list(iter_picked(sess["id"]))
        if not picked:
            die(f"session for '{alb['title']}' returned no items — was the "
                f"pick finished before it expired?")
        fresh = []
        for mi in picked:
            mf = mi.get("mediaFile", {})
            md = mf.get("mediaFileMetadata", {})
            entry = {
                "id": mi["id"],
                "type": "video" if mi.get("type") == "VIDEO" else "photo",
                "filename": mf.get("filename", ""),
                "created": mi.get("createTime", ""),
                "width": str(md.get("width", "")),
                "height": str(md.get("height", "")),
            }
            prev = old.get(mi["id"])
            entry["lore"] = prev.get("lore") if prev else None
            if entry["lore"] is None:
                needs_lore.append((alb["title"], mi["id"], entry["filename"]))
            slug = alb["slug"]
            os.makedirs(os.path.join(PUBLIC_TOWERS, slug), exist_ok=True)
            thumb = os.path.join(PUBLIC_TOWERS, slug, f"{mi['id']}.jpg")
            if not os.path.exists(thumb):
                n = download(mf["baseUrl"] + THUMB_PARAMS, thumb)
                if n:
                    print(f"  + {slug}/{mi['id']}.jpg ({entry['type']}, {n} bytes)")
                else:
                    continue
            entry["thumb"] = f"/assets/towers/{slug}/{mi['id']}.jpg"
            fresh.append(entry)
        if ARGS.prune:
            kept = {f["id"] for f in fresh}
            gone = [i for i in old.values() if i["id"] not in kept]
            for g in gone:
                p = os.path.join(PUBLIC_TOWERS, alb["slug"], f"{g['id']}.jpg")
                if os.path.exists(p):
                    os.unlink(p)
                    print(f"  - {alb['slug']}/{g['id']}.jpg (pruned)")
        fresh.sort(key=lambda x: x["created"], reverse=True)  # newest first
        alb["items"] = fresh
    json.dump(m, open(MANIFEST_PATH, "w"), indent=2, ensure_ascii=False)
    print(f"manifest written: {MANIFEST_PATH}")
    if needs_lore:
        print(f"NEEDS LORE ({len(needs_lore)}) — mint lore into the manifest, "
              f"then rerun to render:")
        for a, i, f in needs_lore:
            print(f"  {a} :: {f} ({i})")
        if not ARGS.allow_empty_lore:
            die("refusing to render items without lore (pass --allow-empty-lore "
                "to render anyway)", 2)
    render(m)


# ── rendering ──────────────────────────────────────────────────────────────

def esc(s):
    return html.escape(str(s), quote=True)


STYLE = """<style>
/* towers-photos: the Google Photos source — stills and reels declared differently */
.pstone-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px 22px;position:relative;z-index:1}
@media(max-width:920px){.pstone-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.pstone-grid{grid-template-columns:1fr}}
.pstone .m-kind{display:inline-block;font-size:8.5px;letter-spacing:1.6px;text-transform:uppercase;padding:2px 8px;border-radius:8px;border:1px solid rgba(201,162,39,.35);color:#b39a6e}
.pstone .m-kind.still{border-color:rgba(122,143,94,.45);color:#9fb27c}
.pstone .m-kind.reel{border-color:rgba(232,163,61,.4);color:#d8a95c}
.pstone .vthumb{cursor:default}
.pstone a.vthumb{cursor:zoom-in}
.pstone .vlore{font-size:12px;font-style:italic;color:#96835f;margin:8px 2px 0;letter-spacing:.3px}
.pstone .vdate{font-size:10px;color:#7a6c4e;letter-spacing:1.4px}
</style>"""


def render_item(alb, it):
    kind = "reel" if it["type"] == "video" else "still"
    glyph = ('<span class="vplay" aria-hidden="true"><svg viewBox="0 0 24 24">'
             '<path d="M9 6.5 L18 12 L9 17.5 Z"/></svg></span>') if kind == "reel" else ""
    lore = it.get("lore") or esc(it.get("filename", ""))
    date = it.get("created", "")[:10]
    if kind == "still":
        thumb = (f'<a class="vthumb" href="{esc(it["thumb"])}" target="_blank" rel="noopener">'
                 f'<img src="{esc(it["thumb"])}" alt="{esc(lore)}" loading="lazy">{glyph}</a>')
    else:
        thumb = (f'<span class="vthumb"><img src="{esc(it["thumb"])}" '
                 f'alt="{esc(lore)}" loading="lazy">{glyph}</span>')
    return f"""      <article class="vstone pstone">
        {thumb}
        <h3>{lore}</h3>
        <p class="vdate">{esc(date)}</p>
        <div class="marks"><span class="m-kind {kind}">{kind}</span></div>
      </article>"""


def render_album(alb):
    items = alb.get("items", [])
    stills = sum(1 for i in items if i["type"] == "photo")
    reels = len(items) - stills
    counts = " · ".join(f"{n} {p}" for p, n in (("stills", stills), ("reels", reels)) if n)
    head = f"""  <section class="grove" id="towers-photos-{esc(alb['slug'])}">
    <header class="grove-head">
      <span class="lh-rune" aria-hidden="true">{esc(alb.get('rune', 'ᚄ'))}</span>
      <div class="lh-roundel"><img src="{esc(alb.get('icon', '/assets/icons/candle.png'))}" alt="" width="38" height="38" loading="lazy"></div>
      <div class="lh-text">
        <p class="lh-over">The Garden Films · {esc(alb['title'])}</p>
        <h2>{esc(alb.get('grove_title', alb['title']))}</h2>
        <p class="lh-lede">{esc(alb.get('lede', ''))}</p>
      </div>
      <div class="lh-plaque"><span class="pl-rune">{esc(alb.get('rune', 'ᚄ'))}</span><span class="pl-count">{counts}</span></div>
    </header>
    <div class="pstone-grid">
"""
    body = "\n".join(render_item(alb, i) for i in items)
    return head + body + "\n    </div>\n  </section>\n"


def render_tabs(m):
    rows = []
    for alb in m.get("albums", []):
        n = len(alb.get("items", []))
        rows.append(f'    <a class="rtab" data-target="#towers-photos-{esc(alb["slug"])}" '
                    f'href="#towers-photos-{esc(alb["slug"])}">'
                    f'<span class="rt-rune">{esc(alb.get("rune", "ᚄ"))}</span>'
                    f'<span class="rt-label">{esc(alb.get("tab", alb["title"]))}</span>'
                    f'<span class="rt-count">×{n}</span></a>')
    return "\n".join(rows)


def splice(page, mark, block):
    start = f"<!-- {mark}:start — {RENDERER_NOTE} -->"
    end = f"<!-- {mark}:end -->"
    if start not in page or end not in page:
        die(f"markers for '{mark}' not found in {PAGE_PATH}")
    head, rest = page.split(start, 1)
    _, tail = rest.split(end, 1)
    return head + start + "\n" + block + "\n  " + end + tail


def render(m=None):
    m = m or load_manifest()
    for alb in m.get("albums", []):
        for it in alb.get("items", []):
            if not it.get("lore") and not ARGS.allow_empty_lore:
                die(f"item {it['id']} in '{alb['title']}' has no lore", 2)
    page = open(PAGE_PATH).read()
    sep = ('  <div class="line-sep" aria-hidden="true"><svg viewBox="0 0 220 24">'
           '<use href="#knot-div"/></svg></div>')
    groves = "\n".join(sep + "\n" + render_album(a).rstrip()
                       for a in m.get("albums", []))
    if groves:
        groves = STYLE + groves
    page = splice(page, MARK_TABS, render_tabs(m))
    page = splice(page, MARK_GROVES, groves)
    open(PAGE_PATH, "w").write(page)
    n_items = sum(len(a.get("items", [])) for a in m.get("albums", []))
    print(f"rendered {len(m.get('albums', []))} grove(s), {n_items} piece(s) "
          f"into {PAGE_PATH}")
    print("assert: cd web && npm ci && npm run build, then grep web/out/videos/index.html")


# ── main ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--auth-url", action="store_true")
    g.add_argument("--auth-code")
    g.add_argument("--check", action="store_true")
    g.add_argument("--pick")
    g.add_argument("--poll")
    g.add_argument("--sync", nargs="?", const="", default=None)
    g.add_argument("--render", action="store_true")
    p.add_argument("--allow-empty-lore", action="store_true",
                   help="render items even before lore is minted")
    p.add_argument("--prune", action="store_true",
                   help="drop (and unlink) items absent from the latest pick")
    ARGS = p.parse_args()
    if ARGS.auth_url:
        auth_url_cmd()
    elif ARGS.auth_code:
        auth_code_cmd(ARGS.auth_code)
    elif ARGS.check:
        check()
    elif ARGS.pick:
        pick_cmd(ARGS.pick)
    elif ARGS.poll:
        poll_cmd(ARGS.poll)
    elif ARGS.sync is not None:
        sync_cmd(ARGS.sync or None)
    elif ARGS.render:
        render()
