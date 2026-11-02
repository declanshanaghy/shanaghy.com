#!/usr/bin/env python3
# Build the Garden Ledger: weave relations.json films into projects/ and videos/ pages.
import json, html, re, sys

ROOT = "/Users/declanshanaghy/src/github.com/declanshanaghy/shanaghy.com"

cat = json.load(open(f"{ROOT}/data/catalog.json"))
rel = json.load(open(f"{ROOT}/data/relations.json"))

repos = {r["name"]: r for r in cat["sources"]["github"]["repos"]}
videos = {v["id"]: v for v in cat["sources"]["youtube"]["videos"]}

ties_direct = {}   # repo -> [video ids]
ties_parallel = {}
seen = set()
for t in rel["ties"]:
    seen.add(t["video"])
    d = ties_direct if t["kind"] == "direct" else ties_parallel
    d.setdefault(t["repo"], []).append(t["video"])
family = rel["family_album"]
for v in family:
    assert v not in seen, f"family video also in ties: {v}"
    seen.add(v)
assert len(seen) == len(videos) == 181, (len(seen), len(videos))

def dur(s):
    m, sec = divmod(int(s), 60)
    return f"{m}:{sec:02d}"

E = lambda s: html.escape(s, quote=False)

# ───────────────────────── 49 stories ─────────────────────────
S = {
"honcho-ui": "A web UI for wandering the memory of Honcho — sessions, metadata, documents, insights pulled up from where they sank. The old stories say the hazel nuts of Segais drop only for those who wait at the well; this one fishes them out in the dark, and moss keeps the caches soft. Huginn flies out, but it is Muninn's pane that remembers.",
"claude-todo": "A Claude Code mod: a per-session todo backlog that execs its titles into subagents, watched from a command-and-control pane. Like Bricriu's feast, every hero is seated at his own contest — and around this stone the party-command reels screen nightly, companions ordered across the field as the backlog orders its own.",
"hermes-todo": "A per-repo todo backlog for Hermes agents — a worker per todo in its own git worktree, with guarded state transitions, prompt drafting, call tracing, and a TUI pane. The Valkyries chose their marked from orbit; these workers drop one per task, split the ground, and are not always gentle about it. The orbit-drops screen beside this stone.",
"re-goatmower": "Gently untangling the goat. The pooka rode a tangled beast through the garden at dusk and left the knots for the morning; this repo is the patient comb, working the burrs out one commit at a time.",
"ollama-models": "Custom model definitions for Open WebUI — vessels for shapes of thought. The Dagda's cauldron never sent a guest away unsatisfied; neither does this shelf, though every ladle comes out slightly different each time the moss is brushed aside.",
"ai-prompts": "A collection of prompts — incantations in the making. The old scribes cut their strongest words in ogham along the edge of a stone so the wind could read them; these are cut along the edge of a prompt file. The spellbook reels screen beside this stone.",
"vulcan-brownout": "A Home Assistant integration that watches low-battery devices through the house. Goibniu's forge never went cold, and neither should the sentries on the wall; this one tracks the embers as they fade and calls it the news. Mortar-line reels screen alongside.",
"heimdall-battery-sentinel": "A battery power monitor for Home Assistant. Heimdall hears the grass grow and needs less sleep than a bird; this sentinel hears the cells drain. The round towers kept their watch the same way — one bell, long before the shore was seen.",
"heimdall_battery_sentinel": "The older rune of the battery watch — the first shape of the sentinel before it was renamed. Lia Fáil cried out under a rightful king, and this stone still cries out under every dying battery, in a voice the house has learned to trust.",
"thor": "An electricity monitor. Taranis hurled the thunder and counted every strike; this meter counts the quieter kind — the current passing the wall of an Athlone kitchen, storm or no storm. The meters that watch the storm screen beside it.",
"bbqberry": "A Raspberry Pi tending the BBQ. The Bealtaine fires were lit to bless the herds and cook the year's first meat; this one keeps its own small fire and reports on it like a farmer at the gate. The fireside reels screen on the stone itself.",
"fitbitexp": "Fitbit data, kept. Oisín went hunting for the three hundred years of Tír na nÓg and found every step had been counted against him; this repo does the counting for you, moss creeping over the charts.",
"electroplater": "Servo speed control for a WEMOS D1 mini (ESP8266), driven by a potentiometer. Lugh's spear never missed its mark, and neither does a well-trimmed pot; the reels of the steady hand at the stick screen alongside this stone.",
"chromext-amazon-order-filter": "A Chrome extension that filters Amazon order history by status — pending, returned, cancelled, completed — with a background-cached, client-side pager. The bog keeps everything that falls into it, but a good spade-wielder knows which stratum to lift; this one sifts the peat by status.",
"gcal-always-monday": "A browser tweak that persuades Google Calendar every day is Monday. Manannán's mist folds the mornings over on each other so the traveler never knows which dawn he is walking into; here the week is folded politely flat.",
"session-logs": "Session logs and artifacts. The monastic scribes copied their vellum not because the words would change but so they would not; this shelf holds the same stubbornness, ink drying under a small candle.",
"dek-calculators1": "Assorted JavaScript calculators. The druids counted by rods and kept their arithmetic to themselves; these at least show their working, figures worn soft with moss.",
"vercel-experiment": "An early Vercel deployment experiment. The first coracle crossing left the monks guessing which shore would answer; this one found out in a single push, and the answer was: it renders.",
"docker-py-001": "First steps with Docker and Python. The first flagstone of Newgrange was laid without knowing the roof would still hold five thousand winters on; this container holds, for now.",
"python-fundamentals": "Python fundamentals — notes and exercises. Fionn cooked the Salmon of Knowledge and burned his thumb on it; every exercise here is a small scald taken on purpose, wisdom one bite at a time.",
"rizz-power-up": "A TypeScript playfulness experiment. Aengus dreamt of a swan-girl and searched Ireland a year for the shape of the dream; this repo chased a smaller charm and caught it in fewer commits.",
"dollar-game": "A TypeScript game of grinding out dollars, coin by coin. The Táin was fought over counted cattle; every tabletop keeps its own herds to tally. Reels of the turn-based tabletop screen alongside.",
"emerald-diggin-donal": "A faithful CGA web clone of Digger (1983) — Donal digs the most emeralds ever. The sídhe hoards are buried under green mounds for a reason, and this one buries them deeper.",
"diamond-diggin-donal": "A faithful web port of Digger (1983), GPL v2 — and the garden arcade besides: every untamed world in the yard drains at last to the digger's field. All the wild roads of Cruachan run down into one cave; so do the reels.",
"gwent": "An electronic Gwent board. The gods whiled the ages at fidchell, and the stakes were never small; this board hosts stranger contests still. The AI matches screen on the stone itself.",
"DexOneRing": "A parameterized Blender-scripted, 3D-printable celtic ring — carved knotwork, runic inscription, gold inlay channel. Draupnir dripped eight rings of itself every ninth night; this one needs a printer and a plate of resin, but the echo is the same. The Norse-ring reels screen beside it.",
"PeytonsBirthdayCladdaghRing": "A photo log of making a Claddagh ring for Peyton's birthday — resin print to gold-plated finish. Midir wooed Étaín with tokens of the sídhe and the patience of fifty years; this forge took a weekend. Films of the medieval forge screen alongside.",
"Accessories": "Various 3D and 2D models for accessories. Gobán Saor wandered the land building wonders for whoever asked well; this workbench keeps his habit, printing what the garden needs. The faire-machine reels screen on the stone itself.",
"ArduinoLibraries": "Arduino libraries for the chips used across the projects. Ogma cut ogham because ink was never deep enough; libraries are the same kind of scar — etched once, read by everything after. An LED scar screens on the stone itself.",
"Morpheus": "A collection of hardware and software units for hobby robots. The Morrígan took three shapes in one morning and called each of them useful; this framework settles for the one that carries parts.",
"JabberBot": "A Bluetooth remote-controlled robot. Cú Chulainn took the hound's place at Culann's gate and kept it a lifetime; this rover only has to keep the carpet. The robot-hound reels screen alongside.",
"VinoTemp": "A controller board for the VinoTemp wine fridge. The sídhe keep their good drink cool under the hills where the sun's arithmetic does not reach; this board does the same for an Athlone kitchen.",
"ByrneLite": "A three-port solid state relay board, the S108T02 at its heart. The old raths kept three-way gatestones — one path for each knock the visitor knew; Byrne by name, raven by temperament, this switch answers three doors at once.",
"BBRegulator": "An LM78XX-based breadboard voltage regulator. The Cailleach holds winter's storms in one hand and lets none of them loose unmeasured; the regulator keeps a steadier grip on the current.",
"Valentines2K11": "Arduino RGB LEDs with an IR proximity sensor and a tilt switch — a valentine that knows when you are near. Diarmuid and Gráinne fled with their torches held low and their hearts lit; this one blinks.",
"AlcoTop": "An Xmas pub crawl drinking cap. The Wild Hunt rides at midwinter and stops at every door that owes it cheer; the cap lights the way of the modern rider.",
"NiceDice": "Electronic dice from Make: Electronics Experiment #23. Bones have been thrown at Samhain since before the churchyard had a fence; these pips land as squarely as any.",
"KeypadBackpack": "A keypad backpack. Every dolmen knows its own passcode — approached from the right quarter, the stones speak; this one gives the code out politely.",
"StormBox": "A storm in a box — an early build. The Fomorians corked worse weather in worse caskets; this one sits quietly on the shelf and rattles only when the LEDs ask.",
"StormBox2": "StormBox redux. Mag Tuired was fought twice before the sides got it right; the second storm is brewed longer and bursts cleaner.",
"GenieSteroids": "A hardware experiment with borrowed courage. The leprechaun's toolkit never lends a dull blade; whatever the Genie wished for, the soldering got the sharper end of it.",
"Max756Breakout": "A MAX756 SMPS DC-DC step-up breakout board. Brigid's bellows raise a low fire to a working heat without wasting a coal; the converter lifts the voltage with the same thrift.",
"BeerLux": "Brewing electronics. Goibniu brewed the ale that spared the gods from decay and the drinker from the morning after; this rig aims only at the first half.",
"VolcanoHat": "A wearable hardware experiment. The cinders of Slieve Gullion were worn as a crown by whoever dared the summit; this one glows without the climb.",
"CocoBra": "An Arduino experiment, woven. At Imbolc the rushes are plaited into wards against the dark; wire and cloth weave just as tightly here.",
"smiler": "The internet-controllable smiley sign. At Lughnasadh the lanterns of the harvest grin down the whole hill; this grin is carried by wire instead, and greets whoever knocks.",
"dek-eagle-lbr": "Custom Eagle symbols, devices, packages, and scripts. An eagle has watched from the crown of Yggdrasil since the first winter, marking what is built below; these libraries are the marks.",
"life-ledger": "A personal life management ledger. The seanchaí recited the births, debts, and harvests of a house generation to generation, needing no page; this ledger keeps a few, mossed and quiet.",
"zeroforge": "The first spore — carried up from the depths of Athlone. The Tuatha Dé burned their ships on landing so nothing would be simple to return to; the forge's patient zero cools the same way.",
}
assert len(S) == 49

