import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the /projects/thor/ port of the bog backdrop (issue #248) ── */

test("thor.html carries the four decorative divs exactly once each", () => {
  const html = read("content/projects/thor.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ["bog-stage", "bog-grainfx", "bog-vign", "bog-bloom"]) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
  assert.ok(!/<script/.test(html.split("runestrip")[0]), "the page adds no script tag of its own");
});

test("thor.html keeps its original content marks and section count", () => {
  const html = read("content/projects/thor.html");
  assert.ok(html.includes("thor"), "the stone's own mark survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main (zero)");
});

test("thor.css pastes the canonical block and lifts the body above the stage", () => {
  const page = read("content/projects/thor.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/, "the page's own content wrapper stacks above the stage");
  assert.match(page, /\.runestrip\{position:relative;z-index:1\}/, "the runestrip rides above the stage");
  assert.match(page, /header\.page-head\{position:relative;z-index:1\}/, "the stone header rides above the stage");
  assert.match(page, /\.plaque-head,\.slab\{position:relative;z-index:1\}/, "the trail plaques ride above the stage");
  assert.match(page, /\.topbar\{[^}]*position:sticky[^}]*z-index:50/, "the sticky topbar stays above the stage");
});

/* ── integration: the BUILT page ─────────────────────────────────────── */

function built() {
  const p = path.join(root, "out", "projects", "thor", "index.html");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

test("built thor page: the port proves the whole path end to end", { skip: !built() && "run npm run build first" }, () => {
  const html = built();
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the chrome loads the shared scene once");
  assert.ok(html.includes("thor"), "the stone's own mark survives the build");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged in the built page (zero)");
});
