import fs from "fs";
import path from "path";
import { readContent, readContentCss } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

const SLUGS = fs.readdirSync(path.join(process.cwd(), "content", "profiles")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));

export default function Profile({ slug, name, html, css }) {
  return (
    <ContentPage
      title={`${name} — a persona of the forge`}
      description={`A persona of the garden — ${name}.`}
      here="/profiles/"
      html={html}
      css={css}
    />
  );
}

export function getStaticPaths() {
  return { paths: SLUGS.map((slug) => ({ params: { slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  const html = readContent(`profiles/${params.slug}.html`);
  const name = (html.match(/<h1 class="profile-name">([\s\S]*?)<\/h1>/) || [null, params.slug])[1]
    .replace(/<[^>]+>/g, "")
    .trim();
  return { props: { slug: params.slug, name, html, css: readContentCss(`profiles/${params.slug}.css`) } };
}