GROVES = [
 ("grove-ai","ᚨ","#sigil-raven","Grove I · The Raven's Perch","AI &amp; Agents","Agent tooling, memory UIs, and model tending.","ᚨ",
  ["honcho-ui","claude-todo","hermes-todo","re-goatmower","ollama-models","ai-prompts"]),
 ("grove-home","ᛖ","#sigil-horn","Grove II · The Listening Horn","Home Lab &amp; Automation","The house that watches itself.","ᛖ",
  ["vulcan-brownout","heimdall-battery-sentinel","heimdall_battery_sentinel","thor","bbqberry","fitbitexp","electroplater"]),
 ("grove-web","ᛜ","#sigil-web","Grove III · The Weaver's Knot","Web &amp; Extensions","Browser tweaks and quiet experiments.","ᛜ",
  ["chromext-amazon-order-filter","gcal-always-monday","session-logs","dek-calculators1","vercel-experiment","docker-py-001","python-fundamentals","rizz-power-up","dollar-game"]),
 ("grove-games","ᛏ","#sigil-die","Grove IV · The Parlor Dice","Games &amp; Play","Donal digs diamonds. And emeralds.","ᛏ",
  ["emerald-diggin-donal","diamond-diggin-donal","gwent"]),
 ("grove-print","ᚷ","#sigil-ring","Grove V · The Ring-Giver's Gift","3D Print &amp; Craft","From Blender scripts to gold-plated Claddaghs.","ᚷ",
  ["DexOneRing","PeytonsBirthdayCladdaghRing","Accessories"]),
 ("grove-hardware","ᚦ","#sigil-hammer","Grove VI · The Elder Stones","The Early Years — Hardware","Arduino boards, Eagle schematics, robots. The spores that started it all (2011–2019).","ᚦ",
  ["ArduinoLibraries","Morpheus","JabberBot","VinoTemp","ByrneLite","BBRegulator","Valentines2K11","AlcoTop","NiceDice","KeypadBackpack","StormBox","StormBox2","GenieSteroids","Max756Breakout","BeerLux","VolcanoHat","CocoBra","smiler","dek-eagle-lbr"]),
 ("grove-misc","ᛚ","#sigil-cauldron","Grove VII · The Keeper's Cauldron","Ledgers &amp; Curiosities","Ledgers and relics that answer to no grove — they keep their own quiet corner.","ᛚ",
  ["life-ledger","zeroforge"]),
]

