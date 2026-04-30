import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // @ts-expect-error — flag is supported at runtime on 15.5 but not yet in types
    nodeMiddleware: true,
  },
};

export default config;
