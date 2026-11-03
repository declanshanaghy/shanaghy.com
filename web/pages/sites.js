import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Sites — shanaghy.com"
      description="The wider roads — the smith's web sites beyond the garden wall, probed and kept."
      here="/sites/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("sites.html"), css: readContentCss("sites.css") } };
}
