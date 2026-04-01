import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mapbox-gl is an ESM package ("type":"module") — prevent webpack from
  // attempting to bundle it server-side, which breaks Vercel production builds.
  serverExternalPackages: ["mapbox-gl"],
};

export default nextConfig;
