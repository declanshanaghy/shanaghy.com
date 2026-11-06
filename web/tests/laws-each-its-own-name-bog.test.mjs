import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the law page port of the bog backdrop (issue #145) ──────────── */

test("each-its-own-name.html carries the four decorative divs exactly once each", () => {
  const html = read("content/laws/each-its-own-name.html");
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

test("each-its-own-name.html keeps its original content marks", () => {
  const html = read("content/laws/each-its-own-name.html");
  assert.ok(html.includes("Law 4 · Each Its Own Name"));
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged");
});

test("each-its-own-name.css pastes the canonical block and lifts the wrapper above the stage", () => {
  const page = read("content/laws/each-its-own-name.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.endsWith(paste.split("\n").pop()) || page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/, "the paste took: the fixed stage rule is present");
  assert.match(page, /div:has\(> #bog-stage\)\{position:relative;z-index:1\}/, "the content wrapper stacks above the stage");
});

/* ── integration: the BUILT page ─────────────────────────────────────── */

function built() {
  const p = path.join(root, "out", "laws", "each-its-own-name", "index.html");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

test("built law page: the port proves the whole path end to end", { skip: !built() && "run npm run build first" }, () => {
  const html = built();
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1, "the shared scene script mounts once");
  assert.ok(html.includes("Law 4 · Each Its Own Name"), "original content mark survives");
  assert.equal((html.match(/<section/g) || []).length, 0, "section count unchanged in the built page");
});
