import { readContent } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html }) {
  return (
    <ContentPage
      title="The Fleet — shanaghy.com"
      description="Three spores, one culture — the agents of the garden."
      here="/fleet/"
      html={html}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("fleet.html") } };
}
