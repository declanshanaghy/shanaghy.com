import { readContent } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html }) {
  return (
    <ContentPage
      title="The Sessions — shanaghy.com"
      description="Notes from the runemaster's forge-floor — sessions filed by project."
      here="/sessions/"
      html={html}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("sessions.html") } };
}
