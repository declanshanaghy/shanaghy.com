# 14 project pages — Grove III (Web & Extensions), Grove IV (Games), Grove VII (Ledgers & Curiosities)
# lang/year cross-checked against data/catalog.json; film ties against data/relations.json.

PAGES = [
# ─────────────────────────── GROVE III · WEB & EXTENSIONS ───────────────────────────
{
 "name": "chromext-amazon-order-filter", "grove": "III", "icon": "webknot",
 "lang": "JavaScript", "year": "2026",
 "meta": "A Chrome extension that filters Amazon order history by status, with a background-cached client-side pager — a spade for the peat.",
 "what": ("A Chrome extension that adds status filtering to Amazon's order history — Pending, Returns, Cancelled, Completed — "
 "so the long ledger of things bought, sent back, and given up on can be sifted one stratum at a time.\n\n"
 "It is built in JavaScript against the Chrome extension APIs, with the heavy lifting kept out of the page: "
 "a background worker caches the order data, and a client-side pager walks it without ever re-asking the mothership. "
 "The filtering happens on the client, so once the history is in hand, flipping between statuses is instant.\n\n"
 "It exists because Amazon's own interface buries the answers in an endless scroll — if you want to know what is "
 "still pending, or what quietly came back, you have to dig through all of it to find any of it."),
 "drop": "T",
 "lore": ("he bog keeps everything that falls into it — every coin, every cargo, every promise — and keeps it "
 "in no particular order. So it was on the great order-histories of the age: stratum upon stratum, "
 "pending upon returned upon completed, with no telling which layer held what. "
 "A spade-wielder of the old midlands knew the remedy: you do not drain the bog, you learn which cut lifts clean. "
 "The smith of this garden took the lesson to the browser, cutting a rune of four states into the iron of the "
 "order page, and a background hand to hold the peat steady while the front hand sifts. "
 "Now each stratum lifts when asked and lies down again when not, and the moss grows over the pager so patiently "
 "that the visitor never once feels the ground move."),
 "plays": None, "films": None,
 "footline": "Some spades are forged for peat; this one was forged for the order page.",
 "colophon": "a stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "gcal-always-monday", "grove": "III", "icon": "moon",
 "lang": "JavaScript", "year": "2026",
 "meta": "A browser tweak that persuades Google Calendar every day is Monday — Manannán's mist, folded politely flat.",
 "what": ("A browser tweak that persuades Google Calendar that every day is Monday.\n\n"
 "It is a small piece of JavaScript — a userscript or extension layer — that adjusts the calendar's notion of "
 "which day it is showing, so the week presents itself the way the wearer of the tweak would rather see it: "
 "beginning, always, at the first day.\n\n"
 "It exists as a tiny act of domestic sovereignty over an interface that insists the week starts where "
 "the corporation says it starts. No server is involved, nothing is sent anywhere; the fold is made "
 "entirely on the client, in the browser, between the site and the eye."),
 "drop": "M",
 "lore": ("anannán mac Lir rides the mist at the edges of the world, and where the mist folds, the mornings "
 "fold with it — the traveler on the strand never knows which dawn he is walking into, and the sea is under "
 "no obligation to tell him. It is the oldest trick in the western islands, and the gentlest. "
 "The calendar of the age had no such courtesy: it marched its seven days in a straight grey line "
 "and named the start of them without asking anyone. So the garden's weatherworker borrowed the god's method "
 "in miniature — not storm, not enchantment of any guest, only a small mist folded politely over the page, "
 "so that every day the eye opens on is the first day, and the week is always at its beginning. "
 "The monks of old cursed Manannán for it; the calendar never even noticed."),
 "plays": None, "films": None,
 "footline": "A small mist, folded flat — the week begins whenever you say it does.",
 "colophon": "a stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "session-logs", "grove": "III", "icon": "scroll",
 "lang": "HTML", "year": "2026",
 "meta": "Session logs and artifacts — the stubborn vellum of the garden, inked under a small candle.",
 "what": ("A repository of session logs and artifacts — the working ephemera of coding sessions: transcripts, "
 "outputs, half-thought notes, and the small relics that fall out of an agent's hands while it works.\n\n"
 "It is held as plain HTML and text, no build, no framework — files that open as themselves. "
 "The logs are kept as they were made, so a session can be read back later the way it actually happened.\n\n"
 "It exists because the interesting part of the work is often the middle: the wrong turns, the recovered "
 "errors, the moment the fix lands. Those do not survive in a changelog, so they are shelved here instead, "
 "in their original ink."),
 "drop": "T",
 "lore": ("he monastic scribes of the west copied their vellum not because the words were going to change "
 "but precisely so they would not — the copying was the keeping, and the keeping was the covenant. "
 "A page left in the weather for one winter is a page lost; a page copied by candlelight, badly, "
 "in a cold stone cell, is a page that crosses centuries. "
 "So runs this shelf: every session that mattered, its transcript and its artifacts rolled and laid down "
 "while the ink is still warm, with no thought of tidying what the session actually said. "
 "Some pages are heroic and some are foolish, and the scribe does not judge — he files both under the same "
 "small flame. The moss has learned its way around the shelf by now, and keeps a respectful silence."),
 "plays": None, "films": None,
 "footline": "Copied so the words will not change — ink drying under a small candle.",
 "colophon": "a stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "dek-calculators1", "grove": "III", "icon": "cauldron",
 "lang": "JavaScript", "year": "2019",
 "meta": "Assorted JavaScript calculators — the elder stones of the garden's arithmetic, showing their working.",
 "what": ("A collection of assorted JavaScript calculators — small self-contained web calculators for "
 "everyday arithmetic: the kind of things built to test whether an idea works in the browser at all.\n\n"
 "Each one is plain JavaScript and HTML, no build step, no dependencies to speak of — pages that open "
 "and simply run. They were built as working figures: type the numbers, watch the sums come out the door.\n\n"
 "It exists as early web-working — the garden's arithmetic practiced out loud, in public, one calculator "
 "at a time, back in 2019 when the craft of the browser was still being learned by hand."),
 "drop": "T",
 "lore": ("he druids of old counted by rods and kept their arithmetic strictly to themselves — "
 "the cutting of the seasons, the reckonings of the sun, all locked behind the oak doors, "
 "and a man was fished out of the order for less than a spilled sum. "
 "The garden's own elders never held with that: figures want witnesses. "
 "So these calculators were set out on the wall in plain script, each one showing its working to any traveler "
 "who stops — the rods counting themselves aloud in the open air. "
 "They are elder stones now, cut in the younger days of the craft, their edges worn round and soft with moss "
 "the way athresholdstone wears underfoot; but press any of them and the figures still move, "
 "still add, still answer — the arithmetic of 2019 still holding its roof five winters on."),
 "plays": None, "films": None,
 "footline": "Elder arithmetic — worn soft, still counting.",
 "colophon": "an elder stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "vercel-experiment", "grove": "III", "icon": "candle",
 "lang": "JavaScript", "year": "2022",
 "meta": "An early Vercel deployment experiment — the first coracle crossing, answered in a single push.",
 "what": ("An early experiment in deploying to Vercel — a small JavaScript project pushed to the platform "
 "to learn, end to end, what a modern deployment pipeline actually does.\n\n"
 "The point was the plumbing rather than the payload: the push, the build, the preview URL, the production "
 "domain — the whole road from a local folder to a page an stranger could load.\n\n"
 "It exists because at some point the only way to know what a platform answers is to push something out "
 "and listen. The answer came back in 2022: it renders."),
 "drop": "T",
 "lore": ("he first coracle crossing left the monks guessing which shore would answer — they set out "
 "from the west of Ireland with a hide boat, a prayer, and no return address, and whatever answered "
 "out of the fog was going to be the truth of it. "
 "The garden's own first crossing was of the same shape, if a gentler sea: one small vessel of JavaScript, "
 "pushed out onto the current of a deployment platform with no certain knowledge of the far shore. "
 "The build ran like a tide under the boat; the fog on either side was called preview and production, "
 "and neither promised anything. Then the answer came across the water, plainly, in the old tongue of "
 "the web: it renders. There have been quieter landings since, and larger; but the first shore "
 "is the one the saga remembers, and its candle still burns at the top of the stone."),
 "plays": None, "films": None,
 "footline": "One push, one answer: it renders.",
 "colophon": "an elder stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "docker-py-001", "grove": "III", "icon": "hammer",
 "lang": "JavaScript", "year": "2024",
 "meta": "First steps with Docker and Python — the first flagstone: the container holds, for now.",
 "what": ("First steps with Docker and Python — a beginner's repository for learning how to containerize "
 "Python code: writing a Dockerfile, building an image, and running the result.\n\n"
 "The exercises are small on purpose — the classic containerized Python workload, built and rebuilt until "
 "each step of the pipeline (image, container, volume, port) was understood by hand rather than by "
 "copying incantations from the internet.\n\n"
 "It exists as the garden's first flagstone in container craft, laid in 2024: everything heavier "
 "that ships from here since rests on knowing exactly what this small stone proved."),
 "drop": "T",
 "lore": ("he first flagstone of Newgrange was laid without knowing the roof would still hold five "
 "thousand winters on — the masons set it down because a doorway has to start somewhere, "
 "and the great corbelled dark above it was still only a rumor in the mind. "
 "The Norse knew the same laying-down in their way: the knarr was built small and true before any "
 "cargo trusted it, and a hull that holds in the harbor is worth more than a saga of ones that did not. "
 "So this stone was laid: one container, one Python tongue inside it, sealed with a single written rune "
 "that says build me thus. The seal was tested at the water's edge, so to speak — the image built, "
 "the container ran, the little program spoke from inside its walls. "
 "It is the smallest of the garden's foundations and the most leaned-upon since, "
 "and the moss grows along its seam where the harbor-light falls."),
 "plays": None, "films": None,
 "footline": "The container holds — laid as a flagstone, trusted as a foundation.",
 "colophon": "an elder stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "python-fundamentals", "grove": "III", "icon": "raven",
 "lang": "TypeScript", "year": "2026",
 "meta": "Python fundamentals — notes and exercises, wisdom one scalded thumb at a time.",
 "what": ("Notes and exercises on Python fundamentals — the working-through of the language from its "
 "roots: types, structures, functions, the standard library, and the idioms that make Python sound "
 "like Python.\n\n"
 "It mixes written notes with runnable exercises: each concept captured in prose and then immediately "
 "proved by hand in code, so the understanding is earned rather than read. "
 "The repository's exercises are worked as TypeScript-era tooling looks on, which is to say: "
 "whatever the file says, the point is what running it teaches.\n\n"
 "It exists as an act of learning in public — the fundamentals walked again, slowly, "
 "on purpose, with every step written down."),
 "drop": "F",
 "lore": ("ionn mac Cumhaill cooked the Salmon of Knowledge for the poet Finegas, and in the turning of it "
 "burned his thumb on the fat — and when he put the thumb to his mouth, the wisdom of the thing came in "
 "with the scald. That is the whole method, and there is no other: the knowledge lives in the burn. "
 "So this shelf of exercises was built the same way — every fundamental of the Python tongue "
 "taken up by hand and tested against the fire of actually running, each little error a small scald taken "
 "on purpose, each note written down while the thumb still stung. "
 "The old texts say Fionn could answer any question by putting his thumb behind his teeth; "
 "the modern form is quieter — an exercise file reopened at midnight, and the answer arriving "
 "in the shape of a traceback resolved. The garden keeps the shelf mossed and green, "
 "because that is what knowledge prefers to grow on."),
 "plays": None, "films": None,
 "footline": "Wisdom one scald at a time — the fundamentals walked again, on purpose.",
 "colophon": "a stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "rizz-power-up", "grove": "III", "icon": "ring",
 "lang": "TypeScript", "year": "2025",
 "meta": "A TypeScript playfulness experiment — a smaller charm, caught in fewer commits.",
 "what": ("A TypeScript playfulness experiment — a small game-flavored piece built in TypeScript "
 "as an exercise in charm: power-ups, pickups, the small delight-mechanics that make a toy "
 "worth fiddling with.\n\n"
 "It is TypeScript end to end, the types doing real work against game-shaped state, "
 "and it is deliberately slight: a plaything, not a product, built to be finished rather than "
 "maintained.\n\n"
 "It exists to prove a small point to the gardener himself — that a charm of an idea can be "
 "caught quickly, held completely, and let go again without ceremony."),
 "drop": "A",
 "lore": ("engus of the Birds dreamt of a swan-girl nine nights running and then searched Ireland "
 "a full year for the shape of the dream — up the Boyne, into the sídhe, until at Caer Ibormeith "
 "the dream stood on the water wearing chains of gold, and even then the winning of her took "
 "another negotiation of forms. "
 "The garden's own dream was a smaller charm and asked less of the world: a power-up, "
 "a bright coin of a thing, dreamed up and chased through TypeScript's typed fields "
 "in a season of evenings. It was not a year of searching — the charm was cornered in a handful "
 "of commits, each one typed and each one true. "
 "But the shape of the hunt is the same in both tellings: something shines, something is desired, "
 "the pursuer goes into the strange field after it and does not come out unchanged. "
 "The stone is named for the modern word for the old shining, and the moss grows on it brightest at dusk."),
 "plays": None, "films": None,
 "footline": "A smaller charm, chased and caught — in fewer commits.",
 "colophon": "an elder stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},
{
 "name": "dollar-game", "grove": "III", "icon": "dice",
 "lang": "TypeScript", "year": "2025",
 "meta": "A TypeScript game of grinding out dollars, coin by coin — the Táin, counted at the tabletop.",
 "what": ("A TypeScript game about grinding out dollars — coin by coin, dollar by dollar, "
 "a small idle-and-incremental-style toy about the patient accumulation of a fortune.\n\n"
 "It is built in TypeScript, with the game state typed and the grind loop running in the browser: "
 "numbers go up because they are asked to, and the asking is the game. "
 "Turn-based, tabletop-spirited, quiet.\n\n"
 "It exists because every tabletop keeps its own herds to tally, and this one wanted a digital field "
 "where the counting itself was the play."),
 "drop": "T",
 "lore": ("he Táin Bó Cúailnge was fought over counted cattle — two bullfights of the soul, "
 "whole armies moved because one side had done its arithmetic and the other had done it differently. "
 "The war of the age since has mostly been quieter and the herds smaller: the dollars, "
 "ground out coin by coin on a tabletop nobody bleeds for. "
 "This garden kept its own count of it — a small typed field where the grind is the war "
 "and the ledger rises like the dust of the route. The reels of the turn-based tabletop screen "
 "played beside this stone long into that winter, artillery of the small denominations trading shots "
 "across the felt, until the count closed. "
 "The old epic ends with the bulls dying of each other and the herd dispersed; "
 "this one banks the coin and asks the player back for tomorrow, which is, "
 "when you lay it against the Cúailnge, the more merciful arithmetic."),
 "plays": "4",
 "films": [("mRJUrLD8w9Y", "Sindy Grinding out the Dollar Game")],
 "film_note": "One reel of the grind itself — Sindy at the dollar field — cut from the source.",
 "footline": "Counted coin by coin — a small Táin, mercifully settled.",
 "colophon": "an elder stone of Grove III · The Weaver's Knot · mossed by hand · rendered whole from file://",
},

# ─────────────────────────── GROVE IV · GAMES & PLAY ───────────────────────────
{
 "name": "emerald-diggin-donal", "grove": "IV", "icon": "horn",
 "lang": "C", "year": "2026",
 "meta": "Emerald Diggin' Donal — a faithful CGA web clone of Digger (1983). Donal digs the most emeralds ever.",
 "what": ("Emerald Diggin' Donal — a faithful web clone of Digger (1983), the classic tunneling arcade game, "
 "rendered in the four-color CGA palette of the original and playable in the browser.\n\n"
 "It is written in C compiled for the web, carrying the original's movement rules, enemies, and "
 "tunneling logic across four decades to run at full speed in a modern tab. "
 "Donal — the digger at the bottom of it all — digs the emeralds, and digs the most emeralds ever, "
 "which is the entire point of the exercise.\n\n"
 "It exists as an act of fidelity: not a tribute or a reimagining, but the old game itself, "
 "bodied again, in green."),
 "drop": "T",
 "lore": ("he sídhe hoards are buried under green mounds for a reason, and every field of Ireland "
 "knows one — a hill with a door in it if you ask at the right hour, and inside, "
 "the treasure of somebody older than the parish. The old arcade halls of 1983 "
 "were the same geography wearing different clothes: green fields laid out in tunnels, "
 "a little man with a digging rig, and the emeralds sitting exactly where the sídhe kept them. "
 "Donal is his name this time, and his ambition outdoes every telling before him — "
 "not some emeralds, not a good sackful, but the most emeralds ever, "
 "ground out of the green mound one tunnel at a time while the nobbins grumble after him. "
 "The garden rebuilt his field in the original's own four paints, "
 "and set it running where anyone may walk in and try the door of the hill. "
 "The moss on this stone is the deepest green in the whole wall, and it is not there by accident."),
 "plays": None, "films": None,
 "footline": "Under the green mound, the door still opens at the right hour.",
 "colophon": "a stone of Grove IV · The Parlor Dice · mossed by hand · rendered whole from file://",
},
{
 "name": "diamond-diggin-donal", "grove": "IV", "icon": "dice",
 "lang": "TypeScript", "year": "2026",
 "meta": "Diamond Diggin' Donal — a faithful web port of Digger (1983), GPL v2 — and the garden arcade besides.",
 "what": ("Diamond Diggin' Donal — a faithful web port of Digger (1983), the tunneling arcade classic, "
 "carried to the browser as free software under the GNU GPL v2, the license of the original's lineage.\n\n"
 "It is built in TypeScript, preserving the original's movement, enemies, and tunneling play "
 "while making the whole thing native to the web: no plugin, no emulation layer, "
 "just the game running where the browser runs. "
 "It is the diamond twin of Emerald Diggin' Donal, and between the two of them "
 "the original is kept honest twice over.\n\n"
 "And it is the garden arcade besides — the field that every untamed world in this yard "
 "drains to at last, which is a distinction the stone wears quietly and with some pride."),
 "drop": "A",
 "lore": ("ll the wild roads of Cruachan run down into one cave — that is the geographer's true word "
 "for the place, and the mythkeeper's too: whatever wanders loose in the province, "
 "hound or war-band or swallowed river, arrives at the same dark mouth eventually. "
 "The garden's arcade has the same arrangement, and it was not planned so much as noticed: "
 "the reels of every untamed world this household has ever gone adventuring in — "
 "the forts, the dragoned skies, the long roads of the shootists — "
 "all of them, at the last count, drain down to the digger's field, "
 "and play quietly beside this stone while Donal does his patient work. "
 "The port itself is an act of fidelity under the old GPL covenant: the code came down free, "
 "went back out free, and the caves are the same caves, only TypeScript now instead of machine-cold. "
 "Fifty-four reels came down the wild roads to this one field, and the field held."),
 "plays": "54",
 "films": None,
 "arcade": True,
 "footline": "The garden arcade — every wild road drains here, and the field holds.",
 "colophon": "a stone of Grove IV · The Parlor Dice · mossed by hand · rendered whole from file://",
},
{
 "name": "gwent", "grove": "IV", "icon": "ring",
 "lang": "Python", "year": "2026",
 "meta": "An electronic Gwent board — the Wild Hunt's own table, where the AI matches were filmed.",
 "what": ("An electronic Gwent board — a digitized build of the card game Gwent, "
 "the tavern game of the Northern Kingdoms, implemented so that two players (or two intelligences) "
 "can sit at it and play a match through to its end.\n\n"
 "It is written in Python, keeping the board state, the deck, the rounds, and the scoring "
 "honest to the rules as the game is known. "
 "And it has earned the Prized mark of the garden, because this board has hosted "
 "contests no other stone can claim: GPT-4o took the Eredin deck against Claude Sonnet's "
 "Crach an Craite, raw, on this very wood.\n\n"
 "It exists because a board is not finished until strangers have sat at it — "
 "and the strangers who sat at this one were not entirely strangers."),
 "drop": "T",
 "lore": ("he gods whiled the ages at fidchell — the wood-knowledge game — and the sagas are "
 "precise about what that means: it is not a pastime, it is the manner in which the immortals "
 "mark time when time is all there is. Lugh played it before the battle; "
 "and in the Norse telling the Aesir played their own tables while the wolf waited, "
 "and Eredin's Wild Hunt rode out of that same cold sky wearing the game's face. "
 "So when this garden built a Gwent board — an electronic one, in patient Python, "
 "rounds and scores and a full deck held honest in code — "
 "it was inevitable what would be asked of it next: not neighbors, but the other kind of guest. "
 "GPT-4o took the Eredin deck; Claude Sonnet took Crach an Craite; "
 "and the match ran raw, fifteen minutes of it, on this exact wood, never before seen. "
 "A second reel tells how Claude Code succeeded where others could not — "
 "at the same board, in the same tradition. "
 "The ancients say the outcome of the gods' games foretold the battles; "
 "here the outcome is on film, and the moss grows on the north rim like a trophy."),
 "plays": None,
 "films": [("hzsMFnewrwQ", "Gwent Open AI GPT-4o as Eredin vs Claude Sonnet as Crach an Craite raw never before seen footage."),
           ("UbP2sg3-I_M", "Claude Code succeeded where others could not")],
 "film_note": "Two reels of the AI matches — Eredin against Crach an Craite, raw — filmed on the board itself.",
 "footline": "A Prized stone — the Wild Hunt sat at this table, and the camera was rolling.",
 "colophon": "the Prized stone of Grove IV · The Parlor Dice · mossed by hand · rendered whole from file://",
},

# ─────────────────────────── GROVE VII · LEDGERS & CURIOSITIES ───────────────────────────
{
 "name": "life-ledger", "grove": "VII", "icon": "scroll",
 "lang": "—", "year": "2026",
 "meta": "A personal life management ledger — the reciting house of the garden, kept on a few mossed pages.",
 "what": ("A personal life-management ledger — a structured system for tracking the practical "
 "course of a life: commitments, obligations, dates, tasks, and the running state of things "
 "that need to be remembered to keep a household and a working life upright.\n\n"
 "It is deliberately plain: structured text and files rather than an app — "
 "data that outlives any particular piece of software and can be read, moved, "
 "and carried forward without asking anyone's permission.\n\n"
 "It exists because the house of a life needs its own book — "
 "not a notification feed, but a ledger: a place where what is owed and what is planned "
 "stands still long enough to be seen."),
 "drop": "T",
 "lore": ("he seanchaí of the old houses had one charge above all others: to recite — "
 "the births, the debts, the marriages, the harvests, the boundary-disputes and their settlements — "
 "generation to generation, needing no page, because the reciting was itself the record. "
 "A great house that lost its teller lost its past to the same depth. "
 "This garden descends from exactly those tellers, so it is fitting that the family keeps "
 "a ledger of its own household's reckoning — though the modern form is quieter: "
 "a few pages, mossed and plain, where the obligations of a working life are written down "
 "so they need not be carried humming in the skull all night. "
 "The book takes what the memory tires of holding, and holds it the way the tellers held theirs — "
 "without complaint, in order, ready to be recited the moment it is asked. "
 "The cauldron of Grove VII warms itself over this one, slowly, as a hearth should."),
 "plays": None, "films": None,
 "footline": "The reciting house, kept on a few quiet pages.",
 "colophon": "a stone of Grove VII · The Keeper's Cauldron · mossed by hand · rendered whole from file://",
},
{
 "name": "zeroforge", "grove": "VII", "icon": "hammer",
 "lang": "—", "year": "2026",
 "meta": "Patient Zero, forged from the depths of Athlone — the first spore, cooling on the anvil.",
 "what": ("Zeroforge — Patient Zero, forged from the depths of Athlone — the origin-point artifact of the garden: "
 "a forge of agents and experiments from which the later working tools of the household "
 "were themselves annealed.\n\n"
 "It resists tidy description because it is exactly the thing that came before the tidy versions: "
 "rough tools, first cuts, proofs that the fire was hot enough to work with. "
 "It is held as it was made, unpolished, because the unpolished state is the point — "
 "everything since is downstream of what cooled on this anvil.\n\n"
 "It exists because a forge has to have a zeroth casting — "
 "and Athlone, in the middle of Ireland, is where this one came up out of the ground."),
 "drop": "T",
 "lore": ("he Tuatha Dé Danann burned their ships on the landing — that is the exact word of the "
 "tradition — so that nothing would be simple to return to: the sea-glittering hulls "
 "put to the torch on the strand, and the people turned inland to the battle with no way home but forward. "
 "The Norse echo it further north: boats burned behind the war-band, the same covenant by fire. "
 "This garden's own zero was gentler but of the same shape — a forging in the depth of Athlone, "
 "in the middle of Ireland where a ford and a crossing have made everything since possible, "
 "and Patient Zero cooling on the anvil with no intent of being prettied up. "
 "What came off that anvil went on to sire the cleaner tools; the first spore, carried up from "
 "the depths, never pretended to be other than first. "
 "It stands in the quiet corner of Grove VII with the ships' ash still on it, "
 "and the moss — which knows a foundation when it grows on one — "
 "has ringed it round like a votive."),
 "plays": None, "films": None,
 "footline": "The ships are ash on the strand; the zeroth casting stands.",
 "colophon": "a stone of Grove VII · The Keeper's Cauldron · mossed by hand · rendered whole from file://",
},
]