import { readContent, readContentCss } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="Na Tuatha — The Forge of FiremanDecko"
      description="Every soul of the garden — the fleet, the kin and the totems, each with its own telling."
      here="/profiles/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("profiles.html"), css: readContentCss("profiles.css") } };
}
