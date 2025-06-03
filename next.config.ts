import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 靜態導出配置
  output: "export",

  // GitHub Pages 配置
  basePath: "/ImagePrompt",
  assetPrefix: "/ImagePrompt",

  // 圖片配置
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: true, // 靜態導出必須
  },

  // 開發時忽略錯誤（生產環境建議移除）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 確保路徑正確處理
  trailingSlash: true,

  // 禁用 server-side features
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
