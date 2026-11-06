import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the /404/ port of the bog backdrop (issue #264) ── */

test("404.html carries the four decorative divs exactly once each", () => {
  const html = read("content/404.html");
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

test("404.html keeps its original content marks and section count", () => {
  const html = read("content/404.html");
  /* the mark wraps "off the map" in an accent span, so grep the text
     with the tags stripped, the way a reader meets it on the page */
  const text = html.replace(/<[^>]+>/g, "");
  assert.ok(text.includes("404 — off the map"), "the page's own mark survives the port");
  assert.ok(html.includes("$ cd ~/lost"), "the overline survives the port");
  assert.ok(html.includes("back to the forge"), "the call to action survives the port");
  /* the <section count on origin/main before the port was 0; the backdrop
     divs must not change it */
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged from origin/main");
});

test("404.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/404.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /main\.hero\{position:relative;z-index:1\}/, "the content wrapper stacks above the stage");
});

/* ── integration: the BUILT page ─────────────────────────────────────── */

function built() {
  /* trailingSlash: true in next.config.js exports the 404 page to
     out/404/index.html (and older builds also wrote out/404.html) */
  for (const p of [path.join(root, "out", "404", "index.html"), path.join(root, "out", "404.html")]) {
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  return null;
}

test("built 404 page: the port proves the whole path end to end", { skip: !built() && "run npm run build first" }, () => {
  const html = built();
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the shared scene script mounts once");
  assert.ok(html.replace(/<[^>]+>/g, "").includes("404 — off the map"), "original content mark survives in the built page");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged in the built page");
});
