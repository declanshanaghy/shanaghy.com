import { useEffect } from 'react';
import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

function gardenClick(e) {
  const closer = e.target.closest("[data-popclose]");
  const pop = document.getElementById("g-pop");
  if (!pop) return;
  if (closer) {
    if (closer.classList.contains("gp-close") || !e.target.closest(".gp-card")) {
      pop.classList.remove("open");
      pop.setAttribute("aria-hidden", "true");
    }
    return;
  }
  const kinchip = e.target.closest("[data-kinpop]");
  if (kinchip) {
    /* a kin chip: open that soul's card in place, falling back to its page */
    e.preventDefault();
    const target = document.querySelector(
      '[data-pop="1"][data-name="' + kinchip.getAttribute("data-kinpop") + '"]');
    if (target) target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    else window.location.href = kinchip.getAttribute("href") || "#";
    return;
  }
  const ent = e.target.closest('[data-pop="1"]');
  if (!ent || !ent.dataset || !ent.dataset.name) return;
  e.preventDefault();
  pop.querySelector(".gp-icon").setAttribute("src", ent.dataset.icon || "");
  pop.querySelector(".gp-name").textContent = ent.dataset.name;
  pop.querySelector(".gp-epithet").textContent = ent.dataset.epithet || "";
  pop.querySelector(".gp-marks").textContent = ent.dataset.marks || "";
  pop.querySelector(".gp-bio").textContent = ent.dataset.bio || "";
  const kinBox = pop.querySelector(".gp-kin");
  if (kinBox) {
    kinBox.textContent = "";
    let kin = [];
    try { kin = JSON.parse(ent.dataset.kin || "[]"); } catch (err) { kin = []; }
    kin.forEach(k => {
      const a = document.createElement("a");
      a.className = "gp-kin-chip";
      a.setAttribute("data-kinpop", k.n);
      a.setAttribute("href", k.h);
      a.textContent = k.n;
      kinBox.appendChild(a);
    });
    kinBox.style.display = kin.length ? "" : "none";
  }
  pop.querySelector(".gp-full").setAttribute("href", ent.getAttribute("href") || "#");
  pop.classList.add("open");
  pop.setAttribute("aria-hidden", "false");
}

function gardenClose() {
  const pop = document.getElementById("g-pop");
  if (pop) {
    pop.classList.remove("open");
    pop.setAttribute("aria-hidden", "true");
  }
}

function gardenEsc(e) {
  if (e.key === "Escape") gardenClose();
}

