import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mapbox-gl uses browser APIs — exclude from server-side bundling
  serverExternalPackages: [],
};

export default nextConfig;
