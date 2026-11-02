import { readContent } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function NotFound({ html }) {
  return (
    <ContentPage
      title="404 — shanaghy.com"
      description="A lost stone in the garden — nothing grows here."
      html={html}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("404.html") } };
}
