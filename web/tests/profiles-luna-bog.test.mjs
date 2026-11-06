import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the /profiles/luna/ port of the bog backdrop (issue #180) ────── */

test("luna.html carries the four decorative divs exactly once each", () => {
  const html = read("content/profiles/luna.html");
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

test("luna.html keeps its original content marks and section count", () => {
  const html = read("content/profiles/luna.html");
  assert.ok(html.includes("Luna"), "the moon's own mark survives the port");
  assert.ok(html.includes("the wireframe nights"), "the ballads survive the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main");
});

test("luna.css pastes the canonical block and lifts the page body above the stage", () => {
  const page = read("content/profiles/luna.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  /* luna's page body rides bare in the content shell (no main wrapper of
     its own), so each top-level block lifts above the stage */
  assert.match(page, /\.profile-head,\.slab,\.backrow\{position:relative;z-index:1\}/, "the page body blocks stack above the stage");
  assert.match(page, /footer\.foot\{position:relative;z-index:1\}/, "the footer rides above the stage");
  assert.match(page, /\.topbar\{\s*\n?\s*position:sticky;top:0;z-index:50/, "the topbar stays above the stage");
});

/* ── integration: the BUILT page ─────────────────────────────────────── */

function built() {
  const p = path.join(root, "out", "profiles", "luna", "index.html");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

test("built luna page: the port proves the whole path end to end", { skip: !built() && "run npm run build first" }, () => {
  const html = built();
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the shared scene script mounts once");
  assert.ok(html.includes("Luna"), "original content mark survives in the built page");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged in the built page");
});