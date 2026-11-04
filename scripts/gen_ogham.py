#!/usr/bin/env python3
"""gen_ogham.py — regenerate the carved ogham sections of web/content/ogham.html.

Cuts every glyph by geometry (the letter IS its strokes: n marks on the right,
the left, across, or through the stem), never trusting a font or a model with
the sacred alphabet (Law IX — never-model-carved). Emits two marked sections:

  <!-- ogham-stone:start --> … <!-- ogham-stone:end -->   the name-row standing stone
  <!-- ogham-cards:start --> … <!-- ogham-cards:end -->   the four aicme + forfeda grids

Run from anywhere:  python3 scripts/gen_ogham.py
Idempotent: re-runs replace only what sits between the markers.
"""
import random
import re
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PAGE = os.path.join(ROOT, "web", "content", "ogham.html")

STONE_START = "<!-- ogham-stone:start -->"
STONE_END = "<!-- ogham-stone:end -->"
CARDS_START = "<!-- ogham-cards:start -->"
CARDS_END = "<!-- ogham-cards:end -->"

# ── the name-row · ᚄᚆᚐᚅᚐᚌᚆᚔ · S H A N A G H Y ──────────────────────────────
# vertical carving, read bottom-to-top: side r/l, d = diagonal, n = notch
NAME_ROW = [
    ("S", "Sail", "r", 4),
    ("H", "Uath", "l", 1),
    ("A", "Ailm", "n", 1),
    ("N", "Nin", "r", 5),
    ("A", "Ailm", "n", 1),
    ("G", "Gort", "d", 2),
    ("H", "Uath", "l", 1),
    ("I", "Idad", "n", 5),
]

# ── the alphabet ────────────────────────────────────────────────────────────
# (aicme, unicode char, name, letter, sound, tree/gloss, stroke kind, count)
LETTERS = [
    ("beithe", "ᚁ", "Beith", "B", "b", "birch", "r", 1),
    ("beithe", "ᚂ", "Luis", "L", "l", "rowan · the word means flame, or herb", "r", 2),
    ("beithe", "ᚃ", "Fearn", "F", "w, later f", "alder — the van of the warrior-bands, for thereof are the shields", "r", 3),
    ("beithe", "ᚄ", "Sail", "S", "s", "willow", "r", 4),
    ("beithe", "ᚅ", "Nin", "N", "n", "ash in the arboreal gloss · the word means fork, or loft", "r", 5),
    ("huath", "ᚆ", "Uath", "H", "h", "white-thorn", "l", 1),
    ("huath", "ᚇ", "Dair", "D", "d", "oak", "l", 2),
    ("huath", "ᚈ", "Tinne", "T", "t", "holly", "l", 3),
    ("huath", "ᚉ", "Coll", "C", "k", "hazel", "l", 4),
    ("huath", "ᚊ", "Ceirt", "Q", "q", "apple tree", "l", 5),
    ("muine", "ᚋ", "Muin", "M", "m", "bramble, or vine", "d", 1),
    ("muine", "ᚌ", "Gort", "G", "g", "ivy · the word means field", "d", 2),
    ("muine", "ᚍ", "nGéadal", "NG", "ng", "broom — the glossators wavered", "d", 3),
    ("muine", "ᚎ", "Straif", "Z", "st, or z", "blackthorn", "d", 4),
    ("muine", "ᚏ", "Ruis", "R", "r", "elder", "d", 5),
    ("ailme", "ᚐ", "Ailm", "A", "a", "fir, or pine", "n", 1),
    ("ailme", "ᚑ", "Onn", "O", "o", "gorse · older glosses say ash", "n", 2),
    ("ailme", "ᚒ", "Úr", "U", "u", "heather · the word means earth, or soil", "n", 3),
    ("ailme", "ᚓ", "Eadhadh", "E", "e", "aspen", "n", 4),
    ("ailme", "ᚔ", "Idad", "I", "i", "yew", "n", 5),
]

# the five added letters — and a sixth, soft beith (rendered from the exact
# unicode forms, rotated to the climbing stem, for their shapes are pictorial)
FORFEDA = [
    ("ᚕ", "Éabhadh", "EA", "aspen — crithach"),
    ("ᚖ", "Óir", "OI", "gold · ór, from the Latin aurum; spindle tree in the gloss"),
    ("ᚗ", "Uilleann", "UI", "elbow · honeysuckle in the gloss"),
    ("ᚘ", "Ifín", "P", "gooseberry, or thorn"),
    ("ᚙ", "Eamancholl", "IA", "the twin of hazel"),
    ("ᚚ", "Peith", "P", "soft beith · dwarf elder"),
]

AICME_META = [
    ("beithe", "Aicme Beithe", "The B-Family", "one to five strokes to the right of the stem", "ᚁ"),
    ("huath", "Aicme hUath", "The H-Family", "one to five strokes to the left of the stem", "ᚆ"),
    ("muine", "Aicme Muine", "The M-Family", "one to five scores slanting across the stem", "ᚋ"),
    ("ailme", "Aicme Ailme", "The A-Family", "one to five notches cut through the stem — the vowels", "ᚐ"),
]


