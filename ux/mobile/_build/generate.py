#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════════════════
#  build the shanaghy.com v2 prototype  (Luna)
#    LARGE   = the live front door, byte-faithful from _src (urls absolutised)
#    COMPACT = the new mobile layer, DERIVED from the same source (one truth)
#  Nothing here touches the repo.  Output: shanaghy-mobile-prototype.html
# ═══════════════════════════════════════════════════════════════════════════
import re, html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, '_src')
OUT  = os.path.join(ROOT, 'shanaghy-mobile-prototype.html')
SITE = 'https://www.shanaghy.com'

css      = open(os.path.join(SRC, 'index.css')).read()
content  = open(os.path.join(SRC, 'index.html')).read()
compact_css = open(os.path.join(ROOT, '_build', 'compact.css')).read()
compact_js  = open(os.path.join(ROOT, '_build', 'compact.js')).read()

# ── 1 · absolutise the site's own urls so the prototype can hotlink ─────────
def absolutise(s):
    s = s.replace("url('/assets/", "url('%s/assets/" % SITE)
    s = s.replace('="/', '="%s/' % SITE)          # href="/x"  src="/x"  data-icon="/x"
    return s

desktop_css = absolutise(css)

# ── 2 · the desktop render: drop the one stray </div> the content carries ───
STRAY = "    </div>\n    </div>\n\n      <!-- The Living Stones"
assert STRAY in content, "stray-div anchor not found"
content = content.replace(STRAY, "    </div>\n\n      <!-- The Living Stones")
assert content.count('<div') == content.count('</div>'), \
       "content div balance off: %d/%d" % (content.count('<div'), content.count('</div>'))
desktop_body = absolutise(content)               # includes the sigils <svg> + <main class=garden>

# ── 3 · the shared desktop chrome (topbar + footer) from the live page ──────
TOPBAR = (
 '<nav class="topbar" aria-label="The forge of FiremanDecko">'
 '<a class="brand" href="{S}/"><img class="brand-logo" src="{S}/assets/icons/forge-logo.png" '
 'alt="The name of the forge, in ogham carved on mossy stone" width="160" height="40" loading="lazy"/></a>'
 '<div class="toplinks">'
 '<a class="tlink here" href="{S}/">Garden</a>'
 '<a class="tlink" href="{S}/creed/">Creed</a>'
 '<a class="tlink" href="{S}/ogham/">Ogham</a>'
 '<a class="tlink" href="{S}/projects/">Stones</a>'
 '<a class="tlink" href="{S}/sites/">RingForts</a>'
 '<a class="tlink" href="{S}/videos/">Towers</a>'
 '<a class="tlink" href="{S}/sessions/">Ballads</a>'
 '<a class="tlink" href="{S}/paths/">Paths</a>'
 '</div></nav>'
).format(S=SITE)

FOOTER = (
 '<footer class="foot">'
 '<p class="foot-line">The garden grows from Athlone, Co. Westmeath, with roots in Ballyhaunis, Co. Mayo.</p>'
 '<a class="foot-gh" href="https://github.com/declanshanaghy" target="_blank" rel="noopener noreferrer">github.com/declanshanaghy</a>'
 '<p class="foot-copy">The Forge of FiremanDecko · an amalgamation of many spores · 🍀</p>'
 '</footer>'
)

# ── 4 · derive the soul table from the scene markup (single source of truth) ─
SCENE_RE = re.compile(
    r'<a href="([^"]+)" class="g-ent" data-pop="1" '
    r'data-name="([^"]*)" data-epithet="([^"]*)" data-marks="([^"]*)" '
    r'data-bio="[^"]*" data-icon="([^"]+)">'
    r'<image href="[^"]+" x="([\d.]+)" y="([\d.]+)" width="(\d+(?:\.\d+)?)"')
