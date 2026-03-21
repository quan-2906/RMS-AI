import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api-bigboy.duthanhduoc.com",
        pathname: "/**",
      },
      {
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],

    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
