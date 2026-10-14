import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Playwright server sets its own, so it can run beside `next dev` (see playwright.config.mts).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  typedRoutes: true,
  reactCompiler: true,
};

export default withVarlock(nextConfig);