# ── carving helpers ─────────────────────────────────────────────────────────
def jit(rng, a, s=0.45):
    """small deterministic hand-wobble so no two cuts look machine-straight."""
    return a + rng.uniform(-s, s)


def stroke_paths(kind, count, x, y0, y1, rng, right_len=19, left_len=19,
                  diag_half=11, notch_half=9.5):
    """paths for one glyph's marks inside the stem band [y0, y1] at stem x."""
    paths = []
    span = y1 - y0
    step = span / count
    for i in range(count):
        y = y0 + step * (i + 0.5)
        y = jit(rng, y, 0.5)
        if kind == "r":
            x2 = jit(rng, x + right_len, 0.8)
            paths.append(f"M {x:.1f} {y:.1f} L {x2:.1f} {jit(rng, y, 0.3):.1f}")
        elif kind == "l":
            x1 = jit(rng, x - left_len, 0.8)
            paths.append(f"M {x1:.1f} {jit(rng, y, 0.3):.1f} L {x:.1f} {y:.1f}")
        elif kind == "d":
            # ascending across the stem, from lower left to upper right
            x1, y1p = x - diag_half, y + diag_half * 0.82
            x2, y2p = x + diag_half, y - diag_half * 0.82
            paths.append(
                f"M {jit(rng, x1, 0.7):.1f} {jit(rng, y1p, 0.6):.1f} "
                f"L {jit(rng, x2, 0.7):.1f} {jit(rng, y2p, 0.6):.1f}")
        elif kind == "n":
            x1, x2 = x - notch_half, x + notch_half
            paths.append(f"M {jit(rng, x1, 0.6):.1f} {jit(rng, y, 0.3):.1f} "
                         f"L {jit(rng, x2, 0.6):.1f} {jit(rng, y, 0.3):.1f}")
    return paths


def carve_group(stem_path, mark_paths, klass=""):
    """one glyph, twice-cut: dark groove beneath, gilt ridge above, offset."""
    stem = f'<path d="{stem_path}"/>' if stem_path else ""
    marks = "".join(f'<path d="{d}"/>' for d in mark_paths)
    return (
        f'<g class="og-carve {klass}">'
        f'<g class="og-groove">{stem}{marks}</g>'
        f'<g class="og-gilt" transform="translate(.9,.9)">{stem}{marks}</g>'
        f'</g>'
    )


def card_svg(ch, kind, count, seed):
    """a single glyph card svg — vertical stem, glyph climbing it."""
    rng = random.Random(seed)
    x = 24.0
    stem = f"M {jit(rng, x, .3):.1f} 10 Q {jit(rng, x + 1.3, .5):.1f} 60 {jit(rng, x, .4):.1f} 110"
    marks = stroke_paths(kind, count, x, 12, 108, rng)
    return (
        f'<svg class="og-card-svg" viewBox="0 0 48 120" role="img" aria-label="{ch}">'
        f'<title>{ch}</title>'
        f"{carve_group(stem, marks)}"
        f"</svg>"
    )


def forfedon_card(ch, seed):
    """the added letters: exact unicode form, rotated onto the climbing stem."""
    rng = random.Random(seed)
    rot = jit(rng, 90, 1.2)
    return (
        f'<svg class="og-card-svg og-ffed" viewBox="0 0 48 120" role="img" aria-label="{ch}">'
        f'<title>{ch}</title>'
        f'<g class="og-carve">'
        f'<g class="og-groove"><text x="24" y="60" transform="rotate({rot:.1f} 24 60)">{ch}</text></g>'
        f'<g class="og-gilt" transform="translate(.9,.9)">'
        f'<text x="24" y="60" transform="rotate({rot:.1f} 24 60)">{ch}</text></g>'
        f"</g></svg>"
    )


def card(ch, kind, count, name, letter, sound, tree, seed, extra_cls=""):
    svg = card_svg(ch, kind, count, seed) if kind else forfedon_card(ch, seed)
    return (
        f'<article class="gcard rise {extra_cls}">'
        f'<span class="og-corner" aria-hidden="true">{ch}</span>'
        f"{svg}"
        f'<h3 class="og-name">{name}</h3>'
        f'<p class="og-meta"><span class="og-letter">{letter}</span>'
        f'<span class="og-sound">/{sound}/</span></p>'
        f'<p class="og-tree">{tree}</p>'
        f"</article>"
    )


