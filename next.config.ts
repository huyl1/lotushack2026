import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const projectDir = process.cwd();
// Merge .env* into process.env before this config runs. When NODE_ENV is not
// "production" (e.g. `next dev`), loads .env.development.local (highest priority
// among dev files) per https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
loadEnvConfig(projectDir, process.env.NODE_ENV !== "production");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
