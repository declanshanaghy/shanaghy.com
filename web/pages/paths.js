import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Paths — The Forge of FiremanDecko"
      description="The ways through the garden."
      here="/paths/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("paths.html"), css: readContentCss("paths.css") } };
}
