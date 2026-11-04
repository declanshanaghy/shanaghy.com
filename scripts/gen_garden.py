#!/usr/bin/env python3
"""gen_garden.py — render the living garden from its JSON definition.

The garden is defined in web/content/garden.json: the painted world (the
backdrop image — the ringfort-workshop with its forge aglow, the tree of
life, the mainistir, the peat fire, the bog pool, Fenrir's castle, the
mossy foreground stones, the mist-veiled dolmens, sky) plus every soul of
the garden as an overlay entity with its coordinates and card. This script renders that
definition as the garden-scene SVG — the backdrop <image> with the souls'
icons placed on their stones — and splices it into web/content/garden.html
between the garden-scene markers. The scene is never hand-tended: a soul is
appended to the JSON and the garden regrows.

The backdrop is generated with the same image generator as the profile icons
(Gemini, the /imagen skill of the fenrir-ledger pack) so the painted world
matches the overlaid souls. If the backdrop is regenerated, re-map the
overlay coordinates against the new painting.

Run from anywhere:  python3 scripts/gen_garden.py
Verify after:       cd web && npm ci && npm run build, then grep web/out
"""
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WEB = os.path.join(ROOT, "web")
GARDEN = os.path.join(WEB, "content", "garden.json")
FLEET = os.path.join(WEB, "content", "index.html")
PUBLIC = os.path.join(WEB, "public")

MARK_START = ("<!-- garden-scene:start — rendered by scripts/gen_garden.py from "
              "web/content/garden.json; hands off between the markers -->")
MARK_END = "<!-- garden-scene:end -->"


def esc(s):
    return html.escape(str(s), quote=True)


# ── the garden's materials ───────────────────────────────────────────────────

DEFS = """<defs>
          <radialGradient id="sporeG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#effbee"/><stop offset="0.55" stop-color="#a9e6c3" stop-opacity=".85"/><stop offset="1" stop-color="#a9e6c3" stop-opacity="0"/></radialGradient>
          <radialGradient id="glowAmber" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffbd5e" stop-opacity=".5"/><stop offset="0.55" stop-color="#e8a33d" stop-opacity=".18"/><stop offset="1" stop-color="#e8a33d" stop-opacity="0"/></radialGradient>
          <filter id="fxSoft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2"/>
          </filter>
        </defs>"""


# ── small builders ──────────────────────────────────────────────────────────

def card(e):
    """the popover's data card — the page's click handler reads these off any [data-pop]."""
    return (" data-pop=\"1\""
            f' data-name="{esc(e["name"])}"'
            f' data-epithet="{esc(e["epithet"])}"'
            f' data-marks="{esc(e["marks"])}"'
            f' data-bio="{esc(e["bio"])}"'
            f' data-icon="{esc(e["icon"])}"')


def label_at(text, x, y):
    return (f'<g class="g-label"><text x="{x}" y="{y}" '
            f'text-anchor="middle">{esc(text)}</text></g>')


def image_art(icon, cx, cy, size):
    return (f'<image href="{esc(icon)}" x="{cx - size / 2:.1f}" y="{cy - size / 2:.1f}" '
            f'width="{size}" height="{size}" class="g-soul"/>'
            f'<ellipse cx="{cx:.1f}" cy="{cy + size * 0.44:.1f}" rx="{size * 0.42:.1f}" '
            f'ry="{size * 0.1:.1f}" fill="#000" opacity=".28" filter="url(#fxSoft)" '
            f'class="g-shadow"/>')


def soul(e):
    """one clickable soul: its icon overlaid on the painted world + its label,
    wrapped in its own card. The shadow ellipse grounds it on the stone."""
    t, lx, ly = e["label"]
    art = image_art(e["icon"], e["x"], e["y"], e["size"])
    return (f'<a href="{esc(e["href"])}" class="g-ent"{card(e)}>'
            f'{art}{label_at(t, lx, ly)}</a>')


def spores_layer(s):
    motes = "".join(
        f'<g class="g-spore {cls}"><circle cx="{x}" cy="{y}" r="{r}" fill="url(#sporeG)"/>'
        f'<circle class="g-hit" cx="{x}" cy="{y}" r="13"/></g>'
        for x, y, r, cls in s["motes"])
    t, x, y = s["label"]
    return f'<g class="g-ent g-sporelayer">{motes}{label_at(t, x, y)}</g>'


# ── assembly ─────────────────────────────────────────────────────────────────

def render(g):
    w, h = g["scene"]["width"], g["scene"]["height"]
    b = g["backdrop"]
    parts = [
        f'<svg class="garden-scene" viewBox="0 0 {w} {h}" role="img" aria-label="{esc(b["aria"])}">',
        DEFS,
        f'<image class="g-world" href="{esc(b["image"])}" x="0" y="0" '
        f'width="{w}" height="{h}" preserveAspectRatio="none"/>',
    ]
    for e in g["entities"]:
        parts.append(soul(e))
    parts.append('<!-- the spore spirits, drifting from the tree through all life -->')
    parts.append(spores_layer(g["spores"]))
    parts.append("</svg>")
    return "\n        ".join(parts)


def validate(g):
    need = ("name", "href", "icon", "epithet", "marks", "bio", "x", "y", "size", "label")
    missing = []
    w, h = g["scene"]["width"], g["scene"]["height"]
    for e in g["entities"]:
        for k in need:
            if k not in e or e[k] in ("", None):
                missing.append(f'{e.get("name", "?")}: {k}')
        if not (0 <= e.get("x", -1) <= w and 0 <= e.get("y", -1) <= h):
            missing.append(f'{e["name"]}: x/y outside the scene')
        icon = e["icon"]
        if icon and not os.path.exists(os.path.join(PUBLIC, icon.lstrip("/"))):
            missing.append(f'{e["name"]}: icon {icon} not found in web/public')
    backdrop = os.path.join(PUBLIC, g["backdrop"]["image"].lstrip("/"))
    if not os.path.exists(backdrop):
        missing.append(f'backdrop {g["backdrop"]["image"]} not found in web/public')
    if missing:
        sys.exit("garden.json will not grow:\n  " + "\n  ".join(missing))


def splice(text, scene):
    if MARK_START in text and MARK_END in text:
        i = text.index(MARK_START)
        j = text.index(MARK_END) + len(MARK_END)
        return text[:i] + MARK_START + "\n      " + scene + "\n      " + MARK_END + text[j:]
    tag = '<svg class="garden-scene"'
    i = text.find(tag)
    if i < 0:
        sys.exit("garden.html: no garden scene and no markers — nowhere to plant")
    j = text.find("</svg>", i)
    if j < 0:
        sys.exit("garden.html: the garden scene never closes")
    j += len("</svg>")
    return text[:i] + MARK_START + "\n      " + scene + "\n      " + MARK_END + text[j:]


def main():
    g = json.load(open(GARDEN, encoding="utf-8"))
    validate(g)
    scene = render(g)
    text = open(FLEET, encoding="utf-8").read()
    open(FLEET, "w", encoding="utf-8").write(splice(text, scene))
    print(f"the garden regrew: {len(g['entities'])} souls overlaid on the painted world, "
          f"{len(g['spores']['motes'])} spores drifting")
    print(f"scene spliced into {os.path.relpath(FLEET, ROOT)} between the markers")
    print("verify: cd web && npm ci && npm run build, then grep 'garden-scene' web/out/index.html")


if __name__ == "__main__":
    main()