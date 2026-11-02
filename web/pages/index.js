import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="FiremanDecko — an amalgamation of many spores"
      description="Home-lab tinkerer, AI agent fleet operator — Athlone, Co. Westmeath. A moss-grown stone garden of projects, agents, and session ephemera."
      here="/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("index.html"), css: readContentCss("index.css") } };
}
