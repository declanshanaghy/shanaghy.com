import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="Ogham — The Forge of FiremanDecko"
      description="The elder tongue of the garden: every glyph, letter, sound and tree of the Beith-Luis-Nin — the name-row cut in stone, the four families, the forfeda."
      here="/ogham/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("ogham.html"), css: readContentCss("ogham.css") } };
}