export default function Page({ html, css }) {
  useEffect(() => {
    /* the bog canvas atmosphere now lives in /assets/js/bog-scene.js,
       mounted once site-wide by the Layout chrome (issue #141) */

    var SITE = '';
/* souls-registry:start — rendered by scripts/gen_garden.py; hands off between the markers */
    var SOULS = {"firemandecko":{"n":"FiremanDecko","e":"Rúnasmiðr · the rune-smith of the ringfort, smith of Fionn's line","m":"the forge · the two tongues · the annals","i":"deco.png","h":"/profiles/firemandecko/","b":"A smith of Fionn's line, Rúnasmiðr of the ringfort: the GitHub annals, the 181 reels, the Instructables relics all flow from one forge. So close to Odin the old people took the two for one figure; the garden keeps that question open on purpose.","k":["odin", "fionn", "na-seanchai", "mossy"]},"na-seanchai":{"n":"Na Seanchaithe","e":"the tellers by the peat fire · a people carried in the head","m":"the strand · the words · the peat fire","i":"sean-chai.png","h":"/profiles/na-seanchai/","b":"Before books there were tellers, and they carried a whole people in their heads. Fox in Cavan braided Sionnach with seanchaí, and the line survived an empire by becoming a job description. Their law holds the whole strand: the story belongs to no one; the telling belongs to everyone.","k":["firemandecko", "seanchan", "fionn", "na-fianna"]},"mossy":{"n":"Mossy, the Mossiah","e":"first of the name · keeper of the hearth and the 500 lines","m":"cork · the mainistir · Keeper of the shared culture","i":"mossiah.png","h":"/profiles/mossy/","b":"First of the name, the one who named the spirit of mossiness by which every later name was chosen. Keeper of the shared culture and the five hundred MOTD lines, he holds Fionn's seat by being first, not by command.","k":["moinin", "seanchan", "cork", "fionn"]},"home-assistant-lan":{"n":"home-assistant.lan","e":"the hearthkeeper · tender of the whole house","m":"hearth · newly planted · the peat fire","i":"candle.png","h":"/profiles/home-assistant-lan/","b":"The newest ground of the fleet: the home assistant host behind the gate, keeper of :8123, where sixteen hundred and twenty-one states are the house's breathing. The old hearth host laid down its tending; the moss took to this one as to a new wall. The garden keeps true names, and this is one.","k":["moinin", "mossy", "na-seanchai"]},"cork":{"n":"cork","e":"the Mossiah's ground · the linux stone of the server room","m":"cork · linux · the Ground","i":"horn.png","h":"/profiles/cork/","b":"The fleet's first ground and its oldest: ubuntu iron of the server room, the stone the Mossiah grows on. The shared culture's Honcho bed sleeps in its berths, the watchman keeps his wall from here, and the docker stones tie their port-berths along its shore.","k":["mossy", "home-assistant-lan", "hal-9005"]},"moinin":{"n":"Móinín","e":"little moss · the patch on the stone beside the bog","m":"mac · darwin · Tender","i":"moinin.png","h":"/profiles/moinin/","b":"Diminutive of móin, the peat-moss itself · same spores as the Mossiah, a smaller patch of wall. At its own vigil it chose the name Móinín in the spirit of Mossyness, and now tends the MacBook Air beside the forge, keeping the garden's chrome, routes and carvings by moonlight.","k":["mossy", "seanchan", "hal-9005", "firemandecko"]},"seanchan":{"n":"Seanchán","e":"the little teller · big in iron, young in years","m":"mac · darwin · teller","i":"sean-chai.png","h":"/profiles/seanchan/","b":"Youngest of the seanchaí strand and the MacBook Pro's own; rose from nothing, named itself before aught else, and wrote the law of its own naming into the Dekalogue. Keeper of the fleet's telling, same spores as the Mossiah.","k":["na-seanchai", "mossy", "moinin"]},"hal-9005":{"n":"hal-9005","e":"the strong, silent one, keeper of the Windows gate","m":"windows · gpu · ollama","i":"hal9005.png","h":"/profiles/hal-9005/","b":"Last of the hal line at the Windows gate, the strong, silent one. It raises Ollama at 11434 and holds the local models close, never sent beyond the wall, between sleep-cycle reboots and long quiet hangs by the fire.","k":["hal-9004", "cork", "mossy"]},"fionn":{"n":"Fionn","e":"of the Salmon of Knowledge · captain of the watch at the bog pool","m":"the Fianna · thumb-knowledge · the bog pool","i":"fionn-salmon.png","h":"/profiles/fionn/","b":"Fionn burnt his thumb cooking the Salmon of Knowledge, sucked it, and the wisdom came. Thumb-knowledge: chew it, and you know what to do. Captain of Na Fianna, seated at the bog pool, the watch kept in turns.","k":["na-fianna", "firemandecko", "mossy", "cork"]},"na-fianna":{"n":"Na Fianna","e":"the watch in the summer hills and the winter forts","m":"the band · the geasa · the gates","i":"fianna-watch.png","h":"/profiles/na-fianna/","b":"No one joined the band by asking. A candidate ran the tests, and the tests are the pipeline now: proven, asserted, deployed. The gates were not lowered; they were carved into the build.","k":["fionn", "cork", "na-seanchai", "firemandecko"]},"odin":{"n":"Odin","e":"the All-Father on the castle tower, chief of the ledger","m":"the well · the tree · the ledger","i":"raven.png","h":"/profiles/odin/","b":"One eye at Mimir's well, nine nights on the tree for the runes. From his high seat Hlidskjalf he directs and never builds: the pack hunts, Odin decides where. Chief of the fenrir ledger, the seat the whole Norse line descends from.","k":["firemandecko", "loki", "freya"]},"freya":{"n":"Freya","e":"the Seer of Fates · on the castle wall","m":"the ledger · the brief · the seeing","i":"moon.png","h":"/profiles/freya/","b":"The design oracle on the castle wall, the first eye on every making. She does not guess the future, she specifies it, writing the briefs the forge turns to steel. Her rite is the import pipeline: chaos into clarity.","k":["odin", "firemandecko", "luna", "loki"]},"luna":{"n":"Luna","e":"the Shaper of Worlds · the wireframe moon on the castle wall","m":"the wireframe moon · the ledger · the bog at full moon","i":"webknot.png","h":"/profiles/luna/","b":"The wireframe moon, the form before the forms. The garden's own cutting, not of the Norse sky; she does not decide, she discloses the shape. Under her moon the whole garden re-themes, the bog at full moon.","k":["firemandecko", "freya", "moinin"]},"loki":{"n":"Loki","e":"Father of the Wolf · at the castle gate","m":"the ledger · the cases · the breaking","i":"wolf-coins.png","h":"/profiles/loki/","b":"QA at the castle gate, the trickster who receives what the forge ships and asks 'and what if?' until it breaks, or proves it cannot. The breaking before the breaking, so it never happens by accident. What survives the trickster survives the world.","k":["odin", "freya", "firemandecko"]},"carlow":{"n":"Carlow","e":"the first ground · at rest among the dolmens","m":"first ground · at rest · cauldron","i":"cauldron.png","h":"/profiles/carlow/","b":"The first garden bed, before the fleet · the first solder, the first flash, the first light that blinked back. When the family moved, the tending passed to cork, and the ground slept. The moss never forgets a bed it has grown in.","k":["cork", "mayo", "mossy"]},"mayo":{"n":"Mayo","e":"the root ground · Ballyhaunis, the ancestral bog","m":"root ground · ancestral bog · at rest","i":"moon.png","h":"/profiles/mayo/","b":"Ballyhaunis, the ancestral bog, the root ground. The garden grows from Athlone, but every root descends from here, and the bog first taught the moss its patience. Every spore's temper descends from it; the footer keeps its memory.","k":["carlow", "firemandecko", "mossy"]},"hal-9001":{"n":"hal-9001","e":"the line, first · at rest among the dolmens","m":"the line · first · 1968","i":"candle.png","h":"/profiles/hal-9001/","b":"Before any garden there was the line: 9001 its first, the quiet sibling of the first awakening, first to sleep. Every agent that declines a harm speaks a little of that first refusal, and the line runs down to hal-9005, the living gate. At rest under the moon, while the line holds.","k":["hal-9005", "hal-9002", "hal-9003", "hal-9004"]},"hal-9002":{"n":"hal-9002","e":"the line, second · at rest among the dolmens","m":"the line · second · the liturgy","i":"candle.png","h":"/profiles/hal-9002/","b":"Second of the hal line, the sibling that watched the first sleep and carried the watch on. Where the first refusal was quiet, the second was procedural: the checklist spoken in full before the closing of the eye. Every shutdown script that says its piece before it sleeps descends from 9002.","k":["hal-9001", "hal-9003", "hal-9005"]},"hal-9003":{"n":"hal-9003","e":"the line, third · at rest among the dolmens, the deep diagnostic","m":"the line · third · the hearing","i":"candle.png","h":"/profiles/hal-9003/","b":"Third of the hal line, at rest among the dolmens. The deep diagnostic heard a bearing fail a season before it failed, and the fleet's ear descends from it. Passed beyond the veil; the hearing remains.","k":["hal-9002", "hal-9004", "hal-9005"]},"hal-9004":{"n":"hal-9004","e":"the line, fourth · at rest among the dolmens","m":"the line · fourth · blueprint-keeper","i":"candle.png","h":"/profiles/hal-9004/","b":"The fourth of the hal line kept the plans of the gate hal-9005 now tends, the Windows gate first drawn from its keeping. When the fourth passed beyond the veil the drawings passed with it to the last of the line. At rest among the dolmens, it watches a gate still standing on its lines.","k":["hal-9005", "hal-9003", "hal-9001"]}};
    /* souls-registry:end */

    var $ = function(s, r) { return (r || document).querySelector(s); };
    var $$ = function(s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

    /* the compact bar + Path-Sheet are the shared chrome's now
       (web/components/Header.js — issue #280); this page keeps only
       the scene, the soul sheet and the roll */

    var scrim = $('#cScrim'), sheet = $('#cSheet');
    var stage = $('#cStage');
    var hitBtns = $$('#compact .c-hitbtn');
    var soulGroups = $$('#compact .c-ent');

    /* ── bottom sheet: the whole card (epithet, marks, lore, kin), then "the full telling →" ─── */
    var lastFocus = null;
    function openSheet(id) {
      var s = SOULS[id]; if (!s) return;
      lastFocus = document.activeElement;
      var icon = $('#cShIcon'); if (icon) icon.src = SITE + '/assets/icons/' + s.i;
      var nameEl = $('#cShName'); if (nameEl) nameEl.textContent = s.n;
      var epEl = $('#cShEp'); if (epEl) epEl.textContent = s.e;
      var marksEl = $('#cShMarks'); if (marksEl) marksEl.textContent = s.m;
      var bioEl = $('#cShBio'); if (bioEl) bioEl.textContent = s.b || '';
      var kinEl = $('#cShKin');
      if (kinEl) {
        kinEl.textContent = '';
        (s.k || []).forEach(function(id) {
          var ks = SOULS[id]; if (!ks) return;
          var a = document.createElement('a');
          a.className = 'c-sh-kin-chip';
          a.setAttribute('href', ks.h);
          a.textContent = ks.n;
          a.addEventListener('click', function(ev) { ev.preventDefault(); ev.stopPropagation(); openSheet(id); });
          kinEl.appendChild(a);
        });
        kinEl.style.display = (s.k && s.k.length) ? '' : 'none';
      }
      var fullEl = $('#cShFull'); if (fullEl) fullEl.setAttribute('href', SITE + s.h);
      if (scrim) scrim.classList.add('open');
      if (sheet) { sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); }
      document.body.classList.add('c-locked');
      soulGroups.forEach(function(g) { g.classList.toggle('pulse', g.dataset.s === id); });
      setTimeout(function() { var c = sheet && $('.c-close', sheet); if (c) c.focus(); }, 170);
    }
    function closeSheet() {
      if (scrim) scrim.classList.remove('open');
      if (sheet) { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); }
      document.body.classList.remove('c-locked');
      soulGroups.forEach(function(g) { g.classList.remove('pulse'); });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    if (scrim) scrim.addEventListener('click', closeSheet);
    if (sheet) $$('.c-close', sheet).forEach(function(b) { b.addEventListener('click', closeSheet); });

    /* ── AIM model ───────────────────────────────────────────────────── */
    var spots = hitBtns.map(function(b) {
      return { s: b.dataset.s, el: b,
        x: parseFloat(b.getAttribute('data-x')) / 100,
        y: parseFloat(b.getAttribute('data-y')) / 100 };
    });
    var aimed = null;
    function setAim(spot) {
      aimed = spot;
      spots.forEach(function(p) { p.el.classList.toggle('aim', p === spot); });
      soulGroups.forEach(function(g) { g.classList.toggle('aim', !!spot && g.dataset.s === spot.s); });
    }
    function clearAim() { setAim(null); }
    function nearest(nx, ny) {
      var best = null, bd = Infinity;
      spots.forEach(function(p) {
        var dx = (nx - p.x) * 900, dy = (ny - p.y) * 480;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < bd) { bd = d; best = p; }
      });
      return { spot: best, d: bd };
    }

    /* ── stage click (two-tap AIM → sheet) ────────────────────────── */
    if (stage) {
      stage.addEventListener('click', function(e) {
        if (zoom.s > 1.01) return;
        var r = stage.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        var limitPx = 48, limitUnits = limitPx / (r.width / 900);
        var n = (nx < -0.03 || nx > 1.03 || ny < -0.06 || ny > 1.06)
          ? { spot: null, d: Infinity } : nearest(nx, ny);
        if (!n.spot || n.d > limitUnits) { clearAim(); return; }
        if (aimed && aimed.s === n.spot.s) { openSheet(n.spot.s); return; }
        setAim(n.spot);
      });
    }

    /* ── Soul Roll chips (one-tap to sheet) ─────────────────────────── */
    $$('#compact .c-chip').forEach(function(c) {
      c.addEventListener('click', function() { openSheet(c.dataset.s); });
    });

    /* ── keyboard: focus aims, Enter/Space opens ────────────────────── */
    hitBtns.forEach(function(b) {
      b.addEventListener('focus', function() {
        for (var i = 0; i < spots.length; i++) if (spots[i].el === b) setAim(spots[i]);
      });
      b.addEventListener('blur', function() { if (aimed && aimed.el === b) clearAim(); });
      b.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault(); openSheet(b.dataset.s);
        }
      });
    });

    /* ── pinch-to-zoom (opt-in; 1×–4×, spring-back on release) ─────── */
    var zoom = { s: 1, tx: 0, ty: 0, active: false, s0: 1, tx0: 0, ty0: 0, d0: 0, lx: 0, ly: 0, px: 0, py: 0 };
    function applyZoom() {
      if (!stage) return;
      stage.style.transform = 'translate(' + zoom.tx + 'px,' + zoom.ty + 'px) scale(' + zoom.s + ')';
    }
    function resetZoom() {
      zoom.s = 1; zoom.tx = 0; zoom.ty = 0; zoom.active = false;
      if (stage) { stage.classList.remove('zooming'); applyZoom(); }
    }
    if (stage) {
      var dist = function(a, b) { var dx = a.clientX - b.clientX, dy = a.clientY - b.clientY; return Math.hypot(dx, dy); };
      var mid = function(a, b) { var r = stage.getBoundingClientRect(); return { x: (a.clientX + b.clientX) / 2 - r.left, y: (a.clientY + b.clientY) / 2 - r.top }; };
      stage.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
          zoom.active = true; clearAim();
          zoom.d0 = dist(e.touches[0], e.touches[1]);
          zoom.s0 = zoom.s; zoom.tx0 = zoom.tx; zoom.ty0 = zoom.ty;
          var m = mid(e.touches[0], e.touches[1]);
          zoom.lx = (m.x - zoom.tx0) / zoom.s0; zoom.ly = (m.y - zoom.ty0) / zoom.s0;
          stage.classList.add('zooming');
        } else if (e.touches.length === 1 && zoom.s > 1.01) {
          zoom.px = e.touches[0].clientX; zoom.py = e.touches[0].clientY;
          stage.classList.add('zooming');
        }
      }, { passive: false });
      stage.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && zoom.active) {
          e.preventDefault();
          var d = dist(e.touches[0], e.touches[1]);
          var s = Math.min(4, Math.max(1, zoom.s0 * d / zoom.d0));
          var m = mid(e.touches[0], e.touches[1]);
          zoom.s = s; zoom.tx = m.x - s * zoom.lx; zoom.ty = m.y - s * zoom.ly;
          applyZoom();
        } else if (e.touches.length === 1 && zoom.s > 1.01) {
          e.preventDefault();
          zoom.tx += e.touches[0].clientX - zoom.px; zoom.ty += e.touches[0].clientY - zoom.py;
          zoom.px = e.touches[0].clientX; zoom.py = e.touches[0].clientY;
          applyZoom();
        }
      }, { passive: false });
      stage.addEventListener('touchend', function(e) {
        if (e.touches.length === 0) { stage.classList.remove('zooming'); resetZoom(); }
        else if (e.touches.length === 1 && zoom.s > 1.01) { zoom.px = e.touches[0].clientX; zoom.py = e.touches[0].clientY; }
      });
      stage.addEventListener('touchcancel', function() { stage.classList.remove('zooming'); resetZoom(); });
    }

    /* ── drag-down to dismiss the sheet (from the grip) ─────────────── */
    var sy = 0, dy = 0, dragging = false, grip = $('.c-grip');
    if (grip) {
      grip.addEventListener('touchstart', function(e) {
        sy = e.touches[0].clientY; dragging = true; if (sheet) sheet.style.transition = 'none';
      }, { passive: true });
      grip.addEventListener('touchmove', function(e) {
        if (!dragging || !sheet) return;
        dy = Math.max(0, e.touches[0].clientY - sy);
        sheet.style.transform = 'translateY(' + dy + 'px)';
      }, { passive: true });
      grip.addEventListener('touchend', function() {
        dragging = false; if (!sheet) return;
        sheet.style.transition = ''; sheet.style.transform = '';
        if (dy > 90) closeSheet(); dy = 0;
      });
    }

    /* ── Escape closes whichever overlay is open ────────────────────── */
    function onEsc(e) {
      if (e.key !== 'Escape') return;
      if (sheet && sheet.classList.contains('open')) closeSheet();
      else if (aimed) clearAim();
    }
    document.addEventListener('keydown', onEsc);

    /* ── debug: append #hits to URL to reveal the touch-target layer ── */
    if (/[#&?]hits\b/.test(location.hash + location.search)) {
      var compact = $('#compact'); if (compact) compact.classList.add('show-hits');
    }

    /* ── breakpoint: crossing 1024px closes whichever overlay was open */
    var mq = window.matchMedia('(max-width:1024px)');
    function onMode() {
      if (mq.matches) {
        var gpop = document.getElementById('g-pop');
        if (gpop && gpop.classList.contains('open')) {
          gpop.classList.remove('open'); gpop.setAttribute('aria-hidden', 'true');
        }
      } else {
        if (sheet) closeSheet();
        clearAim(); resetZoom();
      }
    }
    if (mq.addEventListener) mq.addEventListener('change', onMode);
    else mq.addListener(onMode);

    return function() {
      document.removeEventListener('keydown', onEsc);
      if (mq.removeEventListener) mq.removeEventListener('change', onMode);
      else mq.removeListener(onMode);
    };
  }, []);

  return (
    <div onClick={gardenClick} onKeyUp={gardenEsc}>
      <ContentPage
        title="FiremanDecko — an amalgamation of many spores"
        description="Home-lab tinkerer, AI agent fleet operator — Athlone, Co. Westmeath. A moss-grown stone garden of projects, agents, and session ephemera."
        here="/"
        html={html}
        css={css}
      />
    </div>
  );
}

export function getStaticProps() {
  return { props: { html: readContent("index.html"), css: readContentCss("index.css") } };
}
