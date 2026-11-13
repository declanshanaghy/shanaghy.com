import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(root, p), "utf8");
const SLUG = "josephine-angel";

/* ── unit: the stone's body, css and behaviour ──────────────────────── */

test("the body carries the bog backdrop and no script of its own", () => {
  const html = read(`content/projects/${SLUG}.html`);
  for (const m of ['id="bog-stage"', 'id="bog-scene"', 'id="bog-grainfx"', 'class="bog-vign"', 'class="bog-bloom"']) {
    assert.equal(html.split(m).length - 1, 1, `${m} exactly once`);
  }
  assert.ok(!/<script/.test(html), "inline scripts cannot run in a fragment; the page script carries them");
  assert.ok(!/data:[a-z]+\/[a-z+-]+;base64/.test(html), "no embedded blobs: every asset is a file");
});

test("every stage tab has its panel and every asset it names exists", () => {
  const html = read(`content/projects/${SLUG}.html`);
  const stages = [...html.matchAll(/role="tab"[^>]*data-stage="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(stages, ["preview-2d", "preview-mesh", "preview-inscriptions", "preview-cutouts", "final"]);
  for (const s of stages) assert.ok(html.includes(`id="panel-${s}"`), `panel-${s}`);
  const refs = new Set([...html.matchAll(/(?:src|environment-image)="(\/assets\/[^"]+)"/g)].map((m) => m[1]));
  assert.ok(refs.size >= 90, `the review's images and meshes are all referenced (${refs.size})`);
  for (const r of refs) assert.ok(existsSync(path.join(root, "public", r)), `${r} exists`);
});

test("the css pastes the canonical backdrop and lifts the page above the stage", () => {
  const page = read(`content/projects/${SLUG}.css`);
  assert.ok(page.includes(read("styles/bog-backdrop.paste.css").trim()), "canonical paste verbatim");
  assert.match(page, /main\.page\{position:relative;z-index:1\}/);
  assert.match(page, /\.ja figure:nth-child\(10n\+1\)|\.ja \.grid>figure:nth-child\(10n\+1\)/, "figures cycle the moss caps");
});

test("the page script wires tabs, viewers and the sticky offset", () => {
  const js = read(`public/assets/js/projects/${SLUG}.js`);
  assert.match(js, /model-viewer@3\.5\.0/, "pinned model-viewer");
  assert.match(js, /--ja-stick/, "sticky offset under the site bar");
  assert.match(js, /role=tablist/, "keyboard tab navigation");
});

test("the stone is registered: route, card and sitemap", () => {
  assert.ok(JSON.parse(read("content/routes.json")).projects.includes(SLUG));
  assert.ok(read("content/projects.html").includes(`href="/projects/${SLUG}/"`));
  assert.ok(read("public/sitemap.xml").includes(`/projects/${SLUG}/`));
});

/* ── integration: the BUILT page ─────────────────────────────────────── */

const builtPath = path.join(root, "out", "projects", SLUG, "index.html");
test("built page mounts the backdrop and its own script once", { skip: !existsSync(builtPath) && "run npm run build first" }, () => {
  const html = readFileSync(builtPath, "utf8");
  assert.equal(html.split('src="/assets/js/bog-scene.js"').length - 1, 1);
  assert.equal(html.split(`src="/assets/js/projects/${SLUG}.js"`).length - 1, 1);
  assert.ok(html.includes("Josephine Angel"));
  assert.ok(html.includes("Final Mesh Rendering"));
});
