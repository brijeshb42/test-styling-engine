import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "@brijeshb42/styling-engine-context/getValue":
          "@brijeshb42/styling-engine-context/getValueNextjs",
      },
    },
  },
  webpack(webpackConfig) {
    webpackConfig.resolve.alias["@brijeshb42/styling-engine-context/getValue"] =
      "@brijeshb42/styling-engine-context/getValueNextjs";
    return webpackConfig;
  },
};

export default nextConfig;
