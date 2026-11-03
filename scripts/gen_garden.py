#!/usr/bin/env python3
"""gen_garden.py — render the living garden from its JSON definition.

The garden is defined in web/content/garden.json: every soul the garden
displays — the persons in their dwellings, the fleet on their stones, the
dolmens of the passed ground, the spores off the tree — with each one's
placing and card. This script renders that definition as the garden-scene
SVG and splices it into web/content/fleet.html between the garden-scene
markers, so the scene is never hand-tended: a new soul is appended to the
JSON and the garden regrows.

The rendering follows the garden's own picture-making — the dark, mossy
stone-and-forest renders of the profile icons: bark and stone carry grain,
moss creeps over what stands still, the fire and the lit windows are the
warm lights in a cold night. Filters are feTurbulence grain and leaf-edge
displacement only; no external assets beyond the entities' own icons.

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
FLEET = os.path.join(WEB, "content", "fleet.html")
PUBLIC = os.path.join(WEB, "public")

MARK_START = ("<!-- garden-scene:start — rendered by scripts/gen_garden.py from "
              "web/content/garden.json; hands off between the markers -->")
MARK_END = "<!-- garden-scene:end -->"

PLACES = ("ringfort", "fire", "mainistir", "poolside", "castle")


def esc(s):
    return html.escape(str(s), quote=True)


# ── the garden's materials: gradients and stone/bark/moss filters ──────────

DEFS = """<defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070403"/><stop offset="0.55" stop-color="#0b0705"/><stop offset="0.78" stop-color="#120c07"/><stop offset="1" stop-color="#1a1208"/></linearGradient>
          <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#211609"/><stop offset="1" stop-color="#0c0805"/></linearGradient>
          <radialGradient id="moonG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e8dcb8" stop-opacity=".55"/><stop offset="0.45" stop-color="#d8c9a8" stop-opacity=".22"/><stop offset="1" stop-color="#d8c9a8" stop-opacity="0"/></radialGradient>
          <radialGradient id="glowAmber" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffbd5e" stop-opacity=".5"/><stop offset="0.55" stop-color="#e8a33d" stop-opacity=".18"/><stop offset="1" stop-color="#e8a33d" stop-opacity="0"/></radialGradient>
          <radialGradient id="sporeG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe9b8"/><stop offset="0.55" stop-color="#e8a33d" stop-opacity=".85"/><stop offset="1" stop-color="#e8a33d" stop-opacity="0"/></radialGradient>
          <linearGradient id="barkG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c2113"/><stop offset="0.3" stop-color="#1f150c"/><stop offset="0.55" stop-color="#241a10"/><stop offset="0.8" stop-color="#16100a"/><stop offset="1" stop-color="#2a1d12"/></linearGradient>
          <radialGradient id="canopyG" cx="0.5" cy="0.42" r="0.62"><stop offset="0" stop-color="#77895d"/><stop offset="0.7" stop-color="#4a5a36"/><stop offset="1" stop-color="#2e3a22"/></radialGradient>
          <radialGradient id="canopyHi" cx="0.5" cy="0.42" r="0.62"><stop offset="0" stop-color="#93a76e"/><stop offset="0.7" stop-color="#556639"/><stop offset="1" stop-color="#2b3620"/></radialGradient>
          <radialGradient id="canopyLo" cx="0.5" cy="0.5" r="0.62"><stop offset="0" stop-color="#4c5c35"/><stop offset="0.7" stop-color="#33422a"/><stop offset="1" stop-color="#1d2615"/></radialGradient>
          <linearGradient id="stoneG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2d1c"/><stop offset="1" stop-color="#17100a"/></linearGradient>
          <linearGradient id="capG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33271a"/><stop offset="1" stop-color="#120c07"/></linearGradient>
          <linearGradient id="mossG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c7d54"/><stop offset="1" stop-color="#36422a"/></linearGradient>
          <linearGradient id="bankG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2415"/><stop offset="1" stop-color="#140f08"/></linearGradient>
          <radialGradient id="poolG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#101c14"/><stop offset="1" stop-color="#090603"/></radialGradient>
          <filter id="fxBark" x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.34 0.05" numOctaves="4" seed="9" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.03  0.62 0.30 0 0 0" result="grain"/>
            <feComposite in="grain" in2="SourceAlpha" operator="in" result="clipped"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="clipped"/></feMerge>
          </filter>
          <filter id="fxStone" x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.9" numOctaves="2" seed="4" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.025  0.34 0.12 0 0 0" result="grain"/>
            <feComposite in="grain" in2="SourceAlpha" operator="in" result="clipped"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="clipped"/></feMerge>
          </filter>
          <filter id="fxMoss" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.28 0.34" numOctaves="3" seed="17" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.30  0 0 0 0 0.38  0 0 0 0 0.16  0.45 0.25 0 0 0" result="grain"/>
            <feGaussianBlur in="grain" stdDeviation="0.5" result="soft"/>
            <feComposite in="soft" in2="SourceAlpha" operator="in" result="clipped"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="clipped"/></feMerge>
          </filter>
          <filter id="fxRough" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.22 0.14" numOctaves="2" seed="31" result="n"/>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="fxLeaf" x="-18%" y="-18%" width="136%" height="136%">
            <feTurbulence type="turbulence" baseFrequency="0.11 0.09" numOctaves="3" seed="23" result="n"/>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="fxGround" x="-2%" y="-10%" width="104%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="3" seed="11" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.02  0.30 0.10 0 0 0" result="grain"/>
            <feComposite in="grain" in2="SourceAlpha" operator="in" result="clipped"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="clipped"/></feMerge>
          </filter>
        </defs>"""


# ── small builders ─────────────────────────────────────────────────────────

def card(e):
    """the popover's data card — fleet.js reads these off any [data-pop]."""
    return (" data-pop=\"1\""
            f' data-name="{esc(e["name"])}"'
            f' data-epithet="{esc(e["epithet"])}"'
            f' data-marks="{esc(e["marks"])}"'
            f' data-bio="{esc(e["bio"])}"'
            f' data-icon="{esc(e["icon"])}"')


