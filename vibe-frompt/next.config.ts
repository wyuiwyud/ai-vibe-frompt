import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Bỏ qua ESLint errors trong quá trình production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