META = {  # repo -> (lang, year, elder)
"honcho-ui":("JavaScript","2026",False),"claude-todo":("TypeScript","2026",False),
"hermes-todo":("Python","2026",False),"re-goatmower":("Python","2026",False),
"ollama-models":("Python","2026",False),"ai-prompts":("—","2026",False),
"vulcan-brownout":("Python","2026",False),"heimdall-battery-sentinel":("Python","2026",False),
"heimdall_battery_sentinel":("Python","2026",False),"thor":("Python","2021",True),
"bbqberry":("Go","2020",True),"fitbitexp":("Python","2017",True),"electroplater":("HTML","2026",False),
"chromext-amazon-order-filter":("JavaScript","2026",False),"gcal-always-monday":("JavaScript","2026",False),
"session-logs":("HTML","2026",False),"dek-calculators1":("JavaScript","2019",True),
"vercel-experiment":("JavaScript","2022",True),"docker-py-001":("JavaScript","2024",True),
"python-fundamentals":("TypeScript","2026",False),"rizz-power-up":("TypeScript","2025",True),
"dollar-game":("TypeScript","2025",True),
"emerald-diggin-donal":("C","2026",False),"diamond-diggin-donal":("TypeScript","2026",False),
"gwent":("Python","2026",False),
"DexOneRing":("Python","2026",False),"PeytonsBirthdayCladdaghRing":("CSS","2026",False),
"Accessories":("OpenSCAD","2016",True),
"ArduinoLibraries":("C++","2012",True),"Morpheus":("Java","2012",True),"JabberBot":("Java","2011",True),
"VinoTemp":("Eagle","2015",True),"ByrneLite":("Arduino","2013",True),"BBRegulator":("—","2011",True),
"Valentines2K11":("Java","2011",True),"AlcoTop":("Arduino","2013",True),"NiceDice":("—","2011",True),
"KeypadBackpack":("C++","2012",True),"StormBox":("Java","2011",True),"StormBox2":("Java","2012",True),
"GenieSteroids":("C++","2012",True),"Max756Breakout":("Prolog","2013",True),"BeerLux":("C++","2018",True),
"VolcanoHat":("C++","2018",True),"CocoBra":("Arduino","2013",True),"smiler":("Go","2016",True),
"dek-eagle-lbr":("—","2011",True),
"life-ledger":("—","2026",False),"zeroforge":("—","2026",False),
}

