import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        '@joy/styling-engine-context/getValue':
          '@joy/styling-engine-context/getValueNextjs',
        // Works after copying the file to node_modules
        // '@joy/joy-ui/config': '@joy/joy-ui/nextjs-config',
      },
    },
  },
  webpack(webpackConfig) {
    webpackConfig.resolve.alias['@joy/styling-engine-context/getValue'] =
      '@joy/styling-engine-context/getValueNextjs';
    webpackConfig.resolve.alias['@joy/joy-ui/config'] = require.resolve(
      './src/joy-config.ts'
    );
    return webpackConfig;
  },
};

export default nextConfig;