def label_at(text, x, y):
    return (f'<g class="g-label"><text x="{x}" y="{y}" '
            f'text-anchor="middle">{esc(text)}</text></g>')


def soul(e, art):
    """one clickable soul: its art + its label, wrapped in its own card."""
    t, x, y = e["label"]
    return (f'<a href="{esc(e["href"])}" class="g-ent"{card(e)}>'
            f'{art}{label_at(t, x, y)}</a>')


def image_art(icon, cx, cy, size):
    return (f'<image href="{esc(icon)}" x="{cx - size / 2:.1f}" y="{cy - size / 2:.1f}" '
            f'width="{size}" height="{size}"/>')


# ── sky, hills, ground ──────────────────────────────────────────────────────

def sky(s):
    stars = "".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x, y, r in s["stars"])
    mx, my = s["moon"]
    return (f'<rect x="0" y="0" width="900" height="480" fill="url(#skyG)"/>'
            f'<g fill="#d9b56a" opacity=".45">{stars}</g>'
            f'<circle cx="{mx}" cy="{my}" r="34" fill="url(#moonG)"/>'
            f'<circle cx="{mx}" cy="{my}" r="11" fill="#cdbd94" opacity=".9"/>'
            f'<circle cx="{mx - 5}" cy="{my - 4}" r="2.6" fill="#b0a07c" opacity=".45"/>'
            f'<circle cx="{mx + 4}" cy="{my + 3}" r="1.8" fill="#b0a07c" opacity=".4"/>')


HILLS = ('<path d="M0 372 Q160 330 330 362 T620 350 T900 368 L900 480 L0 480 Z" fill="#120d08"/>'
         '<path d="M0 402 Q240 392 430 400 T900 396 L900 480 L0 480 Z" fill="url(#groundG)" filter="url(#fxGround)"/>'
         '<ellipse cx="450" cy="386" rx="430" ry="14" fill="#0d0a06" opacity=".22"/>'
         '<g fill="#241a0f" opacity=".7"><ellipse cx="480" cy="420" rx="5" ry="2.4"/>'
         '<ellipse cx="618" cy="430" rx="4" ry="2"/><ellipse cx="212" cy="428" rx="3.5" ry="1.8"/>'
         '<ellipse cx="700" cy="442" rx="5" ry="2.2"/><ellipse cx="86" cy="430" rx="3" ry="1.6"/>'
         '<ellipse cx="540" cy="444" rx="4" ry="2"/></g>'
         '<use href="#moss-tuft" x="640" y="366" width="34" height="17" color="#45522f" opacity=".5"/>'
         '<use href="#moss-tuft" x="120" y="368" width="30" height="15" color="#3d4928" opacity=".45"/>'
         '<use href="#moss-tuft" x="420" y="356" width="26" height="13" color="#45522f" opacity=".4"/>')


# ── the dwellings ───────────────────────────────────────────────────────────