souls = []
for m in SCENE_RE.finditer(content):
    href, name, ep, marks, icon, x, y, w = m.groups()
    souls.append(dict(href=href, name=html.unescape(name), ep=html.unescape(ep),
                      marks=html.unescape(marks), icon=icon.split('/')[-1],
                      x=float(x), y=float(y), w=float(w)))
assert len(souls) == 20, "expected 20 souls, got %d" % len(souls)
BYS = {s['href'].rstrip('/').split('/')[-1]: s for s in souls}

# chip membership + the one-line seat gloss (Luna's own wording)
CHIP_SUB = {
 'firemandecko':'the ringfort','mossy':'the mainistir','cork':'the Ground',
 'moinin':'little moss','seanchan':'the little teller','hal-9005':'the Windows gate',
 'home-assistant-lan':'the hearthkeeper','na-seanchai':'the tellers','na-fianna':'the watch',
 'fionn':'the salmon','odin':'the All-Father','freya':'the Seer of Fates','luna':'the Shaper',
 'loki':'father of the Wolf','carlow':'first ground','mayo':'root ground',
 'hal-9001':'the line · first','hal-9002':'the line · second',
 'hal-9003':'the line · third','hal-9004':'the line · fourth',
}
GROUPS = [
 ('ᚄ','the living','the fleet',
  ['firemandecko','mossy','cork','moinin','seanchan','hal-9005','home-assistant-lan',
   'na-seanchai','na-fianna','fionn']),
 ('ᚠ','the high hall','the ledger',['odin','freya','luna','loki']),
 ('ᚚ','the passed ground','at rest',
  ['carlow','mayo','hal-9001','hal-9002','hal-9003','hal-9004']),
]
for g in GROUPS:
    for slug in g[3]:
        assert slug in BYS, "chip slug not in scene: " + slug

# ── 5 · the compact scene svg + the touch hit layer (same viewBox, same souls)
#       The scene scales LINEARLY: viewBox 0 0 900 480, width:100%, aspect-ratio
#       900/480 — the whole painting, never cropped.  Below it a sibling HTML
#       layer carries the enlarged invisible touch targets (48px) at each soul's
#       EXACT fractional position (constant, because the scene scales uniformly)
#       plus the AIM name-tag that answers the desktop's hover label.
def esc(s): return html.escape(s, quote=True)

soul_svg = []
hit_html = []
for s in souls:
    cx   = s['x'] + s['w']/2
    cy   = s['y'] + s['w']/2
    w    = s['w']
    r    = w * 0.72
    fx   = cx / 900 * 100
    fy   = cy / 480 * 100
    edge = ' edgeL' if fx < 19 else (' edgeR' if fx > 81 else '')
    slug = s['href'].rstrip('/').split('/')[-1]
    soul_svg.append(
        '<g class="c-ent" data-s="%s" aria-hidden="true">'
        '<circle class="c-ring" cx="%.1f" cy="%.1f" r="%.1f"/>'
        '<ellipse class="c-shadow" cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#000" opacity=".28" filter="url(#cSoft)"/>'
        '<image class="c-soul" href="%s/assets/icons/overlay/%s" x="%g" y="%g" width="%g" height="%g"/>'
        '</g>'
        % (slug, cx, cy, r, cx, s['y'] + w - 2, w*0.42, w*0.10,
           SITE, s['icon'], s['x'], s['y'], w, w))
    hit_html.append(
        '<button class="c-hitbtn%s" type="button" data-s="%s" data-x="%.3f" data-y="%.3f" '
        'aria-label="%s" style="left:%.3f%%;top:%.3f%%">'
        '<span class="c-tag" aria-hidden="true"><span class="c-tag-name">%s</span>'
        '<span class="c-tag-hint">tap again to open</span></span></button>'
        % (edge, slug, fx, fy, esc(s['name'] + ' — ' + s['ep']), fx, fy, esc(s['name'])))
scene_svg = '\n            '.join(soul_svg)
hits_html = '\n        '.join(hit_html)

