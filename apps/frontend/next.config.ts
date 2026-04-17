import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:4000/api/v1/:path*",
      },
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:4000/api/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