def ringfort(d):
    """FiremanDecko's ringfort: a banked earthen ring, grass on its crest,
    the hearth's glow inside."""
    cx, cy = d["center"]
    brx, bry = d["bank"]
    irx, iry = d["interior"]
    gx, gy = d["glow"]
    x0, x1 = cx - brx, cx + brx
    ix0, ix1 = cx - irx, cx + irx
    band = (f"M{x0} {cy} a{brx} {bry} 0 1 0 {2 * brx} 0 a{brx} {bry} 0 1 0 {-2 * brx} 0 Z "
            f"M{ix0} {cy} a{irx} {iry} 0 1 0 {2 * irx} 0 a{irx} {iry} 0 1 0 {-2 * irx} 0 Z")
    return (f'<g class="g-dwell">'
            f'<path d="{band}" fill-rule="evenodd" fill="url(#bankG)" filter="url(#fxGround)"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="{irx}" ry="{iry}" fill="#0d0803"/>'
            f'<path d="M{ix0 + 10} {cy - 2} a{irx - 10} {iry - 3} 0 0 1 {2 * (irx - 10)} 0" '
            f'fill="none" stroke="#3c4a2c" stroke-width="1.4" opacity=".4"/>'
            f'<circle cx="{gx}" cy="{gy}" r="13" fill="url(#glowAmber)" class="cglow"/>'
            f'</g>')


def mainistir(d):
    """the Mossiah's mainistir: a stone chapel with a round tower, courses
    of cut stone, one lit window in the gable, moss at its feet."""
    cx0, cy0, cw, ch = d["chapel"]
    tx, ty, tw, th = d["tower"]
    winx, winy = d["window"]
    dx, dy = d["door"]
    ax = cx0 + cw / 2
    return (f'<g class="g-dwell">'
            f'<rect x="{cx0}" y="{cy0}" width="{cw}" height="{ch}" fill="url(#stoneG)" filter="url(#fxStone)"/>'
            f'<path d="M{cx0} {cy0 + 18} h{cw} M{cx0} {cy0 + 36} h{cw} M{cx0} {cy0 + 54} h{cw} '
            f'M{cx0} {cy0 + 72} h{cw}" stroke="#0e0a06" stroke-width=".9" opacity=".5"/>'
            f'<path d="M{cx0 + 20} {cy0} v18 M{cx0 + 42} {cy0 + 18} v18 M{cx0 + 62} {cy0} v18 '
            f'M{cx0 + 30} {cy0 + 36} v18 M{cx0 + 52} {cy0 + 36} v18 M{cx0 + 38} {cy0 + 54} v18 '
            f'M{cx0 + 60} {cy0 + 54} v18 M{cx0 + 22} {cy0 + 72} v15" stroke="#0e0a06" stroke-width=".8" opacity=".35"/>'
            f'<path d="M{dx - 14} {cy0 + ch} L{dx - 14} {dy} Q{dx} {dy - 9} {dx + 14} {dy} '
            f'L{dx + 14} {cy0 + ch} Z" fill="#0b0704"/>'
            f'<path d="M{dx - 14} {dy} Q{dx} {dy - 9} {dx + 14} {dy}" fill="none" '
            f'stroke="#2c2115" stroke-width="1.1" opacity=".5"/>'
            f'<circle cx="{winx}" cy="{winy}" r="5" fill="#e8b45e" class="cglow"/>'
            f'<circle cx="{winx}" cy="{winy}" r="5" fill="none" stroke="#241b11" stroke-width="1.2"/>'
            f'<path d="M{winx} {winy - 5} v10 M{winx - 5} {winy} h10" stroke="#241b11" stroke-width=".8"/>'
            f'<rect x="{tx}" y="{ty}" width="{tw}" height="{th}" fill="url(#stoneG)" filter="url(#fxStone)"/>'
            f'<path d="M{tx} {ty + 16} h{tw} M{tx} {ty + 34} h{tw} M{tx} {ty + 52} h{tw} '
            f'M{tx} {ty + 70} h{tw} M{tx} {ty + 88} h{tw} M{tx} {ty + 106} h{tw}" '
            f'stroke="#0e0a06" stroke-width=".8" opacity=".45"/>'
            f'<ellipse cx="{tx + tw / 2}" cy="{ty + 12}" rx="2.2" ry="4" fill="#070503"/>'
            f'<ellipse cx="{tx + tw / 2}" cy="{ty + 52}" rx="2.2" ry="4" fill="#070503"/>'
            f'<ellipse cx="{tx + tw / 2}" cy="{ty + 92}" rx="2.2" ry="4" fill="#070503"/>'
            f'<path d="M{tx - 4} {ty} L{tx + tw / 2} {ty - 24} L{tx + tw + 4} {ty} Z" fill="#1c1510"/>'
            f'<path d="M{cx0 - 6} {cy0} L{ax} {cy0 - 33} L{cx0 + cw + 6} {cy0} Z" fill="#1c1510" filter="url(#fxStone)"/>'
            f'<path d="M{cx0 - 6} {cy0} L{ax} {cy0 - 33} L{cx0 + cw + 6} {cy0}" fill="none" '
            f'stroke="#2c2115" stroke-width="1" opacity=".5"/>'
            f'<path d="M{cx0 + 4} {cy0 - 9} l12 -10 M{cx0 + 28} {cy0 - 28} l12 -10 M{cx0 + 16} {cy0 - 19} l12 -10 '
            f'M{cx0 + 52} {cy0 - 14} l12 -10 M{cx0 + 40} {cy0 - 24} l12 -10 M{cx0 + 58} {cy0 - 6} l12 -10" '
            f'stroke="#0c0805" stroke-width=".8" opacity=".5"/>'
            f'<ellipse cx="{cx0 + 10}" cy="{cy0 + ch - 3}" rx="12" ry="5" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".7"/>'
            f'<ellipse cx="{cx0 + cw - 10}" cy="{cy0 + ch - 2}" rx="10" ry="4" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".65"/>'
            f'<ellipse cx="{tx + tw / 2}" cy="{ty + th - 2}" rx="10" ry="4.5" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".6"/>'
            f'</g>')


