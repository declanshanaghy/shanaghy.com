import { readContent } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html }) {
  return (
    <ContentPage
      title="The Creed — shanaghy.com"
      description="The three strands of the garden: seanchaí, Fianna, Fenrir — the commandments, the rites, the two tongues."
      here="/creed/"
      html={html}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("creed.html") } };
}
