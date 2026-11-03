import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Towers — The Forge of FiremanDecko"
      description="One hundred and eighty-one reels and the smith's own picked stills, screened by candlelight."
      here="/towers/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("towers.html"), css: readContentCss("towers.css") } };
}
