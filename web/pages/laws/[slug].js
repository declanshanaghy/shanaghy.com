import fs from "fs";
import path from "path";
import { readContent, readContentCss } from "../../lib/read";
import { ContentPage } from "../../lib/ContentPage";

const SLUGS = fs.readdirSync(path.join(process.cwd(), "content", "laws"))
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(/\.html$/, ""));

export default function Law({ slug, html, css }) {
  return (
    <ContentPage
      title={`${slug} — a law of the garden`}
      description={`A law of the Mossy Dekalogue — ${slug}.`}
      here="/creed/"
      html={html}
      css={css}
    />
  );
}

export function getStaticPaths() {
  return { paths: SLUGS.map((slug) => ({ params: { slug } })), fallback: false };
}

export function getStaticProps({ params }) {
  return {
    props: {
      slug: params.slug,
      html: readContent(`laws/${params.slug}.html`),
      css: readContentCss(`laws/${params.slug}.css`),
    },
  };
}