import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the /sessions/odins-throne-hermes/vertical-painted-tree/ port of the bog backdrop (issue #261) ── */

test("vertical-painted-tree index.html carries the four decorative divs exactly once each", () => {
  const html = read("content/sessions/odins-throne-hermes/vertical-painted-tree/index.html");
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

test("vertical-painted-tree index.html keeps its original content marks and section count", () => {
  const html = read("content/sessions/odins-throne-hermes/vertical-painted-tree/index.html");
  assert.ok(html.includes("The World-Tree Stands Tall"), "the ballad's own mark survives the port");
  /* the <section count on origin/main before the port was 6 (the six acts);
     the backdrop divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 6, "section count unchanged from origin/main");
});

test("vertical-painted-tree index.css pastes the canonical block and lifts the body blocks above the stage", () => {
  const page = read("content/sessions/odins-throne-hermes/vertical-painted-tree/index.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /header\.ball-head,nav\.ball-toc,\.ball-acts,footer\.ball-foot\{position:relative;z-index:1\}/, "the ballad's body blocks stack above the stage");
  assert.match(page, /\.foot\{position:relative\}/, "the shared footer rides above the stage");
  assert.match(page, /\.topbar\{\s*position:sticky;top:0;z-index:50/, "the sticky topbar stays above the stage");
});

/* ── integration: the BUILT page ─────────────────────────────────────── */

function built() {
  const p = path.join(root, "out", "sessions", "odins-throne-hermes", "vertical-painted-tree", "index.html");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

test("built vertical-painted-tree page: the port proves the whole path end to end", { skip: !built() && "run npm run build first" }, () => {
  const html = built();
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the shared scene script mounts once");
  assert.ok(html.includes("The World-Tree Stands Tall"), "original content mark survives in the built page");
  assert.equal((html.match(/<section/g) || []).length, 6, "section count unchanged in the built page");
});
