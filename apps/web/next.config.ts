import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              `connect-src 'self' ${apiUrl} https://*.razorpay.com`,
              "font-src 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "img-src 'self' data: https:",
              "object-src 'none'",
              'frame-src https://*.razorpay.com',
              `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${
                process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''
              }`,
              "style-src 'self' 'unsafe-inline'",
            ].join('; '),
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), geolocation=(), microphone=()',
          },
        ],
        source: '/(.*)',
      },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@neogamelabs/contracts'],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
