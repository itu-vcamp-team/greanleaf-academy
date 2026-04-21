import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Frontend → Backend API proxy
        source: "/api/backend/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
        }/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "img.youtube.com" }, // YouTube thumbnails
    ],
  },
  experimental: {
    allowedDevOrigins: ["0.0.0.0", "localhost:3000"],
  },
};

export default withNextIntl(nextConfig);
