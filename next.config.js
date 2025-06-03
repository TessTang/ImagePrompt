/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    // Required for static export with next/image if not using a custom loader
    unoptimized: true,
  },
  // Required for GitHub Pages (static site generation)
  output: "export",
  basePath: isProd ? "/ImagePrompt" : "",
  assetPrefix: isProd ? "/ImagePrompt/" : "",
};

module.exports = nextConfig;
