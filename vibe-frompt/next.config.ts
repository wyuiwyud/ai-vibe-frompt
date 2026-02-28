import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Bỏ qua ESLint errors trong quá trình production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua TypeScript errors trong quá trình production build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
