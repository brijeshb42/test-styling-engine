import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'export',
  productionBrowserSourceMaps: true,
};

export default nextConfig;
