import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {},
  // Set the root directory to client
  dir: path.join(__dirname, "client"),
  // Ensure static assets are served from client/public
  publicRuntimeConfig: {
    staticFolder: "/public",
  },
  // Configure path aliases if needed
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.join(__dirname, "client"),
    };
    return config;
  },
};

export default nextConfig;
