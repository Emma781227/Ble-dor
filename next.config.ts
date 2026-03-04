import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Use turbopack (Next.js 16 default) with minimal config
  turbopack: {},

  // prevent Next from attempting to bundle the Expo/mobile app
  webpack(config, { isServer }) {
    // mark mobile folder as external or ignore its files
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      include: /mobile/,
      use: [{ loader: "ignore-loader" }],
    });

    // also exclude from server-side compilations
    if (isServer) {
      config.externals = [...(config.externals || []), /mobile\/.*$/];
    }

    return config;
  },
};

export default nextConfig;
