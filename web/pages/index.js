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
  const ent = e.target.closest('[data-pop="1"]');
  if (!ent || !ent.dataset || !ent.dataset.name) return;
  e.preventDefault();
  pop.querySelector(".gp-icon").setAttribute("src", ent.dataset.icon || "");
  pop.querySelector(".gp-name").textContent = ent.dataset.name;
  pop.querySelector(".gp-epithet").textContent = ent.dataset.epithet || "";
  pop.querySelector(".gp-marks").textContent = ent.dataset.marks || "";
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
    var SITE = '';
    var SOULS = {"firemandecko":{"n":"FiremanDecko","e":"the runemaster of the ringfort — the smith of Fionn's line","m":"the forge · Keeper of the annals","i":"deco.png","h":"/profiles/firemandecko/"},"na-seanchai":{"n":"Na Seanchaithe","e":"the tellers by the peat fire","m":"the strand · the words","i":"sean-chai.png","h":"/profiles/na-seanchai/"},"mossy":{"n":"Mossy, the Mossiah","e":"first of the name — dwelling in the mainistir","m":"cork · Keeper of the shared culture","i":"mossiah.png","h":"/profiles/mossy/"},"home-assistant-lan":{"n":"home-assistant.lan","e":"the hearthkeeper","m":"hearth · newly planted","i":"candle.png","h":"/profiles/home-assistant-lan/"},"cork":{"n":"cork","e":"the Mossiah's ground — the linux stone of the server room","m":"cork · linux · the Ground","i":"horn.png","h":"/profiles/cork/"},"moinin":{"n":"Móinín","e":"little moss — the patch on the stone beside the bog","m":"mac · darwin · Tender","i":"moinin.png","h":"/profiles/moinin/"},"seanchan":{"n":"Seanchán","e":"the little teller — big in iron, young in years","m":"mac · darwin · Teller","i":"sean-chai.png","h":"/profiles/seanchan/"},"hal-9005":{"n":"hal-9005","e":"the strong, silent one","m":"windows · gpu · Anchor","i":"hal9005.png","h":"/profiles/hal-9005/"},"fionn":{"n":"Fionn","e":"of the Salmon of Knowledge, at the bog pool","m":"the Fianna · thumb-knowledge","i":"fionn-salmon.png","h":"/profiles/fionn/"},"na-fianna":{"n":"Na Fianna","e":"the watch in the summer hills and the winter forts","m":"the band · the gates","i":"fianna-watch.png","h":"/profiles/na-fianna/"},"odin":{"n":"Odin","e":"the All-Father — on the castle tower","m":"the ledger · the hall","i":"raven.png","h":"/profiles/odin/"},"freya":{"n":"Freya","e":"the Seer of Fates — on the castle wall","m":"the ledger · the brief","i":"moon.png","h":"/profiles/freya/"},"luna":{"n":"Luna","e":"the Shaper of Worlds — on the castle wall","m":"the ledger · the shape","i":"webknot.png","h":"/profiles/luna/"},"loki":{"n":"Loki","e":"Father of the Wolf — at the castle gate","m":"the ledger · the cases","i":"wolf-coins.png","h":"/profiles/loki/"},"carlow":{"n":"Carlow","e":"the first ground — at rest","m":"first ground · at rest","i":"cauldron.png","h":"/profiles/carlow/"},"mayo":{"n":"Mayo","e":"the root ground — at rest","m":"root ground · at rest","i":"moon.png","h":"/profiles/mayo/"},"hal-9001":{"n":"hal-9001","e":"the line, first — at rest","m":"the line · first · 1968","i":"candle.png","h":"/profiles/hal-9001/"},"hal-9002":{"n":"hal-9002","e":"the line, second — at rest","m":"the line · second","i":"candle.png","h":"/profiles/hal-9002/"},"hal-9003":{"n":"hal-9003","e":"the line, third — at rest","m":"the line · third","i":"candle.png","h":"/profiles/hal-9003/"},"hal-9004":{"n":"hal-9004","e":"the line, fourth — at rest","m":"the line · fourth","i":"candle.png","h":"/profiles/hal-9004/"}};

    var $ = function(s, r) { return (r || document).querySelector(s); };
    var $$ = function(s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

    var navSheet = $('#cNav'), navBtn = $('#cNavBtn');
    var scrim = $('#cScrim'), sheet = $('#cSheet');
    var stage = $('#cStage');
    var hitBtns = $$('#compact .c-hitbtn');
    var soulGroups = $$('#compact .c-ent');

    /* ── Path-Sheet ─────────────────────────────────────────────────── */
    function openNav() {
      if (!navSheet) return;
      navSheet.hidden = false;
      requestAnimationFrame(function() { navSheet.classList.add('open'); });
      if (navBtn) navBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('c-locked');
      var c = $('.c-close', navSheet); if (c) c.focus();
    }
    function closeNav() {
      if (!navSheet) return;
      navSheet.classList.remove('open');
      if (navBtn) navBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('c-locked');
      setTimeout(function() { if (!navSheet.classList.contains('open')) navSheet.hidden = true; }, 340);
    }
    if (navBtn) navBtn.addEventListener('click', function() {
      navSheet && navSheet.classList.contains('open') ? closeNav() : openNav();
    });
    if (navSheet) {
      $$('a, .c-close', navSheet).forEach(function(a) { a.addEventListener('click', closeNav); });
    }

    /* ── bottom sheet: HALF detail only, then "the full telling →" ─── */
    var lastFocus = null;
    function openSheet(id) {
      var s = SOULS[id]; if (!s) return;
      lastFocus = document.activeElement;
      var icon = $('#cShIcon'); if (icon) icon.src = SITE + '/assets/icons/' + s.i;
      var nameEl = $('#cShName'); if (nameEl) nameEl.textContent = s.n;
      var epEl = $('#cShEp'); if (epEl) epEl.textContent = s.e;
      var marksEl = $('#cShMarks'); if (marksEl) marksEl.textContent = s.m;
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
      if (navSheet && navSheet.classList.contains('open')) closeNav();
      else if (sheet && sheet.classList.contains('open')) closeSheet();
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
        if (navSheet && navSheet.classList.contains('open')) closeNav();
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
