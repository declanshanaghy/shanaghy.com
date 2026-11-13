/* /projects/josephine-angel/ — the review page's behaviour: the stage tabs and the
   3D viewers. The page body arrives as an HTML
   fragment, so its inline scripts cannot run; this file carries them. */
(() => {
  const root = document.querySelector("main.ja");
  if (!root || root.dataset.wired) return;
  root.dataset.wired = "1";

  // the pipeline bar sticks just under whichever site bar is sticky at this width
  const stick = () => {
    let h = 0;
    for (const b of document.querySelectorAll(".c-bar,.topbar")) {
      const cs = getComputedStyle(b);
      if (cs.position === "sticky" && cs.display !== "none") h = Math.max(h, b.getBoundingClientRect().height);
    }
    root.style.setProperty("--ja-stick", h + "px");
  };
  stick(); addEventListener("resize", stick);

  // the interactive meshes: model-viewer, loaded once as a module
  if (!customElements.get("model-viewer") && !document.querySelector("script[data-model-viewer]")) {
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
    s.dataset.modelViewer = "1";
    document.head.appendChild(s);
  }

  // each viewer keeps the orbit the viewer left it at, per tab session
  for (const v of root.querySelectorAll("model-viewer[id]")) {
    const k = v.id;
    try { const o = sessionStorage.getItem(k); if (o) v.setAttribute("camera-orbit", o); } catch (e) {}
    v.addEventListener("camera-change", (e) => {
      if (e.detail.source !== "user-interaction") return;
      try { sessionStorage.setItem(k, v.getCameraOrbit().toString()); } catch (x) {}
    });
  }

  // stage tabs: a picked stage is kept across reloads; picking the current
  // stage (or never picking one) opens on the current stage
  const KEY = "josephine-angel-preview-stage", cur = root.dataset.current;
  const tabs = [...root.querySelectorAll("[role=tab]")], live = tabs.filter((t) => t.getAttribute("aria-disabled") !== "true");
  const store = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} };
  const bar = root.querySelector(".ja-top");
  const select = (t, user) => {
    for (const x of tabs) {
      const on = x === t;
      x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1;
      const p = document.getElementById("panel-" + x.dataset.stage); if (p) p.hidden = !on;
    }
    t.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (user) {
      store(t.dataset.stage === cur ? "" : t.dataset.stage);
      const top = root.getBoundingClientRect().top + scrollY - (parseFloat(root.style.getPropertyValue("--ja-stick")) || 0);
      if (scrollY > top) scrollTo(0, top);
    }
  };
  let saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
  const first = live.find((t) => t.dataset.stage === saved) || live.find((t) => t.dataset.stage === cur) || live[live.length - 1];
  if (first) select(first, false);
  for (const t of tabs) t.addEventListener("click", () => { if (live.includes(t)) select(t, true); });
  root.querySelector("[role=tablist]").addEventListener("keydown", (ev) => {
    const i = live.indexOf(document.activeElement); if (i < 0) return;
    const n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: live.length - 1 }[ev.key];
    if (n === undefined) return;
    ev.preventDefault(); const t = live[(n + live.length) % live.length]; select(t, true); t.focus();
  });
})();
