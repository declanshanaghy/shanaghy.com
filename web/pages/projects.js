import { readContent } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html }) {
  return (
    <ContentPage
      title="The Stones — shanaghy.com"
      description="Forty-nine stones in seven groves, three keepers on the cork server."
      here="/projects/"
      html={html}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("projects.html") } };
}