# ── the name-row standing stone ────────────────────────────────────────────
def standing_stone():
    rng = random.Random("seanachai")
    sx, sy0, sy1 = 74.0, 76, 556          # the stemline: the stone's arris
    stem = f"M {sx} {sy1} Q {sx + 2.2:.1f} {(sy0 + sy1) / 2:.0f} {sx + .4:.1f} {sy0}"
    bands = []
    band_h = (sy1 - sy0 - 24) / len(NAME_ROW)
    by = sy1 - 12                          # carve bottom-up: Sail first
    for letter, name, kind, count in NAME_ROW:
        y0, y1 = by - band_h, by
        marks = stroke_paths(kind, count, sx + 0.4, y0, y1, rng,
                             right_len=26, left_len=24, diag_half=14, notch_half=12)
        bands.append(
            f'<title>{name} · {letter}</title>' + carve_group(None, marks, "og-band")
        )
        by -= band_h
    stone_face = (
        "M40 62 L84 36 L146 30 L196 50 L208 148 L214 420 L204 556 "
        "L182 596 L74 600 L50 560 L40 420 L34 156 Z"
    )
    moss = (
        f'<g class="stone-moss">'
        f'<path d="M46 560 Q60 520 52 470 Q44 430 58 400 Q52 372 66 352 '
        f'Q60 330 74 322 L84 336 Q76 380 86 430 Q80 480 92 530 '
        f'Q86 566 98 596 L74 600 L50 560 Z"/>'
        f'<ellipse cx="120" cy="592" rx="66" ry="15"/>'
        f'<ellipse cx="60" cy="588" rx="34" ry="12"/>'
        f"</g>"
    )
    return (
        '<svg class="og-stone-svg" viewBox="0 0 240 640" role="img" '
        'aria-label="the name of the forge, in ogham cut along a standing stone">'
        f'<defs>'
        f'<radialGradient id="stoneG" cx="42%" cy="30%" r="85%">'
        f'<stop offset="0" stop-color="#26301f"/><stop offset=".55" stop-color="#151d15"/>'
        f'<stop offset="1" stop-color="#070a08"/></radialGradient>'
        f'<linearGradient id="mossG" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="#94ac78"/><stop offset="1" stop-color="#57713f"/></linearGradient>'
        f"</defs>"
        f'<ellipse class="stone-shadow" cx="120" cy="606" rx="104" ry="16"/>'
        f'<path class="stone-slab" d="{stone_face}"/>'
        f'<path class="stone-edge" d="{stone_face}"/>'
        f'<g class="stone-grain">'
        f'<path d="M66 60 Q98 200 92 380 Q88 500 108 588"/>'
        f'<path d="M150 44 Q168 210 162 400 Q160 510 176 590"/>'
        f'<path d="M120 38 Q124 240 118 440 Q116 540 130 596"/>'
        f"</g>"
        f"{moss}"
        f'<g class="stone-motes">'
        f'<circle cx="150" cy="140" r="1.6"/><circle cx="172" cy="250" r="1.3"/>'
        f'<circle cx="158" cy="360" r="1.7"/><circle cx="188" cy="300" r="1.2"/>'
        f'<circle cx="140" cy="470" r="1.4"/><circle cx="176" cy="510" r="1.5"/>'
        f"</g>"
        f'<g class="og-row">{carve_group(stem, [])}'
        f'{"".join(bands)}</g>'
        f"</svg>"
    )


# ── section emitters ────────────────────────────────────────────────────────
def cards_section():
    out = []
    for aicme, title, sub, rule, ch in AICME_META:
        letters = [l for l in LETTERS if l[0] == aicme]
        out.append(
            f'<div class="plaque-head rise"><div class="pla-roundel">{ch}</div>'
            f'<div class="pla-text"><p class="over">The Four Families · {rule}</p>'
            f"<h2>{title}</h2></div></div>"
        )
        out.append(f'<div class="og-grid og-{aicme}">')
        for i, (_, c, name, letter, sound, tree, kind, count) in enumerate(letters):
            out.append(card(c, kind, count, name, letter, sound, tree,
                            seed=f"{aicme}-{name}-{i}"))
        out.append("</div>")
    out.append(
        '<div class="plaque-head rise"><div class="pla-roundel">ᚕ</div>'
        '<div class="pla-text"><p class="over">The Added Letters · the glossators&rsquo; own</p>'
        "<h2>Na Forfeda</h2></div></div>"
    )
    out.append('<div class="og-grid og-forfeda">')
    for i, (c, name, value, gloss) in enumerate(FORFEDA):
        out.append(card(c, None, 0, name, value, "", gloss, seed=f"ffed-{name}-{i}"))
    out.append("</div>")
    return "\n".join(out)


def replace_between(text, start, end, body):
    i = text.index(start) + len(start)
    j = text.index(end)
    return text[:i] + "\n" + body + "\n" + text[j:]


def main():
    html = open(PAGE, encoding="utf-8").read()
    for s in (STONE_START, STONE_END, CARDS_START, CARDS_END):
        assert s in html, f"marker missing from ogham.html: {s}"
    html = replace_between(html, STONE_START, STONE_END, standing_stone())
    html = replace_between(html, CARDS_START, CARDS_END, cards_section())
    open(PAGE, "w", encoding="utf-8").write(html)
    n_cards = html.count('class="gcard')
    print(f"ogham.html regenerated — {n_cards} glyph cards, stone carved.")


if __name__ == "__main__":
    main()
