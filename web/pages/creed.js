import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Creed — shanaghy.com"
      description="The three strands of the garden: seanchaí, Fianna, Fenrir — the commandments, the rites, the two tongues."
      here="/creed/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("creed.html"), css: readContentCss("creed.css") } };
}
