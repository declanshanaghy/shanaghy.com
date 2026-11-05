import React, { useEffect } from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title, description, here, children, bare }) {
  useEffect(() => {
    // scroll-reveal: .rise elements fade in as they enter the viewport
    const els = document.querySelectorAll(".rise");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e, i) => {
      e.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(e);
    });
    return () => io.disconnect();
  }, []);

  // film click-to-play embeds
  useEffect(() => {
    const onClick = (e) => {
      const t = e.target.closest(".filmplay");
      if (!t) return;
      e.preventDefault();
      const v = t.getAttribute("data-v");
      t.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + v +
        '?autoplay=1&rel=0" title="film" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      t.style.cursor = "default";
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      {bare ? null : <Header here={here} />}
      {children}
      <Footer />
      <style jsx global>{`
        html { scroll-behavior: smooth; color-scheme: dark; }
        .rise { opacity: 0; transform: translateY(16px); }
        .rise.in { opacity: 1; transform: none; transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.3,1); }
        @media (prefers-reduced-motion: reduce) { .rise { opacity: 1 !important; transform: none !important; } }
      `}</style>
    </>
  );
}