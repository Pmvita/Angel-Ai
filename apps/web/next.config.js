/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  assetPrefix: "./",
  trailingSlash: true,
  transpilePackages: ["@angel/ui", "@angel/types", "@angel/config"],
  reactStrictMode: true,
};
module.exports = nextConfig;