PROJ_CSS = """
/* ============ THE GARDEN LEDGER — stories & film rows ============ */
.stone h3 a{color:inherit;text-decoration:none}
.stone-story{font-size:12.5px;line-height:1.62;color:#a08d68;letter-spacing:.2px}
.stone-story em{color:#b39a6e;font-style:italic}
.onfilm{
  margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;
}
.onfilm-label{font-size:8.5px;letter-spacing:1.9px;text-transform:uppercase;color:#8a795a}
.onfilm a{display:block;border-radius:7px 3px 7px 3px;overflow:hidden;border:1px solid #2c2113;
  box-shadow:inset 0 1px 0 rgba(255,210,140,.08), 0 4px 9px -5px rgba(0,0,0,.8);transition:border-color .28s}
.onfilm a:hover{border-color:rgba(232,163,61,.6)}
.onfilm img{display:block;width:80px;height:45px;object-fit:cover;filter:brightness(.82) saturate(.92);transition:filter .3s}
.onfilm a:hover img{filter:brightness(1.04) saturate(1.05)}
.playsline{
  margin-top:12px;font-family:var(--mono);font-size:9.5px;letter-spacing:1.6px;text-transform:uppercase;
}
.playsline a{color:#b08b4f;text-decoration:none;border-bottom:1px dotted rgba(138,106,59,.55);transition:color .25s,text-shadow .25s}
.playsline a:hover,.playsline a:focus{color:var(--amber2);text-shadow:0 0 9px rgba(232,163,61,.5)}
"""

