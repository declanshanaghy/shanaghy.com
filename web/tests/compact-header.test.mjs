import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the shared Header renders both chrome layers ────────────────── */

test("the shared Header renders the desktop topbar AND the compact bar + path-sheet", () => {
  const js = read("components/Header.js");
  // desktop chrome, unchanged
  assert.ok(js.includes('className="topbar"'), "desktop topbar kept");
  assert.ok(js.includes('className="toplinks"'), "desktop toplinks kept");
  assert.ok((js.match(/className=\{"tlink"/g) || []).length === 1, "tlink render kept");
  // compact chrome, ported from the homepage
  assert.ok(js.includes('className="c-bar"'), "compact bar present");
  assert.ok(js.includes('id="cNavBtn"'), "burger button keeps its id");
  assert.ok(js.includes('className="c-burger"'), "burger glyph present");
  assert.ok(js.includes('aria-expanded'), "burger carries aria-expanded");
  assert.ok(js.includes('aria-controls="cNav"'), "burger controls the sheet");
  assert.match(js, /className=\{"c-navsheet" \+ \(open \? " open" : ""\)\}/, "path-sheet present, open class rendered from state");
  assert.ok(js.includes('className="c-nav-grid"'), "2-col nav grid present");
  assert.ok(js.includes('className="c-close"'), "sheet close button present");
  assert.ok(js.includes('aria-label="close the paths"'), "close button labelled");
});

test("the shared Header carries all seven paths with runes and plate names", () => {
  const js = read("components/Header.js");
  for (const href of ["/", "/creed/", "/projects/", "/sites/", "/videos/", "/sessions/", "/profiles/"]) {
    assert.ok(js.includes(`href: "${href}"`), `NAV carries ${href}`);
  }
  for (const rune of ["ᚌ", "ᚄ", "ᚐ", "ᚉ", "ᚘ", "ᚊ", "ᚋ"]) {
    assert.ok(js.includes(rune), `plate rune ${rune} present`);
  }
  for (const plate of ["The Garden", "The Creed", "The Stones", "The RingForts", "The Towers", "The Ballads", "Na Tuatha"]) {
    assert.ok(js.includes(`"${plate}"`), `plate name ${plate} present`);
  }
});

test("the shared Header owns the sheet behaviour the homepage had", () => {
  const js = read("components/Header.js");
  assert.ok(js.includes('c-locked'), "scroll lock via body.c-locked");
  assert.ok(js.includes("Escape"), "Escape closes the sheet");
  assert.ok(js.includes("(max-width:1024px)"), "crossing the breakpoint closes the sheet");
  assert.ok(js.includes("requestAnimationFrame"), "open slides in on the next frame");
  assert.ok(js.includes("340"), "close re-hides after the slide");
  assert.ok(js.includes(".focus()"), "focus is managed (close on open, burger on close)");
  assert.ok(js.includes('hidden={!shown}'), "the sheet starts hidden");
});

test("the shared Header marks the current page in both layers", () => {
  const js = read("components/Header.js");
  assert.match(js, /"tlink" \+ \(here === n\.href \? " here" : ""\)/, "desktop tlink.here");
  assert.match(js, /"c-plate" \+ \(here === n\.href \? " here" : ""\)/, "mobile c-plate.here");
  assert.match(js, /className="c-here"/, "compact bar shows the current section");
});

/* ── unit: the shared stylesheet is the one source of the header css ───── */

test("the shared compact-header css carries the ported rules verbatim", () => {
  const css = read("styles/compact-header.css");
  assert.ok(css.includes(".c-bar{display:none}"), "compact bar desktop-hidden");
  assert.match(css, /@media \(max-width:1024px\)\{[^]*body \.topbar\{display:none\}/, "topbar hidden at the breakpoint, body-scoped to outrank page css (issue #282)");
  assert.match(css, /\.c-bar\{position:sticky;top:0;z-index:60/, "sticky compact bar");
  assert.match(css, /\.c-navsheet\{position:fixed;inset:0;z-index:80/, "fixed path-sheet");
  assert.match(css, /transform:translateY\(-101%\);transition:transform \.32s/, "slide-in transition");
  assert.match(css, /\.c-nav-grid\{display:grid;grid-template-columns:1fr 1fr/, "2-col tap-target grid");
  assert.ok(css.includes(".c-plate.here{"), "current page's plate glows at rest");
  assert.ok(css.includes("body.c-locked{overflow:hidden}"), "scroll lock");
  assert.match(css, /@media \(max-width:1024px\) and \(hover:hover\)/, "hover hints pointer-gated");
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{[^]*\.c-navsheet\{transition-duration:\.01ms/, "reduced-motion guard");
  assert.match(css, /\.c-bar,\.c-navsheet\{font-size:16px;--c-tap:44px/, "tokens re-rooted for the shared chrome");
});

test("the app mounts the shared stylesheet exactly once", () => {
  const app = read("pages/_app.js");
  assert.equal(
    (app.match(/import "\.\.\/styles\/compact-header\.css"/g) || []).length,
    1,
    "_app imports the shared compact-header css once"
  );
});

/* ── unit: the homepage delegates to the shared implementation ─────────── */

test("the homepage no longer carries its own compact bar or path-sheet markup", () => {
  const html = read("content/index.html");
  assert.ok(!html.includes('id="cNavBtn"'), "no private burger button");
  assert.ok(!html.includes('id="cNav"'), "no private navsheet");
  assert.ok(!html.includes('class="c-bar"'), "no private compact bar");
  assert.ok(!html.includes('class="c-plate'), "no private nav plates");
  assert.ok(html.includes('id="cSheet"'), "the compact bottom sheet stays");
  assert.ok(html.includes('id="cStage"'), "the living scene stays");
});

test("the homepage script no longer wires the path-sheet", () => {
  const js = read("pages/index.js");
  assert.ok(!js.includes("cNav"), "no #cNav lookups");
  assert.ok(!js.includes("cNavBtn"), "no #cNavBtn lookups");
  assert.ok(!js.includes("openNav"), "no private openNav");
  assert.ok(!js.includes("closeNav"), "no private closeNav");
  assert.ok(js.includes("closeSheet"), "the soul sheet wiring stays");
});

test("index.css keeps its compact content rules but not the header rules", () => {
  const css = read("content/index.css");
  // the header rules were 2-space indented inside the compact media block;
  // compound content selectors (.c-sh-quick .c-btn) are the sheet's, not the header's
  for (const gone of [".c-bar{", ".c-brand{", ".c-here{", ".c-burger{", ".c-navsheet{",
                      ".c-nav-grid{", ".c-plate{", ".c-ns-foot{", ".c-ns-note{",
                      "body.c-locked{", ".c-btn--menu{", ".c-plate:hover", ".c-plate.here{"]) {
    assert.ok(!css.includes(gone), `${gone} header rule lifted out of index.css`);
  }
  assert.ok(!/\n\s+\.c-btn\{/.test(css), ".c-btn{ base rule lifted out of index.css");
  assert.ok(!/\n\s+\.c-close\{/.test(css), ".c-close{ base rule lifted out of index.css");
  for (const kept of [".c-stage{", ".c-sheet{", ".c-scrim{", ".c-hitbtn{", ".foot{display:none}"]) {
    assert.ok(css.includes(kept), `${kept} compact-content rule kept`);
  }
  assert.ok(!css.includes(".topbar{display:none}"), "topbar hiding is the shared stylesheet's now");
});

/* ── regression: issue #282 — the two bugs PR #281 let slip ──────────────── */

/* css specificity: (ids, classes/attrs/pseudo-classes, types) — a later rule
   in the cascade only wins over an earlier one of GREATER-OR-EQUAL specificity */
function specificity(sel) {
  const ids = (sel.match(/#[\w-]+/g) || []).length;
  const classes = (sel.match(/[.:][\w-]+|\[[^\]]*\]/g) || []).length;
  const types = (sel
    .replace(/#[\w-]+|[.:][\w-]+|\[[^\]]*\]/g, "")
    .match(/(^|[\s>+~])([a-zA-Z][\w-]*)/g) || []).length;
  return [ids, classes, types];
}
const greaterSpec = (a, b) =>
  a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] > b[2];

test("issue #282 · the topbar hide rule outranks every page stylesheet in BOTH load orders", () => {
  const shared = read("styles/compact-header.css");
  const media = shared.match(/@media \(max-width:1024px\)\{([\s\S]*?)\n\}/);
  assert.ok(media, "the ≤1024px media block exists");
  const hide = media[1].match(/(?:^|\n)\s*([^{}\n]+?)\{display:none\}/);
  assert.ok(hide, "a display:none hide rule exists inside the ≤1024px media block");
  assert.equal(hide[1], "body .topbar", "the hide rule is body-scoped (0,1,1)");
  assert.ok(greaterSpec(specificity(hide[1]), specificity(".topbar")),
    "hide specificity strictly beats a plain .topbar page rule");

  // every page still ships its own base .topbar rule; Next.js injects the page
  // chunk AFTER the app chunk, so the hide must win on specificity alone
  for (const page of ["creed", "sessions", "sites", "profiles", "index", "ogham", "paths", "videos"]) {
    const css = read(`content/${page}.css`);
    const base = css.match(/(?:^|\n)[ \t]*(\.topbar)\s*\{/);
    if (!base) continue; // this page never styled the topbar itself
    // order 1: page css after app css (the live, broken order from #281)
    assert.ok(!greaterSpec(specificity(base[1]), specificity(hide[1])),
      `${page}.css .topbar cannot out-rank the hide when loaded after the app css`);
    // order 2: page css before app css — the hide still wins
    assert.ok(greaterSpec(specificity(hide[1]), specificity(base[1])),
      `${page}.css .topbar is out-ranked when loaded before the app css too`);
  }
});

/* ── regression: issue #284 — the first tap was swallowed on the homepage ── */

test("issue #284 · the open commit cannot be cancelled by an effect teardown", () => {
  const js = read("components/Header.js");
  // the slide-in rAF commits the open state directly, inside the [shown] effect
  assert.ok(js.includes("requestAnimationFrame(() => setOpen(true))"),
    "the rAF commits open directly");
  assert.ok(!js.includes("cancelAnimationFrame"),
    "nothing in the Header can cancel a pending open/close — the old cleanup's cancelAnimationFrame is what stranded the sheet (issue #284)");
  // the [shown] effect must carry NO cleanup: a teardown between the tap and
  // the frame used to discard the pending setOpen, leaving the sheet un-hidden
  // but translated off-screen — first tap gone, second tap needed
  const eff = js.match(/useEffect\(\(\) => \{\s*if \(!shown\) return;[\s\S]*?\}, \[shown\]\);/);
  assert.ok(eff, "the [shown] effect exists");
  assert.ok(!eff[0].includes("return () =>"),
    "the [shown] effect has no cleanup — no teardown can discard the open commit");
  assert.ok(eff[0].includes('document.body.classList.add("c-locked")'),
    "the open path still locks the body from the effect");
});

test("issue #284 · the pending re-hide is token-guarded, so a mid-close reopen wins", () => {
  const js = read("components/Header.js");
  assert.ok(js.includes("closeTokRef"), "the close carries a token");
  assert.match(js, /const tok = \+\+closeTokRef\.current;/,
    "each close takes a fresh token");
  assert.match(js, /if \(closeTokRef\.current === tok\) setShown\(false\)/,
    "the re-hide only fires for the LATEST close");
  assert.match(js, /closeTokRef\.current\+\+;[^\n]*pending re-hide is void/,
    "opening the sheet voids any pending re-hide");
  // replay the hazard the old clearTimeout-cleanup papered over: close, then
  // reopen inside the 340ms window — the stale timer must be a no-op
  let shown = true;
  let tok = 0;
  let pending = null;
  const closePath = () => { tok = tok + 1; pending = { fires: () => { if (tok === pending.staleTok) shown = false; }, staleTok: tok }; };
  const openSheetPath = () => { tok = tok + 1; if (!shown) { shown = true; return; } };
  closePath();          // sheet closing; a 340ms re-hide is scheduled
  openSheetPath();       // reopened before the re-hide fires — token moves on
  pending.fires();       // the stale 340ms timer fires anyway
  assert.equal(shown, true, "mid-close reopen: the stale re-hide is void, the sheet stays laid out");
});

/* ── (kept) issue #282 — the open class rendered from state ─────────────── */

test("issue #282 · the open class is rendered from state, so React's re-render preserves it", () => {
  const js = read("components/Header.js");
  // the class must come from the render (state-driven), never from an
  // imperative classList write a re-render would wipe
  const m = js.match(/className=\{("c-navsheet" \+ \(open \? " open" : ""\))\}/);
  assert.ok(m, "the sheet's className is computed from the open state");
  const classNameFor = new Function("open", "return " + m[1]);
  assert.equal(classNameFor(false), "c-navsheet", "closed render: no open class");
  assert.equal(classNameFor(true), "c-navsheet open", "open render: the open class rides along");
  // reconciliation replay: state flips shown→open→closed; every re-render
  // recomputes className from that same state, so the open class survives
  const frames = [
    { shown: false, open: false }, // initial
    { shown: true, open: false },  // burger tap: un-hidden, laid out
    { shown: true, open: true },   // next frame: slides in — open PRESENT after the re-render
    { shown: true, open: false },  // close tap: slides out
  ];
  for (const f of frames) {
    const cls = classNameFor(f.open);
    assert.ok(cls.startsWith("c-navsheet"), "base class kept through the re-render");
    assert.equal(cls.includes(" open"), f.open, `open class ${f.open ? "present" : "absent"} when open=${f.open}`);
  }
  // nothing imperative can clobber it: the sheet's class is only ever React's
  assert.ok(!/classList\.(add|remove|toggle)\("open"\)/.test(js),
    "no imperative classList write touches the open class");
  assert.match(js, /aria-expanded=\{open \? "true" : "false"\}/,
    "aria-expanded reads the same state as the class");
});