def castle(d):
    """the high castle of the Norse line on its motte: coursed stone, a
    crenellated rampart and tower, a gate with an ember behind it."""
    wx, wy, ww, wh = d["wall"]
    rx, ry = d["rampart"]
    tx, ty, tw, th = d["tower"]
    gx, gy = d["gate"]
    return (f'<g class="g-dwell">'
            f'<path d="M744 403 Q810 344 900 352 L900 403 Z" fill="#151009"/>'
            f'<rect x="{wx}" y="{wy}" width="{ww}" height="{wh}" fill="url(#stoneG)" filter="url(#fxStone)"/>'
            f'<path d="M{wx} {wy + 16} h{ww} M{wx} {wy + 32} h{ww} M{wx} {wy + 47} h{ww - 4}" '
            f'stroke="#0d0906" stroke-width=".8" opacity=".5"/>'
            f'<path d="M{rx} {ry} V{ry + 52}" stroke="#32251a" stroke-width="13" filter="url(#fxStone)"/>'
            f'<path d="M{rx} {ry + 6} h6 M{rx} {ry + 18} h6 M{rx} {ry + 32} h6 M{rx} {ry + 44} h6" '
            f'stroke="#100b07" stroke-width="13"/>'
            f'<rect x="{tx}" y="{ty}" width="{tw}" height="{th}" fill="url(#stoneG)" filter="url(#fxStone)"/>'
            f'<path d="M{tx} {ty + 16} h{tw} M{tx} {ty + 32} h{tw} M{tx} {ty + 46} h{tw}" '
            f'stroke="#0d0906" stroke-width=".8" opacity=".45"/>'
            f'<path d="M{tx - 4} {ty} h{tw + 8}" stroke="#241b11" stroke-width="4"/>'
            f'<path d="M{tx} {ty} v-6 M{tx + 5.5} {ty} v-6 M{tx + 11} {ty} v-6" stroke="#241b11" stroke-width="4"/>'
            f'<ellipse cx="{tx + tw / 2}" cy="{ty + 22}" rx="1.8" ry="3.6" fill="#070503"/>'
            f'<path d="M{gx - 9} {wy + wh} L{gx - 9} {gy} Q{gx} {gy - 9} {gx + 9} {gy} L{gx + 9} {wy + wh} Z" fill="#0b0704"/>'
            f'<path d="M{gx - 5} {wy + wh - 6} q5 -7 10 0" stroke="#e8722d" stroke-width="1.6" '
            f'fill="none" opacity=".4" class="cglow"/>'
            f'<ellipse cx="{tx + tw / 2}" cy="{ty + th - 2}" rx="9" ry="4" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".6"/>'
            f'</g>')


# ── the tree of life ────────────────────────────────────────────────────────

