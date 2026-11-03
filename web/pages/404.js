import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function NotFound({ html, css }) {
  return (
    <ContentPage
      title="404 — The Forge of FiremanDecko"
      description="A lost stone in the garden — nothing grows here."
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("404.html"), css: readContentCss("404.css") } };
}
