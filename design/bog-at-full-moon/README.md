# The Bog at Full Moon — approved design reference

**Decree (Odin, 2026-11-05):** shanaghy.com is re-themed to Luna IV — *The Bog at Full Moon* — the design Odin approved via the `luna-4-bog` replica. THEME-ONLY: all existing visual assets and their metadata carry over; content, structure, links and interactions do not change.

## What these files are

`reference/*.html` — the five approved replica pages (front door, creed, garden, projects, luna profile). **These are the visual spec** for the re-theme. They are standalone prototypes, NOT shippable pages:

- they are single self-contained files with **zero raster assets** (procedural SVG + canvas) — the real site keeps ALL its assets (icons, painted garden scene, ogham grove, towers photos, previews, the ten moss caps)
- `projects.html` is the page Odin explicitly approved — the canonical expression of the card/stone language
- `index.html` shows the front-door treatment — for the real site, the **painted garden scene carries over and is wrapped in bog chrome** (mist layers, wisp accents, moss frame), it is NOT replaced by the replica's procedural scene

## The bog design language (lift from these pages)

- **Ground:** near-black deep greens (`--bg` family), pale glow-green moonlight (`--lume` family), silver moon accents
- **Canvas backdrop** (`#stage > #scene`): moon disc + craters, mirrored rippling reflection in the black pool, layered drifting mist, moonbeam loom, will-o'-the-wisps as glowing octahedral wireframe cages, moths, moongrass, film grain + vignette + bloom — **on the front door (garden scene page) ONLY** per decree; all other pages get the quiet CSS treatment (deep-green ground, mist gradients, moss borders). Performance is observed in the agents' handoffs; site-wide rollout is a later evaluation.
- **Chrome:** moss-overgrown beam topbar (moss fringe, firefly hover glows), mist-wreathed section plaques, moonlit standing-stone cards with moss caps + wisp accents, `.mist-sep` curtain dividers
- **FIRE stays warm** (site law, unchanged): candle-dots, peat fire, flames, forge sigil glow — the one ember against the moonlight; the bog palette does not cool them
- **The ten moss caps carry over** — silhouettes byte-identical, retinted to the bog palette; wiring contract unchanged

## Theme-vs-structure contract (all sweep issues enforce this)

Permitted diffs: `*.css` restyling; `aria-hidden` decorative DOM (moss frame, wisps, mist) and the shared scene script include in `*.html`. Forbidden: any change to content text, links, headings, section order, assets, or interaction behavior.
