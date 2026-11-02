import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Fleet — shanaghy.com"
      description="Three spores, one culture — the agents of the garden."
      here="/fleet/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("fleet.html"), css: readContentCss("fleet.css") } };
}
