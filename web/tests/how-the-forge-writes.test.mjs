import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");

/* ── unit: the /laws/how-the-forge-writes/ port (issue #148) ─────────── */

test("how-the-forge-writes.html carries the four decorative divs exactly once each", () => {
  const html = read("content/laws/how-the-forge-writes.html");
  assert.equal((html.match(/id="bog-stage"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-scene"/g) || []).length, 1);
  assert.equal((html.match(/id="bog-grainfx"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-vign"/g) || []).length, 1);
  assert.equal((html.match(/class="bog-bloom"/g) || []).length, 1);
  for (const d of ['bog-stage', 'bog-grainfx', 'bog-vign', 'bog-bloom']) {
    assert.ok(html.includes(`${d}" aria-hidden="true"`), `${d} is aria-hidden`);
  }
});

test("how-the-forge-writes.html keeps its original content marks", () => {
  const html = read("content/laws/how-the-forge-writes.html");
  assert.ok(html.includes("Law 14 · How The Forge Writes"));
  assert.ok(html.includes("No file or directory listings in documents"));
});

test("how-the-forge-writes.css pastes the canonical block verbatim and lifts the wrapper", () => {
  const page = read("content/laws/how-the-forge-writes.css");
  const paste = read("styles/bog-backdrop.paste.css").trim();
  assert.ok(page.includes(paste), "the canonical paste rides verbatim at the end of the page css");
  assert.match(page, /#bog-stage\{[^}]*position:fixed/s, "the stage is the fixed ground");
  assert.match(
    page,
    /#__next>div\{position:relative;z-index:1\}/,
    "the content wrapper stacks above the stage"
  );
});

/* ── integration: the BUILT page ─────────────────────────────────────── */

function built(name) {
  const p = path.join(root, "out", name);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

test("built law page: the backdrop proves the whole path end to end", { skip: !built("laws/how-the-forge-writes/index.html") && "run npm run build first" }, () => {
  const html = built("laws/how-the-forge-writes/index.html");
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal((html.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1, `${m} exactly once`);
  }
  assert.ok(html.includes("Law 14 · How The Forge Writes"));
  assert.equal((html.match(/src="\/assets\/js\/bog-scene\.js"/g) || []).length, 1);
});