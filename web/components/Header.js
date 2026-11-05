import React, { useEffect, useRef, useState } from "react";

/* the seven paths — one NAV feeds both renders:
     • the desktop .topbar links (label / href)
     • the compact .c-navsheet plates (label / href / ogham rune / plate name / about)
   the homepage's mobile header is the spec (issue #280); this is that header,
   lifted into the shared chrome so every page wears it identically. */
const NAV = [
  { label: "Garden", href: "/", rune: "ᚌ", plate: "The Garden", about: "the front door" },
  { label: "Creed", href: "/creed/", rune: "ᚄ", plate: "The Creed", about: "three strands · the Dekalogue" },
  { label: "Stones", href: "/projects/", rune: "ᚐ", plate: "The Stones", about: "49 projects, seven groves" },
  { label: "RingForts", href: "/sites/", rune: "ᚉ", plate: "The RingForts", about: "ten halls beyond the wall" },
  { label: "Towers", href: "/videos/", rune: "ᚘ", plate: "The Towers", about: "181 reels of the wander" },
  { label: "Ballads", href: "/sessions/", rune: "ᚊ", plate: "The Ballads", about: "ephemera between stones" },
  { label: "Na Tuatha", href: "/profiles/", rune: "ᚋ", plate: "Na Tuatha", about: "the tribe · every soul in one roll" },
];

export default function Header({ here }) {
  const hereNav = NAV.find((n) => n.href === here) || null;

  /* ── the Path-Sheet state — the homepage's openNav/closeNav, in React ── */
  const [shown, setShown] = useState(false); // hidden attr off (element laid out)
  const [open, setOpen] = useState(false);   // .open class (slide-in transition)
  const navBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const wasOpenRef = useRef(false);

  // open: unhide first, then slide on the next frame (so the transition runs)
  useEffect(() => {
    if (!shown) return;
    document.body.classList.add("c-locked");
    const raf = requestAnimationFrame(() => setOpen(true));
    if (closeBtnRef.current) closeBtnRef.current.focus();
    return () => cancelAnimationFrame(raf);
  }, [shown]);

  // close: unlock, hand focus back to the burger, re-hide after the slide
  useEffect(() => {
    if (open) { wasOpenRef.current = true; return; }
    if (!wasOpenRef.current) return; // never opened — nothing to close
    wasOpenRef.current = false;
    document.body.classList.remove("c-locked");
    if (navBtnRef.current) navBtnRef.current.focus();
    const t = setTimeout(() => setShown(false), 340);
    return () => clearTimeout(t);
  }, [open]);

  // Escape closes the sheet
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // crossing the 1024px breakpoint upwards closes whichever overlay was open
  useEffect(() => {
    const mq = window.matchMedia("(max-width:1024px)");
    const onMode = () => { if (!mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMode);
    else mq.addListener(onMode);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onMode);
      else mq.removeListener(onMode);
    };
  }, []);

  // open: unhide first, then slide on the next frame (so the transition runs);
  // if the sheet is mid-close (still laid out), just slide it straight back
  const openSheet = () => {
    if (!shown) { setShown(true); return; }
    document.body.classList.add("c-locked");
    setOpen(true);
    if (closeBtnRef.current) closeBtnRef.current.focus();
  };
  const toggle = () => (open ? setOpen(false) : openSheet());

  return (
    <>
      {/* the desktop chrome — unchanged, hidden at ≤1024px by the shared css */}
      <nav className="topbar" aria-label="The forge of FiremanDecko">
        <a className="brand" href="/">
          <img
            className="brand-logo"
            src="/assets/icons/forge-logo.webp"
            alt="The name of the forge, in ogham carved on mossy stone"
            width={160}
            height={40}
            loading="lazy"
          />
        </a>
        <div className="toplinks">
          {NAV.map((n) => (
            <a
              key={n.href}
              className={"tlink" + (here === n.href ? " here" : "")}
              href={n.href}
            >
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      {/* the compact bar — the homepage's .c-bar, verbatim */}
      <nav className="c-bar" aria-label="The forge of FiremanDecko">
        <a className="c-brand" href="/">
          <img
            src="/assets/icons/forge-logo.webp"
            alt="The name of the forge, in ogham carved on mossy stone"
            width={128}
            height={30}
          />
        </a>
        {hereNav ? <span className="c-here">{hereNav.label}</span> : null}
        <button
          ref={navBtnRef}
          className="c-btn c-btn--menu"
          id="cNavBtn"
          type="button"
          aria-expanded={open ? "true" : "false"}
          aria-controls="cNav"
          onClick={toggle}
        >
          <span className="c-burger" aria-hidden="true"><i></i><i></i><i></i></span>
          <span className="c-menu-t">Paths</span>
        </button>
      </nav>

      {/* the Path-Sheet — the homepage's .c-navsheet, verbatim.
          The .open class that drives transform:none is rendered from state,
          NOT added imperatively: a state change re-renders this element and
          React's className reconciliation would wipe any imperative class,
          leaving the sheet translated off-screen forever (issue #282). */}
      <div className={"c-navsheet" + (open ? " open" : "")} id="cNav" hidden={!shown}>
        <div className="c-navsheet-head">
          <div><p className="c-ns-over">The Garden · By Path</p><h2>Where would you wander?</h2></div>
          <button
            ref={closeBtnRef}
            className="c-close"
            type="button"
            aria-label="close the paths"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="c-nav-grid">
          {NAV.map((n) => (
            <a
              key={n.href}
              className={"c-plate" + (here === n.href ? " here" : "")}
              href={n.href}
              onClick={() => setOpen(false)}
            >
              <span className="c-np-rune">{n.rune}</span>
              <span className="c-np-name">{n.plate}</span>
              <span className="c-np-about">
                {n.href === "/" && here === "/" ? "the front door — you are here" : n.about}
              </span>
            </a>
          ))}
        </div>
        <div className="c-ns-foot">
          <a className="c-btn" href="https://github.com/declanshanaghy" target="_blank" rel="noopener">github.com/declanshanaghy</a>
        </div>
        <p className="c-ns-note" aria-hidden="true">the garden is grown, never built — <span className="c-rune">ᚄᚆᚐᚅᚐᚌᚆᚔ</span></p>
      </div>
    </>
  );
}
