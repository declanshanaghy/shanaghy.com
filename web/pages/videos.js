import { readContent } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html }) {
  return (
    <ContentPage
      title="The Films — shanaghy.com"
      description="One hundred and eighty-one reels of FiremanDecko, screened by candlelight."
      here="/videos/"
      html={html}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("videos.html") } };
}