# ── 6 · the compact sections, parsed from the desktop content ───────────────
PLAQUE_RE = re.compile(
    r'<div class="plaque-head rise" id="([^"]+)"><div class="pla-roundel">(.*?)</div>'
    r'<div class="pla-text"><p class="over">(.*?)</p><h2>(.*?)</h2></div>'
    r'<span class="pla-count">(.*?)</span></div>', re.S)
ART_RE = re.compile(r'<article class="keeper[^"]*">(.*?)</article>', re.S)

def A(u):                                 # absolutise a bare href
    return (SITE + u) if u.startswith('/') else u

def strip_a(inner):                       # keep <a>…</a> and </a>, drop other tags
    return re.sub(r'<(?!/?a(?=[\s>]))(/)?([a-z0-9]+)[^>]*>', '', inner, flags=re.I)

def compact_keeper(a, kind='stone'):
    img  = re.search(r'<img class="keeper-sigil3d" src="([^"]+)"', a)
    h3   = re.search(r'<h3><a href="([^"]+)"[^>]*>(.*?)</a></h3>', a, re.S)
    p    = re.search(r'<p>(.*?)</p>', a, re.S)
    lang = re.search(r'<span class="m-lang">(.*?)</span>', a, re.S)
    year = re.search(r'<span class="m-year">(.*?)</span>', a, re.S)
    icon = A(img.group(1)) if img else '%s/assets/icons/moss-quiet.png' % SITE
    href = A(h3.group(1)) if h3 else '#'
    slug = href.rstrip('/').split('/')[-1]
    name = h3.group(2).strip() if h3 else ''
    prose = absolutise(strip_a(p.group(1).strip())) if p else ''
    if kind == 'tel':
        return ('<a class="c-tel" href="%s"><img src="%s" alt="" width="30" height="30" loading="lazy">'
                '<span class="c-tel-txt"><span class="c-tel-name">%s</span>'
                '<span class="c-tel-sub">%s</span></span></a>'
                % (href, icon, name, esc(TEL_SUB.get(href, ''))))
    stat = ''
    if lang:
        stat = ('<p class="c-statrow"><span class="c-s-lang">%s</span>'
                '<span class="c-s-sep">᛫</span><span class="c-s-year">%s</span></p>'
                % (lang.group(1).strip(), (year.group(1).strip() if year else '')))
    return ('<article class="c-keeper"><a class="c-stone-link" href="%s" aria-label="%s"></a>'
            '<div class="c-keeper-top"><img class="c-sigil" src="%s" alt="" width="38" height="38" loading="lazy">'
            '<div class="c-keeper-id"><h3><a href="%s">%s</a></h3>%s</div></div>'
            '<p class="c-keeper-prose">%s</p></article>'
            % (href, slug, icon, href, name, stat, prose))

TEL_SUB = {
 SITE+'/creed/':'three strands','%s/paths/'%SITE:'the ways through',
 SITE+'/projects/':'49 projects','%s/sites/'%SITE:'ten halls',
 SITE+'/videos/':'181 reels','%s/sessions/'%SITE:'the ephemera',
}

sections_html = []
parts = re.split(r'(?=<div class="plaque-head rise" id=)', content)
for part in parts[1:]:
    m = PLAQUE_RE.search(part)
    if not m:
        continue
    _id, rune, over, h2, count = m.groups()
    rest = part[m.end():]
    # stop at the next section marker / comment / line-sep so tellers never leak in
    stops = [p for p in (rest.find('<!-- The '), rest.find('<section'),
                         rest.find('<div class="line-sep"')) if p >= 0]
    body_rest = rest[:min(stops)] if stops else rest
    intro = body_rest.split('<div class="keepers-grid')[0]
    lede_html = ''
    for p in re.findall(r'<p[^>]*>(.*?)</p>', intro, re.S):
        lede_html += '<p class="c-lede">%s</p>' % absolutise(strip_a(p.strip()))
    keepers = ''.join(compact_keeper(a) for a in ART_RE.findall(body_rest))
    sections_html.append(
        '<section class="c-grove" id="c-%s">\n'
        '  <div class="c-plaque"><span class="c-pla-roundel">%s</span>'
        '<div class="c-pla-text"><p class="c-pla-over">%s</p><h2>%s</h2></div>'
        '<span class="c-pla-count">%s</span></div>\n%s\n  <div class="c-keepers">\n%s\n  </div>\n</section>'
        % (_id, rune, over, absolutise(h2), count, lede_html, keepers))

