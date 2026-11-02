import Layout from "../components/Layout";

export function ContentPage({ title, description, here, html }) {
  return (
    <Layout title={title} description={description} here={here}>
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </Layout>
  );
}