def stone_card(name):
    repo = repos[name]
    lang, year, elder = META[name]
    cls = "stone elder" if elder else "stone"
    if name == "gwent":
        cls = "stone stone--prized"
    honor = '\n        <span class="honor">Prized</span>' if name == "gwent" else ""
    sig = {"grove-ai":"#sigil-raven"}.get(name,"")  # placeholder, unused
    story = S[name]
    out = [f'      <article class="{cls}" data-repo="{name}">' + honor]
    out.append(f'        <svg class="stone-sigil" aria-hidden="true"><use href="{GROVE_SIGIL[name]}"/></svg>')
    out.append(f'        <h3><a href="{repo["html_url"]}" target="_blank" rel="noopener">{name}</a></h3>')
    out.append(f'        <p class="stone-story">{E(story)}</p>')
    if name in ties_direct:
        out.append('        <div class="onfilm"><span class="onfilm-label">on film</span>')
        for vid in ties_direct[name]:
            t = videos[vid]["title"]
            out.append(f'          <a href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener" title="{E(t)}"><img src="https://i.ytimg.com/vi/{vid}/default.jpg" alt="{E(t)}" width="80" height="45" loading="lazy"></a>')
        out.append('        </div>')
    if name in ties_parallel:
        n = len(ties_parallel[name])
        word = "reel" if n == 1 else "reels"
        out.append(f'        <p class="playsline">plays alongside: <a href="../videos/">{n} {word}</a></p>')
    out.append(f'        <div class="marks"><span class="m-lang">{lang}</span><span class="m-sep">᛫</span><span class="m-year">{year}</span></div>')
    out.append("      </article>")
    return "\n".join(out)

GROVE_SIGIL = {}
for gid, rune, sigil, over, title, lede, pr, names in GROVES:
    for n in names:
        GROVE_SIGIL[n] = sigil