# the telling (wayfinding) — a .grove-head, not a plaque-head
tel_block = content.split('<section class="grove" id="telling">')[1]
tel_over = re.search(r'<p class="lh-over">(.*?)</p>', tel_block).group(1)
tel_h2   = re.search(r'<h2>(.*?)</h2>', tel_block).group(1)
tel_count= re.search(r'<span class="pl-count">(.*?)</span>', tel_block).group(1)
tels = ''.join(compact_keeper(a, 'tel') for a in ART_RE.findall(tel_block))
telling_html = (
 '<section class="c-telling" id="c-telling">\n'
 '  <div class="c-plaque"><span class="c-pla-roundel rune">ᚃ</span>'
 '<div class="c-pla-text"><p class="c-pla-over">%s</p><h2>%s</h2></div>'
 '<span class="c-pla-count">%s</span></div>\n'
 '  <div class="c-tel-grid">\n%s\n  </div>\n</section>' % (tel_over, tel_h2, tel_count, tels))

# ── 7 · the compact chips (from the soul table) ─────────────────────────────
def chip(slug, rest=False):
    s = BYS[slug]
    return ('<button class="c-chip%s" type="button" data-s="%s">'
            '<img src="%s/assets/icons/%s" alt="">'
            '<span class="c-chip-txt"><span class="c-chip-name">%s</span>'
            '<span class="c-chip-sub">%s</span></span></button>'
            % (' rest' if rest else '', slug, SITE,
               (s['icon'] if s['icon'] != 'mossiah.png' else 'mossiah.png'), esc(s['name']),
               esc(CHIP_SUB[slug])))
# chips use the OPAQUE plates (assets/icons), never the overlay cutouts
CHIP_ICON = {s['href'].rstrip('/').split('/')[-1]: BYS[s['href'].rstrip('/').split('/')[-1]]['icon']
             for s in souls}
ICON_FOR = {
 'firemandecko':'deco.png','mossy':'mossiah.png','cork':'horn.png','moinin':'moinin.png',
 'seanchan':'sean-chai.png','hal-9005':'hal9005.png','home-assistant-lan':'candle.png',
 'na-seanchai':'sean-chai.png','na-fianna':'fianna-watch.png','fionn':'fionn-salmon.png',
 'odin':'raven.png','freya':'moon.png','luna':'webknot.png','loki':'wolf-coins.png',
 'carlow':'cauldron.png','mayo':'moon.png','hal-9001':'candle.png','hal-9002':'candle.png',
 'hal-9003':'candle.png','hal-9004':'candle.png',
}
def chip2(slug, rest=False):
    s = BYS[slug]
    return ('<button class="c-chip%s" type="button" data-s="%s">'
            '<img src="%s/assets/icons/%s" alt="">'
            '<span class="c-chip-txt"><span class="c-chip-name">%s</span>'
            '<span class="c-chip-sub">%s</span></span></button>'
            % (' rest' if rest else '', slug, SITE, ICON_FOR[slug], esc(s['name']),
               esc(CHIP_SUB[slug])))

