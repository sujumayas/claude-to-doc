import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better serverless support
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Exclude browser-only packages from server-side bundles
  // These are used only in client components for document export
  serverExternalPackages: ['docx', 'jspdf', 'file-saver'],
};

export default nextConfig;
