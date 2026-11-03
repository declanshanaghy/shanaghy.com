import Head from "next/head";

export default function GardenRedirect() {
  return (
    <Head>
      <meta httpEquiv="refresh" content="0; url=/" />
      <title>The Garden — FiremanDecko</title>
      <link rel="canonical" href="/" />
    </Head>
  );
}

export function getStaticProps() {
  return { props: {} };
}