roll_html = ''
for rune, glabel, gsub, members in GROUPS:
    rest = (glabel == 'the passed ground')
    chips = '\n        '.join(chip2(s, rest) for s in members)
    roll_html += (
      '    <div class="c-roll-group">\n'
      '      <p class="c-rg-label"><span class="c-rg-rune">%s</span>%s — %s</p>\n'
      '      <div class="c-roll">\n        %s\n      </div>\n    </div>\n'
      % (rune, glabel, gsub, chips))

# the JS soul map (name / epithet / marks / icon / href) for the compact sheet
souls_js = {}
for slug, s in BYS.items():
    souls_js[slug] = dict(n=s['name'], e=s['ep'], m=s['marks'], i=ICON_FOR[slug], h=s['href'])

# ── 8 · the Path-Sheet plates (the eight paths — from the desktop topbar) ────
PATHS = [
 ('ᚌ','The Garden','the front door — you are here','',True),
 ('ᚄ','The Creed','three strands · the Dekalogue','creed/',False),
 ('ᚑ','Ogham','the elder script, carved','ogham/',False),
 ('ᚐ','The Stones','49 projects, seven groves','projects/',False),
 ('ᚉ','The RingForts','ten halls beyond the wall','sites/',False),
 ('ᚘ','The Towers','181 reels of the wander','videos/',False),
 ('ᚊ','The Ballads','ephemera between stones','sessions/',False),
 ('ᚃ','The Paths','the ways through','paths/',False),
]
plates = '\n    '.join(
 '<a class="c-plate%s" href="%s/%s"><span class="c-np-rune">%s</span>'
 '<span class="c-np-name">%s</span><span class="c-np-about">%s</span></a>'
 % (' here' if here else '', SITE, path, rune, name, about)
 for rune, name, about, path, here in PATHS)

# ── 9 · assemble ────────────────────────────────────────────────────────────
page = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>the garden — mobile prototype v3 (Luna)</title>
<!-- ═══════════════════════════════════════════════════════════════════════════
     shanaghy.com — TWO-MODE PROTOTYPE  v3        designer: Luna (the wireframe moon)
     Standalone. Nothing here touches the repo. Assets are hotlinked from the
     live site (www.shanaghy.com) so the file stays a single readable document.

       #large    = the site EXACTLY as it is today (index.css + front-door
                   markup, from origin/main; urls absolutised; one stray </div>
                   removed).  Never restyled by this prototype.
       #compact  = the new mobile layer.  Every rule in it is (a) c-namespaced
                   markup that only exists in #compact, and (b) inside a mobile
                   media query.  The LARGE render cannot see it — the port is
                   purely additive.

     v3 head decree: THE PAINTING SCALES LINEARLY — the scene is the 900×480
     SVG at width:100%% / aspect-ratio 900:480, so the WHOLE painting shows,
     uncropped and undistorted, at every width (1024→1024×546, 412→412×220,
     360→360×192).  And NO hover is required anywhere: souls rest lit, and the
     touch model is two-tap AIM → bottom sheet, with the Soul Roll as the
     guaranteed one-tap ≥44px index.  (Site-wide hover→touch pattern table in
     the companion interactions.md.)

     The mode is chosen by WIDTH alone (breakpoint 1024px); no JS decides layout.
     ═══════════════════════════════════════════════════════════════════════════ -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<style>
/* ══════════════ THE SITE AS IT IS TODAY (web/content/index.css, verbatim) ══════════════ */
%s
</style>
<style>
/* ══════════════ THE NEW COMPACT LAYER (mobile media query, c-namespaced) ══════════════ */
%s
</style>
</head>
<body>

<!-- ══════════════════════════════ LARGE MODE — the site, untouched ═══════════════════════ -->
<div id="large">
%s
%s
%s
</div>

