import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Note: experimental.serverComponentsExternalPackages has been moved to serverExternalPackages
  // This is the correct configuration for Next.js 15
};

export default nextConfig;
