import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["192.168.1.*"],
  async headers() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
            { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" }
          ]
        }
      ];
    }
    return [];
  }
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