def build_projects():
    src = open(f"{ROOT}/projects/index.html").read()
    head = src[:src.index('<main class="garden">')]
    tail = src[src.index('<!-- ═══════════ FOOTER'):]
    if "THE GARDEN LEDGER" not in head:
        head = head.replace("</style>", PROJ_CSS + "</style>", 1)
    parts = [head, '<main class="garden">\n']
    for gi, (gid, rune, sigil, over, title, lede, pr, names) in enumerate(GROVES):
        roman = ["I","II","III","IV","V","VI","VII"][gi]
        parts.append(f'''
  <!-- ═══════════ GROVE {roman} — {title} ═══════════ -->
  <section class="grove" id="{gid}">
    <header class="grove-head">
      <span class="lh-rune" aria-hidden="true">{rune}</span>
      <div class="lh-roundel"><svg aria-hidden="true"><use href="{sigil}"/></svg></div>
      <div class="lh-text">
        <p class="lh-over">{over}</p>
        <h2>{title}</h2>
        <p class="lh-lede">{lede}</p>
      </div>
      <div class="lh-plaque"><span class="pl-rune">{pr}</span><span class="pl-count">{len(names)} stones</span></div>
    </header>
    <div class="grid">
''')
        for n in names:
            parts.append(stone_card(n) + "\n")
        parts.append("    </div>\n  </section>\n")
        if gi < len(GROVES) - 1:
            parts.append('\n  <div class="line-sep" aria-hidden="true"><svg viewBox="0 0 220 24"><use href="#knot-div"/></svg></div>\n')
    # keepers unchanged — extract from original
    keep = src[src.index('  <!-- ═══════════ THE KEEPERS'):src.index('<!-- ═══════════ FOOTER')]
    keep = keep.split("</main>")[0].rstrip()
    parts.append("\n" + keep)
    parts.append("\n</main>\n")
    parts.append(tail)
    out = "".join(parts)
    open(f"{ROOT}/projects/index.html","w").write(out)

# ───────────────────────── videos page ─────────────────────────
FILM_SECTIONS = [
 ("films-claude-todo","raven","Party","ᚨ","The Garden Films · claude-todo","The Party-Command Reels",
  "Films of the commanded party — companions ordered across the field, as the backlog execs its titles into subagents.","claude-todo"),
 ("films-hermes-todo","moon","Orbit","ᛗ","The Garden Films · hermes-todo","The Orbit-Drops",
  "Reels dropped from orbit — a worker per todo, a diver per drop.","hermes-todo"),
 ("films-gwent","scroll","Gwent","ᛊ","The Garden Films · gwent","The AI Matches",
  "Matches at the electronic Gwent board — GPT-4o as Eredin versus Claude Sonnet as Crach an Craite.","gwent"),
 ("films-ai-prompts","cauldron","Spells","ᚲ","The Garden Films · ai-prompts","The Spellbook",
  "Incantations of the prompt-craft — every spell once cast in the book.","ai-prompts"),
 ("films-jabberbot","horn","Hounds","ᚺ","The Garden Films · JabberBot","The Hounds",
  "Robot-hound reels — distant kin of the Bluetooth rover.","JabberBot"),
 ("films-arduinolibraries","hammer","Scars","ᛜ","The Garden Films · ArduinoLibraries","The Scars",
  "LED-driver scars — where the libraries were etched.","ArduinoLibraries"),
 ("films-dexonering","ring","Rings","ᚱ","The Garden Films · DexOneRing","The Norse Rings",
  "Reels worn on the hand — rings and the smiths' myth.","DexOneRing"),
 ("films-peytonsring","hammer","Forge","ᚷ","The Garden Films · PeytonsBirthdayCladdaghRing","The Forge",
  "Medieval forge films — the blacksmith's craft the Claddagh echoes.","PeytonsBirthdayCladdaghRing"),
 ("films-accessories","webknot","Faire","ᚹ","The Garden Films · Accessories","The Faire Machines",
  "Printed contraptions — Maker Faire machines and backyard rocketry.","Accessories"),
 ("films-bbqberry","candle","Fireside","ᛚ","The Garden Films · bbqberry","The Fireside",
  "The fireside sensor — the smoker's watcher.","bbqberry"),
 ("films-thor","moon","Meters","ᛏ","The Garden Films · thor","The Meters",
  "Meters that watch the storm — engines and power under the instrument panel.","thor"),
 ("films-electroplater","hammer","Stick","ᛞ","The Garden Films · electroplater","The Stick",
  "A steady hand at the stick — kin of the servo's precision.","electroplater"),
 ("films-vulcan-brownout","webknot","Mortars","ᛒ","The Garden Films · vulcan-brownout","The Mortars",
  "Vulcan's fire — mortar-lines that share a god with the forge.","vulcan-brownout"),
 ("films-dollar-game","dice","Tabletop","ᛖ","The Garden Films · dollar-game","The Tabletop",
  "Turn-based artillery on the same tabletop.","dollar-game"),
 ("films-arcade","dice","Arcade","ᛟ","The Garden Films · diamond-diggin-donal","The Garden Arcade",
  "The garden arcade — untamed worlds drain to the digger's field.","diamond-diggin-donal"),
 ("films-family","candle","Album","ᛋ","The Garden Films · the household","The Family Album",
  "Quiet reels of the household — no repo, no stone, just family.",None),
]

