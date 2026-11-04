import Layout from "../components/Layout";

export function ContentPage({ title, description, here, html, css, bare }) {
  return (
    <Layout title={title} description={description} here={here} bare={bare}>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </Layout>
  );
}