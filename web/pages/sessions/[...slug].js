import fs from "fs";
import path from "path";
import { readContent, readContentCss } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

function listSessionRoutes() {
  // walks content/sessions/**: [slug] dirs -> /[slug]/, .html files -> /[name].html
  const base = path.join(process.cwd(), "content", "sessions");
  const routes = [];
  for (const d of fs.readdirSync(base, { withFileTypes: true })) {
    if (d.isDirectory()) {
      if (fs.existsSync(path.join(base, d.name, "index.html")))
        routes.push({ segs: [d.name], file: `sessions/${d.name}/index.html` });
      for (const f2 of fs.readdirSync(path.join(base, d.name))) {
        if (f2.endsWith(".html") && f2 !== "index.html")
          routes.push({ segs: [d.name, f2], file: `sessions/${d.name}/${f2}` });
      }
    }
  }
  return routes;
}

const SESSIONS = listSessionRoutes();

export default function SessionPage({ html, css }) {
  return (
    <ContentPage
      title="A session of the garden — shanaghy.com"
      description="Notes from the runemaster's forge-floor — a session filed by project."
      here="/sessions/"
      html={html}
      css={css}
    />
  );
}

export function getStaticPaths() {
  return {
    paths: SESSIONS.map((r) => ({ params: { slug: r.segs } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const route = SESSIONS.find((r) => r.segs.join("/") === params.slug.join("/"));
  return {
    props: {
      html: readContent(route.file),
      css: (() => {
        try {
          return readContentCss(route.file.replace(/\.html$/, ".css"));
        } catch {
          return "";
        }
      })(),
    },
  };
}