VID_CSS = """
/* ============ THE GARDEN FILMS — plaques & parallels ============ */
.lh-roundel img{width:38px;height:38px;filter:drop-shadow(0 1px 0 rgba(0,0,0,.85))}
.vparallel{
  margin-top:8px;font-family:var(--mono);font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:#8a795a;
}
.vparallel a{color:#b08b4f;text-decoration:none;border-bottom:1px dotted rgba(138,106,59,.55);transition:color .25s,text-shadow .25s}
.vparallel a:hover,.vparallel a:focus{color:var(--amber2);text-shadow:0 0 9px rgba(232,163,61,.5)}
.vstone h3 a{color:inherit;text-decoration:none}
"""

def film_plaque(vid, repo_name=None):
    v = videos[vid]
    t = E(v["title"])
    out = [f'''      <article class="vstone">
        <a class="vthumb" href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="" loading="lazy"><span class="vplay" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6.5 L18 12 L9 17.5 Z"/></svg></span></a>
        <h3><a href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener">{t}</a></h3>''']
    if repo_name:
        kind = "film" if vid in ties_direct.get(repo_name, []) else "parallel"
        ru = repos[repo_name]["html_url"]
        out.append(f'        <p class="vparallel">a {kind} of <a href="{ru}" target="_blank" rel="noopener">{repo_name}</a></p>')
    out.append(f'        <div class="marks"><span class="m-dur">{dur(v["duration_seconds"])}</span><span class="m-sep">᛫</span><span class="m-views">{v["views"]} views</span></div>')
    out.append("      </article>")
    return "\n".join(out)

