import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async headers() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Cross-Origin-Opener-Policy",
              value: "unsafe-none"
            },
            {
              key: "Cross-Origin-Embedder-Policy",
              value: "unsafe-none"
            }
          ]
        }
      ];
    }
    return [];
  }
};

export default nextConfig;
