import React from "react";

const NAV = [
  ["Forge", "/"],
  ["Stones", "/projects/"],
  ["RingForts", "/sites/"],
  ["Towers", "/videos/"],
  ["Ballads", "/sessions/"],
  ["Creed", "/creed/"],
  ["Garden", "/garden/"],
  ["Paths", "/paths/"],
];

export default function Header({ here }) {
  return (
    <nav className="topbar" aria-label="The forge of FiremanDecko">
      <a className="brand" href="/">
        <img
          className="brand-logo"
          src="/assets/icons/forge-logo.png"
          alt="The name of the forge, in ogham carved on mossy stone"
          width={160}
          height={40}
          loading="lazy"
        />
      </a>
      <div className="toplinks">
        {NAV.map(([label, href]) => (
          <a
            key={href}
            className={"tlink" + (here === href ? " here" : "")}
            href={href}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}