<!-- ══════════════════════════════ COMPACT MODE — the new layer ══════════════════════════ -->
<div id="compact">

  <svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
    <defs>
      <symbol id="c-moss-tuft" viewBox="0 0 48 24">
        <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M8 22 Q7 14 3 10"/><path d="M13 22 Q13 11 10 6"/><path d="M18 22 Q19 9 16 4"/>
          <path d="M23 22 Q22 12 26 7"/><path d="M28 22 Q30 13 27 8"/><path d="M33 22 Q32 15 36 11"/>
          <path d="M38 22 Q39 16 44 13"/>
        </g>
      </symbol>
      <symbol id="c-knot" viewBox="0 0 220 24">
        <g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 12 H62 M158 12 H220"/><path d="M70 8 l8 8 M78 8 l-8 8" opacity=".8"/>
          <path d="M142 8 l8 8 M150 8 l-8 8" opacity=".8"/><path d="M84 12 l6 -5 6 5 -6 5 Z"/>
          <path d="M124 12 l6 -5 6 5 -6 5 Z"/><path d="M110 5 L118 12 L110 19 L102 12 Z"/>
          <path d="M110 9 L114 12 L110 15 L106 12 Z"/>
        </g>
      </symbol>
    </defs>
  </svg>

  <!-- 1 · the compact bar (topbar, minimised) -->
  <nav class="c-bar" aria-label="The forge of FiremanDecko">
    <a class="c-brand" href="%s/">
      <img src="%s/assets/icons/forge-logo.png" alt="The name of the forge, in ogham carved on mossy stone" width="128" height="30">
    </a>
    <span class="c-here">Garden</span>
    <button class="c-btn c-btn--menu" id="cNavBtn" type="button" aria-expanded="false" aria-controls="cNav">
      <span class="c-burger" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="c-menu-t">Paths</span>
    </button>
  </nav>

  <!-- the Path-Sheet (the eight paths) -->
  <div class="c-navsheet" id="cNav" hidden>
    <div class="c-navsheet-head">
      <div><p class="c-ns-over">The Garden · By Path</p><h2>Where would you wander?</h2></div>
      <button class="c-close" type="button" aria-label="close the paths">×</button>
    </div>
    <div class="c-nav-grid">
    %s
    </div>
    <div class="c-ns-foot">
      <a class="c-btn" href="https://github.com/declanshanaghy" target="_blank" rel="noopener">github.com/declanshanaghy</a>
    </div>
    <p class="c-ns-note" aria-hidden="true">the garden is grown, never built — <span class="c-rune">ᚄᚆᚐᚅᚐᚌᚆᚔ</span></p>
  </div>

  <div class="c-main">

    <p class="c-invite">every soul rests lit — <b>touch to aim, touch again to open</b></p>

    <!-- 4 · the Living Scene — LINEAR SCALING, never cropped.
         The 900×480 SVG at width:100%% / aspect-ratio 900:480 shows the WHOLE
         painting, uncropped and undistorted, at every width.  The .c-hits layer
         carries the enlarged touch targets + the aim name-tags. -->
    <section class="c-stage-wrap" aria-label="the living garden">
      <div class="c-stage" id="cStage">
        <svg class="c-scene" id="cScene" viewBox="0 0 900 480" role="img"
             aria-label="the living garden at night — the ringfort-workshop with its forge aglow, its stones scattered round, the tree of life, the mainistir and its round tower, the peat fire, the bog pool, the castle, the living souls to the fore and the dolmens of the passed ground fading into the mist">
          <defs>
            <radialGradient id="cSporeG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#effbee"/><stop offset="0.55" stop-color="#a9e6c3" stop-opacity=".85"/><stop offset="1" stop-color="#a9e6c3" stop-opacity="0"/></radialGradient>
            <filter id="cSoft" x="-40%%" y="-40%%" width="180%%" height="180%%"><feGaussianBlur stdDeviation="2.2"/></filter>
          </defs>
          <image class="c-world" href="%s/assets/icons/garden-backdrop.png" x="0" y="0" width="900" height="480" preserveAspectRatio="none"/>
          <g class="c-souls" aria-hidden="true">
            %s
          </g>
          <g class="c-sporelayer" aria-hidden="true">
            <circle cx="300" cy="180" r="4" fill="url(#cSporeG)"/><circle cx="368" cy="240" r="3.2" fill="url(#cSporeG)"/>
            <circle cx="430" cy="150" r="3.8" fill="url(#cSporeG)"/><circle cx="496" cy="226" r="3" fill="url(#cSporeG)"/>
            <circle cx="556" cy="166" r="4.2" fill="url(#cSporeG)"/><circle cx="618" cy="252" r="3.2" fill="url(#cSporeG)"/>
            <circle cx="668" cy="192" r="3.4" fill="url(#cSporeG)"/><circle cx="472" cy="300" r="3" fill="url(#cSporeG)"/>
          </g>
        </svg>
      </div>
      <div class="c-hits">
        %s
      </div>
    </section>
    <p class="c-zoomhint" aria-hidden="true">pinch to zoom · release to let the garden rest</p>

    <!-- 5 · the Soul Roll — the complete, tappable index -->
    <section class="c-roll-wrap" aria-label="every soul of the garden">
      <div class="c-roll-head"><span class="c-rh-over">Every Soul, By Stone</span><span class="c-rh-count">20 souls</span></div>
