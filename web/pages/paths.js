import { readContent } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html }) {
  return (
    <ContentPage
      title="The Paths — shanaghy.com"
      description="The ways through the garden."
      here="/paths/"
      html={html}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("paths.html") } };
}
