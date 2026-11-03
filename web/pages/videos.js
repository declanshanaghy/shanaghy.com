import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Films — The Forge of FiremanDecko"
      description="One hundred and eighty-one reels of FiremanDecko, screened by candlelight."
      here="/videos/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("videos.html"), css: readContentCss("videos.css") } };
}
