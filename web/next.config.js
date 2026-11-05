/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
// CommonJS on purpose: `export default` requires ESM loading, which fails on
// stock Node 18 with "SyntaxError: Unexpected token 'export'". module.exports
// loads on every Node the repo builds under (18 through 26) with zero behavior change.
module.exports = nextConfig;