def tree(t):
    """the tree of life, old and real: a leaning trunk with root flare and
    a hollow, bark furrows, moss up its flank, gnarled branches under a
    canopy of displaced foliage clumps dappled by the sky and the fire."""
    trunk = ("M226 404 C228 396 229 388 230 380 C232 366 234 352 236 338 "
             "C238 322 240 306 242 290 C244 272 245 254 246 238 "
             "C246.5 226 247 216 248 208 L266 208 C267 218 268 230 269.5 242 "
             "C271 258 273 274 275.5 290 C278 306 280 322 283 338 "
             "C285 352 287 366 289 380 C290 388 291 396 292 404 "
             "C285 406 278 405 271 404 C263 403 255 405 247 404 "
             "C239 403 232 405 226 404 Z")
    toe_l = "M226 404 C221 400 215 398 209 397.5 C213 401 217 404.5 221 406.5 Z"
    toe_r = "M292 404 C297 400 303 398 309 397.5 C305 401 301 404.5 297 406.5 Z"
    branches = (
        '<path d="M249 214 C242 208 234 204 226 200 C217 196 209 192 202 186" '
        'stroke="#241a0f" stroke-width="8" fill="none" stroke-linecap="round"/>'
        '<path d="M266 212 C272 205 280 200 289 196 C298 191 306 185 312 178" '
        'stroke="#241a0f" stroke-width="8" fill="none" stroke-linecap="round"/>'
        '<path d="M254 208 C253 202 253 196 254 190" stroke="#241a0f" stroke-width="6" fill="none"/>'
        '<path d="M247 222 C240 220 232 220 224 222 C216 224 210 228 204 234" '
        'stroke="#1e150c" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<path d="M267 222 C274 218 282 216 290 216 C297 216 303 218 309 222" '
        'stroke="#1e150c" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<path d="M251 192 L257 187 L258 194 Z" fill="#100b06"/>')
    ridges = (
        '<path d="M244 396 C246 360 245 320 248 280 C249 260 250 240 251 216" '
        'stroke="#140d07" stroke-width="1.1" fill="none" opacity=".5"/>'
        '<path d="M262 216 C263 240 265 268 267 292 C269 318 271 350 273 380 '
        'C274 390 274 396 274 400" stroke="#140d07" stroke-width="1.1" fill="none" opacity=".45"/>'
        '<path d="M256 212 C256 240 255 280 256 320 C257 352 256 380 255 400" '
        'stroke="#0f0a06" stroke-width=".9" fill="none" opacity=".4"/>')
    hollow = (
        '<ellipse cx="252" cy="336" rx="7" ry="10" fill="#050302"/>'
        '<path d="M245 336 a7 10 0 0 1 14 0" fill="none" stroke="#4a3822" '
        'stroke-width="1.3" opacity=".5"/>')
    moss = (
        '<ellipse cx="240" cy="376" rx="6.5" ry="14" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".8"/>'
        '<ellipse cx="271" cy="396" rx="10" ry="6" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".7"/>'
        '<ellipse cx="252" cy="228" rx="6" ry="4.5" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".6"/>'
        '<circle cx="284" cy="352" r="2.2" fill="#9a8f5e" opacity=".35"/>'
        '<circle cx="236" cy="310" r="1.8" fill="#9a8f5e" opacity=".3"/>')
    canopy = (
        '<ellipse cx="258" cy="238" rx="66" ry="30" fill="#131c0e" opacity=".5"/>'
        '<circle cx="256" cy="206" r="44" fill="url(#canopyLo)" filter="url(#fxLeaf)"/>'
        '<circle cx="216" cy="222" r="32" fill="url(#canopyG)" filter="url(#fxLeaf)"/>'
        '<circle cx="296" cy="218" r="34" fill="url(#canopyG)" filter="url(#fxLeaf)"/>'
        '<circle cx="256" cy="232" r="36" fill="url(#canopyLo)" filter="url(#fxLeaf)"/>'
        '<circle cx="196" cy="236" r="22" fill="url(#canopyG)" filter="url(#fxLeaf)"/>'
        '<circle cx="318" cy="228" r="20" fill="url(#canopyG)" filter="url(#fxLeaf)"/>'
        '<circle cx="236" cy="178" r="26" fill="url(#canopyHi)" filter="url(#fxLeaf)"/>'
        '<circle cx="280" cy="174" r="24" fill="url(#canopyHi)" filter="url(#fxLeaf)"/>'
        '<circle cx="256" cy="154" r="24" fill="url(#canopyHi)" filter="url(#fxLeaf)"/>'
        '<circle cx="208" cy="196" r="20" fill="url(#canopyG)" filter="url(#fxLeaf)"/>'
        '<circle cx="300" cy="192" r="20" fill="url(#canopyG)" filter="url(#fxLeaf)"/>'
        '<circle cx="228" cy="246" r="18" fill="url(#canopyLo)" filter="url(#fxLeaf)"/>'
        '<circle cx="284" cy="248" r="17" fill="url(#canopyLo)" filter="url(#fxLeaf)"/>'
        '<circle cx="246" cy="258" r="15" fill="url(#canopyLo)" filter="url(#fxLeaf)"/>'
        '<circle cx="268" cy="256" r="14" fill="url(#canopyLo)" filter="url(#fxLeaf)"/>'
        '<circle cx="242" cy="170" r="4" fill="#a9bd7c" opacity=".28"/>'
        '<circle cx="268" cy="162" r="3.4" fill="#a9bd7c" opacity=".25"/>'
        '<circle cx="222" cy="186" r="3.2" fill="#a9bd7c" opacity=".22"/>'
        '<circle cx="292" cy="180" r="3.6" fill="#a9bd7c" opacity=".25"/>'
        '<ellipse cx="286" cy="244" rx="34" ry="14" fill="#e8a33d" opacity=".10" class="cglow"/>')
    t_text, tx, ty = t["label"]
    return (f'<g class="g-ent g-tree">'
            f'<path d="{trunk}" fill="url(#barkG)" filter="url(#fxBark)"/>'
            f'<path d="{toe_l}" fill="url(#barkG)" filter="url(#fxBark)"/>'
            f'<path d="{toe_r}" fill="url(#barkG)" filter="url(#fxBark)"/>'
            f'{ridges}{hollow}{moss}{branches}{canopy}'
            f'{label_at(t_text, tx, ty)}</g>')


