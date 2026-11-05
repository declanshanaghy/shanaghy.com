/* ═══════════════════════════════════════════════════════════════════════════
   shanaghy.com — prototype behaviour (v3 · Luna)
   TWO MODES, ONE FILE:
     LARGE   (#large)   — the shipped front door: the scene's own popover
                          (HALF detail only), the scripted reveal.
     COMPACT (#compact) — the LINEAR-SCALED scene with a touch interaction
                          model that needs NO hover anywhere:
                            · souls glow AT REST (no hover needed to read them)
                            · two-tap AIM  → bottom sheet   (the fake-mouseover)
                            · Soul Roll chips → bottom sheet in one tap
                            · pinch-to-zoom (opt-in) that springs back
                          plus the Path-Sheet and the drag-dismissible sheet.
   The mode is chosen by WIDTH alone (@media 1024px); no JS decides layout.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;

  /* ══════════════ LARGE MODE — the shipped popover + reveal ══════════════ */
  var gpop = $('#g-pop');
  var largeOpen = null;
  function openPop(el) {
    largeOpen = el;
    $('.gp-name', gpop).textContent = el.dataset.name || '';
    $('.gp-epithet', gpop).textContent = el.dataset.epithet || '';
    $('.gp-marks', gpop).textContent = el.dataset.marks || '';
    $('.gp-icon', gpop).src = el.dataset.icon || '';
    $('.gp-full', gpop).setAttribute('href', el.getAttribute('href'));
    gpop.classList.add('open');
    body.classList.add('c-locked');
    var c = $('.gp-close', gpop); if (c) c.focus();
  }
  function closePop() {
    gpop.classList.remove('open');
    body.classList.remove('c-locked');
    if (largeOpen && largeOpen.focus) largeOpen.focus();
    largeOpen = null;
  }
  $$('#large .g-ent[data-pop]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openPop(el); });
  });
  if (gpop) {
    gpop.addEventListener('click', function (e) {
      if (e.target === gpop || e.target.hasAttribute('data-popclose')) closePop();
    });
  }

  /* the scripted reveal (.rise) — the shipped front door's IntersectionObserver */
  var riseEls = $$('#large .rise');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    riseEls.forEach(function (el) { io.observe(el); });
  } else {
    riseEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* the compact layer exists only ≤1024px; guard everything on it */
  var navSheet = $('#cNav'), navBtn = $('#cNavBtn');
  var scrim = $('#cScrim'), sheet = $('#cSheet');
  var stage = $('#cStage');
  var hitBtns = $$('#compact .c-hitbtn');
  var soulGroups = $$('#compact .c-ent');           /* the painted SVG souls */

  /* ── the Path-Sheet ─────────────────────────────────────────────────── */
  function openNav() {
    navSheet.hidden = false;
    requestAnimationFrame(function () { navSheet.classList.add('open'); });
    navBtn.setAttribute('aria-expanded', 'true');
    body.classList.add('c-locked');
    var c = $('.c-close', navSheet); if (c) c.focus();
  }
  function closeNav() {
    navSheet.classList.remove('open');
    navBtn.setAttribute('aria-expanded', 'false');
    body.classList.remove('c-locked');
    setTimeout(function () { if (!navSheet.classList.contains('open')) navSheet.hidden = true; }, 340);
  }
  if (navBtn) navBtn.addEventListener('click', function () {
    navSheet.classList.contains('open') ? closeNav() : openNav();
  });
  if (navSheet) {
    $$('a, .c-close', navSheet).forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* ── the bottom sheet: HALF detail only, then "the full telling →" ───── */
  var lastFocus = null;
  function openSheet(id) {
    var s = SOULS[id]; if (!s) return;
    lastFocus = document.activeElement;
    $('#cShIcon').src = SITE + '/assets/icons/' + s.i;
    $('#cShName').textContent = s.n;
    $('#cShEp').textContent = s.e;
    $('#cShMarks').textContent = s.m;
    $('#cShFull').setAttribute('href', SITE + s.h);
    scrim.classList.add('open'); sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    body.classList.add('c-locked');
    soulGroups.forEach(function (g) { g.classList.toggle('pulse', g.dataset.s === id); });
    setTimeout(function () { var c = $('.c-close', sheet); if (c) c.focus(); }, 170);
  }
  function closeSheet() {
    scrim.classList.remove('open'); sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    body.classList.remove('c-locked');
    soulGroups.forEach(function (g) { g.classList.remove('pulse'); });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (scrim) scrim.addEventListener('click', closeSheet);
  if (sheet) {
    $$('.c-close', sheet).forEach(function (b) { b.addEventListener('click', closeSheet); });
  }

  /* ══════════════ THE TOUCH INTERACTION MODEL (no hover anywhere) ═══════════
     At 412px a painted soul is ~19px tall — too small to tap reliably and the
     enlarged 48px hit circles overlap on a scene this dense.  So taps are
     resolved to the NEAREST SOUL at the tap point (a deterministic, overlap-
     proof rule), and acting on a soul is a TWO-TAP AIM:
       tap near a soul        → AIM   (soul glows harder + its name tag shows)
       tap the same soul/tag  → OPEN  (the bottom sheet)
       tap empty scene        → drop the aim
     The Soul Roll chips skip the aim step and open in one tap — the guarantee. */

  /* soul positions as fractions of the 900×480 scene (exact: the scene scales
     linearly, so a soul's fractional position is constant at every width) */
  var spots = hitBtns.map(function (b) {
    return { s: b.dataset.s, el: b,
      x: parseFloat(b.getAttribute('data-x')) / 100,
      y: parseFloat(b.getAttribute('data-y')) / 100 };
  });
  var aimed = null;
  function groupFor(id) { for (var i = 0; i < soulGroups.length; i++) if (soulGroups[i].dataset.s === id) return soulGroups[i]; return null; }

  function setAim(spot) {
    aimed = spot;
    spots.forEach(function (p) { p.el.classList.toggle('aim', p === spot); });
    soulGroups.forEach(function (g) { g.classList.toggle('aim', !!spot && g.dataset.s === spot.s); });
  }
  function clearAim() { setAim(null); }

  /* nearest soul to a normalised point, measured in scene units (900×480) */
  function nearest(nx, ny) {
    var best = null, bd = Infinity;
    spots.forEach(function (p) {
      var dx = (nx - p.x) * 900, dy = (ny - p.y) * 480;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = p; }
    });
    return { spot: best, d: bd };
  }

  if (stage) {
    stage.addEventListener('click', function (e) {
      if (zoom.s > 1.01) return;                       /* zoomed: not aiming */
      var r = stage.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      var limitPx = 48, limitUnits = limitPx / (r.width / 900);
      var n = (nx < -0.03 || nx > 1.03 || ny < -0.06 || ny > 1.06) ? { spot: null, d: Infinity } : nearest(nx, ny);
      if (!n.spot || n.d > limitUnits) { clearAim(); return; }
      if (aimed && aimed.s === n.spot.s) { openSheet(n.spot.s); return; }
      setAim(n.spot);
    });
  }

  /* the roll chips open the sheet directly — no aim step */
  $$('#compact .c-chip').forEach(function (c) {
    c.addEventListener('click', function () { openSheet(c.dataset.s); });
  });

  /* keyboard: focusing a soul button aims it (its tag shows); Enter opens */
  hitBtns.forEach(function (b) {
    b.addEventListener('focus', function () {
      for (var i = 0; i < spots.length; i++) if (spots[i].el === b) setAim(spots[i]);
    });
    b.addEventListener('blur', function () { if (aimed && aimed.el === b) clearAim(); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); openSheet(b.dataset.s); }
    });
  });

  /* ══════════════ PINCH-TO-ZOOM (opt-in; the garden always rests whole) ═════════
     The resting state is the WHOLE painting at 1:1 with the viewport.  Two
     fingers zoom (1×–4×) about the pinch midpoint; releasing lets the garden
     settle back to rest.  While zoomed, one finger pans.  The scene never
     crops at rest, so this is pure opt-in exploration. */
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
    var dist = function (a, b) { var dx = a.clientX - b.clientX, dy = a.clientY - b.clientY; return Math.hypot(dx, dy); };
    var mid = function (a, b) { var r = stage.getBoundingClientRect(); return { x: (a.clientX + b.clientX) / 2 - r.left, y: (a.clientY + b.clientY) / 2 - r.top }; };
    stage.addEventListener('touchstart', function (e) {
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
    stage.addEventListener('touchmove', function (e) {
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
    stage.addEventListener('touchend', function (e) {
      if (e.touches.length === 0) { stage.classList.remove('zooming'); resetZoom(); }
      else if (e.touches.length === 1 && zoom.s > 1.01) { zoom.px = e.touches[0].clientX; zoom.py = e.touches[0].clientY; }
    });
    stage.addEventListener('touchcancel', function () { stage.classList.remove('zooming'); resetZoom(); });
  }

  /* ══════════════ drag-down to dismiss the sheet (from the grip) ═════════ */
  var sy = 0, dy = 0, dragging = false, grip = $('.c-grip');
  if (grip) {
    grip.addEventListener('touchstart', function (e) {
      sy = e.touches[0].clientY; dragging = true; if (sheet) sheet.style.transition = 'none';
    }, { passive: true });
    grip.addEventListener('touchmove', function (e) {
      if (!dragging || !sheet) return;
      dy = Math.max(0, e.touches[0].clientY - sy);
      sheet.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: true });
    grip.addEventListener('touchend', function () {
      dragging = false; if (!sheet) return;
      sheet.style.transition = ''; sheet.style.transform = '';
      if (dy > 90) closeSheet(); dy = 0;
    });
  }

  /* Escape closes whatever is open (either mode) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (navSheet && navSheet.classList.contains('open')) closeNav();
    else if (sheet && sheet.classList.contains('open')) closeSheet();
    else if (gpop && gpop.classList.contains('open')) closePop();
    else if (aimed) clearAim();
  });

  /* reveal the touch targets for review: append #hits to the url */
  if (/[#&?]hits\b/.test(location.hash + location.search)) $('#compact').classList.add('show-hits');

  /* crossing the breakpoint closes whichever overlay was open */
  var mq = window.matchMedia('(max-width:1024px)');
  function onMode() {
    if (mq.matches) { if (gpop) closePop(); }
    else { if (sheet) closeSheet(); if (navSheet && navSheet.classList.contains('open')) closeNav(); clearAim(); resetZoom(); }
  }
  (mq.addEventListener ? mq.addEventListener('change', onMode) : mq.addListener(onMode));
})();
