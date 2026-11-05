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
  assert.ok(js.includes('className="c-navsheet"'), "path-sheet present");
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
  assert.match(css, /@media \(max-width:1024px\)\{[^]*\.topbar\{display:none\}/, "topbar hidden at the breakpoint");
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