# ── the peat fire, the teller, the bog pool ─────────────────────────────────

def fire(f):
    x, y = f["place"]
    return (f'<g class="g-fire cglow">'
            f'<circle cx="{x}" cy="{y - 3}" r="20" fill="url(#glowAmber)" opacity=".6"/>'
            f'<rect x="{x - 14}" y="{y - 4}" width="27" height="4.5" rx="2.2" fill="#2b1d10" '
            f'transform="rotate(-7 {x} {y - 2})"/>'
            f'<rect x="{x - 11}" y="{y - 3}" width="25" height="4" rx="2" fill="#221609" '
            f'transform="rotate(6 {x} {y - 1})"/>'
            f'<circle cx="{x - 5}" cy="{y}" r="1.4" fill="#ff9a3c" class="cglow"/>'
            f'<circle cx="{x + 3}" cy="{y + 1}" r="1.1" fill="#ff8426" class="cglow"/>'
            f'<circle cx="{x + 7}" cy="{y - 1}" r="1" fill="#ffb04e" class="cglow"/>'
            f'<path d="M{x - 8} {y + 2} Q{x - 3} {y - 15} {x + 4} {y + 2} '
            f'Q{x + 1} {y + 5} {x - 4} {y + 4} Z" fill="#e8823d" opacity=".85"/>'
            f'<path class="flame" d="M{x - 5} {y + 2} Q{x - 1.5} {y - 11} {x + 3} {y + 2} '
            f'Q{x} {y + 4.5} {x - 3} {y + 2.5} Z" fill="#ffbd5e"/>'
            f'</g>')


def teller(cx, base):
    """a hooded teller by the peat fire: cloak, hood, the fire's rim on
    the shoulder, a staff in hand."""
    return (f'<path d="M{cx - 15} {base} L{cx - 12} {base - 31}" stroke="#241a0f" '
            f'stroke-width="2.6" stroke-linecap="round"/>'
            f'<path d="M{cx - 13} {base} C{cx - 13} {base - 27} {cx - 7} {base - 40} {cx} {base - 40} '
            f'C{cx + 7} {base - 40} {cx + 13} {base - 27} {cx + 13} {base} Z" '
            f'fill="#1d150c" filter="url(#fxRough)"/>'
            f'<circle cx="{cx}" cy="{base - 46}" r="7.5" fill="#241a0f"/>'
            f'<circle cx="{cx}" cy="{base - 45}" r="4.6" fill="#090604"/>'
            f'<path d="M{cx + 7} {base - 35} C{cx + 9} {base - 27} {cx + 10} {base - 17} '
            f'{cx + 10.5} {base - 8}" stroke="#e8a33d" stroke-width="1.1" fill="none" '
            f'opacity=".38" class="cglow"/>')


def pool(p):
    """the bog pool: black water, a moon glint, reeds at its rim."""
    cx, cy = p["center"]
    rx, ry = p["size"]
    return (f'<ellipse cx="{cx}" cy="{cy + 1}" rx="{rx + 3}" ry="{ry + 2}" fill="#060403"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="url(#poolG)"/>'
            f'<path d="M{cx - 24} {cy - 3} q14 5 30 4 q12 -1 22 -5" stroke="#93a37b" '
            f'stroke-width="1.1" fill="none" opacity=".25"/>'
            f'<path d="M{cx - 48} {cy + 4} q-2 -12 -7 -16 M{cx - 42} {cy + 5} q0 -14 5 -18 '
            f'M{cx + 46} {cy + 3} q2 -10 7 -14 M{cx + 40} {cy + 4} q-1 -12 4 -16 '
            f'M{cx - 30} {cy + 6} q-1 -8 -6 -11 M{cx + 30} {cy + 6} q1 -8 6 -12" '
            f'stroke="#33402a" stroke-width="1.3" fill="none" opacity=".65" stroke-linecap="round"/>'
            f'<ellipse cx="{cx}" cy="{cy + ry}" rx="{rx}" ry="5" fill="url(#mossG)" '
            f'filter="url(#fxMoss)" opacity=".35"/>')


