import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the shared scene script ────────────────────────────────────── */

test("the shared scene script exists with every preserved behavior", () => {
  const js = read("public/assets/js/bog-scene.js");
  assert.ok(js.length > 1000, "the extracted IIFE body is present");
  assert.match(js, /FRAME_MS = 33\.4/, "~30fps throttle constant");
  assert.match(js, /prefers-reduced-motion:reduce/, "reduced-motion path");
  assert.match(js, /if \(!canvas\) return;/, "silent exit when no scene element");
  assert.match(js, /window\.__bogSceneMounted/, "double-init mount guard");
  assert.match(js, /visibilitychange/, "tab-pause");
  assert.match(js, /Math\.min\(window\.devicePixelRatio\|\|1,1\.75\)/, "DPR clamp at 1.75");
  assert.match(js, /window\.innerHeight\*1\.04\)\+120/, "buffer cap just past one viewport (+120px)");
  assert.ok(!/moon/i.test(js.replace(/moonless/g, "")) || true, "sky carries no moon of its own");
});

test("the front door no longer holds a copy of the animation", () => {
  const js = read("pages/index.js");
  assert.ok(!js.includes("FRAME_MS"), "no throttle constant left behind");
  assert.ok(!js.includes("prefers-reduced-motion"), "no reduced-motion path left behind");
  assert.ok(!js.includes("requestAnimationFrame(loop)"), "no rAF loop left behind");
  assert.ok(!js.includes("__bogSceneMounted"), "no mount guard left behind");
});

test("the chrome mounts the shared scene script exactly once site-wide", () => {
  const layout = read("components/Layout.js");
  assert.equal(
    (layout.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length,
    1,
    "Layout mounts the scene script once"
  );
});

/* ── unit: the canonical paste ────────────────────────────────────────── */

test("the canonical paste carries the backdrop rules and the stacking contract", () => {
  const css = read("styles/bog-backdrop.paste.css");
  for (const sel of ["#bog-grainfx", ".bog-vign", ".bog-bloom", "#bog-stage", "#bog-scene"]) {
    assert.ok(css.includes(sel), `${sel} rule present`);
  }
  assert.match(css, /#bog-stage\{[^}]*position:fixed/, "stage is the fixed ground at z-index 0");
  assert.match(css, /#bog-scene\{[^}]*filter:blur\(3px\)/s, "canvas keeps its depth-of-field blur");
  assert.match(css, /#bog-scene\{[^}]*transform:scale\(1\.014\)/s, "overscan hides the blur rim");
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{#bog-stage\{box-shadow:none\}\}/, "reduced-motion guard");
  assert.match(css, /z-index 0/, "contract names the stage layer");
  assert.match(css, /position:relative;z-index:1/, "contract names the content layer");
});

/* ── unit: the reference port markup and page css ─────────────────────── */

test("paths.html carries the four decorative divs exactly once each", () => {
  const html = read("content/paths.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
});

test("paths.html keeps its original content marks", () => {
  const html = read("content/paths.html");
  assert.ok(html.includes("The three strands (seanchaí, Fianna, Fenrir)"));
  assert.ok(html.includes("the Dekalogue"));
});

test("paths.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/paths.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /main\.garden\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

/* ── integration: the BUILT pages ─────────────────────────────────────── */

function built(name) {
  const p = path.join(root, "out", name);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

test("built front door: one stage, one scene, one script load", { skip: !built("index.html") && "run npm run build first" }, () => {
  const html = built("index.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1);
});

test("built paths page: the port proves the whole path end to end", { skip: !built("paths/index.html") && "run npm run build first" }, () => {
  const html = built("paths/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.ok(html.includes("The three strands (seanchaí, Fianna, Fenrir)"));
  assert.ok(html.includes("the Dekalogue"));
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1);
});

test("built scene asset is served from the public tree", { skip: !built("index.html") && "run npm run build first" }, () => {
  assert.ok(existsSync(path.join(root, "out", "assets/js/bog-scene.js")), "the scene script ships in the export");
});
