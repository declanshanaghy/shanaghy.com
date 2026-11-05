import Layout from "../components/Layout";

export function ContentPage({ title, description, image, url, here, html, css, bare }) {
  return (
    <Layout title={title} description={description} image={image} url={url} here={here} bare={bare}>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </Layout>
  );
}