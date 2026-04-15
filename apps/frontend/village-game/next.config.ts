import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // disable double-invoke so game loop runs once
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
