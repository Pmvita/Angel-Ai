/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: ["@angel/ui", "@angel/types", "@angel/config"],
  reactStrictMode: true,
};

module.exports = nextConfig;