# ── the fleet's stones and the dolmens of the passed ground ──────────────────

def plinth(cx, base, w):
    """a mossy pedestal stone: an irregular block with a moss cap, the
    fleet's icon set on its top."""
    x0, x1 = cx - w / 2, cx + w / 2
    body = (f"M{x0 + 4} {base} C{x0} {base + 2} {x0} {base + 7} {x0 + 3} {base + 13} "
            f"C{x0 + 5} {base + 18} {cx - w / 4} {base + 21} {cx} {base + 21} "
            f"C{cx + w / 4} {base + 21} {x1 - 5} {base + 18} {x1 - 3} {base + 13} "
            f"C{x1} {base + 7} {x1} {base + 2} {x1 - 4} {base} "
            f"C{cx + w / 8} {base - 1.5} {cx - w / 8} {base - 1.5} {x0 + 4} {base} Z")
    moss = (f"M{x0 + 6} {base + 1} C{cx - w / 3} {base - 2} {cx - w / 6} {base - 1} {cx} {base - 1.5} "
            f"C{cx + w / 6} {base - 1} {cx + w / 3} {base - 2} {x1 - 6} {base + 1} "
            f"C{cx + w / 3} {base + 2.5} {cx - w / 3} {base + 2.5} {x0 + 6} {base + 1} Z")
    return (f'<ellipse cx="{cx}" cy="{base + 21}" rx="{w * 0.66:.0f}" ry="4" fill="#000" opacity=".45"/>'
            f'<g class="g-stone">'
            f'<path d="{body}" fill="url(#stoneG)" filter="url(#fxStone)"/>'
            f'<path d="{moss}" fill="url(#mossG)" filter="url(#fxMoss)" opacity=".85"/>'
            f'</g>')


def dolmen(cx, base):
    """a portal dolmen of the passed ground: two chipped uprights under a
    weathered, tilted capstone, moss and lichen in its cracks."""
    up_l = f"M{cx - 17} {base} L{cx - 16} {base - 19} L{cx - 11} {base - 21} L{cx - 9} {base} Z"
    up_r = f"M{cx + 9} {base} L{cx + 11} {base - 21} L{cx + 16} {base - 19} L{cx + 17} {base} Z"
    cap = f"M{cx - 25} {base - 20} L{cx + 25} {base - 22} L{cx + 24} {base - 31} L{cx - 24} {base - 30} Z"
    return (f'<ellipse cx="{cx}" cy="{base + 1}" rx="27" ry="4.5" fill="#000" opacity=".5"/>'
            f'<g class="g-dolm">'
            f'<path d="{up_l}" fill="url(#capG)" filter="url(#fxRough)"/>'
            f'<path d="{up_r}" fill="url(#capG)" filter="url(#fxRough)"/>'
            f'<path d="{cap}" fill="url(#capG)" filter="url(#fxRough)"/>'
            f'<ellipse cx="{cx - 10}" cy="{base - 19}" rx="4" ry="2.2" fill="url(#mossG)" '
            f'filter="url(#fxMoss)" opacity=".7"/>'
            f'<ellipse cx="{cx + 6}" cy="{base - 29}" rx="5" ry="2.5" fill="url(#mossG)" '
            f'filter="url(#fxMoss)" opacity=".65"/>'
            f'<circle cx="{cx + 14}" cy="{base - 26}" r="1.8" fill="#9a8f5e" opacity=".3"/>'
            f'</g>')


# ── rows ────────────────────────────────────────────────────────────────────

def row_centers(row, n):
    x0, x1 = row["from"], row["to"]
    if n == 1:
        return [(x0 + x1) / 2]
    step = (x1 - x0) / (n - 1)
    return [x0 + i * step for i in range(n)]


def fleet_row(g):
    row, members = g["fleet"]["row"], g["fleet"]["members"]
    out = []
    for cx, m in zip(row_centers(row, len(members)), members):
        size = m.get("size", 44)
        base = row["base"]
        icon = image_art(m["icon"], cx, base - size / 2, size)
        out.append(f'<a href="{esc(m["href"])}" class="g-ent"{card(m)}>'
                   f'{plinth(cx, base, size + 12)}{icon}'
                   f'{label_at(m["label"], cx, base - size - 20)}</a>')
    return "\n        ".join(out)


