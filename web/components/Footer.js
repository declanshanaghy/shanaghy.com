import React from "react";

const NAV = [
  ["Forge", "/"],
  ["Stones", "/projects/"],
  ["Films", "/videos/"],
  ["Sessions", "/sessions/"],
  ["Creed", "/creed/"],
  ["Fleet", "/fleet/"],
  ["Paths", "/paths/"],
];

export default function Footer() {
  return (
    <footer className="foot">
      <p className="foot-line">
        The garden grows from Athlone, Co. Westmeath, with roots in
        Ballyhaunis, Co. Mayo.
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
      <p className="foot-copy">© FiremanDecko · an amalgamation of many spores · 🍀</p>
    </footer>
  );
}