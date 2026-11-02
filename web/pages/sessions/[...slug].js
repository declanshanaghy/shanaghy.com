import fs from "fs";
import path from "path";
import { readContent, readContentCss } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

function listSessionRoutes() {
  // walks content/sessions/**: bed dirs -> /[bed]/, session subdirs -> /[bed]/[session]/,
  // stray .html files at any level -> /[bed]/[file]
  const base = path.join(process.cwd(), "content", "sessions");
  const routes = [];
  for (const d of fs.readdirSync(base, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const bed = d.name;
    if (fs.existsSync(path.join(base, bed, "index.html")))
      routes.push({ segs: [bed], file: `sessions/${bed}/index.html` });
    const bedBase = path.join(base, bed);
    for (const e of fs.readdirSync(bedBase, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith(".html") && e.name !== "index.html")
        routes.push({ segs: [bed, e.name], file: `sessions/${bed}/${e.name}` });
      if (e.isDirectory()) {
        const sub = path.join(bedBase, e.name);
        if (fs.existsSync(path.join(sub, "index.html")))
          routes.push({ segs: [bed, e.name], file: `sessions/${bed}/${e.name}/index.html` });
        for (const f3 of fs.readdirSync(sub)) {
          if (f3.endsWith(".html") && f3 !== "index.html")
            routes.push({ segs: [bed, e.name, f3], file: `sessions/${bed}/${e.name}/${f3}` });
        }
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