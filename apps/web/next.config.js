/** @type {import('next').NextConfig} */
const isElectronBuild = process.env.ELECTRON_BUILD === "1";

const nextConfig = {
  output: "export",
  // Relative asset paths only for Electron file:// loads. Absolute paths for Vercel/web.
  ...(isElectronBuild ? { assetPrefix: "./" } : {}),
  trailingSlash: true,
  transpilePackages: ["@angel/ui", "@angel/types", "@angel/config"],
  reactStrictMode: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
