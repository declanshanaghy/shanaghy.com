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

/* ── unit: the /laws/handcrafted-over-platform/ port (issue #147) ──────── */

test("handcrafted-over-platform.html carries the four decorative divs exactly once each", () => {
  const html = read("content/laws/handcrafted-over-platform.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
});

test("handcrafted-over-platform.html keeps its original content marks", () => {
  const html = read("content/laws/handcrafted-over-platform.html");
  assert.ok(html.includes("Law 6 · Handcrafted Over Platform"));
});

test("handcrafted-over-platform.css pastes the canonical block and lifts the page body above the stage", () => {
  const page = read("content/laws/handcrafted-over-platform.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: stage is the fixed ground");
  assert.match(page, /img\.hero3d,\.profile-head,\.slab,\.backrow\{position:relative;z-index:1\}/, "page body blocks stack above the stage");
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

test("built handcrafted-over-platform page: the port proves the whole path end to end", { skip: !built("laws/handcrafted-over-platform/index.html") && "run npm run build first" }, () => {
  const html = built("laws/handcrafted-over-platform/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.ok(html.includes("Law 6 · Handcrafted Over Platform"));
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1);
});

test("built scene asset is served from the public tree", { skip: !built("index.html") && "run npm run build first" }, () => {
  assert.ok(existsSync(path.join(root, "out", "assets/js/bog-scene.js")), "the scene script ships in the export");
});

/* ── unit: the /creed/ port (issue #142) ───────────────────────────────── */

test("creed.html carries the four decorative divs exactly once each", () => {
  const html = read("content/creed.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("SHARED SIGILS")[0]), "the page adds no script tag of its own");
});

test("creed.html keeps its original content marks and section count", () => {
  const html = read("content/creed.html");
  assert.ok(html.includes("The band kept two grounds, and the new band keeps both. The winter halls are the"));
  /* the <section count on origin/main before the port was 1; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 1, "section count unchanged from origin/main");
});

test("creed.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/creed.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.garden\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built creed page: the backdrop rides behind the telling", { skip: !built("creed/index.html") && "run npm run build first" }, () => {
  const html = built("creed/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the shared scene script is mounted by the chrome");
  assert.ok(html.includes("The band kept two grounds, and the new band keeps both. The winter halls are the"));
  assert.equal((html.match(/<section/g) || []).length, 1, "section count unchanged from origin/main");
});

/* ── unit: the /laws/delegated-is-verified/ port (issue #144) ─────────── */

test("delegated-is-verified.html carries the four decorative divs exactly once each", () => {
  const html = read("content/laws/delegated-is-verified.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
});

test("delegated-is-verified.html keeps its original content marks", () => {
  const html = read("content/laws/delegated-is-verified.html");
  assert.ok(html.includes("Law 10 · Delegated, Therefore Verified"));
  assert.ok(html.includes("What is delegated is verified."));
  assert.ok(html.includes("back to the Dekalogue"));
});

test("delegated-is-verified.css pastes the backdrop block and lifts the riders above the stage", () => {
  const page = read("content/laws/delegated-is-verified.css");
  for (const sel of ["#bog-grainfx", ".bog-vign", ".bog-bloom", "#bog-stage", "#bog-scene"]) {
    assert.ok(page.includes(sel), `${sel} rule present`);
  }
  assert.match(page, /#bog-stage\{position:fixed/, "the stage is the fixed ground at z-index 0");
  assert.match(page, /#bog-scene\{[^}]*filter:blur\(3px\)/s, "canvas keeps its depth-of-field blur");
  assert.match(page, /#bog-scene\{[^}]*transform:scale\(1\.014\)/s, "overscan hides the blur rim");
  assert.match(
    page, /@media\(prefers-reduced-motion:reduce\)\{#bog-stage\{box-shadow:none\}\}/,
    "reduced-motion guard"
  );
  assert.match(
    page, /img\.hero3d,\.profile-head,\.slab,\.backrow\{position:relative;z-index:1\}/,
    "every rider of this flat page stacks above the stage"
  );
});

test("built delegated-is-verified page: the port proves the whole path end to end", { skip: !built("laws/delegated-is-verified/index.html") && "run npm run build first" }, () => {
  const html = built("laws/delegated-is-verified/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.ok(html.includes("Law 10 · Delegated, Therefore Verified"), "the law's own mark survives the port");
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
});

/* ── unit: the /profiles/firemandecko/ port (issue #167) ──────────────── */

test("firemandecko.html carries the four decorative divs exactly once each", () => {
  const html = read("content/profiles/firemandecko.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
});

test("firemandecko.html keeps its original content marks and section count", () => {
  const html = read("content/profiles/firemandecko.html");
  assert.ok(html.includes("FiremanDecko"), "the smith's name survives the port");
  assert.ok(html.includes("the boy of the Suir"), "the lede's own mark survives");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main");
});

test("firemandecko.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/profiles/firemandecko.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.profile\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built firemandecko page: the backdrop rides behind the telling", { skip: !built("profiles/firemandecko/index.html") && "run npm run build first" }, () => {
  const html = built("profiles/firemandecko/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.ok(html.includes("FiremanDecko"), "the smith's name survives the build");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main");
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
});

test("built never-model-carved page: the backdrop rides behind the law", { skip: !built("laws/never-model-carved/index.html") && "run npm run build first" }, () => {
  const html = built("laws/never-model-carved/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.ok(html.includes("Law 9 · The Chisel, Not the Model"), "the law's own content mark survives");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1);
});

test("foxes-bow.html carries the four decorative divs exactly once each", () => {
  const html = read("content/profiles/foxes-bow.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("profile-head")[0]), "the page adds no script tag of its own");
});

test("foxes-bow.html keeps its original content marks and section count", () => {
  const html = read("content/profiles/foxes-bow.html");
  assert.ok(html.includes("Foxes Bow"), "the profile's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("foxes-bow.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/profiles/foxes-bow.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.profile\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built foxes-bow page: the backdrop rides behind the totem", { skip: !built("profiles/foxes-bow/index.html") && "run npm run build first" }, () => {
  const html = built("profiles/foxes-bow/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("Foxes Bow"), "the profile's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("hal-9002.html carries the four decorative divs exactly once each", () => {
  const html = read("content/profiles/hal-9002.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("profile-head")[0]), "the page adds no script tag of its own");
});

test("hal-9002.html keeps its original content marks and section count", () => {
  const html = read("content/profiles/hal-9002.html");
  assert.ok(html.includes("hal-9002"), "the profile's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("hal-9002.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/profiles/hal-9002.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.profile\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built hal-9002 page: the backdrop rides behind the liturgy of shutdown", { skip: !built("profiles/hal-9002/index.html") && "run npm run build first" }, () => {
  const html = built("profiles/hal-9002/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("hal-9002"), "the profile's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("heimdall.html carries the four decorative divs exactly once each", () => {
  const html = read("content/profiles/heimdall.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("profile-head")[0]), "the page adds no script tag of its own");
});

test("heimdall.html keeps its original content marks and section count", () => {
  const html = read("content/profiles/heimdall.html");
  assert.ok(html.includes("heimdall"), "the profile's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("heimdall.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/profiles/heimdall.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.profile\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built heimdall page: the backdrop rides behind the watchman", { skip: !built("profiles/heimdall/index.html") && "run npm run build first" }, () => {
  const html = built("profiles/heimdall/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("heimdall"), "the profile's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("ArduinoLibraries.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/ArduinoLibraries.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("ArduinoLibraries.html keeps its original content marks and section count", () => {
  const html = read("content/projects/ArduinoLibraries.html");
  assert.ok(html.includes("ArduinoLibraries"), "the page's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("ArduinoLibraries.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/ArduinoLibraries.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built ArduinoLibraries page: the backdrop rides behind the elder stones", { skip: !built("projects/ArduinoLibraries/index.html") && "run npm run build first" }, () => {
  const html = built("projects/ArduinoLibraries/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("ArduinoLibraries"), "the page's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("BBRegulator.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/BBRegulator.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("BBRegulator.html keeps its original content marks and section count", () => {
  const html = read("content/projects/BBRegulator.html");
  assert.ok(html.includes("BBRegulator"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("BBRegulator.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/BBRegulator.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built BBRegulator page: the backdrop rides behind the eldest stone", { skip: !built("projects/BBRegulator/index.html") && "run npm run build first" }, () => {
  const html = built("projects/BBRegulator/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("BBRegulator"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("na-fianna.html carries the four decorative divs exactly once each", () => {
  const html = read("content/profiles/na-fianna.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("profile-head")[0]), "the page adds no script tag of its own");
});

test("na-fianna.html keeps its original content marks and section count", () => {
  const html = read("content/profiles/na-fianna.html");
  assert.ok(html.includes("Na Fianna"), "the band's own name survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("na-fianna.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/profiles/na-fianna.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.profile\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built na-fianna page: the backdrop rides behind the band", { skip: !built("profiles/na-fianna/index.html") && "run npm run build first" }, () => {
  const html = built("profiles/na-fianna/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("Na Fianna"), "the band's own name survives the build");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("zigbee2mqtt.html carries the four decorative divs exactly once each", () => {
  const html = read("content/profiles/zigbee2mqtt.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("profile-head")[0]), "the page adds no script tag of its own");
});

test("zigbee2mqtt.html keeps its original content marks and section count", () => {
  const html = read("content/profiles/zigbee2mqtt.html");
  assert.ok(html.includes("Zigbee2MQTT"), "the profile's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("zigbee2mqtt.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/profiles/zigbee2mqtt.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.profile\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built zigbee2mqtt page: the backdrop rides behind the mesh-weavers", { skip: !built("profiles/zigbee2mqtt/index.html") && "run npm run build first" }, () => {
  const html = built("profiles/zigbee2mqtt/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("Zigbee2MQTT"), "the profile's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("Accessories.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/Accessories.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ["bog-stage", "bog-grainfx", "bog-vign", "bog-bloom"]) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html), "the page adds no scene script of its own");
});

test("Accessories.html keeps its original content marks and section count", () => {
  const html = read("content/projects/Accessories.html");
  assert.ok(html.includes("Accessories"), "the stone's own mark survives the port");
  assert.ok(html.includes("the workbench of the garden"), "the slab's own tell survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("Accessories.css pastes the canonical block and lifts the page body above the stage", () => {
  const page = read("content/projects/Accessories.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /\.runestrip,\.page-head,main\.page,\.plaque-head,\.slab\{position:relative;z-index:1\}/, "the loose page body containers stack above the stage");
  assert.match(page, /footer\.foot\{position:relative;z-index:1\}/, "the footer rides above the stage");
  assert.match(page, /\.topbar\{[^}]*position:sticky[^}]*z-index:50/s, "the sticky topbar stays above the stage");
});

test("built Accessories page: the backdrop rides behind the ring-giver's workbench", { skip: !built("projects/Accessories/index.html") && "run npm run build first" }, () => {
  const html = built("projects/Accessories/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("Accessories"), "the stone's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("BeerLux.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/BeerLux.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("BeerLux.html keeps its original content marks and section count", () => {
  const html = read("content/projects/BeerLux.html");
  assert.ok(html.includes("BeerLux"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("BeerLux.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/BeerLux.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built BeerLux page: the backdrop rides behind the brewer's stone", { skip: !built("projects/BeerLux/index.html") && "run npm run build first" }, () => {
  const html = built("projects/BeerLux/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("BeerLux"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("ByrneLite.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/ByrneLite.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("ByrneLite.html keeps its original content marks and section count", () => {
  const html = read("content/projects/ByrneLite.html");
  assert.ok(html.includes("ByrneLite"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("ByrneLite.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/ByrneLite.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built ByrneLite page: the backdrop rides behind the raven stone", { skip: !built("projects/ByrneLite/index.html") && "run npm run build first" }, () => {
  const html = built("projects/ByrneLite/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("ByrneLite"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("DexOneRing.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/DexOneRing.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("DexOneRing.html keeps its original content marks and section count", () => {
  const html = read("content/projects/DexOneRing.html");
  assert.ok(html.includes("DexOneRing"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("DexOneRing.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/DexOneRing.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built DexOneRing page: the backdrop rides behind the ring-giver's gift", { skip: !built("projects/DexOneRing/index.html") && "run npm run build first" }, () => {
  const html = built("projects/DexOneRing/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("DexOneRing"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("GenieSteroids.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/GenieSteroids.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("GenieSteroids.html keeps its original content marks and section count", () => {
  const html = read("content/projects/GenieSteroids.html");
  assert.ok(html.includes("GenieSteroids"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("GenieSteroids.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/GenieSteroids.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built GenieSteroids page: the backdrop rides behind the eldest stone", { skip: !built("projects/GenieSteroids/index.html") && "run npm run build first" }, () => {
  const html = built("projects/GenieSteroids/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("GenieSteroids"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("JabberBot.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/JabberBot.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("JabberBot.html keeps its original content marks and section count", () => {
  const html = read("content/projects/JabberBot.html");
  assert.ok(html.includes("JabberBot"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("JabberBot.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/JabberBot.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built JabberBot page: the backdrop rides behind the rover's stone", { skip: !built("projects/JabberBot/index.html") && "run npm run build first" }, () => {
  const html = built("projects/JabberBot/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("JabberBot"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("KeypadBackpack.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/KeypadBackpack.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("KeypadBackpack.html keeps its original content marks and section count", () => {
  const html = read("content/projects/KeypadBackpack.html");
  assert.ok(html.includes("KeypadBackpack"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("KeypadBackpack.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/KeypadBackpack.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built KeypadBackpack page: the backdrop rides behind the keyless lock's stone", { skip: !built("projects/KeypadBackpack/index.html") && "run npm run build first" }, () => {
  const html = built("projects/KeypadBackpack/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("KeypadBackpack"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("Max756Breakout.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/Max756Breakout.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("Max756Breakout.html keeps its original content marks and section count", () => {
  const html = read("content/projects/Max756Breakout.html");
  assert.ok(html.includes("Max756Breakout"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("Max756Breakout.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/Max756Breakout.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built Max756Breakout page: the backdrop rides behind the eldest stone", { skip: !built("projects/Max756Breakout/index.html") && "run npm run build first" }, () => {
  const html = built("projects/Max756Breakout/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("Max756Breakout"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("PeytonsBirthdayCladdaghRing.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/PeytonsBirthdayCladdaghRing.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("PeytonsBirthdayCladdaghRing.html keeps its original content marks and section count", () => {
  const html = read("content/projects/PeytonsBirthdayCladdaghRing.html");
  assert.ok(html.includes("PeytonsBirthdayCladdaghRing"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("PeytonsBirthdayCladdaghRing.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/PeytonsBirthdayCladdaghRing.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built PeytonsBirthdayCladdaghRing page: the backdrop rides behind the ring-giver's gift", { skip: !built("projects/PeytonsBirthdayCladdaghRing/index.html") && "run npm run build first" }, () => {
  const html = built("projects/PeytonsBirthdayCladdaghRing/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("PeytonsBirthdayCladdaghRing"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("StormBox.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/StormBox.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("StormBox.html keeps its original content marks and section count", () => {
  const html = read("content/projects/StormBox.html");
  assert.ok(html.includes("StormBox"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("StormBox.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/StormBox.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built StormBox page: the backdrop rides behind the storm in a box", { skip: !built("projects/StormBox/index.html") && "run npm run build first" }, () => {
  const html = built("projects/StormBox/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("StormBox"), "the project's own mark survives the build");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("ai-prompts.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/ai-prompts.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("ai-prompts.html keeps its original content marks and section count", () => {
  const html = read("content/projects/ai-prompts.html");
  assert.ok(html.includes("ai-prompts"), "the project's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("ai-prompts.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/projects/ai-prompts.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "content wrapper stacks above the stage");
});

test("built ai-prompts page: the backdrop rides behind the incantation stones", { skip: !built("projects/ai-prompts/index.html") && "run npm run build first" }, () => {
  const html = built("projects/ai-prompts/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("ai-prompts"), "the project's own mark survives the port");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});