def build_videos():
    src = open(f"{ROOT}/videos/index.html").read()
    head = src[:src.index('<main class="garden">')]
    tail = src[src.index('<!-- ═══════════ FOOTER'):]
    if "THE GARDEN FILMS" not in head:
        head = head.replace("</style>", VID_CSS + "</style>", 1)
    head = head.replace(
      "<title>the fireside screenings · shanaghy.com</title>",
      "<title>the garden films · shanaghy.com</title>", 1)
    head = head.replace(
      'content="The Fireside Screenings — 181 videos from FiremanDecko on YouTube: games, gadgets, and the occasional Gwent AI showdown. A candlelit parlor of the mossy stone garden."',
      'content="The Garden Films — 181 videos from FiremanDecko, every reel planted beside its parallel stone in the mossy garden, plus the quiet family album. A candlelit parlor from Athlone."', 1)
    # rebuild the runestrip tabs (nav links must resolve; no Gaming Table)
    i0 = head.index('<div class="runestrip">')
    i1 = head.index("</div>", i0)
    tabs = []
    counts = {}
    for sid, icon, label, rune, over, title, lede, repo in FILM_SECTIONS:
        if repo is None:
            n = len(family)
        else:
            n = len(ties_direct.get(repo,[])) + len(ties_parallel.get(repo,[]))
        counts[sid] = n
        tabs.append(f'    <a class="rtab" data-target="#{sid}" href="#{sid}"><span class="rt-rune">{rune}</span><span class="rt-label">{label}</span><span class="rt-count">×{n}</span></a>')
    head = head[:i0] + '<div class="runestrip">\n' + "\n".join(tabs) + '\n  ' + head[i1:]
    parts = [head, '<main class="garden">\n']
    for si, (sid, icon, label, rune, over, title, lede, repo) in enumerate(FILM_SECTIONS):
        n = counts[sid]
        w = "film" if n == 1 else "films"
        parts.append(f'''
  <!-- ═══════════ {title.upper()} ═══════════ -->
  <section class="grove" id="{sid}">
    <header class="grove-head">
      <span class="lh-rune" aria-hidden="true">{rune}</span>
      <div class="lh-roundel"><img src="../assets/icons/{icon}.png" alt="" width="38" height="38"></div>
      <div class="lh-text">
        <p class="lh-over">{over}</p>
        <h2>{title}</h2>
        <p class="lh-lede">{lede}</p>
      </div>
      <div class="lh-plaque"><span class="pl-rune">{rune}</span><span class="pl-count">{n} {w}</span></div>
    </header>
    <div class="vgrid">
''')
        if repo is None:
            for vid in family:
                parts.append(film_plaque(vid) + "\n")
        else:
            for vid in ties_direct.get(repo, []) + ties_parallel.get(repo, []):
                parts.append(film_plaque(vid, repo) + "\n")
        parts.append("    </div>\n  </section>\n")
        if si < len(FILM_SECTIONS) - 1:
            parts.append('\n  <div class="line-sep" aria-hidden="true"><svg viewBox="0 0 220 24"><use href="#knot-div"/></svg></div>\n')
    parts.append("\n</main>")
    parts.append(tail)
    out = "".join(parts)
    open(f"{ROOT}/videos/index.html","w").write(out)

build_projects()
build_videos()

# ── verification ──
for page, path in [("projects", f"{ROOT}/projects/index.html"), ("videos", f"{ROOT}/videos/index.html")]:
    c = open(path).read()
    assert "Gaming Table" not in c, page
    from html.parser import HTMLParser
    VOID = {"meta","link","img","br","hr","input","source"}
    class P(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True); self.stack=[]; self.errs=[]
        def handle_starttag(self, tag, attrs):
            if tag not in VOID: self.stack.append(tag)
        def handle_endtag(self, tag):
            if tag in VOID: return
            if not self.stack or self.stack[-1]!=tag: self.errs.append((tag,self.getpos()))
            else: self.stack.pop()
    p = P(); p.feed(c)
    assert not p.errs and not p.stack, (page, p.errs[:5], p.stack[:5])
    print(page, "OK: tag balance", len(c), "bytes")

v = open(f"{ROOT}/videos/index.html").read()
ids = re.findall(r'youtube\.com/watch\?v=([\w\-]{6,})', v)
print("videos page: unique", len(set(ids)), "total", len(ids), "(expect 181 unique)")
counts = {}
for sid, icon, label, rune, over, title2, lede, repo in FILM_SECTIONS:
    counts[sid] = (len(family) if repo is None
                   else len(ties_direct.get(repo, [])) + len(ties_parallel.get(repo, [])))
for sid, n in counts.items():
    print("  ", sid, n)
pr = open(f"{ROOT}/projects/index.html").read()
print("projects: stories", pr.count("stone-story"), "| onfilm rows", pr.count('class="onfilm"'),
      "| playsalong", pr.count("playsline"))
navs = re.findall(r'href="(#[\w\-]+)"[^>]*class="rtab"', pr)
print("projects nav tabs:", navs)
navv = re.findall(r'href="(#[\w\-]+)"[^>]*class="rtab"', v)
print("videos nav tabs:", navv)