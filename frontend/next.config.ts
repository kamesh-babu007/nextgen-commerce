import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Replace this URL with your actual deployed Cloud Function URL
        // Example: https://api-xyz123-uc.a.run.app/:path*
        // For local development, this can point to the local emulator or server
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
