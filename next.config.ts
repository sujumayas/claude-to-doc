import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better serverless support
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
