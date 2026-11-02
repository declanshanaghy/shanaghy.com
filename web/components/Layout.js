import React from "react";
import Head from "next/head";


const NAV = [
  ["Forge", "/"],
  ["Stones", "/projects/"],
  ["Films", "/videos/"],
  ["Sessions", "/sessions/"],
  ["Creed", "/creed/"],
  ["Fleet", "/fleet/"],
  ["Paths", "/paths/"],
];

export function Header({ here }) {
  return (
    <nav className="topbar" aria-label="The forge of FiremanDecko">
      <a className="brand" href="/">
        <img
          className="brand-logo"
          src="/assets/icons/forge-logo.png"
          alt="The Forge of FiremanDecko"
          width={160}
          height={40}
          loading="lazy"
        />
      </a>
      <div className="toplinks">
        {NAV.map(([label, href]) => (
          <a key={href} className={"tlink" + (here === href ? " here" : "")} href={href}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <p className="foot-line">
        The garden grows from Athlone, Co. Westmeath, with roots in Ballyhaunis, Co. Mayo.
      </p>
      <a
        className="foot-gh"
        href="https://github.com/declanshanaghy"
        target="_blank"
        rel="noopener"
      >
        github.com/declanshanaghy
      </a>
      <p className="foot-colophon">
        {NAV.map(([label, href]) => (
          <React.Fragment key={href}>
            <a className="foot-tlink" href={href}>
              the {label.toLowerCase()}
            </a>{" "}
          </React.Fragment>
        ))}
      </p>
      <p className="foot-copy">© Declan Shanaghy · an amalgamation of many spores · 🍀</p>
    </footer>
  );
}

export default function Layout({ title, description, here, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <Header here={here} />
      {children}
      <Footer />
      <style jsx global>{`
        html { scroll-behavior: smooth; color-scheme: dark; }
      `}</style>
    </>
  );
}