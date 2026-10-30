/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@angel/ui", "@angel/types", "@angel/config"],
  reactStrictMode: true,
};

module.exports = nextConfig;

