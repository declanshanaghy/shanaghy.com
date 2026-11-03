import fs from "fs";
import path from "path";
import { readContent, readContentCss } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

const SLUGS = fs.readdirSync(path.join(process.cwd(), "content", "profiles")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));

export default function Profile({ slug, html, css }) {
  return (
    <ContentPage
      title={`${slug} — a persona of the forge`}
      description={`A persona of the garden — ${slug}.`}
      here="/fleet/"
      html={html}
      css={css}
    />
  );
}

export function getStaticPaths() {
  return { paths: SLUGS.map((slug) => ({ params: { slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  return { props: { slug: params.slug, html: readContent(`profiles/${params.slug}.html`), css: readContentCss(`profiles/${params.slug}.css`) } };
}