def dolmen_row(g):
    row, members = g["dolmens"]["row"], g["dolmens"]["members"]
    base = row["base"]
    out = []
    for cx, m in zip(row_centers(row, len(members)), members):
        icon = image_art(m["icon"], cx, base - 56, 18)
        out.append(f'<a href="{esc(m["href"])}" class="g-ent g-dolmen"{card(m)}>'
                   f'{dolmen(cx, base)}{icon}'
                   f'{label_at(m["label"], cx, base - 52)}</a>')
    return "\n        ".join(out)


def spores_layer(s):
    motes = "".join(
        f'<g class="g-spore {cls}"><circle cx="{x}" cy="{y}" r="{r}" fill="url(#sporeG)"/>'
        f'<circle class="g-hit" cx="{x}" cy="{y}" r="13"/></g>'
        for x, y, r, cls in s["motes"])
    t, x, y = s["label"]
    return f'<g class="g-ent g-sporelayer">{motes}{label_at(t, x, y)}</g>'


# ── assembly ────────────────────────────────────────────────────────────────

def render(g):
    w, h = g["scene"]["width"], g["scene"]["height"]
    fixed = g["entities"]

    def at(place):
        return [e for e in fixed if e["art"]["place"] == place]

    parts = [
        f'<svg class="garden-scene" viewBox="0 0 {w} {h}" role="img" aria-label="{esc(g["aria"])}">',
        DEFS,
        sky(g["sky"]),
        HILLS,
        ringfort(g["dwellings"]["ringfort"]),
    ]
    for e in at("ringfort"):
        a = e["art"]
        parts.append(soul(e, image_art(e["icon"], a["center"][0], a["center"][1], a["size"])))
    parts.append(tree(g["tree"]))
    parts.append(fire(g["fire"]))
    for e in at("fire"):
        a = e["art"]
        parts.append(soul(e, teller(a["center"][0], a["center"][1])))
    parts.append(mainistir(g["dwellings"]["mainistir"]))
    for e in at("mainistir"):
        a = e["art"]
        parts.append(soul(e, image_art(e["icon"], a["center"][0], a["center"][1], a["size"])))
    parts.append(fleet_row(g))
    parts.append(pool(g["pool"]))
    for e in at("poolside"):
        a = e["art"]
        parts.append(soul(e, image_art(e["icon"], a["center"][0], a["center"][1], a["size"])))
    parts.append(castle(g["dwellings"]["castle"]))
    for e in at("castle"):
        a = e["art"]
        parts.append(soul(e, image_art(e["icon"], a["center"][0], a["center"][1], a["size"])))
    parts.append('<!-- the passed ground: dolmens of the retired fleet -->')
    parts.append('<g class="g-dolmens">')
    parts.append(dolmen_row(g))
    parts.append('</g>')
    parts.append('<!-- the spore spirits, drifting from the tree through all life -->')
    parts.append(spores_layer(g["spores"]))
    parts.append("</svg>")
    return "\n        ".join(parts)


def validate(g):
    need = ("name", "href", "icon", "epithet", "marks", "bio", "label")
    souls = list(g["entities"]) + list(g["fleet"]["members"]) + list(g["dolmens"]["members"])
    missing = []
    for e in souls:
        for k in need:
            if k not in e or e[k] in ("", None):
                missing.append(f'{e.get("name", "?")}: {k}')
        if "art" in e and e["art"].get("place") not in PLACES:
            missing.append(f'{e["name"]}: art.place must be one of {PLACES}')
        icon = e["icon"]
        if icon and not os.path.exists(os.path.join(PUBLIC, icon.lstrip("/"))):
            missing.append(f'{e["name"]}: icon {icon} not found in web/public')
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
        sys.exit("fleet.html: no garden scene and no markers — nowhere to plant")
    j = text.find("</svg>", i)
    if j < 0:
        sys.exit("fleet.html: the garden scene never closes")
    j += len("</svg>")
    return text[:i] + MARK_START + "\n      " + scene + "\n      " + MARK_END + text[j:]


def main():
    g = json.load(open(GARDEN, encoding="utf-8"))
    validate(g)
    scene = render(g)
    text = open(FLEET, encoding="utf-8").read()
    open(FLEET, "w", encoding="utf-8").write(splice(text, scene))
    souls = len(g["entities"]) + len(g["fleet"]["members"]) + len(g["dolmens"]["members"])
    print(f"the garden regrew: {len(g['entities'])} souls in dwellings, "
          f"{len(g['fleet']['members'])} fleet stones, "
          f"{len(g['dolmens']['members'])} dolmens, "
          f"{len(g['spores']['motes'])} spores — {souls} souls in all")
    print(f"scene spliced into {os.path.relpath(FLEET, ROOT)} between the markers")
    print("verify: cd web && npm ci && npm run build, then grep 'garden-scene' web/out/fleet/index.html")


if __name__ == "__main__":
    main()