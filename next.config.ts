import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable ESLint during production builds
  eslint: {
    // Only run ESLint during development, not during builds
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript during production builds for now
  typescript: {
    // Skip type checking during builds
    ignoreBuildErrors: true,
  },
  // Configure images for fetching from any domain
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
