import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.hkrtcdn.com",
      },
      {
        protocol: "https",
        hostname: "www.optimumnutrition.co.in",
      },
    ],
  },
};

export default nextConfig;
