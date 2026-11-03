import { readContent, readContentCss } from "../lib/read";
import { ContentPage } from "../lib/ContentPage";

export default function Page({ html, css }) {
  return (
    <ContentPage
      title="The Sessions — The Forge of FiremanDecko"
      description="Notes from the runemaster's forge-floor — sessions filed by project."
      here="/sessions/"
      html={html}
      css={css}
    />
  );
}

export function getStaticProps() {
  return { props: { html: readContent("sessions/index.html"), css: readContentCss("sessions.css") } };
}