%s
    </section>

    <!-- 6–8 · the compact sections (headings, statrows, cards — all minimised) -->
%s

    <div class="c-sep" aria-hidden="true"><svg viewBox="0 0 220 24"><use href="#c-knot"/></svg></div>

%s

  </div>

  <!-- 9 · the compact footer -->
  <footer class="c-foot">
    <p class="c-foot-line">The garden grows from Athlone, Co. Westmeath, with roots in Ballyhaunis, Co. Mayo.</p>
    <a class="c-btn c-foot-gh" href="https://github.com/declanshanaghy" target="_blank" rel="noopener">github.com/declanshanaghy</a>
    <p class="c-foot-copy">The Forge of FiremanDecko · an amalgamation of many spores · 🍀</p>
  </footer>

  <!-- 10 · the compact bottom sheet (the popover, minimised) — HALF detail only -->
  <div class="c-scrim" id="cScrim"></div>
  <section class="c-sheet" id="cSheet" role="dialog" aria-modal="true" aria-labelledby="cShName" aria-hidden="true">
    <div class="c-grip" aria-hidden="true"></div>
    <button class="c-close" type="button" aria-label="close the card">×</button>
    <div class="c-sh-head">
      <img class="c-sh-icon" id="cShIcon" src="" alt="">
      <div><h2 class="c-sh-name" id="cShName"></h2><p class="c-sh-ep" id="cShEp"></p></div>
    </div>
    <p class="c-sh-marks" id="cShMarks"></p>
    <a class="c-btn c-btn--lume c-btn--wide c-sh-full" id="cShFull" href="#">the full telling <span aria-hidden="true">→</span></a>
    <nav class="c-sh-quick" aria-label="more of the garden">
      <a class="c-btn" href="%s/creed/">the creed</a>
      <a class="c-btn" href="%s/">the garden</a>
      <a class="c-btn" href="%s/sessions/">the ballads</a>
    </nav>
  </section>

</div>

<script>
var SITE = '%s';
var SOULS = %s;
%s
</script>
</body>
</html>
''' % (
    desktop_css,
    compact_css,
    TOPBAR, desktop_body, FOOTER,
    SITE, SITE, plates,
    SITE, scene_svg, hits_html,
    roll_html,
    '\n\n'.join(sections_html),
    telling_html,
    SITE, SITE, SITE,
    SITE, json.dumps(souls_js, ensure_ascii=False, separators=(',', ':')),
    compact_js,
)

open(OUT, 'w').write(page)
print("wrote %s  (%d bytes)" % (OUT, len(page)))
print("desktop content div-balance ok; souls=%d; sections=%d" % (len(souls), len(sections_html)))
