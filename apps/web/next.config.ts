import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Required for standalone output in a monorepo — tells Next.js where the
  // root node_modules lives so it traces and copies dependencies correctly.
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
