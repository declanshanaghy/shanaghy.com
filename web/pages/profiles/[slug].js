import fs from "fs";
import path from "path";
import { readContent } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

const SLUGS = fs.readdirSync(path.join(process.cwd(), "content", "profiles")).map((f) => f.replace(/\.html$/, ""));

export default function Profile({ slug, html }) {
  return (
    <ContentPage
      title={`${slug} — a persona of shanaghy.com`}
      description={`A persona of the garden — ${slug}.`}
      here="/fleet/"
      html={html}
    />
  );
}

export function getStaticPaths() {
  return { paths: SLUGS.map((slug) => ({ params: { slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  return { props: { slug: params.slug, html: readContent(`profiles/${params.slug}.html`) } };
}
