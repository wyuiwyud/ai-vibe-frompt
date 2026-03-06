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
  images: {
    remotePatterns: [
      {
        // Cho phép load ảnh từ Supabase Storage
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
