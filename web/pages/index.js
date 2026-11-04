import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

function gardenClick(e) {
  const closer = e.target.closest("[data-popclose]");
  const pop = document.getElementById("g-pop");
  if (!pop) return;
  if (closer) {
    if (closer.classList.contains("gp-close") || !e.target.closest(".gp-card")) {
      pop.classList.remove("open");
      pop.setAttribute("aria-hidden", "true");
    }
    return;
  }
  const ent = e.target.closest('[data-pop="1"]');
  if (!ent || !ent.dataset || !ent.dataset.name) return;
  e.preventDefault();
  pop.querySelector(".gp-icon").setAttribute("src", ent.dataset.icon || "");
  pop.querySelector(".gp-name").textContent = ent.dataset.name;
  pop.querySelector(".gp-epithet").textContent = ent.dataset.epithet || "";
  pop.querySelector(".gp-marks").textContent = ent.dataset.marks || "";
  pop.querySelector(".gp-full").setAttribute("href", ent.getAttribute("href") || "#");
  pop.classList.add("open");
  pop.setAttribute("aria-hidden", "false");
}

function gardenClose() {
  const pop = document.getElementById("g-pop");
  if (pop) {
    pop.classList.remove("open");
    pop.setAttribute("aria-hidden", "true");
  }
}

function gardenEsc(e) {
  if (e.key === "Escape") gardenClose();
}

export default function Page({ html, css }) {
  return (
    <div onClick={gardenClick} onKeyUp={gardenEsc}>
      <ContentPage
        title="FiremanDecko — an amalgamation of many spores"
        description="Home-lab tinkerer, AI agent fleet operator — Athlone, Co. Westmeath. A moss-grown stone garden of projects, agents, and session ephemera."
        here="/"
        bare
        html={html}
        css={css}
      />
    </div>
  );
}

export function getStaticProps() {
  return { props: { html: readContent("index.html"), css: readContentCss("index.css") } };
}
