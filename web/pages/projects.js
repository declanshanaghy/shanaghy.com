import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Stones — The Forge of FiremanDecko"
      description="Forty-nine stones in seven groves, three keepers on the cork server."
      here="/projects/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("projects.html"), css: readContentCss("projects.css") } };
}
