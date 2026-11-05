# shanaghy.com — Two-Mode Prototype · Interaction Spec (v3)

**Prototype:** `shanaghy-mobile-prototype.html` (v3) · **This file:** the behavioural contract for the port.

**v2 → v3 — what this pass answers (Declan's second review):**
> *"The garden is not scaling nicely, it should scale down linearly. How will it be interactive in mobile?"*
> *"we utilize a lot of mouseover interactions, which don't work on mobile."*

1. **THE PAINTING NOW SCALES LINEARLY — UNBREAKABLE.** The compact mode's fixed-height,
   cover-cropped, pan-by-default **Living Band is REJECTED**. In its place the garden scene renders at
   **uniform scale, aspect-preserved, width-proportional** — the whole painting, always, at every width.
   The scale is **continuous** as the viewport narrows: no breakpoint, no crop, no vh height, no
   distortion. Exploration survives only as **opt-in pinch-zoom that springs back**.
2. **THE MOBILE INTERACTION MODEL IS EXPLICIT AND HOVER-FREE.** A **two-tap AIM** (tap a soul → it lights
   harder and its name-tag appears; tap again → the sheet) is the honest touch equivalent of the desktop
   mouseover, and the **Soul Roll** stays the guaranteed one-tap ≥44 px index. §3.7 is the full
   element/gesture/response table; §3.9 answers the question in one screen.
3. **A SITE-WIDE HOVER AUDIT** and its per-pattern translation rule: §3.8. Every hover-driven interaction
   in the source is inventoried by **pattern** (the ~110 page css reuse the same handful), each with a
   compact port rule. Compact ships **zero behavioural hover dependency** — proven by grep (§6).

Everything else from v2 stands: **LARGE** mode is the site *exactly as it ships today* (byte-identical,
re-verified); **COMPACT** carries the new components; one **display swap on width alone** at 1024 px;
moonlit-moss canon; ogham not futhark; never the personal name; ≥44 px controls, ≥16 px body, no
horizontal overflow. The port is **purely additive** — every compact rule is inside a mobile media query.

**Division of truth:** the HTML is the *reference implementation* — its code holds the exact values and
its comments are the *minimum* documentation; THIS md states the behaviour that must hold no matter the
implementation. The port replicates from **both**. Nothing here is a repo instruction yet.

---

## 0. Build provenance (what in this file is "the site")

The prototype is assembled by `python3 _build/generate.py` from **`_src/` provenance copies of
origin/main** (re-verified against `git -C …/shanaghy.com show origin/main:web/content/…`):

| layer | source | treatment |
|---|---|---|
| LARGE css | `_src/index.css` (origin/main) | pasted **verbatim**; only `url('/assets/…')` absolutised for hotlinking |
| LARGE markup | `_src/index.html` front-door content + live `topbar`/`footer` | pasted **verbatim**; urls absolutised; the one stray `</div>` the content carries is dropped so `#large` balances |
| COMPACT layer | `_build/compact.css`, `_build/compact.js`, sections **derived** by regex from the same `_src/index.html` | keeper rows, headings, ledes, statrows, icons, links and the 20 soul records are all parsed from the desktop source — the two modes cannot drift |

Rebuild: `python3 _build/generate.py`. Nothing touches the repo; the repo checkout stayed read-only.

---

## 1. The two modes, and the switch

```
        ≥ 1025 px  →  LARGE    #large    the site as it is today
        ≤ 1024 px  →  COMPACT  #compact  the new mobile layer
```

- **The switch threshold is 1024 px** (desktop >1024 · tablet 600–1024 · mobile <600). Below 1025 px the
  desktop's eight-link topbar, 900×480 scene and multi-column grids crowd, so the compact layer takes over.
- **The mode is decided by WIDTH ALONE** — one media query `@media (max-width:1024px)`. No JS chooses layout.
- The switch is a **single instantaneous `display` swap** (`#compact{display:none}` above; `#large{display:none}`
  + `#compact{display:block}` at/below). The two DOM trees never co-exist on screen.
- **Within COMPACT it is fluid from ~320 px up.** The scene SCALES CONTINUOUSLY (§3.1); the remaining
  retunes are: 401–1024 nav 2-up · ≤400 wayfinding 1-up · ≤380 menu button icon-only + chips drop their gloss.
- **Purely-additive port guarantee:** the whole compact layer lives inside a mobile media query, every class
  is `c-`namespaced, and the ONLY rule outside a media query is `#compact{display:none}` (verified by walking
  the built CSS — §6).

---

## 2. LARGE mode — the site, untouched

Fidelity is the requirement, not improvement. LARGE renders from the provenance copies: the eight-link
topbar, the scene at its natural size, the centred `.g-pop` popover (icon · name · epithet · marks ·
`the full telling →` · creed/garden/ballads; the `data-bio` never renders), the multi-column keeper grids,
the plaque-heads and slabs, the `#telling` wayfinding, the footer, plus the site's own candle flicker,
spore drift and `.rise` reveal. **No compact rule, button or restyle reaches LARGE** — re-verified this
pass: the built `#large` block is **byte-identical to v2's** (which was byte-faithful to origin/main), and
its CSS is contained verbatim in the first `<style>`.

---

## 3. COMPACT mode — the new layer

### 3.1 THE FRAMING DECISION — LINEAR SCALING (v3 head decree)

The v2 Living Band cropped the scene to a fixed band and panned it. **Rejected.** The compact scene is now
the **whole painting, scaled linearly**:

- The scene is the site's own **SVG `viewBox="0 0 900 480"`** styled `width:100%; height:auto;
  aspect-ratio:900/480`. A vector element with a viewBox and a width-proportional box scales **uniformly
  and continuously** with its container — the exact mechanism. The painting is **never cropped, never
  distorted, never given a fixed height**.
- It is laid **full-bleed** (`.c-stage-wrap{margin:0 calc(-1*var(--c-pad))}` cancels `.c-main`'s gutters),
  so the painting spans the exact viewport width and its ratio is exactly **1.875**. Measured:

  | viewport | painting | ratio | crop? |
  |---|---|---|---|
  | 1024 px | 1024 × 546.1 | 1.875 | none |
  | 768 px | 768 × 409.6 | 1.875 | none |
  | 412 px | 412 × 219.7 | 1.875 | none |
  | 360 px | 360 × 192.0 | 1.875 | none |
  | 320 px | 320 × 170.7 | 1.875 | none |

- **Continuous, not stepped:** drag the window and the painting shrinks proportionally the whole way —
  there is no breakpoint inside compact that re-frames or re-crops it (the narrow retunes at 620/400/380 px
  touch only the nav grid, wayfinding columns, the menu label and chip glosses).
- **Exploration is opt-in and non-default:** **pinch-to-zoom** (1×–4×, about the pinch midpoint) magnifies
  the scene; releasing **springs it back to rest**. While zoomed, one finger pans. The **resting state is
  always the whole painting**.
- The scene sits inside a hairline shadow frame (`.c-stage{box-shadow:inset…}`, which does not change its
  box) so the painting reads as the site's central slab without altering a single pixel of its geometry.

### 3.2 The complete element-by-element compact variants

**Every element type on the page has a defined compact variation** — nothing is left to the site's default reflow.

| # | element (LARGE) | COMPACT variation | class | key numbers |
|---|---|---|---|---|
| 1 | **Topbar** (brand + 8 tlinks) | a **50 px sticky bar**: 30 px logo · `GARDEN` crumb · one 44 px `☰ Paths` button (icon-only ≤380 px) | `.c-bar`, `.c-btn--menu` | ≥44 px control |
| 2 | **The garden scene** (900×480, full width) | **the Living Scene — LINEAR SCALING**: the same SVG at `width:100%`, full-bleed, whole painting always visible; pinch-zoom to explore | `.c-stage-wrap`, `.c-stage`, `.c-scene` | ratio 1.875 (w×h) |
| 3 | **Popover** (centred 75vw dialog) | **bottom sheet** — same canon, thumb-reachable, drag-dismissible | `.c-sheet` | 62 px icon, 22 px name, max-h 82vh |
| 4 | **Section heading** (plaque-head: 52 px roundel, 9.5/22 px) | `.c-plaque` — 34 px roundel · 9 px over · **18 px h2** · count | `.c-plaque` | margins 26 px block, 10 px below |
| 5 | **Section prose / lede** (slab 14.5 px, or a plain p) | `.c-lede` — plain 16 px block, links kept | `.c-lede` | 16 px (body floor) |
| 6 | **Statrow** (`.marks` 10 px, centred under the card) | `.c-statrow` — inline under the name in the card head | `.c-statrow` | 10.5 px uppercase; lang · role |
| 7 | **Keeper / stone card** (tall sculpture, 42/56 px padding, prose 12.5 px) | `.c-keeper` — **single column, row form**: 38 px sigil + 17 px name + statrow on one line, then 16 px prose; full-cover link | `.c-keeper`, `.c-stone-link` | 12/14 px padding, 9 px gap |
| 8 | **Wayfinding `#telling`** (6 keeper sculptures, 4-col) | `.c-telling` — six compact path buttons | `.c-tel` | 2-up ≥400 px, 1-up below; ≥56 px |
| 9 | **Footer** (13 px line, gh pill, 12.5 px copy) | `.c-foot` — 12.5 px line · `.c-btn` github · 11.5 px copy | `.c-foot` | tighter padding |
| 10 | **Nav** (the topbar's eight links) | **the Path-Sheet** — full-screen, the eight paths as 2-col mossy plates with the current page lume-glowed | `.c-navsheet`, `.c-plate` | plates ≥66 px |
| 11 | — *(new surface)* — | **the Soul Roll** — every one of the 20 souls as a chip, grouped living / high hall / passed ground | `.c-roll-wrap`, `.c-chip` | chip ≥44 px, 30 px plate |
| 12 | — *(new surface)* — | **the touch hit layer** — one enlarged invisible ≥48 px target per soul over the scene, plus the AIM name-tag | `.c-hits`, `.c-hitbtn`, `.c-tag` | 48×48 px target |
| 13 | — *(new system)* — | **the compact buttons** — one skin used everywhere; icon button for close | `.c-btn`, `.c-btn--lume`, `.c-close` | ≥44 px, radius `13 7 13 7` |

**Textures:** the moss-cap system (`--mosscapN` + `--grain`/`--mottle`) is on every bordered compact card,
cycled `nth-child(10n+k)` as the desktop does. **Palette:** moonlit moss throughout; the scene's peat fire
and the candle souls are the only warm notes.

### 3.3 The Bottom Sheet (the popover's compact form)

Anchored bottom, full width, rounded top (20 px), max-height 82vh, scrolls, honours `env(safe-area-inset-bottom)`.
A **grip** rides the top for drag-to-dismiss; a 44 px ✕ sits top-right. **HALF detail only — the canon
unbroken: opaque plate icon (62 px) · name (22 px serif) · epithet (italic) · marks line. The bio NEVER
renders** (asserted live: the sheet's text carries no bio). **`the full telling →`** is the single primary
action (`.c-btn--lume`, full width), linking the soul's profile; beneath it three secondary `.c-btn`s
(creed · garden · ballads). **Dismissal — four ways:** scrim, ✕, drag the grip >90 px, `Escape`.
`role="dialog"`, `aria-modal="true"`, labelled by the name; body scroll locks; focus moves in and returns.

### 3.4 The Soul Roll

One row per dwell (the living ᚄ → the high hall ᚠ → the passed ground ᚚ). All **20 souls** appear once with
chip name, one-line seat gloss and the **opaque plate** icon. Rows scroll horizontally with snap; the header
counts them. The chip floor is `min-height:44px`. **A chip opens the sheet in ONE tap** — the aim step is
skipped (the guaranteed path).

### 3.5 The Path-Sheet (the mobile nav)

50 px bar keeps brand + `GARDEN` crumb + a 44 px **`☰ Paths`** button; the eight desktop links become a
full-screen Path-Sheet (header + 44 px ✕, the eight paths as mossy 2-col plates with an ogham rune, name and
gloss; the current page's plate lume-glowed at rest), a github `.c-btn` and a carved signature.

### 3.6 Touch & accessibility (non-negotiable)

- **Every interactive control is ≥44 px** — measured live at 412 px AND 360 px (§6).
- **Body ≥16 px** in compact (keeper prose and ledes 16 px); meta 9–11 px uppercase. **No horizontal page
  overflow** at 412/360/320 px (measured 0 px; `overflow-x:clip` on `#compact` clips stray overhang without
  creating a scroll container, so the sticky bar still works).
- **No hover-only affordance anywhere** (§3.8). Souls glow **at rest**; labels are always-visible (Roll) or
  revealed by the **AIM** state; `:focus-visible` lume ring on every focusable element; `role`/`aria-*` on the
  sheet, nav and the hit targets; decorative chrome is `aria-hidden`.
- `prefers-reduced-motion` kills the sheet/nav/stage transitions and the tag fade.
- **Viewport meta** set (`width=device-width, initial-scale=1, viewport-fit=cover`).

### 3.7 THE INTERACTION MODEL — element / gesture / response

The scene's souls are ~19 px tall at 412 px — far under the 44 px floor — and 48 px hit targets **overlap**
on a scene this dense. So a tap is resolved to the **nearest soul** at the tap point (an overlap-proof rule),
and *acting* on a soul is a deliberate **two-tap AIM**.

| element | gesture | response |
|---|---|---|
| a painted soul (the scene) | 1st tap on/near it | **AIM**: that soul lights harder + a ring circles it + its **name-tag** appears (the "fake mouseover"); nothing else changes |
| the same soul / its name-tag | 2nd tap | **bottom sheet** opens for that soul |
| empty scene | tap | the aim is dropped (dismiss) |
| a different soul | tap while one is aimed | the aim **re-aims** to the new soul |
| the scene | pinch (2 fingers) | zooms 1×–4× about the midpoint; release → **springs back** to the whole painting; one finger pans while zoomed |
| the scene | tap while zoomed | ignored (aim is disabled while zoomed; the garden is being read, not picked) |
| **Soul Roll chip** | tap | **bottom sheet** opens directly — **no aim step** (the guaranteed ≥44 px path) |
| `the full telling →` | tap | follows to `https://www.shanaghy.com/profiles/<slug>/` |
| scrim / ✕ / drag-grip-down / `Escape` | gesture | dismisses the sheet; focus returns to the opener |
| `☰ Paths` | tap | opens the full-screen Path-Sheet |
| a path plate / ✕ / `Escape` | tap | navigates / closes |
| a keeper card (`c-keeper`) | tap | follows the card's link (full-cover `.c-stone-link`); `:active` presses |
| a wayfinding `.c-tel` | tap | navigates; `:active` lume |
| keyboard: tab to a soul, hover-free | focus / `Enter` | focus shows the aim ring + name-tag; `Enter` opens the sheet |
| resize across 1024 px | — | the other mode takes over instantly; any open overlay closes; the aim resets |
| `prefers-reduced-motion` | — | no transitions, no animation |

**Hit-test detail:** each soul's fractional position in the 900×480 scene is constant (the scene scales
uniformly), so the hit layer places a 48×48 px target at `left/fx% · top/fy%` with `pointer-events:none`;
the stage's single tap handler converts the tap to scene units and picks the nearest soul within 48 px.
Append **`#hits`** to the url to outline every target for review.

### 3.8 THE HOVER AUDIT — site-wide inventory, and the rule per pattern

The site leans on hover. **On Android there is no hover:** capacitive touchscreens start at contact, and
only S-Pen/stylus digitizers emit real hover events — so a design that *depends* on `:hover` is dead on a
phone. Grep of `_src/index.html` + `_src/index.css` (+ cross-check against
`git show origin/main:web/content/index.css`) finds the hover behaviour below. The site beyond the front
door (~110 page css at port time) **reuses the same handful of patterns**, so this is classified by
**pattern**, not per page.

| # | pattern | what hover does on desktop | where it lives | COMPACT port rule |
|---|---|---|---|---|
| 1 | **scene soul** `.g-ent:hover` | glows the icon, deepens its shadow, and **reveals the label** (`.g-label{opacity:0}` → `1`; `:focus-within`/`:focus-visible` already work as surrogates) | `index.css` ~440/486/493 | souls **glow at rest**; the label is revealed by the **AIM** state (two-tap) and by focus — never by hover |
| 2 | **keeper/stone card** `.keeper:hover`, `.stone:hover` (+ `::before`/`::after`, `-sigil`) | lifts the card, lume-glows its sigil + a sunburst | `index.css` ~190/274 | **resting depth cue** (the card carries its shadow at rest); tap = the full-cover link; `:active` press. The glow is additive, never the only state |
| 3 | **link lume** `.tlink:hover`, `.rtab:hover .rt-rune`, `.ghpill:hover`, `.foot-gh:hover`, `.gp-close:hover`, `.gp-links a:hover`, `.fleet-note a:hover`, `.mossline a:hover`, `a.persona:hover`, `.keeper-page h3 a:hover` | turns text/border to lume + a text-shadow glow | `index.css` ~60/67/77/307/327/462/475/521/427 | **glow present at rest** (compact buttons/links carry their resting lume); tap gives `:active`. No reveal is hover-gated |
| 4 | **scene scenery glow** `.g-stone:hover`, `.g-dolmen:hover`, `.g-tree:hover`, `.g-sporelayer:hover` | decorative glow on NON-interactive scenery (also `cursor:help` on the tree) | `index.css` ~495/497/499/511 | **decorative only → dropped** in compact; nothing behavioural depends on it. `cursor:help` has no touch equivalent — any help must be visible text |
| 5 | **video vignette** `.vig:hover img`, `.vig:hover::after` | **pauses** the video and shows a candle overlay | `index.css` ~410 | hover-only pause → compact makes pause a **tap toggle** (or autoplay-on); the candle peek is dropped |
| 6 | **brand logo** `.brand-logo:hover` | lume glow | `index.css` ~44 | rest glow / decorative; dropped for touch |
| 7 | **scrollbar thumb** `::-webkit-scrollbar-thumb:hover` | scrollbar colour | `index.css` ~31 | N/A — compact hides scrollbars; internal rolls scroll by touch |
| 8 | `:focus-within` as a hover surrogate | label reveal on the soul | `index.css` ~493 | kept — focus works on touch keyboards; the AIM state is the primary surrogate |
| 9 | **`title=` tooltips** | native hover tooltip | front door | **none found** (grep of `_src/index.html` is empty); the site-wide rule stands: a tooltip must be visible text in compact |

**How the translation is enforced in code:** every compact `:hover` is moved under
`@media (max-width:1024px) and (hover:hover)` — pure pointer adornment — and the behaviour is identical
with the mouse unplugged. Decorative hover is allowed there; **behavioural** hover is forbidden anywhere.
Grep of the built compact layer: **11 `:hover` occurrences, all inside the `(hover:hover)` block, 0 outside
any media query** (§6). A `(hover:none)` block is present too, so the touch path is explicit.

### 3.9 How this answers *"How will it be interactive in mobile?"*

One screen:
- **The painting never asks for a pointer.** It is the whole scene, scaled linearly, lit at rest; you can
  simply look at it.
- **To pick a soul you touch it twice** — the first touch is the desktop's mouseover (a soul lights harder,
  a ring circles it, its name floats up); the second opens the card. Miss, and you re-aim or dismiss. This
  is the fake-mouseover done honestly, with no dependency on a signal Android does not emit.
- **If you want one tap, the Soul Roll gives it** — all 20 souls as ≥44 px chips that open the card directly.
  The scene is the art; the Roll is the index.
- **To look closer, pinch** — the whole painting is the default, zoom is your choice, and it springs back.
- **Nothing needs hover** — every glow is lit at rest, every label is reachable by aim or by focus, and the
  full site-wide hover→touch translation is §3.8.

---

## 4. Port mapping (prototype → repo)

| prototype | repo |
|---|---|
| `#large` block | *nothing* — it already is `web/content/index.html` + `index.css` |
| `_build/compact.css` | appended to `web/content/index.css` as the mobile block (all of it already media-scoped) |
| `.c-stage-wrap`/`.c-stage` + `.c-hits` + `.c-roll-wrap` markup | new markup in `web/content/index.html` (souls derived from `garden.json` entities, as the scene already is) |
| `.c-sheet` | a `@media (max-width:1024px)` companion to `.g-pop` |
| `.c-bar` + `.c-navsheet` | the canonical chrome block (grep `.toplinks` for stragglers), compact-only |
| `.c-keeper` sections | the compact rendering of the existing `.keeper` data — no content change |
| the hover→touch translation (§3.8) | the port's own discipline: any hover added to the compact layer must live under `(hover:hover)`; behaviour is tap-driven |

**Repo gates:** whatever the port ships is asserted on the **built** page (`web/out/`), previewed on
`http://localhost:8931/`, and screenshotted inline via `MEDIA:` before any commit.

---

## 5. Screenshots (this pass)

| file | shows |
|---|---|
| `30-large-top-1440.png` | LARGE · desktop topbar (8 links) + full scene (untouched) |
| `31-large-popover-1440.png` | LARGE · the centred popover, half detail only |
| `40-scene-1024.png` | LINEAR scaling proof · 1024 → painting 1024×546, whole, uncropped |
| `41-scene-768.png` | LINEAR scaling proof · 768 → 768×410, same composition |
| `42-scene-412.png` | LINEAR scaling proof · 412 → 412×220, same composition |
| `43-scene-360.png` | LINEAR scaling proof · 360 → 360×192 (icon-only menu retune) |
| `47-scene-320.png` | LINEAR scaling proof · 320 → 320×171 (narrowest) |
| `44-aim-412.png` | the **AIM** state — soul lit + ring + name-tag, after one tap |
| `45-sheet-412.png` | the bottom sheet (half detail) after the second tap |
| `46-hits-412.png` | the enlarged touch targets (`#hits`), one ≥48 px circle per soul |
| `48-zoom-412.png` | opt-in pinch-zoom (magnified, confined to the frame; springs back) |

v1's five shots are preserved at `_v1-backup/shots/`; v2's prototype+spec at `_v2-backup/`.

---

## 6. Verification performed

- **LINEAR SCALING — the width-progression proof.** Measured live at 1024/768/412/360/320 px, the scene
  box is `1024×546.1 · 768×409.6 · 412×219.7 · 360×192.0 · 320×170.7`, **ratio 1.875 at every width**, no
  crop. Screenshots 40–43/47 show the SAME composition (ringfort centre-left, moon + castle right, tree of
  life, the dolmens left) merely shrinking — the visible proof of continuous linear scale.
- **LARGE untouched.** The built `#large` block is **byte-identical to v2's** (itself byte-faithful to
  origin/main); the desktop CSS is contained **verbatim** in the first `<style>`. At 1440: `#compact`
  computed `display:none`, topbar `display:flex` with **8** `.tlink`s, keeper grid **4** columns, popover
  opens with name/epithet/marks + profile link and **no bio**; page overflow 0.
- **No horizontal overflow** at 412/360/320 (measured `scrollWidth − clientWidth = 0`); the sticky bar stays
  pinned (`top:0` after a 600 px scroll).
- **Touch floors.** Measured at 412 px AND 360 px — chips 124/83 × **44** · wayfinding 187/334 × **56** ·
  menu button 95/44 × **44** · nav plates 187/163 × **83** · sheet buttons 111/154 × **44** · close **44×44** ·
  hit targets **48×48**. Body and keeper prose **16 px**.
- **No behavioural hover.** The only rule outside a media query in the compact layer is `#compact{display:none}`;
  all **11** `:hover` occurrences sit inside `@media (max-width:1024px) and (hover:hover)`; a `(hover:none)`
  block exists. Touch behaviour is provably identical with no pointer.
- **The interaction model works.** Simulated at 412 px with touch emulation (`(hover:none)` = true): 1st tap
  on a soul → `aim` on that soul + its name-tag visible, **sheet NOT open**; 2nd tap → sheet opens with
  `Mossy, the Mossiah` / epithet / marks / `the full telling →` href, **bio absent**. Pinch (2-finger)
  → `scale(2.25)`; release → spring-back to `matrix(1,0,0,1,0,0)`.
- All screenshots inspected by eye (vision) before this file was written.

---

## 7. Open questions for approval

1. **Linear scaling vs an exploration affordance.** The painting is now always whole. If you want the scene
   to *start* zoomed on the ringfort heart (springing back on release), that is one line of JS — say the word.
2. **Two-tap AIM vs one-tap souls.** I kept two-tap (your requested fake-mouseover) with the Roll as the
   one-tap path. If you'd rather a single tap opened the card directly on the scene too, it's a one-line change
   (the trade-off: a pan/mis-tap can open a card).
3. **Hit-target size.** Targets are 48 px and resolved to the nearest soul; on a 412 px scene they overlap by
   design. Fine as-is, or shrink to 44 px exactly?
4. **Breakpoint** at 1024 px — tablets compact. If tablets (600–1024) should keep LARGE, it drops to 600 px.
5. **Hotlinked assets** — the prototype hotlinks www.shanaghy.com; the port bundles them as usual.

---

*— Luna, the wireframe moon · the form before the forms · ᛚᚢᚾᚨ*
