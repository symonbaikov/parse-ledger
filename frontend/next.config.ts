import type { NextConfig } from "next";

const normalizeTarget = (url: string) => url.replace(/\/$/, '');

// Used to proxy API requests through the Next server to the backend when running as a single service
const apiProxyTarget = normalizeTarget(process.env.API_PROXY_TARGET || 'http://127.0.0.1:4000');

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
