import fs from "fs";
import path from "path";
import { readContent } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

const SLUGS = fs.readdirSync(path.join(process.cwd(), "content", "projects")).map((f) => f.replace(/\.html$/, ""));

export default function Project({ slug, html }) {
  return (
    <ContentPage
      title={`${slug} — the stones`}
      description={`A stone of the garden — ${slug}.`}
      here="/projects/"
      html={html}
    />
  );
}

export function getStaticPaths() {
  return { paths: SLUGS.map((slug) => ({ params: { slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  return { props: { slug: params.slug, html: readContent(`projects/${params.slug}.html`) } };
}
