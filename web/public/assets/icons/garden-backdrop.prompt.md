# garden-backdrop.png — the generation prompt

The painted world behind the living garden on the front page
(`web/content/garden.json` → `scripts/gen_garden.py` → the garden-scene SVG).
Generated with the claude-pack `imagen` skill (Gemini), 16:9, 1376×768,
landed 2026-11-03 — the third regrowth: the ringfort-workshop expanded into
the grand centerpiece, its stones drawn in around it as part of its grounds,
the gravestones left far in the mist.

## The exact prompt

> Expansive ancient stone ringfort-workshop as the GRAND CENTERPIECE
> dominating the center of a mystical nocturnal Irish landscape, fantasy
> concept art digital painting, wide 16:9. The massive circular fortified
> forge complex sprawls wide and huge: towering drystone ramparts with
> crenellated rampart walks, heavy timber gate, great smoking chimney, warm
> orange forge-light glowing from windows and the open smithy, anvils and
> tools glimpsed within, figures working. Scattered around the fort's
> grounds, modest and spread out — clearly part of the fortress: smaller
> moss-grown standing stones and flat plinths, some near the walls, a few in
> the near grass, each bare and unoccupied. Right of the fort: an ancient
> gnarled oak tree of life with a small peat fire, one hooded seated figure
> BESIDE the flame (not on it), a ruined chapel with tall Irish round tower
> behind. Far right: a dark stone castle on a rocky rise under a huge
> luminous full moon in a starry night sky, a black bog pool with reeds at
> its foot. Rolling green summer hills stretch behind the fort. Deep far
> background: faint weathered gravestones and dolmens half-lost in blue mist,
> distant and veiled. Palette: deep forest greens, slate greys, midnight
> blues, warm forge-orange accents, silver moonlight; chiaroscuro cinematic
> lighting, painterly textured brushwork, high-end fantasy book-cover
> illustration. No text.

## Regrowing it

Same generator, same aspect (`--size 16:9`), overwrite this png — then
re-map every soul's overlay coordinates in `garden.json` against the new
painting (the living ride the foreground stones, the passed ground fades
into the background mist), run `python3 scripts/gen_garden.py`, and rebuild
(`cd web && npm ci && npm run build`).