import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/api/render/[slug]": ["./node_modules/ffmpeg-static/**/*"],
    "/api/render/*": ["./node_modules/ffmpeg-static/**/*"],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
